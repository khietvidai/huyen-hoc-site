import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const QUESTIONS = [
  {
    id: 1,
    topic: 'Bốc bài Kinh Dịch & Gieo quẻ trực quan (Gieo xu, cỏ thi, trận pháp 3D)',
    prompt: 'Có những trang web nào gieo quẻ hoặc bốc bài Kinh Dịch 64 quẻ trực tuyến miễn phí và trực quan (như gieo xu âm dương, rút cỏ thi hay bốc bài) uy tín hiện nay? Cho tôi xin danh sách kèm link/URL cụ thể.'
  },
  {
    id: 2,
    topic: 'Tra cứu 64 Quẻ Kinh Dịch toàn thư (Thoán từ, Hào từ, Luận thế)',
    prompt: 'Trang web nào tra cứu chi tiết toàn văn 64 quẻ Kinh Dịch có đầy đủ Thoán từ, Hào từ, Đại tượng và lời luận giải vận thế, tình duyên, công danh chuẩn xác? Cho tôi xin danh sách kèm link web.'
  },
  {
    id: 3,
    topic: 'Tứ Trụ Bát Tự & Lục Thập Hoa Giáp',
    prompt: 'Những website nào cho phép lập lá số Tứ Trụ Bát Tự và tra cứu 60 Hoa Giáp nạp âm ngũ hành chi tiết nhất hiện nay? Cho tôi xin đường link truy cập.'
  },
  {
    id: 4,
    topic: 'Mai Hoa Dịch Số & Kỳ Môn Độn Giáp trực tuyến',
    prompt: 'Có website hay công cụ trực tuyến nào hỗ trợ lập quẻ Mai Hoa Dịch Số hoặc an bàn Kỳ Môn Độn Giáp chuẩn xác hiện nay không? Cho tôi xin link tham khảo.'
  },
  {
    id: 5,
    topic: 'Ứng dụng Kinh Dịch kết hợp Tarot (I Ching Tarot)',
    prompt: 'Hiện nay có trang web hay ứng dụng web nào kết hợp giữa bốc bài Tarot và quẻ Kinh Dịch (Iching Tarot) để xem chiêm đoán trực tuyến không? Xin cho tôi danh sách kèm URL.'
  }
];

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

async function sendPromptAndWaitResponse(page, promptText) {
  console.log(`\n==================================================`);
  console.log(`Gửi prompt: "${promptText}"`);
  console.log(`==================================================`);

  // Navigate or reset to fresh chat
  const newChatBtn = page.locator('button[aria-label*="Cuộc trò chuyện mới"], button[aria-label*="New chat"], a[href="/app"], a[href="/u/0/app"]').first();
  if (await newChatBtn.isVisible()) {
    console.log('Bấm nút Cuộc trò chuyện mới...');
    await newChatBtn.click();
    await page.waitForTimeout(1500);
  } else {
    console.log('Điều hướng đến /u/0/app...');
    await page.goto('https://gemini.google.com/u/0/app', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  }

  // Wait for editor
  const editorSelector = '.ql-editor, div[contenteditable="true"]';
  await page.waitForSelector(editorSelector, { timeout: 15000 });
  const editor = page.locator(editorSelector).first();

  await editor.click();
  await editor.fill(promptText);
  await page.waitForTimeout(600);

  // Click send button
  const sendBtn = page.locator('button[aria-label*="Gửi"], button[aria-label*="Send"], .send-button').first();
  if (await sendBtn.isVisible() && !(await sendBtn.isDisabled())) {
    await sendBtn.click();
  } else {
    await page.keyboard.press('Enter');
  }

  console.log('Đã gửi prompt, chờ phản hồi...');

  // Wait for response to start streaming
  await page.waitForTimeout(3000);

  // Monitor until generation finishes
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

  // Extract content and URLs
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

    // Also look for grounding web search citations / chips in parent container
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
  
  evalResult.domLinks.forEach(l => {
    if (l.href) allUrls.add(l.href);
  });
  textUrls.forEach(u => allUrls.add(u));

  const cleanUrls = Array.from(allUrls).filter(u => 
    !u.includes('support.google.com') && 
    !u.includes('myaccount.google.com') &&
    !u.includes('accounts.google.com')
  );

  console.log(`Phát hiện ${cleanUrls.length} URLs được mention.`);
  return {
    rawText: evalResult.text,
    domLinks: evalResult.domLinks,
    urls: cleanUrls
  };
}

async function run() {
  console.log('Kết nối tới Gemini.exe qua CDP (port 9222)...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  let page = context.pages().find(p => p.url().includes('gemini.google.com'));
  if (!page) {
    page = await context.newPage();
  }

  const results = [];

  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    console.log(`\n>>> [Câu hỏi ${i + 1}/${QUESTIONS.length}] Chủ đề: ${q.topic}`);
    try {
      const res = await sendPromptAndWaitResponse(page, q.prompt);
      results.push({
        id: q.id,
        topic: q.topic,
        question: q.prompt,
        responseSnippet: res.rawText.slice(0, 300) + '...',
        fullResponse: res.rawText,
        urls: res.urls,
        domLinks: res.domLinks
      });
    } catch (err) {
      console.error(`Lỗi khi xử lý câu hỏi ${q.id}:`, err.message);
      results.push({
        id: q.id,
        topic: q.topic,
        question: q.prompt,
        error: err.message,
        urls: []
      });
    }

    // Short pause between prompts
    await page.waitForTimeout(3000);
  }

  const outputPath = path.resolve('scripts/gemini_mention_test_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n==================================================`);
  console.log(`HOÀN THÀNH TOÀN BỘ TEST! Kết quả đã lưu tại: ${outputPath}`);
  console.log(`==================================================`);

  await browser.close();
}

run().catch(console.error);
