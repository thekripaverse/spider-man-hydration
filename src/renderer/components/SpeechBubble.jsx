import React from 'react';
import { Droplets, Clock, Sparkles, Settings } from 'lucide-react';

/**
 * SpeechBubble Component
 * Minimalist, glassmorphic speech bubble that dynamically orients its tail and positioning
 * based on Spider-Man's screen placement and pose.
 */
export default function SpeechBubble({
  quote = "Hey! Drink some water 💧",
  onDrink,
  onSnooze,
  onOpenSettings,
  isReacting = false,
  reactionText = null,
  snoozeDuration = 5,
  isDarkMode = false,
  placement = 'below', // 'below' | 'above' | 'left' | 'right'
  pointerDirection = 'top', // 'top' | 'bottom' | 'right' | 'left'
}) {
  // Compute arrow position and styling based on pointerDirection
  const getArrowStyle = () => {
    switch (pointerDirection) {
      case 'bottom':
        return {
          className: 'absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px]',
          borderColorKey: 'borderTopColor',
        };
      case 'right':
        return {
          className: 'absolute top-1/2 -right-3 -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[12px]',
          borderColorKey: 'borderLeftColor',
        };
      case 'left':
        return {
          className: 'absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[12px]',
          borderColorKey: 'borderRightColor',
        };
      case 'top':
      default:
        return {
          className: 'absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px]',
          borderColorKey: 'borderBottomColor',
        };
    }
  };

  const arrow = getArrowStyle();
  const bgBorderColor = isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.96)';

  return (
    <div
      className={`interactive relative max-w-xs rounded-2xl p-4 transition-all duration-300 animate-bubble-pop select-none ${
        isDarkMode ? 'glass-bubble-dark text-white' : 'glass-bubble text-slate-800'
      }`}
      style={{
        filter: 'drop-shadow(0 16px 36px rgba(0, 0, 0, 0.32))',
      }}
    >
      {/* Dynamic Comic Pointer Arrow pointing accurately towards Spider-Man */}
      <div
        className={arrow.className}
        style={{
          [arrow.borderColorKey]: bgBorderColor,
        }}
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <span className="text-xs">🕷️</span>
          </div>
          <span className="text-[11px] font-bold tracking-wider uppercase opacity-75">
            Spider-Man
          </span>
        </div>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Message Content */}
      <div className="mb-3.5">
        {isReacting && reactionText ? (
          <p className="text-sm font-bold text-sky-600 dark:text-sky-400 leading-snug flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
            <span>{reactionText}</span>
          </p>
        ) : (
          <p className="text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100">
            {quote}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {!isReacting && (
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <button
            onClick={onDrink}
            className="btn-drink flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Droplets className="w-3.5 h-3.5 animate-droplet" />
            <span>💧 I DRANK</span>
          </button>

          <button
            onClick={onSnooze}
            className="btn-snooze py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 opacity-70" />
            <span>😴 Snooze {snoozeDuration}m</span>
          </button>
        </div>
      )}
    </div>
  );
}
