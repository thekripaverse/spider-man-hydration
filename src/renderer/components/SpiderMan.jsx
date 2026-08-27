import React from 'react';

/**
 * SpiderMan Component
 * Renders the chosen Spider-Man photographic asset without deforming the source image.
 * Uses natural whole-body physics (bounces, tilts, harmonic sways).
 */
export default function SpiderMan({
  asset,
  scale = 1.0,
  isReacting = false,
  reactionType = null, // 'drink' | 'snooze' | null
  onClick = null,
}) {
  if (!asset) return null;

  // Subtle natural body language on reaction without modifying the artwork
  const getReactionTransform = () => {
    if (!isReacting) return '';
    if (reactionType === 'drink') {
      // Happy subtle bounce and tilt
      return 'translateY(-8px) scale(1.03) rotate(2.5deg)';
    }
    if (reactionType === 'snooze') {
      // Subtle playful disappointment / quizzical head tilt
      return 'translateY(3px) rotate(-3.5deg)';
    }
    return '';
  };

  const finalWidth = (asset.width || 200) * scale;

  return (
    <div
      onClick={onClick}
      className="relative inline-block transition-transform duration-300 select-none"
      style={{
        transform: getReactionTransform(),
        transformOrigin: asset.naturalPose === 'vertical-hang' ? 'top center' : 'center center',
      }}
    >
      <img
        src={asset.src}
        alt={asset.name}
        draggable={false}
        className="pointer-events-auto select-none transition-all duration-300"
        style={{
          width: `${finalWidth}px`,
          height: 'auto',
          filter: 'drop-shadow(0 18px 32px rgba(0, 0, 0, 0.52))',
          imageRendering: 'auto',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}
