import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('gemini.google.com'));
  
  const convs = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href*="/app/"]')).map(a => ({
      text: a.innerText.trim(),
      href: a.href
    }));
    return anchors;
  });

  console.log('Conversations:', JSON.stringify(convs.slice(0, 10), null, 2));
  await browser.close();
}

main().catch(console.error);
