import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('gemini.google.com'));
  
  const debug = await page.evaluate(() => {
    const mainText = document.querySelector('main')?.innerText || '';
    const pendingText = document.querySelector('.pending, .loading, .streaming, [role="progressbar"]')?.innerText || '';
    const errorText = document.querySelector('.error, [role="alert"]')?.innerText || '';
    return {
      mainTextSnippet: mainText.slice(-1000),
      pendingText,
      errorText
    };
  });

  console.log('Debug:', JSON.stringify(debug, null, 2));
  await browser.close();
}

main().catch(console.error);
