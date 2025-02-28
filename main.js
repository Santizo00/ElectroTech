const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

app.whenReady().then(() => {
    console.log("🚀 Iniciando aplicación...");

    // Levantar backend
    backendProcess = spawn('node', ['Backend/index.js'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
    });

    backendProcess.on('close', (code) => {
        console.log(`⚠️ Backend cerrado con código ${code}`);
    });

    // Crear la ventana del frontend
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadURL(`http://localhost:3000`); // Cargar el frontend

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (backendProcess) backendProcess.kill();
    });
});

app.on('quit', () => {
    if (backendProcess) backendProcess.kill();
});
