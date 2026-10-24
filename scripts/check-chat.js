import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('gemini.google.com'));
  
  const info = await page.evaluate(() => {
    const stopBtns = Array.from(document.querySelectorAll('button[aria-label*="Ngừng"], button[aria-label*="Stop"]')).map(e => ({
      aria: e.getAttribute('aria-label'),
      text: e.innerText,
      visible: e.offsetParent !== null
    }));
    const responses = Array.from(document.querySelectorAll('message-content, model-response')).map(e => e.innerText);
    const conversations = Array.from(document.querySelectorAll('.conversation-title, a[data-test-id="conversation-list-item"]')).map(e => e.innerText);

    return { stopBtns, responsesCount: responses.length, responses, conversations };
  });

  console.log('Result:', JSON.stringify(info, null, 2));
  await browser.close();
}

main().catch(console.error);
