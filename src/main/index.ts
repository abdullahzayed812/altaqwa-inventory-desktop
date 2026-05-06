import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { initializeDatabase } from './database/dataSource';
import { setupIpcHandlers } from './ipc';

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
    await initializeDatabase();
    setupIpcHandlers();

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            // At runtime, __dirname = dist/main/ → preload at dist/preload/index.js
            preload: path.join(__dirname, '../preload/index.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        // Vite builds renderer to dist/renderer/index.html
        // __dirname at runtime = dist/main/ → ../renderer/index.html = dist/renderer/index.html
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
