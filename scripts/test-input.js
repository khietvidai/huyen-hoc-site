import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('gemini.google.com'));
  
  const editor = page.locator('.ql-editor').first();
  await editor.click();
  await editor.fill('Test input');
  await page.waitForTimeout(500);

  const sendBtn = page.locator('button[aria-label*="Gửi"], button[aria-label*="Send"], .send-button').first();
  console.log('Send button visible:', await sendBtn.isVisible());
  console.log('Send button aria-label:', await sendBtn.getAttribute('aria-label'));
  console.log('Send button disabled:', await sendBtn.getAttribute('aria-disabled'), await sendBtn.getAttribute('disabled'));

  await browser.close();
}

main().catch(console.error);
