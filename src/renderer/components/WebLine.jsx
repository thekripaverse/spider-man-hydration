import React from 'react';

/**
 * Realistic Dynamic Web Line Component
 * Renders an animated SVG web strand connecting from an anchor point to Spider-Man
 */
export default function WebLine({
  startX = '50%',
  startY = 0,
  length = 220,
  angle = 0,
  opacity = 0.95,
  isDiagonal = false,
  targetX = 0,
  targetY = 0,
}) {
  if (isDiagonal) {
    // Custom 2-point diagonal web line
    return (
      <svg
        className="absolute pointer-events-none z-10 overflow-visible"
        style={{
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: opacity,
          transition: 'opacity 0.2s ease',
        }}
      >
        <defs>
          <linearGradient id="diagWebGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Core strand */}
        <line
          x1={startX}
          y1={startY}
          x2={targetX}
          y2={targetY}
          stroke="url(#diagWebGlow)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Soft Shadow */}
        <line
          x1={startX}
          y1={startY}
          x2={targetX}
          y2={targetY}
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />
      </svg>
    );
  }

  // Vertical / Pendulum Hanging Web
  return (
    <svg
      className="absolute top-0 pointer-events-none z-10"
      style={{
        left: '50%',
        transform: `translateX(-50%) rotate(${angle}deg)`,
        transformOrigin: 'top center',
        width: '40px',
        height: `${length}px`,
        overflow: 'visible',
        opacity: opacity,
        transition: 'opacity 0.2s ease',
      }}
    >
      <defs>
        <linearGradient id="verticalWebGlow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <line
        x1="20"
        y1="0"
        x2="20"
        y2={length}
        stroke="rgba(15, 23, 42, 0.35)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Core line */}
      <line
        x1="20"
        y1="0"
        x2="20"
        y2={length}
        stroke="url(#verticalWebGlow)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Web Nodes */}
      {Array.from({ length: Math.floor(length / 28) }).map((_, i) => {
        const yPos = (i + 1) * 28;
        return (
          <g key={i} opacity="0.85">
            <path
              d={`M 16 ${yPos - 2} Q 20 ${yPos + 2} 24 ${yPos - 2}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx="20" cy={yPos} r="1.4" fill="#ffffff" />
          </g>
        );
      })}

      {/* Top Anchor Point */}
      <circle cx="20" cy="2" r="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
    </svg>
  );
}
