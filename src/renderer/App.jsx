import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import SpiderMan from './components/SpiderMan';
import WebLine from './components/WebLine';
import SpeechBubble from './components/SpeechBubble';
import SettingsModal from './components/SettingsModal';
import OnboardingModal from './components/OnboardingModal';
import { soundSynth } from './utils/audioSynth';
import { SPIDERMAN_ASSETS, SNOOZE_REPEAT_QUOTES } from './utils/assetsMetadata';

// Hydration State Machine States
const STATES = {
  IDLE_COUNTING: 'IDLE_COUNTING',
  ENTRANCE: 'ENTRANCE',
  REMINDER_VISIBLE: 'REMINDER_VISIBLE',
  ACTION_REACTING: 'ACTION_REACTING',
  EXIT: 'EXIT',
};

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

// Shuffling helper ensuring no immediate repetition
function shuffleAssets(assets, lastAssetId = null) {
  const shuffled = [...assets];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  if (lastAssetId && shuffled[0].id === lastAssetId && shuffled.length > 1) {
    const swap = 1 + Math.floor(Math.random() * (shuffled.length - 1));
    [shuffled[0], shuffled[swap]] = [shuffled[swap], shuffled[0]];
  }
  return shuffled;
}

export default function App() {
  const [appState, setAppState] = useState(STATES.IDLE_COUNTING);
  const [currentAsset, setCurrentAsset] = useState(SPIDERMAN_ASSETS[0]);
  const [currentQuote, setCurrentQuote] = useState("Hey! Drink some water 💧");
  const [reactionText, setReactionText] = useState(null);
  const [reactionType, setReactionType] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Consecutive snooze count to trigger cute concerned reactions
  const snoozeCountRef = useRef(0);
  const assetQueueRef = useRef([]);
  const lastAssetIdRef = useRef(null);

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('spiderman_hydration_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [stats, setStats] = useState(() => {
    try {
      const today = new Date().toDateString();
      if (settings.stats) {
        if (settings.stats.lastDate === today) return settings.stats;
        return {
          drinksToday: 0,
          remindersToday: 0,
          streakDays: (settings.stats.streakDays || 1) + 1,
          lastDate: today,
        };
      }
      return { drinksToday: 0, remindersToday: 0, streakDays: 1, lastDate: today };
    } catch {
      return { drinksToday: 0, remindersToday: 0, streakDays: 1, lastDate: new Date().toDateString() };
    }
  });

  const [remainingSeconds, setRemainingSeconds] = useState(settings.reminderIntervalMinutes * 60);
  const [idleSeconds, setIdleSeconds] = useState(0);

  // Load persistent settings from Electron backend on launch
  useEffect(() => {
    async function loadBackendSettings() {
      if (window.electronAPI?.getSettings) {
        try {
          const backendSettings = await window.electronAPI.getSettings();
          if (backendSettings) {
            setSettings((prev) => ({ ...prev, ...backendSettings }));
            if (backendSettings.stats) setStats(backendSettings.stats);
            if (backendSettings.firstLaunch) {
              setIsOnboardingOpen(true);
            }
          }
        } catch (e) {}
      }
    }
    loadBackendSettings();
  }, []);

  // Sound settings sync
  useEffect(() => {
    soundSynth.setSettings(settings.enableSound, settings.volume);
  }, [settings.enableSound, settings.volume]);

  // Persist settings handler
  const handleUpdateSettings = (updates) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('spiderman_hydration_settings', JSON.stringify(updated));
      if (window.electronAPI?.saveSettings) {
        window.electronAPI.saveSettings(updated);
      }
      return updated;
    });
  };

  // Persist stats handler
  const updateStats = useCallback((drinkDelta = 0, reminderDelta = 0) => {
    setStats((prev) => {
      const today = new Date().toDateString();
      const updated = {
        drinksToday: Math.max(0, prev.drinksToday + drinkDelta),
        remindersToday: Math.max(0, prev.remindersToday + reminderDelta),
        streakDays: prev.streakDays,
        lastDate: today,
      };
      handleUpdateSettings({ stats: updated });
      return updated;
    });
  }, []);

  const handleResetStats = () => {
    const fresh = {
      drinksToday: 0,
      remindersToday: 0,
      streakDays: 1,
      lastDate: new Date().toDateString(),
    };
    setStats(fresh);
    handleUpdateSettings({ stats: fresh });
  };

  // Get next asset from shuffled queue (guarantees variety and no repeats)
  const getNextAsset = useCallback((forcedAssetId = null) => {
    if (forcedAssetId) {
      const found = SPIDERMAN_ASSETS.find((a) => a.id === forcedAssetId);
      if (found) return found;
    }
    if (assetQueueRef.current.length === 0) {
      assetQueueRef.current = shuffleAssets(SPIDERMAN_ASSETS, lastAssetIdRef.current);
    }
    const next = assetQueueRef.current.shift();
    lastAssetIdRef.current = next.id;
    return next;
  }, []);

  // Trigger Spider-Man appearance
  const triggerReminder = useCallback(
    (forcedAssetId = null) => {
      if (appState !== STATES.IDLE_COUNTING) return;

      const chosenAsset = getNextAsset(forcedAssetId);
      setCurrentAsset(chosenAsset);

      // Choose quote based on snooze history and asset
      let quote;
      if (snoozeCountRef.current >= 2) {
        quote = SNOOZE_REPEAT_QUOTES[Math.floor(Math.random() * SNOOZE_REPEAT_QUOTES.length)];
      } else {
        const quotes = chosenAsset.quotes || ["Hey! Drink some water 💧"];
        quote = quotes[Math.floor(Math.random() * quotes.length)];
      }
      setCurrentQuote(quote);
      setReactionText(null);
      setReactionType(null);

      // Sound design based on entrance (custom or procedural)
      soundSynth.playReminder(settings.customSounds?.reminder?.data);
      if (chosenAsset.naturalPose === 'diagonal-swing') {
        setTimeout(() => soundSynth.playWebSwing(), 180);
      }

      setAppState(STATES.ENTRANCE);
      updateStats(0, 1);

      // Entrance animation duration before speech bubble pops
      const entranceDurations = {
        'hanging-tasm': 1200,
        'standing-mcu': 1100,
        'diagonal-swing': 1300,
        'crouch-realistic': 1100,
        'wall-cling': 1600,
        'hanging-mcu': 1200,
        'hanging-comic': 1200,
      };
      const duration = entranceDurations[chosenAsset.id] || 1200;

      setTimeout(() => {
        setAppState(STATES.REMINDER_VISIBLE);
        soundSynth.playBubblePop();
      }, duration);
    },
    [appState, getNextAsset, updateStats, settings.customSounds]
  );

  // Electron IPC Listeners
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onTriggerReminder((forcedId) => triggerReminder(forcedId));
      window.electronAPI.onOpenSettings(() => setIsSettingsOpen(true));
      window.electronAPI.onDrinkWater(() => handleDrink());
      window.electronAPI.onSnoozeReminder(() => handleSnooze());
      window.electronAPI.onIdleStatus((idleSec) => setIdleSeconds(idleSec));
      window.electronAPI.onTogglePause((paused) => setIsPaused(paused));
      window.electronAPI.onPowerSuspend(() => setIsPaused(true));
      window.electronAPI.onPowerResume(() => setIsPaused(false));
    }
  }, [triggerReminder]);

  // Active Timer Tick Loop
  useEffect(() => {
    if (appState !== STATES.IDLE_COUNTING || isPaused) return;

    const interval = setInterval(() => {
      if (settings.pauseWhenIdle && idleSeconds > 60) {
        return;
      }

      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          triggerReminder();
          return settings.reminderIntervalMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    appState,
    isPaused,
    idleSeconds,
    settings.pauseWhenIdle,
    settings.reminderIntervalMinutes,
    triggerReminder,
  ]);

  // "💧 I DRANK" Action
  const handleDrink = () => {
    if (appState !== STATES.REMINDER_VISIBLE) return;

    setAppState(STATES.ACTION_REACTING);
    setReactionType('drink');
    setReactionText(currentAsset.drinkReaction || "That's my human! Stay hydrated 💧🕷️");

    soundSynth.playDrinkSuccess(settings.customSounds?.drink?.data);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.82, y: 0.4 },
        colors: ['#38bdf8', '#0284c7', '#e11d48', '#ffffff'],
      });
    } catch {}

    updateStats(1, 0);
    snoozeCountRef.current = 0;

    // Directional Exit matching asset's entrance
    setTimeout(() => {
      setAppState(STATES.EXIT);
      soundSynth.playWebShoot();

      setTimeout(() => {
        setAppState(STATES.IDLE_COUNTING);
        setRemainingSeconds(settings.afterDrinkMinutes * 60);
      }, 750);
    }, 1600);
  };

  // "😴 Snooze 5 min" Action
  const handleSnooze = () => {
    if (appState !== STATES.REMINDER_VISIBLE) return;

    setAppState(STATES.ACTION_REACTING);
    setReactionType('snooze');
    setReactionText(currentAsset.snoozeReaction || "Fine... 5 more minutes. 😑");

    soundSynth.playSnooze(settings.customSounds?.snooze?.data);
    snoozeCountRef.current += 1;

    // Directional Exit matching asset's entrance
    setTimeout(() => {
      setAppState(STATES.EXIT);
      soundSynth.playWebShoot();

      setTimeout(() => {
        setAppState(STATES.IDLE_COUNTING);
        setRemainingSeconds(settings.snoozeMinutes * 60);
      }, 750);
    }, 1300);
  };

  // Instant Test Trigger from Settings Modal
  const handleTriggerTestEntrance = (assetId) => {
    setIsSettingsOpen(false);
    setAppState(STATES.IDLE_COUNTING);
    setTimeout(() => {
      triggerReminder(assetId);
    }, 150);
  };

  // Mouse event forwarding management
  const isAnyModalOpen = isSettingsOpen || isOnboardingOpen;

  const handleMouseEnterInteractive = () => {
    if (window.electronAPI?.setIgnoreMouseEvents) {
      window.electronAPI.setIgnoreMouseEvents(false);
    }
  };

  const handleMouseLeaveInteractive = () => {
    if (!isAnyModalOpen && window.electronAPI?.setIgnoreMouseEvents) {
      window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
    }
  };

  useEffect(() => {
    if (isAnyModalOpen) {
      window.electronAPI?.setIgnoreMouseEvents(false);
    } else if (appState === STATES.IDLE_COUNTING) {
      window.electronAPI?.setIgnoreMouseEvents(true, { forward: true });
    }
  }, [isAnyModalOpen, appState]);

  // Initial welcome entrance on startup
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      triggerReminder('hanging-tasm');
    }, 800);
    return () => clearTimeout(welcomeTimer);
  }, []);

  const isVisible = appState !== STATES.IDLE_COUNTING;

  // Format countdown
  const formatCountdown = (totalSeconds) => {
    if (totalSeconds <= 0) return '00:00';
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Dynamic animation class based on state and asset
  const getAnimationClass = () => {
    if (appState === STATES.EXIT) {
      return currentAsset.exitClass || 'exit-top-drop';
    }
    if (appState === STATES.ENTRANCE) {
      return currentAsset.entranceClass || 'anim-top-drop';
    }
    return '';
  };

  return (
    <div className="overlay-viewport relative select-none">
      {/* Floating Companion Pill with Countdown & Settings */}
      {!isAnyModalOpen && (
        <div
          className="absolute top-3 right-5 interactive transition-all duration-300 z-30"
          onMouseEnter={handleMouseEnterInteractive}
          onMouseLeave={handleMouseLeaveInteractive}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-rose-500/20 shadow-lg shadow-black/10 hover:shadow-rose-500/20 hover:scale-105 transition-all text-xs font-bold text-slate-700 dark:text-slate-200">
            <button
              onClick={() => triggerReminder()}
              title="Click to summon Spider-Man!"
              className="flex items-center gap-1.5 hover:text-rose-600 transition-colors"
            >
              <span className="text-sm">🕷️</span>
              {isPaused ? (
                <span className="text-amber-500 text-[11px] font-semibold">Paused</span>
              ) : (
                <span className="text-sky-600 dark:text-sky-400 font-mono">
                  {formatCountdown(remainingSeconds)}
                </span>
              )}
            </button>
            <div className="w-[1px] h-3 bg-slate-300 dark:bg-slate-700" />
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Settings & Stats"
              className="hover:text-rose-500 transition-colors p-0.5"
            >
              ⚙️
            </button>
          </div>
        </div>
      )}

      {/* Spider-Man Character & Speech Bubble Overlay */}
      {isVisible && (
        <div
          className={`absolute flex transition-all duration-200 z-40 ${
            currentAsset.bubble.placement === 'left' ? 'flex-row-reverse items-center gap-3' :
            currentAsset.bubble.placement === 'right' ? 'flex-row items-center gap-3' :
            currentAsset.containerClasses
          } ${getAnimationClass()}`}
          style={{
            transformOrigin: currentAsset.naturalPose === 'vertical-hang' ? 'top center' : 'center center',
          }}
        >
          {/* Dynamic Web Lines (Only when appropriate for the natural pose) */}
          {currentAsset.web.type === 'vertical-top' && (
            <WebLine length={currentAsset.web.length || 155} opacity={appState === STATES.EXIT ? 0.4 : 1} />
          )}
          {currentAsset.web.type === 'diagonal-corner' && (
            <WebLine
              length={currentAsset.web.length || 200}
              angle={currentAsset.web.angle || 25}
              opacity={appState === STATES.EXIT ? 0.4 : 1}
            />
          )}

          {/* Realistic Spider-Man Character */}
          <div
            className={`relative z-20 flex justify-center interactive cursor-pointer ${
              appState === STATES.REMINDER_VISIBLE ? (currentAsset.idleMotionClass || 'animate-breathe') : ''
            }`}
            onMouseEnter={handleMouseEnterInteractive}
            onMouseLeave={handleMouseLeaveInteractive}
          >
            <SpiderMan
              asset={currentAsset}
              scale={settings.scale}
              isReacting={appState === STATES.ACTION_REACTING}
              reactionType={reactionType}
              onClick={() => soundSynth.playWaterDrop()}
            />
          </div>

          {/* Adaptive Speech Bubble */}
          {(appState === STATES.REMINDER_VISIBLE || appState === STATES.ACTION_REACTING) && (
            <div
              className="relative z-30 flex justify-center interactive"
              onMouseEnter={handleMouseEnterInteractive}
              onMouseLeave={handleMouseLeaveInteractive}
            >
              <SpeechBubble
                quote={currentQuote}
                reactionText={reactionText}
                isReacting={appState === STATES.ACTION_REACTING}
                onDrink={handleDrink}
                onSnooze={handleSnooze}
                onOpenSettings={() => setIsSettingsOpen(true)}
                snoozeDuration={settings.snoozeMinutes}
                isDarkMode={settings.isDarkMode}
                placement={currentAsset.bubble.placement}
                pointerDirection={currentAsset.bubble.pointerDirection}
              />
            </div>
          )}
        </div>
      )}

      {/* Settings & Stats Modal */}
      <div
        onMouseEnter={handleMouseEnterInteractive}
        onMouseLeave={handleMouseLeaveInteractive}
      >
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          stats={stats}
          onResetStats={handleResetStats}
          onTriggerTestEntrance={handleTriggerTestEntrance}
          nextReminderInSeconds={remainingSeconds}
          idleSeconds={idleSeconds}
        />

        <OnboardingModal
          isOpen={isOnboardingOpen}
          initialSettings={settings}
          onComplete={(onboardingUpdates) => {
            setIsOnboardingOpen(false);
            handleUpdateSettings({ ...onboardingUpdates, firstLaunch: false });
            if (window.electronAPI?.setIgnoreMouseEvents) {
              window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
            }
          }}
        />
      </div>
    </div>
  );
}
