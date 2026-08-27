import React, { useState } from 'react';
import {
  X,
  Clock,
  Volume2,
  VolumeX,
  Upload,
  Play,
  RotateCcw,
  Zap,
  Power,
  BarChart3,
  Trash2,
  Activity,
  Check,
} from 'lucide-react';
import { SPIDERMAN_ASSETS } from '../utils/assetsMetadata';
import { soundSynth } from '../utils/audioSynth';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  stats,
  onResetStats,
  onTriggerTestEntrance,
  nextReminderInSeconds,
  idleSeconds = 0,
}) {
  const [activeTab, setActiveTab] = useState('timers');

  if (!isOpen) return null;

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    if (secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Handle custom audio file selection
  const handleAudioUpload = async (event, soundType) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result;
      let soundUrl = base64String;

      // In Electron environment, persist file to userData
      if (window.electronAPI?.saveCustomAudio) {
        const rawBase64 = base64String.split(',')[1];
        const ext = file.name.split('.').pop() || 'mp3';
        const savedUrl = await window.electronAPI.saveCustomAudio(soundType, rawBase64, ext);
        if (savedUrl) soundUrl = savedUrl;
      }

      const updatedSounds = {
        ...(settings.customSounds || {}),
        [soundType]: {
          name: file.name,
          data: soundUrl,
        },
      };

      onUpdateSettings({ customSounds: updatedSounds });
    };

    reader.readAsDataURL(file);
  };

  const handleClearCustomAudio = (soundType) => {
    const updatedSounds = { ...(settings.customSounds || {}) };
    delete updatedSounds[soundType];
    onUpdateSettings({ customSounds: updatedSounds });
  };

  const handlePreviewAudio = (soundType) => {
    const customData = settings.customSounds?.[soundType]?.data;
    if (soundType === 'reminder') {
      soundSynth.playReminder(customData);
    } else if (soundType === 'drink') {
      soundSynth.playDrinkSuccess(customData);
    } else if (soundType === 'snooze') {
      soundSynth.playSnooze(customData);
    }
  };

  const tabs = [
    { id: 'timers', label: 'Timers', icon: Clock },
    { id: 'character', label: 'Spider-Man', icon: Zap },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'system', label: 'System', icon: Power },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  const handleMouseEnter = () => {
    if (window.electronAPI?.setIgnoreMouseEvents) {
      window.electronAPI.setIgnoreMouseEvents(false);
    }
  };

  return (
    <div
      className="modal-backdrop interactive pointer-events-auto"
      onMouseEnter={handleMouseEnter}
      onClick={onClose}
    >
      <div
        className="modal-card interactive pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={handleMouseEnter}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-600 flex items-center justify-center text-white text-lg shadow-md shadow-rose-600/30">
              🕷️
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Spider-Man Hydration</h2>
              <p className="text-xs text-slate-500 font-medium">Settings & Preferences</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-close"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`modal-tab-btn ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="modal-body">
          {/* TAB 1: TIMERS */}
          {activeTab === 'timers' && (
            <>
              {/* Next Reminder Status Banner */}
              <div className="setting-box" style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
                <div className="setting-box-row">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sky-600" />
                    <span className="font-bold text-xs text-sky-900">Next Reminder in:</span>
                  </div>
                  <span className="setting-value" style={{ color: '#0284c7' }}>
                    {formatTime(nextReminderInSeconds)}
                  </span>
                </div>
              </div>

              {/* Work Interval */}
              <div className="setting-box">
                <div className="setting-box-row">
                  <span className="setting-title">Work Reminder Interval</span>
                  <span className="setting-value">{settings.reminderIntervalMinutes} min</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={settings.reminderIntervalMinutes}
                  onChange={(e) =>
                    onUpdateSettings({ reminderIntervalMinutes: Number(e.target.value) })
                  }
                  className="w-full cursor-pointer"
                />
                <p className="setting-desc">
                  How often Spider-Man appears across your screen to remind you to drink water.
                </p>
              </div>

              {/* Post-Drink Interval */}
              <div className="setting-box">
                <div className="setting-box-row">
                  <span className="setting-title">After-Drink Timer</span>
                  <span className="setting-value">{settings.afterDrinkMinutes} min</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={settings.afterDrinkMinutes}
                  onChange={(e) =>
                    onUpdateSettings({ afterDrinkMinutes: Number(e.target.value) })
                  }
                  className="w-full cursor-pointer"
                />
                <p className="setting-desc">
                  Timer reset duration after you click "💧 I DRANK".
                </p>
              </div>

              {/* Snooze Interval */}
              <div className="setting-box">
                <div className="setting-box-row">
                  <span className="setting-title">Snooze Duration</span>
                  <span className="setting-value">{settings.snoozeMinutes} min</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={settings.snoozeMinutes}
                  onChange={(e) =>
                    onUpdateSettings({ snoozeMinutes: Number(e.target.value) })
                  }
                  className="w-full cursor-pointer"
                />
                <p className="setting-desc">
                  Timer duration when you click "😴 Snooze".
                </p>
              </div>
            </>
          )}

          {/* TAB 2: SPIDER-MAN CHARACTER & ENTRANCES */}
          {activeTab === 'character' && (
            <>
              {/* Character Scale */}
              <div className="setting-box">
                <div className="setting-box-row">
                  <span className="setting-title">Spider-Man Size & Scale</span>
                  <span className="setting-value">{Math.round(settings.scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.4"
                  step="0.05"
                  value={settings.scale}
                  onChange={(e) => onUpdateSettings({ scale: Number(e.target.value) })}
                  className="w-full cursor-pointer"
                />
              </div>

              {/* Entrance Test Playground */}
              <div className="setting-box">
                <span className="setting-title">⚡ Test Spider-Man Entrance Animations:</span>
                <p className="setting-desc">Click any entrance to summon Spider-Man immediately for testing.</p>

                <div className="grid grid-cols-1 gap-2 mt-2">
                  {SPIDERMAN_ASSETS.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-sm hover:border-rose-400 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={asset.src}
                          alt={asset.name}
                          className="spiderman-thumb"
                          style={{ width: '38px', height: '38px', maxWidth: '38px', maxHeight: '38px', objectFit: 'contain', flexShrink: 0 }}
                        />
                        <span className="text-xs font-semibold text-slate-800 truncate">{asset.name}</span>
                      </div>
                      <button
                        onClick={() => onTriggerTestEntrance(asset.id)}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '11px', flexShrink: 0 }}
                      >
                        ⚡ Test Live
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 3: AUDIO & SOUNDS */}
          {activeTab === 'audio' && (
            <>
              {/* Sound Toggle */}
              <div className="setting-box">
                <div className="setting-box-row">
                  <div className="flex items-center gap-2">
                    {settings.enableSound ? (
                      <Volume2 className="w-4 h-4 text-rose-600" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="setting-title">Enable Sound Effects</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableSound}
                    onChange={(e) => onUpdateSettings({ enableSound: e.target.checked })}
                  />
                </div>

                {settings.enableSound && (
                  <div className="mt-2 space-y-1">
                    <div className="setting-box-row">
                      <span className="text-xs text-slate-600 font-semibold">Volume</span>
                      <span className="setting-value">{Math.round(settings.volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.volume}
                      onChange={(e) => onUpdateSettings({ volume: Number(e.target.value) })}
                      className="w-full cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Custom Audio Uploaders */}
              <div className="setting-box">
                <span className="setting-title">🎵 Custom Audio & Voice Lines:</span>
                <p className="setting-desc">Upload your own MP3/WAV files for reminders and reactions.</p>

                {[
                  { id: 'reminder', label: 'Reminder Sound', defaultDesc: 'Web-Shoot THWIP!' },
                  { id: 'drink', label: 'Celebration Sound', defaultDesc: 'Fanfare & Drop' },
                  { id: 'snooze', label: 'Snooze Sound', defaultDesc: 'Playful Sigh' },
                ].map((item) => {
                  const custom = settings.customSounds?.[item.id];
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 mt-2 space-y-2"
                    >
                      <div className="setting-box-row">
                        <span className="text-xs font-bold text-slate-800">{item.label}</span>
                        <span className="text-[11px] text-slate-500">
                          {custom ? `Custom: ${custom.name}` : `Default: ${item.defaultDesc}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreviewAudio(item.id)}
                          className="btn-secondary"
                        >
                          <Play className="w-3 h-3 text-sky-600" />
                          <span>Preview</span>
                        </button>

                        <label className="btn-secondary cursor-pointer">
                          <Upload className="w-3 h-3 text-rose-600" />
                          <span>{custom ? 'Replace Audio' : 'Upload MP3/WAV'}</span>
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={(e) => handleAudioUpload(e, item.id)}
                          />
                        </label>

                        {custom && (
                          <button
                            onClick={() => handleClearCustomAudio(item.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Reset to default"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* TAB 4: SYSTEM & STARTUP */}
          {activeTab === 'system' && (
            <>
              {/* Start With Windows */}
              <div className="setting-box">
                <div className="setting-box-row">
                  <div>
                    <span className="setting-title">Start automatically with Windows</span>
                    <p className="setting-desc">Runs quietly in your system tray when Windows boots up.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.startWithWindows}
                    onChange={async (e) => {
                      const checked = e.target.checked;
                      if (window.electronAPI?.setLoginItemSettings) {
                        await window.electronAPI.setLoginItemSettings(checked);
                      }
                      onUpdateSettings({ startWithWindows: checked });
                    }}
                  />
                </div>
              </div>

              {/* Pause When Idle */}
              <div className="setting-box">
                <div className="setting-box-row">
                  <div>
                    <span className="setting-title">Pause timer when away / idle (over 60s)</span>
                    <p className="setting-desc">Pauses countdown while your computer is locked or unattended.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.pauseWhenIdle}
                    onChange={(e) => onUpdateSettings({ pauseWhenIdle: e.target.checked })}
                  />
                </div>
              </div>
            </>
          )}

          {/* TAB 5: STATS & STREAK */}
          {activeTab === 'stats' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-center space-y-1">
                  <div className="text-2xl font-black text-sky-600">
                    {stats?.drinksToday || 0} 💧
                  </div>
                  <div className="text-xs font-bold text-slate-700">Drinks Today</div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-1">
                  <div className="text-2xl font-black text-rose-600">
                    {stats?.remindersToday || 0} 🕷️
                  </div>
                  <div className="text-xs font-bold text-slate-700">Reminders</div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
                  <div className="text-2xl font-black text-amber-600">
                    {stats?.streakDays || 1} 🔥
                  </div>
                  <div className="text-xs font-bold text-slate-700">Day Streak</div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={onResetStats}
                  className="btn-secondary"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Today's Stats</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
