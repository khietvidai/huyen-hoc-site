import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

function extractUrlsFromText(text) {
  const urls = new Set();
  const regex = /https?:\/\/[^\s\)\>\]\"\'\`]+/gi;
  let m;
  while ((m = regex.exec(text)) !== null) {
    let u = m[0].replace(/[.,;:!]+$/, '');
    urls.add(u);
  }
  return Array.from(urls);
}

async function runQ5() {
  console.log('Connecting to Gemini for Q5...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  let page = context.pages().find(p => p.url().includes('gemini.google.com'));

  const promptText = 'Hiện nay có trang web hay ứng dụng web nào kết hợp giữa bốc bài Tarot và quẻ Kinh Dịch (I Ching Tarot) để xem chiêm đoán trực tuyến không? Xin cho tôi danh sách kèm URL truy cập.';
  
  // Navigate to fresh chat
  await page.goto('https://gemini.google.com/u/0/app', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const editorSelector = '.ql-editor, div[contenteditable="true"]';
  await page.waitForSelector(editorSelector, { timeout: 15000 });
  const editor = page.locator(editorSelector).first();
  await editor.click();
  await editor.fill(promptText);
  await page.waitForTimeout(800);

  const sendBtn = page.locator('button[aria-label*="Gửi"], button[aria-label*="Send"], .send-button').first();
  if (await sendBtn.isVisible() && !(await sendBtn.isDisabled())) {
    await sendBtn.click();
  } else {
    await page.keyboard.press('Enter');
  }

  console.log('Sent prompt, waiting for generation...');
  await page.waitForTimeout(3000);

  const start = Date.now();
  let lastText = '';
  let stableCount = 0;
  const timeoutMs = 80000;

  while (Date.now() - start < timeoutMs) {
    await page.waitForTimeout(2000);

    const isGenerating = await page.evaluate(() => {
      const stopBtn = document.querySelector('button[aria-label*="Ngừng"], button[aria-label*="Stop"]');
      const progress = document.querySelector('mat-progress-bar, .streaming-text, .generating');
      return !!stopBtn || !!progress;
    });

    const currentText = await page.evaluate(() => {
      const msgs = document.querySelectorAll('message-content, model-response');
      if (!msgs.length) return '';
      return msgs[msgs.length - 1].innerText;
    });

    if (!isGenerating && currentText.length > 50) {
      if (currentText === lastText) {
        stableCount++;
        if (stableCount >= 2) {
          console.log(`Hoàn thành sinh nội dung (${currentText.length} ký tự).`);
          break;
        }
      } else {
        stableCount = 0;
        lastText = currentText;
      }
    } else {
      lastText = currentText;
      stableCount = 0;
    }
  }

  await page.waitForTimeout(2000);

  const evalResult = await page.evaluate(() => {
    const msgs = document.querySelectorAll('message-content, model-response');
    if (!msgs.length) return { text: '', domLinks: [] };
    const latest = msgs[msgs.length - 1];

    const domLinks = [];
    latest.querySelectorAll('a').forEach(a => {
      if (a.href && !a.href.startsWith('javascript:')) {
        domLinks.push({
          title: a.innerText.trim(),
          href: a.href
        });
      }
    });

    const turn = latest.closest('.conversation-container, .response-container, .model-turn') || latest.parentElement;
    if (turn) {
      turn.querySelectorAll('a[href^="http"]').forEach(a => {
        if (!a.href.includes('google.com/search') && !a.href.includes('policies.google.com')) {
          if (!domLinks.some(l => l.href === a.href)) {
            domLinks.push({
              title: a.innerText.trim() || 'Grounding Source',
              href: a.href,
              grounding: true
            });
          }
        }
      });
    }

    return {
      text: latest.innerText,
      domLinks
    };
  });

  const textUrls = extractUrlsFromText(evalResult.text);
  const allUrls = new Set();
  evalResult.domLinks.forEach(l => { if (l.href) allUrls.add(l.href); });
  textUrls.forEach(u => allUrls.add(u));

  const cleanUrls = Array.from(allUrls).filter(u => 
    !u.includes('support.google.com') && 
    !u.includes('myaccount.google.com') &&
    !u.includes('accounts.google.com')
  );

  console.log(`Q5 Result length: ${evalResult.text.length}`);
  console.log(`Q5 URLs found: ${cleanUrls.length}`);
  console.log('URLs:', cleanUrls);

  // Update json
  const jsonPath = path.resolve('scripts/gemini_mention_test_results.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const q5 = data.find(q => q.id === 5);
  if (q5) {
    q5.responseSnippet = evalResult.text.slice(0, 300) + '...';
    q5.fullResponse = evalResult.text;
    q5.urls = cleanUrls;
    q5.domLinks = evalResult.domLinks;
  }
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('Updated json with Q5 results!');

  await browser.close();
}

runQ5().catch(console.error);
