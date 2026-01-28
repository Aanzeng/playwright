const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 存儲當前運行的進程
const runningProcesses = {};

// 中間件
app.use(express.json());
app.use(express.static('public'));


// 執行腳本的端點
app.post('/api/run-script', (req, res) => {
  const { scriptName } = req.body;

  // 驗證腳本名稱
  const allowedScripts = ['run-Cyberbiz.js', 'run-linepay.js'];
  if (!allowedScripts.includes(scriptName)) {
    return res.status(400).json({ error: '無效的腳本名稱' });
  }

  const scriptPath = path.join(__dirname, scriptName);
  
  // 檢查腳本是否存在
  if (!fs.existsSync(scriptPath)) {
    return res.status(404).json({ error: '腳本不存在' });
  }

  // 如果已有相同的進程在運行，則停止它
  if (runningProcesses[scriptName]) {
    runningProcesses[scriptName].kill();
    delete runningProcesses[scriptName];
  }

  // 執行腳本
  const process = spawn('node', [scriptPath], {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  runningProcesses[scriptName] = process;
  let output = '';
  let errorOutput = '';

  process.stdout.on('data', (data) => {
    output += data.toString();
    console.log(`[${scriptName}] ${data.toString()}`);
  });

  process.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.error(`[${scriptName}] 錯誤: ${data.toString()}`);
  });

  process.on('close', (code) => {
    delete runningProcesses[scriptName];
    console.log(`[${scriptName}] 進程已結束，代碼: ${code}`);
  });

  res.json({ 
    message: `已開始執行 ${scriptName}`,
    scriptName: scriptName
  });
});

// 停止腳本的端點
app.post('/api/stop-script', (req, res) => {
  const { scriptName } = req.body;

  if (runningProcesses[scriptName]) {
    runningProcesses[scriptName].kill();
    delete runningProcesses[scriptName];
    return res.json({ message: `已停止 ${scriptName}` });
  }

  res.status(400).json({ error: `${scriptName} 未在運行` });
});

// 獲取運行狀態的端點
app.get('/api/status', (req, res) => {
  const status = {};
  const scripts = ['run-Cyberbiz.js', 'run-linepay.js'];
  
  scripts.forEach(script => {
    status[script] = runningProcesses[script] ? 'running' : 'stopped';
  });

  res.json(status);
});

app.listen(PORT, () => {
  console.log(`🚀 服務器運行於 http://localhost:${PORT}`);
  console.log('可以透過網頁執行 run-Cyberbiz.js 和 run-linepay.js');
});
