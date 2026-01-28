// 引入 Node 內建 path 模組以處理檔案路徑
const path = require('path');
const fs = require('fs');

// 從 Playwright 函式庫引入 chromium 瀏覽器控制器
const { chromium } = require('playwright');

/**
 * 動態尋找 Chromium 可執行檔
 * 支援不同版本，避免版本硬編碼問題
 */
function findChromiumExecutable() {
  // 可能的 Chromium 位置
  const possiblePaths = [
    // Playwright 安裝位置 (Windows)
    path.join(process.env.LOCALAPPDATA || '', 'ms-playwright'),
    path.join(process.env.USERPROFILE || '', '.cache', 'ms-playwright'),
    // Node modules 位置
    path.join(__dirname, 'node_modules', '@playwright', 'browser-chromium'),
    path.join(__dirname, '..', 'node_modules', '@playwright', 'browser-chromium'),
    // 全域安裝位置
    path.join(process.env.APPDATA || '', 'npm', 'node_modules', '@playwright', 'browser-chromium')
  ];

  for (const basePath of possiblePaths) {
    if (!fs.existsSync(basePath)) continue;

    try {
      // 尋找所有 chromium-* 資料夾
      const entries = fs.readdirSync(basePath, { withFileTypes: true });
      const chromiumDirs = entries
        .filter(e => e.isDirectory() && e.name.startsWith('chromium-'))
        .map(e => e.name)
        .sort((a, b) => {
          // 按版本號排序，取最新版本
          const versionA = parseInt(a.split('-')[1]) || 0;
          const versionB = parseInt(b.split('-')[1]) || 0;
          return versionB - versionA;
        });

      for (const chromiumDir of chromiumDirs) {
        const execPath = path.join(basePath, chromiumDir, 'chrome-win', 'chrome.exe');
        if (fs.existsSync(execPath)) {
          console.log(`✓ 找到 Chromium: ${execPath}`);
          return execPath;
        }
      }
    } catch (err) {
      // 忽略讀取錯誤，繼續尋找
    }
  }

  console.log('⚠ 未找到 Chromium 可執行檔，將使用 Playwright 預設設定');
  return null;
}

// 開始一個立即執行的非同步函式，用來執行非同步程式碼
(async () => {
  let context;
  let page;

  try {
    // 不要寫死 userDataDir 路徑;可用環境變數 USER_DATA_DIR 覆蓋,否則使用專案目錄下的 user-data
    const userDataDir = process.env.USER_DATA_DIR // 從環境變數讀取 USER_DATA_DIR
      ? path.resolve(process.env.USER_DATA_DIR)   // 如果有設定,解析為絕對路徑
      : path.resolve(process.cwd(), 'user-data'); // 否則解析專案目錄下的 'user-data' 路徑

    // 尋找 Chromium 可執行檔
    const chromiumPath = findChromiumExecutable();

    // 啟動一個會使用指定的 user-data-dir 的 launchPersistentContext (持久性上下文)
    const launchOptions = {
      headless: false // 將 headless 設為 false,使瀏覽器以可視化模式執行
    };

    // 如果找到自訂 Chromium 路徑，則使用它
    if (chromiumPath) {
      launchOptions.executablePath = chromiumPath;
    }

    context = await chromium.launchPersistentContext(userDataDir, launchOptions);

    // 在上下文中建立新的分頁物件
    page = await context.newPage();

    await page.goto('https://github.com/user/repo/settings/access');

//等待輸入操作流程


  } catch (error) {
    console.error('執行過程中發生錯誤:', error);
  } finally {
    // 確保資源被釋放
    if (page) {
      await page.close(); // 呼叫 page.close() 關閉分頁 物件
    }
    if (context) {
      await context.close(); // 呼叫 context.close() 關閉整個瀏覽器上下文並釋放資源
    }
  }

})();
