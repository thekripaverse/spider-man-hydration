const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Settings & Storage IPC
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  getLoginItemSettings: () => ipcRenderer.invoke('get-login-item-settings'),
  setLoginItemSettings: (enabled) => ipcRenderer.invoke('set-login-item-settings', enabled),
  saveCustomAudio: (soundType, base64Data, extension) =>
    ipcRenderer.invoke('save-custom-audio', soundType, base64Data, extension),

  // Window & Mouse Forwarding
  setIgnoreMouseEvents: (ignore, options) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options);
  },
  closeApp: () => {
    ipcRenderer.send('close-app');
  },

  // Event Listeners from Main Process / System Tray
  onTriggerReminder: (callback) => {
    ipcRenderer.on('trigger-reminder', (_event, forcedAnim) => callback(forcedAnim));
  },
  onOpenSettings: (callback) => {
    ipcRenderer.on('open-settings', () => callback());
  },
  onDrinkWater: (callback) => {
    ipcRenderer.on('action-drink', () => callback());
  },
  onSnoozeReminder: (callback) => {
    ipcRenderer.on('action-snooze', () => callback());
  },
  onIdleStatus: (callback) => {
    ipcRenderer.on('idle-status', (_event, idleSec) => callback(idleSec));
  },
  onPowerSuspend: (callback) => {
    ipcRenderer.on('power-suspend', () => callback());
  },
  onPowerResume: (callback) => {
    ipcRenderer.on('power-resume', () => callback());
  },
  onTogglePause: (callback) => {
    ipcRenderer.on('toggle-pause', (_event, isPaused) => callback(isPaused));
  },
});
