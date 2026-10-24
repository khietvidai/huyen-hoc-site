import { chromium } from 'playwright';

async function testInteraction() {
  console.log('Connecting to Gemini via CDP...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  let page = context.pages().find(p => p.url().includes('gemini.google.com'));
  
  if (!page) {
    console.log('Gemini page not found, opening new page...');
    page = await context.newPage();
    await page.goto('https://gemini.google.com/u/0/app', { waitUntil: 'domcontentloaded' });
  }

  // Find or click new chat button if available, or navigate
  console.log('Current page URL:', page.url());
  const newChatBtn = page.locator('button[aria-label*="Cuộc trò chuyện mới"], button[aria-label*="New chat"], a[href="/app"], a[href="/u/0/app"]').first();
  if (await newChatBtn.isVisible()) {
    console.log('Clicking New Chat button...');
    await newChatBtn.click();
    await page.waitForTimeout(1500);
  } else {
    console.log('Navigating to /u/0/app...');
    await page.goto('https://gemini.google.com/u/0/app', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  }

  // Find editor
  const editorSelector = '.ql-editor, div[contenteditable="true"]';
  await page.waitForSelector(editorSelector, { timeout: 15000 });
  console.log('Editor found!');

  const testPrompt = 'Cho tôi xin một số trang web gieo quẻ Kinh Dịch trực tuyến uy tín hiện nay kèm đường link.';
  console.log('Sending prompt:', testPrompt);

  const editor = page.locator(editorSelector).first();
  await editor.click();
  await editor.fill(testPrompt);
  await page.waitForTimeout(500);

  // Check initial response count before sending
  const initialResponseCount = await page.locator('message-content, model-response').count();
  console.log('Initial response count:', initialResponseCount);

  // Click send button
  const sendBtn = page.locator('button[aria-label*="Gửi"], button[aria-label*="Send"], .send-button').first();
  if (await sendBtn.isVisible()) {
    console.log('Clicking send button...');
    await sendBtn.click();
  } else {
    console.log('Pressing Enter...');
    await page.keyboard.press('Enter');
  }

  console.log('Waiting for response generation...');
  // Wait for new response element to appear
  let responseCount = initialResponseCount;
  const start = Date.now();
  while (responseCount <= initialResponseCount && Date.now() - start < 15000) {
    await page.waitForTimeout(500);
    responseCount = await page.locator('message-content, model-response').count();
  }
  console.log('New response element appeared! Total:', responseCount);

  // Wait until generation finishes (stop button disappears and content settles)
  let lastText = '';
  let stableTicks = 0;
  while (Date.now() - start < 60000) {
    const isStopVisible = await page.locator('button[aria-label*="Ngừng"], button[aria-label*="Stop"]').isVisible();
    const currentResponses = page.locator('message-content, model-response');
    const latestResponse = currentResponses.nth((await currentResponses.count()) - 1);
    const text = await latestResponse.innerText().catch(() => '');

    if (text.length > 0 && text === lastText && !isStopVisible) {
      stableTicks++;
      if (stableTicks >= 3) {
        console.log('Response stabilized and streaming completed.');
        break;
      }
    } else {
      stableTicks = 0;
      lastText = text;
    }

    await page.waitForTimeout(1000);
  }

  await page.waitForTimeout(1500);

  // Extract response text and links
  const result = await page.evaluate(() => {
    const responseContainers = document.querySelectorAll('message-content, model-response');
    if (!responseContainers.length) return { text: '', links: [] };
    const latest = responseContainers[responseContainers.length - 1];
    const text = latest.innerText;

    const links = [];
    const linkElements = latest.querySelectorAll('a');
    linkElements.forEach(a => {
      const href = a.href;
      if (href && !href.startsWith('javascript:')) {
        links.push({
          text: a.innerText.trim(),
          href: href
        });
      }
    });

    // Also look at source anchors / grounding chips around this response
    const block = latest.closest('.conversation-container, .response-container, .model-turn') || latest.parentElement;
    if (block) {
      block.querySelectorAll('a[href^="http"]').forEach(a => {
        if (!links.some(l => l.href === a.href) && !a.href.includes('google.com/search') && !a.href.includes('policies.google.com')) {
          links.push({
            text: a.innerText.trim() || 'Citation/Grounding',
            href: a.href,
            type: 'grounding'
          });
        }
      });
    }

    // Extract URLs from text regex if not clickable
    const urlRegex = /(https?:\/\/[^\s\)\>\"\']+)/gi;
    let match;
    while ((match = urlRegex.exec(text)) !== null) {
      const url = match[1].replace(/[.,;:]$/, '');
      if (!links.some(l => l.href === url)) {
        links.push({
          text: url,
          href: url,
          type: 'text_regex'
        });
      }
    }

    return { text, links };
  });

  console.log('\n================ RESPONSE SUMMARY ================\n');
  console.log(result.text);
  console.log('\n================ EXTRACTED URLS ================\n');
  console.log(JSON.stringify(result.links, null, 2));

  await browser.close();
}

testInteraction().catch(console.error);
