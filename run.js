// 引入 Node 內建 path 模組以處理檔案路徑
const path = require('path');
const fs = require('fs');

// 從 Playwright 函式庫引入 chromium 瀏覽器控制器
const { chromium } = require('playwright');

// 開始一個立即執行的非同步函式，用來執行非同步程式碼
(async () => {
  let context;

  try {
    // 讀取 credentials.txt 檔案並解析
    const credentialsPath = path.resolve(process.cwd(), 'credentials.txt');
    const credentials = fs.readFileSync(credentialsPath, 'utf-8')
      .trim()
      .split('\n')
      .map(line => {
        const [id, pw] = line.split(',');
        return { id: id.trim(), pw: pw.trim() };
      });

    // 不要寫死 userDataDir 路徑;可用環境變數 USER_DATA_DIR 覆蓋,否則使用專案目錄下的 user-data
    const userDataDir = process.env.USER_DATA_DIR // 從環境變數讀取 USER_DATA_DIR
      ? path.resolve(process.env.USER_DATA_DIR)   // 如果有設定,解析為絕對路徑
      : path.resolve(process.cwd(), 'user-data'); // 否則解析專案目錄下的 'user-data' 路徑

    // 啟動一個會使用指定的 user-data-dir 的 launchPersistentContext (持久性上下文)
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false // 將 headless 設為 false,使瀏覽器以可視化模式執行
    });

    // 迴圈遍歷每一對 user_ID 和 user_PW
    for (let i = 0; i < credentials.length; i++) {
      const user_ID = credentials[i].id;
      const user_PW = credentials[i].pw;

      console.log(`\n=== 處理第 ${i + 1} 個帳號: ${user_ID} ===`);

      // 在上下文中建立新的分頁物件
      const page = await context.newPage();

      try {
        await page.goto('https://pay.line.me/portal/tw/auth/login/id?isEpiSwitchOn=true');

        await page.locator('div').nth(3).click();
        await page.getByRole('textbox', { name: '請輸入商店ID' }).click();
        await page.getByRole('textbox', { name: '請輸入商店ID' }).fill(user_ID);
        await page.getByRole('button', { name: '下一步' }).click();
        await page.getByRole('textbox', { name: '請輸入密碼' }).click();
        await page.getByRole('textbox', { name: '請輸入密碼' }).fill(user_PW);
        await page.getByRole('button', { name: '登入', exact: true }).click();
        await page.locator('#btn_epi_close').click();
        await page.getByRole('button', { name: '管理交易' }).click();
        await page.getByRole('link', { name: '交易記錄' }).click();

        console.log(`✓ 帳號 ${user_ID} 處理完成`);

      } catch (error) {
        console.error(`✗ 帳號 ${user_ID} 出現錯誤:`, error);
      } finally {
        // 關閉分頁
        await page.close();
      }
    }

  } catch (error) {
    console.error('執行過程中發生錯誤:', error);
  } finally {
    // 確保資源被釋放
    if (context) {
      await context.close(); // 呼叫 context.close() 關閉整個瀏覽器上下文並釋放資源
    }
  }

})();
