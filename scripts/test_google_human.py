import sys
import asyncio
import urllib.parse

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

from camoufox.async_api import AsyncCamoufox

async def main():
    print("Khởi động Camoufox kiểm tra tab Diễn đàn...")
    async with AsyncCamoufox(headless=True) as browser:
        page = await browser.new_page()
        
        # Thử nghiệm với các từ khóa nhu cầu diễn đàn về Kinh Dịch / Tarot
        query = 'xin quẻ kinh dịch hỏi công việc'
        encoded_query = urllib.parse.quote_plus(query)
        forums_url = f"https://www.google.com/search?q={encoded_query}&udm=18&hl=vi"
        
        print(f"Truy cập trực tiếp tab Diễn đàn: {forums_url}")
        await page.goto(forums_url, wait_until="domcontentloaded")
        await asyncio.sleep(3)
        
        title = await page.title()
        print(f"Tiêu đề: {title}")
        print(f"URL: {page.url}")
        
        # Nếu bị sorry, thử đi từ trang chủ rồi bấm tab Diễn đàn
        if "sorry" in page.url:
            print("Gặp trang sorry khi vào trực tiếp udm=18. Đang chuyển sang tìm kiếm từ trang chủ...")
            await page.goto("https://www.google.com/?hl=vi", wait_until="domcontentloaded")
            await asyncio.sleep(2)
            search_box = page.locator('textarea[name="q"], input[name="q"]').first
            await search_box.fill(query)
            await search_box.press("Enter")
            await page.wait_for_load_state("domcontentloaded")
            await asyncio.sleep(2)
            
            # Tìm nút hoặc link Diễn đàn
            forum_tab = page.locator('a:has-text("Diễn đàn"), a:has-text("Forums"), a[href*="udm=18"]').first
            if await forum_tab.count() > 0:
                print("Đã tìm thấy tab Diễn đàn, đang click...")
                await forum_tab.click()
                await page.wait_for_load_state("domcontentloaded")
                await asyncio.sleep(2)
            else:
                print("Không thấy tab Diễn đàn hiển thị trên thanh điều hướng.")

        # Trích xuất các bài viết diễn đàn và câu hỏi
        print("Trích xuất bài thảo luận...")
        results = await page.evaluate('''() => {
            const items = [];
            // Tìm tất cả khối kết quả
            const links = document.querySelectorAll('a');
            for (const a of links) {
                const h3 = a.querySelector('h3');
                if (h3) {
                    const title = h3.innerText.trim();
                    let href = a.href || a.getAttribute('href');
                    // Bỏ qua link nội bộ google
                    if (title && href && !href.includes('google.com') && !href.startsWith('/')) {
                        items.push({ title, url: href });
                    }
                }
            }
            return items;
        }''')
        
        print(f"Tìm thấy {len(results)} kết quả:")
        for idx, res in enumerate(results[:10]):
            print(f"[{idx+1}] {res['title']}\n    URL: {res['url']}")

if __name__ == "__main__":
    asyncio.run(main())
