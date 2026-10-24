import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const EN_TEST_QUERIES = [
  {
    cluster: 'I Ching Tarot & Hybrid Decks',
    query: 'What are the best interactive websites or apps that combine Tarot card spreads with I Ching 64 hexagrams? Please provide a list with website URLs.'
  },
  {
    cluster: 'Virtual Divination & 3D Tools',
    query: 'What are the most accurate and visually interactive online I Ching divination websites (like virtual coin tossing or yarrow stalk casting)? Please provide URLs.'
  },
  {
    cluster: 'Four Pillars of Destiny (BaZi)',
    query: 'What are the best online Four Pillars of Destiny (BaZi) calculators with true solar time correction and in-depth chart analysis? Please provide website links.'
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

async function runEnTest() {
  console.log('Connecting to Gemini.exe via CDP...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  let page = context.pages().find(p => p.url().includes('gemini.google.com'));

  const results = [];

  for (let i = 0; i < EN_TEST_QUERIES.length; i++) {
    const item = EN_TEST_QUERIES[i];
    console.log(`\n[${i + 1}/${EN_TEST_QUERIES.length}] Testing: "${item.query}"`);

    await page.goto('https://gemini.google.com/u/0/app', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const editorSelector = '.ql-editor, div[contenteditable="true"]';
    await page.waitForSelector(editorSelector, { timeout: 15000 });
    const editor = page.locator(editorSelector).first();
    await editor.click();
    await editor.fill(item.query);
    await page.waitForTimeout(600);

    const sendBtn = page.locator('button[aria-label*="Gửi"], button[aria-label*="Send"], .send-button').first();
    if (await sendBtn.isVisible() && !(await sendBtn.isDisabled())) {
      await sendBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }

    console.log('Waiting for response...');
    await page.waitForTimeout(3000);

    const start = Date.now();
    let lastText = '';
    let stableCount = 0;

    while (Date.now() - start < 75000) {
      await page.waitForTimeout(2000);
      const isGenerating = await page.evaluate(() => {
        return !!document.querySelector('button[aria-label*="Ngừng"], button[aria-label*="Stop"]');
      });
      const currentText = await page.evaluate(() => {
        const msgs = document.querySelectorAll('message-content, model-response');
        if (!msgs.length) return '';
        return msgs[msgs.length - 1].innerText;
      });

      if (!isGenerating && currentText.length > 50) {
        if (currentText === lastText) {
          stableCount++;
          if (stableCount >= 2) break;
        } else {
          stableCount = 0;
          lastText = currentText;
        }
      } else {
        lastText = currentText;
        stableCount = 0;
      }
    }

    await page.waitForTimeout(1500);

    const evalResult = await page.evaluate(() => {
      const msgs = document.querySelectorAll('message-content, model-response');
      if (!msgs.length) return { text: '', links: [] };
      const latest = msgs[msgs.length - 1];
      const links = [];
      latest.querySelectorAll('a').forEach(a => {
        if (a.href && !a.href.startsWith('javascript:')) links.push(a.href);
      });
      const turn = latest.closest('.conversation-container, .response-container, .model-turn') || latest.parentElement;
      if (turn) {
        turn.querySelectorAll('a[href^="http"]').forEach(a => {
          if (!a.href.includes('google.com/search') && !a.href.includes('policies.google.com')) {
            if (!links.includes(a.href)) links.push(a.href);
          }
        });
      }
      return { text: latest.innerText, links };
    });

    const textUrls = extractUrlsFromText(evalResult.text);
    const combined = Array.from(new Set([...evalResult.links, ...textUrls])).filter(u =>
      !u.includes('support.google.com') && !u.includes('accounts.google.com')
    );

    console.log(`Found ${combined.length} URLs mentioned.`);
    results.push({
      cluster: item.cluster,
      query: item.query,
      urls: combined,
      snippet: evalResult.text.slice(0, 300) + '...'
    });

    await page.waitForTimeout(2000);
  }

  const outPath = path.resolve('scripts/en_gemini_test_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Saved results to ${outPath}`);

  await browser.close();
}

runEnTest().catch(console.error);
