const { app, BrowserWindow, screen, ipcMain, Tray, Menu, nativeImage, powerMonitor } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;
let idleCheckInterval = null;
let isPaused = false;

const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

// Production Logging
const userDataPath = app.getPath('userData');
const logFilePath = path.join(userDataPath, 'app.log');
const settingsFilePath = path.join(userDataPath, 'settings.json');
const soundsDirPath = path.join(userDataPath, 'sounds');

// Ensure directories exist
try {
  if (!fs.existsSync(soundsDirPath)) {
    fs.mkdirSync(soundsDirPath, { recursive: true });
  }
} catch (e) {}

function log(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;
  try {
    fs.appendFileSync(logFilePath, entry, 'utf8');
  } catch (err) {}
  if (isDev) {
    console.log(`[LOG] ${message}`);
  }
}

log('Application starting...');

// Default Settings
const DEFAULT_SETTINGS = {
  reminderIntervalMinutes: 25,
  afterDrinkMinutes: 20,
  snoozeMinutes: 5,
  scale: 1.0,
  enableSound: true,
  volume: 0.6,
  pauseWhenIdle: true,
  startWithWindows: false,
  isDarkMode: false,
  firstLaunch: true,
  customSounds: {},
  stats: {
    drinksToday: 0,
    remindersToday: 0,
    streakDays: 1,
    lastDate: new Date().toDateString(),
  },
};

// Settings Persistence Helpers
function loadStoredSettings() {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const raw = fs.readFileSync(settingsFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (err) {
    log(`Failed to read settings: ${err.message}`);
  }
  return DEFAULT_SETTINGS;
}

function saveStoredSettings(settings) {
  try {
    const existing = loadStoredSettings();
    const merged = { ...existing, ...settings };
    fs.writeFileSync(settingsFilePath, JSON.stringify(merged, null, 2), 'utf8');
    log('Settings successfully saved to userData');
    return merged;
  } catch (err) {
    log(`Failed to save settings: ${err.message}`);
    return settings;
  }
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  log('Another instance already running. Exiting secondary instance.');
  app.quit();
} else {
  app.on('second-instance', () => {
    log('Second instance attempted to launch. Bringing main window to front.');
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send('open-settings');
    }
  });
}

function createOverlayWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    fullscreenable: false,
    skipTaskbar: true, // Clean background utility living in system tray
    icon: path.join(__dirname, '../../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false, // Ensure timer ticks smoothly in background
    },
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  const distPath = app.isPackaged
    ? path.join(app.getAppPath(), 'dist/index.html')
    : path.join(__dirname, '../../dist/index.html');

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.loadFile(distPath);
      }
    });
  } else {
    mainWindow.loadFile(distPath);
  }

  mainWindow.webContents.on('did-finish-load', () => {
    log('Main window finished loading');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Build and update System Tray
function updateTrayMenu() {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    { label: '🕷️ Spider-Man Hydration', enabled: false },
    { type: 'separator' },
    {
      label: '💧 Drink Water (+1 💧)',
      click: () => {
        if (mainWindow) mainWindow.webContents.send('action-drink');
      },
    },
    {
      label: '🕷️ Test Reminder',
      click: () => {
        if (mainWindow) mainWindow.webContents.send('trigger-reminder');
      },
    },
    {
      label: '⚙️ Settings',
      click: () => {
        if (mainWindow) mainWindow.webContents.send('open-settings');
      },
    },
    { type: 'separator' },
    {
      label: isPaused ? '▶ Resume Reminders' : '⏸ Pause Reminders',
      click: () => {
        isPaused = !isPaused;
        log(`Hydration reminders ${isPaused ? 'paused' : 'resumed'}`);
        if (mainWindow) mainWindow.webContents.send('toggle-pause', isPaused);
        updateTrayMenu();
      },
    },
    { type: 'separator' },
    {
      label: '🚪 Exit',
      click: () => {
        log('User initiated exit from System Tray');
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function createTray() {
  const iconPath = path.join(__dirname, '../../build/icon.png');
  let trayIcon;

  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 20, height: 20 });
  } else {
    // Vector fallback icon
    const svgIcon = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#e11d48"/>
        <ellipse cx="16" cy="16" rx="10" ry="12" fill="#dc2626"/>
        <path d="M 10 14 C 11 11 14 11 14 16 C 14 18 10 18 10 14 Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.2"/>
        <path d="M 22 14 C 21 11 18 11 18 16 C 18 18 22 18 22 14 Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.2"/>
      </svg>
    `;
    trayIcon = nativeImage.createFromBuffer(Buffer.from(svgIcon)).resize({ width: 20, height: 20 });
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('Spider-Man Hydration Reminder 🕷️💧');

  updateTrayMenu();

  tray.on('double-click', () => {
    if (mainWindow) mainWindow.webContents.send('open-settings');
  });

  log('System tray initialized');
}

// System Idle & Sleep/Wake Monitoring
function startSystemMonitoring() {
  if (idleCheckInterval) clearInterval(idleCheckInterval);

  idleCheckInterval = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        const idleTime = powerMonitor.getSystemIdleTime();
        mainWindow.webContents.send('idle-status', idleTime);
      } catch (err) {}
    }
  }, 2000);

  powerMonitor.on('suspend', () => {
    log('System entered sleep/suspend. Pausing timers.');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('power-suspend');
    }
  });

  powerMonitor.on('resume', () => {
    log('System resumed from sleep. Resuming timers cleanly.');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('power-resume');
    }
  });
}

// IPC Handlers
ipcMain.handle('get-settings', () => {
  return loadStoredSettings();
});

ipcMain.handle('save-settings', (_event, settings) => {
  return saveStoredSettings(settings);
});

ipcMain.handle('get-login-item-settings', () => {
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.handle('set-login-item-settings', (_event, enabled) => {
  log(`Setting Windows login auto-start: ${enabled}`);
  app.setLoginItemSettings({
    openAtLogin: !!enabled,
    path: process.execPath,
    args: ['--hidden'],
  });
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.handle('save-custom-audio', (_event, soundType, base64Data, extension) => {
  try {
    const fileName = `${soundType}_${Date.now()}.${extension || 'mp3'}`;
    const targetPath = path.join(soundsDirPath, fileName);
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(targetPath, buffer);
    log(`Saved custom audio file for ${soundType} at: ${targetPath}`);
    return `file://${targetPath.replace(/\\/g, '/')}`;
  } catch (err) {
    log(`Failed to save custom audio: ${err.message}`);
    return null;
  }
});

ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (ignore) {
      win.setIgnoreMouseEvents(true, { forward: true, ...options });
    } else {
      win.setIgnoreMouseEvents(false);
    }
  }
});

ipcMain.on('close-app', () => {
  log('Close app requested');
  app.quit();
});

// App Lifecycle
if (gotTheLock) {
  app.whenReady().then(() => {
    // Check auto-start initial status
    const stored = loadStoredSettings();
    if (stored.startWithWindows) {
      app.setLoginItemSettings({
        openAtLogin: true,
        path: process.execPath,
        args: ['--hidden'],
      });
    }

    createOverlayWindow();
    createTray();
    startSystemMonitoring();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createOverlayWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (idleCheckInterval) clearInterval(idleCheckInterval);
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    log('Application shutting down gracefully.');
  });
}
