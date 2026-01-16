// 引入 Node 內建 path 模組以處理檔案路徑
const path = require('path');
const fs = require('fs');
const os = require('os');

// 從 Playwright 函式庫引入 chromium 瀏覽器控制器
const { chromium } = require('playwright');

// 開始一個立即執行的非同步函式，用來執行非同步程式碼
(async () => {
  let context;
  // 獲取桌面路徑
  const desktopPath = path.join(os.homedir(), 'Desktop');

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
        // 登入
        await page.goto('https://pay.line.me/portal/tw/auth/login/id?isEpiSwitchOn=true');
        await page.getByText('LINE Pay @line.pay 記住我的商店ID').click();
        await page.getByRole('textbox', { name: '請輸入商店ID' }).click();
        await page.getByRole('textbox', { name: '請輸入商店ID' }).fill(user_ID);
        await page.getByRole('button', { name: '下一步' }).click();
        await page.getByRole('textbox', { name: '請輸入密碼' }).click({
          modifiers: ['ControlOrMeta']
        });
        await page.getByRole('textbox', { name: '請輸入密碼' }).fill(user_PW);
        await page.getByRole('button', { name: '登入', exact: true }).click();
        await page.waitForTimeout(2000);

        // 處理新服務上線浮窗
        try {
          await page.waitForTimeout(1000);
          
          // 方法1: 嘗試找到關閉按鈕(X)
          let closed = false;
          
          // 尋找span或button中包含X的元素
          const closeButtons = await page.locator('button, span, div').all();
          for (const btn of closeButtons) {
            try {
              const text = await btn.textContent();
              if (text && text.trim() === '×') {
                await btn.click();
                console.log('✓ 已通過X按鈕關閉新服務上線浮窗');
                closed = true;
                await page.waitForTimeout(1000);
                break;
              }
            } catch (e) {
              // 繼續尋找
            }
          }
          
          // 方法2: 如果方法1失敗，嘗試點擊"今日不再顯示"
          if (!closed) {
            try {
              const notShowButton = page.locator('text=今日不再顯示').first();
              if (await notShowButton.isVisible()) {
                await notShowButton.click();
                console.log('✓ 已通過"今日不再顯示"關閉新服務上線浮窗');
                closed = true;
                await page.waitForTimeout(1000);
              }
            } catch (e) {
              // 繼續
            }
          }
          
          if (!closed) {
            console.log('⚠ 未找到浮窗關閉按鈕');
          }
        } catch (e) {
          console.log('處理浮窗時出錯:', e.message);
        }

        // 處理緊急通知 (5秒超時)
        try {
          await page.locator('#urgentPromotionCloseButton').click({ timeout: 5000 });
          console.log('✓ 已關閉緊急通知');
        } catch (e) {
          console.log('沒有找到緊急通知或超時');
        }

        // 導航至資料下載頁面
        await page.getByRole('button', { name: '資料下載' }).click();
        await page.waitForTimeout(1000);
        //await page.getByRole('link', { name: '下載設定' }).click();
        //await page.waitForTimeout(1000);
        await page.getByRole('link', { name: '下載交易記錄' }).click();
        await page.waitForTimeout(1000);
        
        // 選擇月份並生成EXCEL
        await page.getByRole('link', { name: '個月' }).click();
        await page.waitForTimeout(1000);
        await page.getByRole('link', { name: 'EXCEL' }).click();
        await page.waitForTimeout(2000);

        // 進入下載頁面並檢測最新一筆正在處理的資料
        await page.getByRole('link', { name: '下載交易記錄' }).click();
        await page.waitForTimeout(2000);

        // 等待頁面加載並檢測"正在處理"的最新一筆資料
        console.log(`  ⏳ 檢測最新一筆正在處理的資料...`);
        
        let isProcessing = true;
        let retryCount = 0;
        const maxRetries = 60; // 最多等待60次 * 3秒 = 3分鐘

        while (isProcessing && retryCount < maxRetries) {
          // 檢查是否還有"正在處理"的狀態
          const processingCell = await page.locator('table tbody tr').filter({
            has: page.locator('td:has-text("正在處理")')
          }).first();

          if (await processingCell.isVisible()) {
            console.log(`  ⏳ 仍在處理中，等待中... (${retryCount + 1}/${maxRetries})`);
            await page.waitForTimeout(3000);
            // 刷新頁面以獲取最新狀態
            await page.reload();
            await page.waitForTimeout(1000);
            retryCount++;
          } else {
            isProcessing = false;
            console.log(`  ✓ 資料已處理完成`);
          }
        }

        if (retryCount >= maxRetries) {
          console.log(`  ⚠ 等待超時，無法完成處理`);
        }

        // 等待狀態變成"已處理"後，點擊第一筆的download按鈕
        console.log(`  📥 搜尋第一筆已處理記錄的下載按鈕...`);
        
        // 找到第一行"已處理"的記錄
        const firstProcessedRow = await page.locator('table tbody tr').filter({
          has: page.locator('td:has-text("已處理")')
        }).first();

        if (await firstProcessedRow.isVisible()) {
          // 在該行中找到下載按鈕
          const downloadButton = firstProcessedRow.locator('button');
          
          // 設置下載監聽器
          const downloadPromise = page.waitForEvent('download');
          await downloadButton.click();
          const download = await downloadPromise;

          // 將文件保存到桌面
          const fileName = download.suggestedFilename();
          const savePath = path.join(desktopPath, fileName);
          await download.saveAs(savePath);

          console.log(`✓ 交易記錄已下載至: ${savePath}`);
        } else {
          console.log(`  ✗ 找不到已處理的記錄`);
        }

        // ============ 下載撨款記錄 ============
        console.log(`\n  📥 開始下載撨款記錄...`);
        
        try {
          // 回到資料下載頁面並選擇下載撨款記錄
          await page.getByRole('button', { name: '資料下載' }).click();
          await page.waitForTimeout(1000);
          await page.getByRole('link', { name: '下載撥款記錄' }).click();
          await page.waitForTimeout(1000);
          
          // 選擇月份並生成EXCEL
          await page.getByRole('link', { name: '個月' }).click();
          await page.waitForTimeout(1000);
          await page.getByRole('link', { name: 'EXCEL' }).click();
          await page.waitForTimeout(2000);

          // 進入撨款記錄下載頁面
          await page.goto('https://pay.line.me/tw/center/download/settleDownloadView?locale=zh_TW');
          await page.waitForTimeout(2000);

          // 等待第一行"已處理"出現
          console.log(`  ⏳ 等待第一行已處理記錄...`);
          let isWaiting = true;
          let waitRetryCount = 0;
          const maxWaitRetries = 60; // 最多等待60次 * 3秒 = 3分鐘

          while (isWaiting && waitRetryCount < maxWaitRetries) {
            // 檢查是否有"已處理"的狀態
            const processedCell = await page.locator('table tbody tr').filter({
              has: page.locator('td:has-text("已處理")')
            }).first();

            if (await processedCell.isVisible()) {
              isWaiting = false;
              console.log(`  ✓ 已處理記錄已出現`);
            } else {
              console.log(`  ⏳ 等待中... (${waitRetryCount + 1}/${maxWaitRetries})`);
              await page.waitForTimeout(3000);
              // 刷新頁面以獲取最新狀態
              await page.reload();
              await page.waitForTimeout(1000);
              waitRetryCount++;
            }
          }

          if (waitRetryCount >= maxWaitRetries) {
            console.log(`  ⚠ 等待超時，無法完成撥款記錄下載`);
          }

          // 找到第一行"已處理"的記錄並點擊download按鈕
          console.log(`  📥 搜尋撥 款記錄的下載按鈕...`);
          
          const settleFirstProcessedRow = await page.locator('table tbody tr').filter({
            has: page.locator('td:has-text("已處理")')
          }).first();

          if (await settleFirstProcessedRow.isVisible()) {
            // 在該行中找到Download按鈕
            const settleDownloadButton = settleFirstProcessedRow.locator('button:has-text("Download")').first();
            
            // 設置下載監聽器
            const settleDownloadPromise = page.waitForEvent('download');
            await settleDownloadButton.click();
            const settleDownload = await settleDownloadPromise;

            // 將文件保存到桌面
            const settleFileName = settleDownload.suggestedFilename();
            const settleSavePath = path.join(desktopPath, settleFileName);
            await settleDownload.saveAs(settleSavePath);

            console.log(`✓ 撥款記錄已下載至: ${settleSavePath}`);
          } else {
            console.log(`  ✗ 找不到撥款記錄的已處理項目`);
          }

        } catch (error) {
          console.error(`  ✗ 下載撥款記錄時出現錯誤:`, error.message);
        }

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
