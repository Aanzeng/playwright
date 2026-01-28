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
    // 讀取 credentials-cyberbiz.txt 檔案並解析
    // 格式: 店名,網址,帳號,密碼
    const credentialsPath = path.resolve(process.cwd(), 'credentials-cyberbiz.txt');
    const credentials = fs.readFileSync(credentialsPath, 'utf-8')
      .trim()
      .split('\n')
      .map(line => {
        const [shopName, url, email, password] = line.split(',');
        return { 
          shopName: shopName.trim(),
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

    // ============ 在執行迴圈前先備份現有檔案 ============
    const savePath = `E:\\SOB\\trans\\cyberbiz\\`;
    console.log(`\n📁 檢查存檔目錄...\n`);
    
    // 建立目錄（如果不存在）
    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, { recursive: true });
      console.log(`✓ 已建立檔案夾: ${savePath}`);
    }
    
    // 檢查並備份現有檔案
    const existingFiles = fs.readdirSync(savePath).filter(file => {
      const filePath = path.join(savePath, file);
      try {
        return fs.statSync(filePath).isFile() && file !== 'BAK';
      } catch {
        return false;
      }
    });

    if (existingFiles.length > 0) {
      const bakPath = path.join(savePath, 'BAK');
      if (!fs.existsSync(bakPath)) {
        fs.mkdirSync(bakPath, { recursive: true });
        console.log(`✓ 已建立備份檔案夾: ${bakPath}`);
      }
      
      console.log(`🔄 備份 ${existingFiles.length} 個現有檔案到: ${bakPath}`);
      existingFiles.forEach(file => {
        const srcPath = path.join(savePath, file);
        const destPath = path.join(bakPath, file);
        
        if (fs.existsSync(destPath)) {
          fs.unlinkSync(destPath);
        }
        
        fs.renameSync(srcPath, destPath);
        console.log(`  ✓ ${file}`);
      });
    }
    
    console.log(`\n📋 開始處理所有帳號...\n`);

    // 迴圈遍歷每一個帳號
    for (let i = 0; i < credentials.length; i++) {
      const shopName = credentials[i].shopName;
      const loginUrl = credentials[i].url;
      const email = credentials[i].email;
      const password = credentials[i].password;

      console.log(`\n=== 處理第 ${i + 1} 個帳號 ===`);
      console.log(`🏪 店名: ${shopName}`);
      console.log(`🌐 登入網址: ${loginUrl}`);
      console.log(`📧 帳號: ${email}`);

      // 在上下文中建立新的分頁物件
      page = await context.newPage();

      try {
        await page.goto(loginUrl);

        //等待輸入操作流程
        await page.locator('#login-input').click();
        await page.locator('#login-input').fill(email);
        await page.locator('#password').click();
        await page.locator('#password').fill(password);
        await page.getByRole('button', { name: '登入' }).click();
        await page.waitForTimeout(2000);
        
        // ============ 處理廣告視窗 ============
        console.log('🔍 檢查是否有廣告視窗...');
        try {
          // 方法1: 尋找"我已詳細閱讀，並確認"按鈕
          const agreeButtons = await page.locator('button:has-text("我已詳細閱讀，並確認")').all();
          if (agreeButtons.length > 0) {
            const btn = agreeButtons[0];
            const isVisible = await btn.isVisible();
            if (isVisible) {
              await btn.click();
              console.log('✓ 已關閉廣告視窗 (方法1: 我已詳細閱讀，並確認)');
              await page.waitForTimeout(1000);
            }
          }
        } catch (e) {
          console.log('  (未找到確認按鈕)');
        }
        
        try {
          // 方法2: 尋找關閉按鈕 (X)
          const closeButtons = await page.locator('button[aria-label="Close"], button:has-text("X"), .close, [class*="close"]').all();
          for (const btn of closeButtons) {
            try {
              const isVisible = await btn.isVisible();
              if (isVisible) {
                await btn.click();
                console.log('✓ 已關閉廣告視窗 (方法2: 關閉按鈕)');
                await page.waitForTimeout(1000);
                break;
              }
            } catch (e) {
              continue;
            }
          }
        } catch (e) {
          console.log('  (無廣告或無法關閉)');
        }
        
        try {
          // 方法3: 尋找"確定"或"同意"按鈕
          const confirmButtons = await page.locator('button:has-text("確定"), button:has-text("同意"), button:has-text("OK")').all();
          if (confirmButtons.length > 0) {
            const btn = confirmButtons[0];
            const isVisible = await btn.isVisible();
            if (isVisible) {
              await btn.click();
              console.log('✓ 已關閉廣告視窗 (方法3: 確定按鈕)');
              await page.waitForTimeout(1000);
            }
          }
        } catch (e) {
          console.log('  (無廣告或無法關閉)');
        }
        
        // 將鼠標移動到頁面左側以顯示動態選單
        console.log('🔍 移動鼠標到左側以顯示菜單...');
        await page.mouse.move(50, 300);
        await page.waitForTimeout(1000);
        
        // 點擊管理中心
        try {
          const adminLink = page.getByRole('link', { name: '管理中心' });
          await adminLink.click();
          console.log('✓ 已點擊管理中心');
          await page.waitForTimeout(1000);
        } catch (e) {
          console.log('⚠ 未找到管理中心，嘗試尋找其他選項');
        }
        
        // 移動鼠標到左側以顯示對帳中心選單
        await page.mouse.move(50, 300);
        await page.waitForTimeout(1000);
        
        // 點擊對帳中心
        try {
          const accountingLink = page.getByRole('link', { name: '對帳中心' });
          await accountingLink.click();
          console.log('✓ 已點擊對帳中心');
          await page.waitForTimeout(1000);
        } catch (e) {
          console.log('⚠ 未找到對帳中心，嘗試尋找其他選項');
        }

        // ============ 等待頁面加載並檢查按鈕 ============
        console.log(`\n⏳ 等待對帳中心頁面加載，30秒內每3秒掃描一次...`);
        
        let pageLoaded = false;
        let cycleCount = 0;
        const maxCycles = 3;
        const cycleWaitTime = 30000; // 30秒
        const scanInterval = 3000; // 3秒

        while (!pageLoaded && cycleCount < maxCycles) {
          cycleCount++;
          console.log(`\n📋 開始第 ${cycleCount} 個30秒循環...`);
          
          const startTime = Date.now();
          let found = false;
          
          // 在30秒內持續掃描
          while (Date.now() - startTime < cycleWaitTime && !found) {
            try {
              // 檢查是否存在下載對帳單按鈕
              const downloadButtons = await page.locator('button:has-text("下載對帳單"), a:has-text("下載對帳單")').all();
              
              if (downloadButtons.length > 0) {
                console.log(`✓ 找到下載對帳單按鈕，頁面已加載`);
                pageLoaded = true;
                found = true;
                break;
              } else {
                const elapsedTime = Math.round((Date.now() - startTime) / 1000);
                console.log(`  ⏳ 已掃描 ${elapsedTime} 秒，未找到按鈕，3秒後再掃描...`);
                await page.waitForTimeout(scanInterval);
              }
            } catch (e) {
              const elapsedTime = Math.round((Date.now() - startTime) / 1000);
              console.log(`  ⏳ 已掃描 ${elapsedTime} 秒，掃描出錯，3秒後再掃描...`);
              await page.waitForTimeout(scanInterval);
            }
          }
          
          // 如果未找到且還有循環次數，刷新頁面並進入下一個循環
          if (!found && cycleCount < maxCycles) {
            console.log(`  🔄 30秒循環結束，未找到按鈕，重整頁面進入下一循環...`);
            await page.reload();
            await page.waitForTimeout(1000);
          }
        }

        if (!pageLoaded) {
          console.log(`⚠ 已達最大循環次數(${maxCycles})，頁面仍未完全加載`);
        }

        // ============ 查找並下載第一個有下載按鈕的對帳單 ============
        console.log(`\n📊 開始查找對帳單...\n`);
        
        try {
          // 直接查找所有下載按鈕
          const downloadButtons = await page.locator('button:has-text("下載對帳單"), a:has-text("下載對帳單")').all();
          console.log(`📊 找到 ${downloadButtons.length} 個下載按鈕\n`);
          
          if (downloadButtons.length > 0) {
            let downloadedFlag = false;
            
            // 逐個檢查按鈕，找到第一個可見的
            for (let btnIndex = 0; btnIndex < downloadButtons.length; btnIndex++) {
              try {
                const btn = downloadButtons[btnIndex];
                const isVisible = await btn.isVisible().catch(() => false);
                
                if (isVisible) {
                  console.log(`✓ 找到第一個可見的下載按鈕（第 ${btnIndex + 1} 個）`);
                  
                  console.log(`\n📥 開始下載...`);
                  const downloadPromise = page.waitForEvent('download');
                  await btn.click();
                  const download = await downloadPromise;
                  
                  const fileName = download.suggestedFilename();
                  const finalFileName = `${shopName}-${fileName}`;
                  const finalPath = path.join(savePath, finalFileName);
                  await download.saveAs(finalPath);
                  
                  console.log(`✓ 對帳單已下載至: ${finalPath}`);
                  downloadedFlag = true;
                  break;
                }
              } catch (e) {
                console.log(`  ⚠ 第 ${btnIndex + 1} 個按鈕處理失敗: ${e.message}`);
                continue;
              }
            }
            
            if (!downloadedFlag) {
              console.log(`⚠ 未找到任何可見的下載按鈕`);
            }
          } else {
            console.log(`⚠ 頁面上沒有找到下載按鈕`);
          }
        } catch (error) {
          console.error(`✗ 查找對帳單時出現錯誤: ${error.message}`);
        }

      } catch (error) {
        console.error(`✗ 帳號 ${email} 出現錯誤: ${error.message}`);
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
