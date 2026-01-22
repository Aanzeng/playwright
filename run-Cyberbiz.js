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

      // 從URL中提取店铺名称 (XXX from https://XXX.cyberbiz.co/admin)
      const shopNameMatch = loginUrl.match(/https:\/\/(.+?)\.cyberbiz\.co/);
      const shopName = shopNameMatch ? shopNameMatch[1] : `shop_${i + 1}`;
      const savePath = `C:\\trans\\`;

      console.log(`\n=== 處理第 ${i + 1} 個帳號 ===`);
      console.log(`🌐 登入網址: ${loginUrl}`);
      console.log(`📧 帳號: ${email}`);
      console.log(`📧 店舖名稱: ${shopName}`);
      console.log(`📁 儲存路徑: ${savePath}`);

      // 建立C:\trans資料夾
      if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, { recursive: true });
        console.log(`✓ 已建立檔案夾: ${savePath}`);
      }

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

  // ============ 查找並下載已過完的對帳單 ============
  console.log(`\n📊 開始查找已過完的對帳單區間...`);
  
  try {
    // ============ 獲取當前日期並判斷要查找的區間 ============
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    console.log(`📅 當前日期: ${currentYear}年${currentMonth}月${currentDay}號`);
    
    // 判斷應該查找哪個區間
    // 如果當前日期 > 15，則查找當月的 1-15 區間
    // 如果當前日期 <= 15，則查找上個月的 16-月末 區間
    let targetPeriod = '';
    let targetMonthYear = '';
    
    if (currentDay > 15) {
      // 查找當月的 1-15 區間
      targetPeriod = '1-15';
      targetMonthYear = `${currentMonth}月`;
      console.log(`💡 因為今天是${currentDay}號(> 15)，要查找本月 1-15 的檔案`);
    } else {
      // 查找上個月的 16-月末 區間
      targetPeriod = '16-月末';
      
      // 計算上個月
      let prevMonth = currentMonth - 1;
      let prevYear = currentYear;
      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear = currentYear - 1;
      }
      
      targetMonthYear = `${prevMonth}月`;
      console.log(`💡 因為今天是${currentDay}號(<= 15)，要查找上個月(${prevYear}年${prevMonth}月) 16-月末 的檔案`);
    }
    
    console.log(`🎯 目標: 尋找第一個有下載按鈕的對帳單\n`);
    
    // 嘗試多種選擇器找行
    let rows = await page.locator('tr').all();
    console.log(`  'tr' 找到 ${rows.length} 行`);
    
    if (rows.length === 0) {
      // 嘗試查找所有div
      rows = await page.locator('div').all();
      console.log(`  'div' 找到 ${rows.length} 個元素`);
    }
    
    if (rows.length === 0) {
      // 嘗試查找所有按鈕
      const buttons = await page.locator('button:has-text("下載對帳單"), a:has-text("下載對帳單")').all();
      console.log(`  找到 ${buttons.length} 個下載按鈕`);
      
      if (buttons.length > 0) {
        console.log(`\n✓ 找到下載按鈕！開始下載第一個...`);
        
        // ============ 備份現有檔案 ============
        const bakPath = path.join(shopPath, 'BAK');
        const files = fs.readdirSync(shopPath);
        const filesToMove = files.filter(file => {
          const filePath = path.join(shopPath, file);
          return fs.statSync(filePath).isFile() && file !== 'BAK';
        });

        if (filesToMove.length > 0) {
          if (!fs.existsSync(bakPath)) {
            fs.mkdirSync(bakPath, { recursive: true });
            console.log(`  ✓ 已建立備份檔案夾: ${bakPath}`);
          }
          
          console.log(`  🔄 備份現有檔案到: ${bakPath}`);
          filesToMove.forEach(file => {
            const srcPath = path.join(shopPath, file);
            const destPath = path.join(bakPath, file);
            
            if (fs.existsSync(destPath)) {
              fs.unlinkSync(destPath);
            }
            
            fs.renameSync(srcPath, destPath);
            console.log(`    ✓ 已備份: ${file}`);
          });
        }
        
        console.log(`  📥 開始下載...`);
        const downloadPromise = page.waitForEvent('download');
        await buttons[0].click();
        const download = await downloadPromise;
        
        const fileName = download.suggestedFilename();
        const finalFileName = `${shopName}-${fileName}`;
        const finalPath = path.join(savePath, finalFileName);
        await download.saveAs(finalPath);
        
        console.log(`✓ 對帳單已下載至: ${finalPath}`);
      }
    }
    
    console.log(`\n找到 ${rows.length} 行/元素\n`);
    
    let foundDownloadButton = false;
    
    // 逐行查找，直到找到有"下載對帳單"按鈕的行
    for (const row of rows) {
      try {
        const rowText = await row.textContent();
        
        // 檢查該行是否包含下載按鈕
        const downloadButton = row.locator('button:has-text("下載對帳單"), a:has-text("下載對帳單")').first();
        const isVisible = await downloadButton.isVisible().catch(() => false);
        
        if (isVisible) {
          console.log(`✓ 找到有下載按鈕的對帳單: ${rowText.substring(0, 100)}`);
          
          // ============ 備份現有檔案 ============
          const bakPath = path.join(shopPath, 'BAK');
          const files = fs.readdirSync(shopPath);
          const filesToMove = files.filter(file => {
            const filePath = path.join(shopPath, file);
            // 只移動檔案，不移動資料夾（BAK除外）
            return fs.statSync(filePath).isFile() && file !== 'BAK';
          });

          if (filesToMove.length > 0) {
            // 建立備份資料夾
            if (!fs.existsSync(bakPath)) {
              fs.mkdirSync(bakPath, { recursive: true });
              console.log(`  ✓ 已建立備份檔案夾: ${bakPath}`);
            }
            
            console.log(`  🔄 備份現有檔案到: ${bakPath}`);
            filesToMove.forEach(file => {
              const srcPath = path.join(shopPath, file);
              const destPath = path.join(bakPath, file);
              
              // 如果備份資料夾中已有同名檔案，先刪除
              if (fs.existsSync(destPath)) {
                fs.unlinkSync(destPath);
              }
              
              fs.renameSync(srcPath, destPath);
              console.log(`    ✓ 已備份: ${file}`);
            });
          }
          
          console.log(`  📥 開始下載...`);
          const downloadPromise = page.waitForEvent('download');
          await downloadButton.click();
          const download = await downloadPromise;
          
          // 保存檔案到C:\trans\ 並以 店舖名稱-檔案名稱 格式命名
          const fileName = download.suggestedFilename();
          const finalFileName = `${shopName}-${fileName}`;
          const finalPath = path.join(savePath, finalFileName);
          await download.saveAs(finalPath);
          
          console.log(`✓ 對帳單已下載至: ${finalPath}`);
          foundDownloadButton = true;
          break;
        }
      } catch (e) {
        // 繼續檢查下一行
        continue;
      }
    }
    
    if (!foundDownloadButton) {
      console.log(`⚠ 未找到任何有下載按鈕的對帳單`);
    }
    
  } catch (error) {
    console.error(`  ✗ 查找對帳單時出現錯誤:`, error.message);
  }


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
