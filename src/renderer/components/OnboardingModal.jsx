import React, { useState } from 'react';
import { Sparkles, Check, Clock, Power, X } from 'lucide-react';

export default function OnboardingModal({ isOpen, onComplete, initialSettings }) {
  const [intervalMin, setIntervalMin] = useState(initialSettings?.reminderIntervalMinutes || 25);
  const [startWithWindows, setStartWithWindows] = useState(initialSettings?.startWithWindows ?? true);

  if (!isOpen) return null;

  const handleGetStarted = (e) => {
    if (e) e.stopPropagation();
    onComplete({
      reminderIntervalMinutes: intervalMin,
      startWithWindows,
      firstLaunch: false,
    });
  };

  const handleMouseEnter = () => {
    if (window.electronAPI?.setIgnoreMouseEvents) {
      window.electronAPI.setIgnoreMouseEvents(false);
    }
  };

  return (
    <div
      className="modal-backdrop interactive pointer-events-auto"
      onMouseEnter={handleMouseEnter}
      onClick={handleGetStarted}
    >
      <div
        className="modal-card interactive pointer-events-auto"
        style={{ width: '480px', padding: '0' }}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={handleMouseEnter}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-xl shadow-md shadow-rose-600/30 text-white shrink-0">
              🕷️
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Welcome!</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h2>
              <p className="text-xs text-slate-500 font-medium">I'm your Spider-Man hydration companion.</p>
            </div>
          </div>

          <button
            onClick={handleGetStarted}
            className="btn-close"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p className="text-xs text-slate-600 leading-relaxed">
            I'll appear across your screen while you work to keep you healthy, energized, and hydrated.
          </p>

          {/* Interval Setting Box */}
          <div className="setting-box">
            <div className="setting-box-row">
              <span className="setting-title flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                <span>Work reminder interval:</span>
              </span>
              <span className="setting-value">{intervalMin} min</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={intervalMin}
              onChange={(e) => setIntervalMin(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Auto-Start Box */}
          <div className="setting-box">
            <div className="setting-box-row">
              <div>
                <span className="setting-title flex items-center gap-1.5">
                  <Power className="w-3.5 h-3.5 text-sky-600" />
                  <span>Start automatically with Windows</span>
                </span>
                <p className="setting-desc">Runs quietly in your system tray when you log in.</p>
              </div>
              <input
                type="checkbox"
                checked={startWithWindows}
                onChange={(e) => setStartWithWindows(e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            onClick={handleGetStarted}
            className="btn-primary w-full"
            style={{ padding: '12px 20px', fontSize: '14px' }}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Get Started</span>
          </button>
        </div>
      </div>
    </div>
  );
}
