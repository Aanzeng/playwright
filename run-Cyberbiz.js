// 引入 Node 內建 path 模組以處理檔案路徑
const path = require('path');
const fs = require('fs');

// 從 Playwright 函式庫引入 chromium 瀏覽器控制器
const { chromium } = require('playwright');

// 開始一個立即執行的非同步函式，用來執行非同步程式碼
(async () => {
  let context;
  let page;

  try {
    // 讀取 credentials-cyberbiz.txt 檔案並解析
    const credentialsPath = path.resolve(process.cwd(), 'credentials-cyberbiz.txt');
    const credentials = fs.readFileSync(credentialsPath, 'utf-8')
      .trim()
      .split('\n')
      .map(line => {
        const [url, email, password] = line.split(',');
        return { 
          url: url.trim(), 
          email: email.trim(), 
          password: password.trim() 
        };
      });

    console.log(`📋 已讀取 ${credentials.length} 個帳號\n`);

    // 不要寫死 userDataDir 路徑;可用環境變數 USER_DATA_DIR 覆蓋,否則使用專案目錄下的 user-data
    const userDataDir = process.env.USER_DATA_DIR // 從環境變數讀取 USER_DATA_DIR
      ? path.resolve(process.env.USER_DATA_DIR)   // 如果有設定,解析為絕對路徑
      : path.resolve(process.cwd(), 'user-data'); // 否則解析專案目錄下的 'user-data' 路徑

    // 啟動一個會使用指定的 user-data-dir 的 launchPersistentContext (持久性上下文)
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false // 將 headless 設為 false,使瀏覽器以可視化模式執行
    });

    // 迴圈遍歷每一個帳號
    for (let i = 0; i < credentials.length; i++) {
      const loginUrl = credentials[i].url;
      const email = credentials[i].email;
      const password = credentials[i].password;

      console.log(`\n=== 處理第 ${i + 1} 個帳號 ===`);
      console.log(`🌐 登入網址: ${loginUrl}`);
      console.log(`📧 帳號: ${email}`);

      // 在上下文中建立新的分頁物件
      page = await context.newPage();

      try {
        await page.goto(loginUrl);

        //等待輸入操作流程

      } catch (error) {
        console.error(`✗ 帳號 ${email} 出現錯誤:`, error.message);
      } finally {
        // 關閉分頁
        if (page) {
          await page.close();
        }
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
