import { Camoufox } from 'camoufox-js';

async function main() {
  console.log('Khởi chạy Camoufox anti-detect browser...');
  const browser = await Camoufox({
    headless: true,
  });

  const page = await browser.newPage();
  console.log('Mở trang kiểm tra User Agent...');
  await page.goto('https://httpbin.org/user-agent');
  const content = await page.textContent('body');
  console.log('Kết quả User-Agent:', content);

  await browser.close();
  console.log('Camoufox hoạt động thành công!');
}

main().catch((err) => {
  console.error('Lỗi khi chạy Camoufox:', err);
  process.exit(1);
});
