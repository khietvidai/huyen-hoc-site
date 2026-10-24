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

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('gemini.google.com'));
  
  console.log('Navigating to Q5 conversation: https://gemini.google.com/u/0/app/4484e78e9ccb90d2');
  await page.goto('https://gemini.google.com/u/0/app/4484e78e9ccb90d2', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

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

  console.log('Q5 text length:', evalResult.text.length);
  console.log('Q5 text snippet:\n', evalResult.text.slice(0, 600));
  console.log('\nQ5 URLs:', cleanUrls);

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
  console.log('Successfully updated scripts/gemini_mention_test_results.json!');

  await browser.close();
}

main().catch(console.error);
