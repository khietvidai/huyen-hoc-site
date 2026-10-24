import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('gemini.google.com'));
  if (!page) {
    console.log('No Gemini page found');
    await browser.close();
    return;
  }
  console.log('Page URL:', page.url());

  const state = await page.evaluate(() => {
    const editor = document.querySelector('.ql-editor');
    const stopBtn = document.querySelector('button[aria-label*="Ngừng"], button[aria-label*="Stop"]');
    const sendBtn = document.querySelector('button[aria-label*="Gửi"], button[aria-label*="Send"], .send-button');
    const newChatBtn = document.querySelector('a[href*="/app"], button[aria-label*="Cuộc trò chuyện mới"], button[aria-label*="New chat"]');
    return {
      hasEditor: !!editor,
      editorContent: editor ? editor.innerText : null,
      isGenerating: !!stopBtn,
      sendBtnAria: sendBtn ? sendBtn.getAttribute('aria-label') : null,
      newChatBtn: !!newChatBtn
    };
  });

  console.log('State:', state);
  await browser.close();
}

main().catch(console.error);
