import { Camoufox } from 'camoufox-js';

async function testGoogle() {
  const browser = await Camoufox({
    headless: true,
  });

  const page = await browser.newPage();
  const query = encodeURIComponent('xin quẻ kinh dịch tình duyên');
  const url = `https://www.google.com/search?q=${query}&udm=18&hl=vi`;
  
  console.log(`Đang truy cập: ${url}`);
  const response = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  console.log(`HTTP status: ${response ? response.status() : 'null'}`);
  console.log(`Current URL: ${page.url()}`);
  
  await page.waitForTimeout(2000);
  const title = await page.title();
  console.log(`Page title: "${title}"`);

  const text = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log(`Body snippet:\n${text}`);

  await browser.close();
}

testGoogle().catch(console.error);
