// Asset-Driven Spider-Man Metadata Registry
// Every asset's natural pose establishes its valid entrance, positioning, web connection, and exit trajectory.

import hangingTasmImg from '../assets/spiderman/hanging_realistic_tasm.png';
import hangingMcuImg from '../assets/spiderman/hanging_realistic_mcu.png';
import standingMcuImg from '../assets/spiderman/standing_realistic_mcu.png';
import crouchingImg from '../assets/spiderman/crouching_realistic.png';
import diagonalSwingImg from '../assets/spiderman/diagonal_swing_realistic.png';
import wallClingImg from '../assets/spiderman/wall_cling_realistic.png';
import hangingComicImg from '../assets/spiderman/hanging_comic.png';

export const SPIDERMAN_ASSETS = [
  // 1. TASM2 REALISTIC VERTICAL UPSIDE-DOWN HANGING
  {
    id: 'hanging-tasm',
    name: '1. Realistic Vertical Upside-Down Drop (TASM2 Suit)',
    src: hangingTasmImg,
    naturalPose: 'vertical-hang',
    width: 175,
    screenPosition: 'top-right',
    containerClasses: 'top-0 right-24 items-center',
    entranceClass: 'anim-top-drop',
    exitClass: 'exit-top-drop',
    idleMotionClass: 'animate-sway',
    web: {
      type: 'vertical-top',
      length: 155,
    },
    bubble: {
      placement: 'below', // Sits below upside-down mask
      pointerDirection: 'top',
    },
    quotes: [
      "Hey... did you drink water? 👀",
      "Hydration check! 🕷️💧",
      "Spider-Man says: HYDRATE.",
      "Your friendly neighborhood hydration reminder."
    ],
    drinkReaction: "Yesss! 💧 Nice job!",
    snoozeReaction: "Fine... I'll be back in 5 minutes. 😑",
  },

  // 2. REALISTIC STANDING ARMS CROSSED (MCU Homecoming Suit)
  {
    id: 'standing-mcu',
    name: '2. Bottom Edge Rise (Standing Peter Parker)',
    src: standingMcuImg,
    naturalPose: 'bottom-standing',
    width: 130,
    screenPosition: 'bottom-right',
    containerClasses: 'bottom-4 right-24 flex-col-reverse items-center',
    entranceClass: 'anim-bottom-rise',
    exitClass: 'exit-bottom-rise',
    idleMotionClass: 'animate-breathe',
    web: {
      type: 'none',
    },
    bubble: {
      placement: 'above', // Sits safely above standing Spider-Man's head
      pointerDirection: 'bottom',
    },
    quotes: [
      "You forgot something... WATER.",
      "Standing by until you take a sip 💧",
      "I'm keeping my spider-eyes on you: Drink water!",
      "Even superheroes take regular hydration breaks."
    ],
    drinkReaction: "That's my human! Stay hydrated 💧🕷️",
    snoozeReaction: "5 more minutes on the clock... don't forget!",
  },

  // 3. REALISTIC DIAGONAL WEB SHOOTING / SWINGING
  {
    id: 'diagonal-swing',
    name: '3. Top Corner Diagonal Web Swing',
    src: diagonalSwingImg,
    naturalPose: 'diagonal-swing',
    width: 250,
    screenPosition: 'top-corner',
    containerClasses: 'top-12 right-20 items-end',
    entranceClass: 'anim-corner-swing',
    exitClass: 'exit-corner-swing',
    idleMotionClass: 'animate-breathe',
    web: {
      type: 'diagonal-corner',
      angle: 28,
      length: 220,
    },
    bubble: {
      placement: 'left', // Sits to the left of diagonal Spider-Man
      pointerDirection: 'right',
    },
    quotes: [
      "Caught you working again! 💧",
      "Swung across the city just to make sure you drink water.",
      "THWIP! Hydration check incoming! 🕷️⚡",
      "Web-fluid is ready, but what about your water glass?"
    ],
    drinkReaction: "Awesome! Catch ya on the next swing! 🕸️✨",
    snoozeReaction: "Snoozing? Okay, swinging back in 5 mins!",
  },

  // 4. REALISTIC CROUCHING / GROUND PERCH (TASM2 Suit)
  {
    id: 'crouch-realistic',
    name: '4. Bottom Corner Perch & Land',
    src: crouchingImg,
    naturalPose: 'bottom-crouch',
    width: 215,
    screenPosition: 'bottom-right',
    containerClasses: 'bottom-4 right-16 flex-col-reverse items-center',
    entranceClass: 'anim-bottom-rise',
    exitClass: 'exit-bottom-rise',
    idleMotionClass: 'animate-breathe',
    web: {
      type: 'none',
    },
    bubble: {
      placement: 'above', // Sits safely above crouching Spider-Man
      pointerDirection: 'bottom',
    },
    quotes: [
      "Water. Now. 🕷️",
      "Perched right here until I see that water bottle go up!",
      "Hydration level check: Time for a refill. 💧",
      "Just landed to remind you: Take a big gulp."
    ],
    drinkReaction: "Good job! Stay sharp, web-friend. 💧",
    snoozeReaction: "Fine... 5 minutes. I'm watching you! 😑",
  },

  // 5. SIDE WALL CLING / LEAP (MCU Suit)
  {
    id: 'wall-cling',
    name: '5. Side Edge Wall Cling & Peek',
    src: wallClingImg,
    naturalPose: 'wall-cling',
    width: 220,
    screenPosition: 'right-edge',
    containerClasses: 'top-28 right-8 items-start',
    entranceClass: 'anim-side-peek',
    exitClass: 'exit-side-peek',
    idleMotionClass: 'animate-breathe',
    web: {
      type: 'none',
    },
    bubble: {
      placement: 'left', // Sits to the left towards screen center
      pointerDirection: 'right',
    },
    quotes: [
      "Did you drink water?",
      "Hey... did you drink water? 👀",
      "I see you... and that empty glass. 💧",
      "Clung to your screen until you take a sip!"
    ],
    drinkReaction: "Boom! 100% superhero fuel unlocked! ⚡",
    snoozeReaction: "5 minutes! Don't make me crawl back over here! 🕷️",
  },

  // 6. MCU HOMECOMING HANGING UPSIDE-DOWN ON WEB
  {
    id: 'hanging-mcu',
    name: '6. Upside-Down Ceiling Drop (MCU Suit)',
    src: hangingMcuImg,
    naturalPose: 'vertical-hang',
    width: 185,
    screenPosition: 'top-right',
    containerClasses: 'top-0 right-28 items-center',
    entranceClass: 'anim-top-drop',
    exitClass: 'exit-top-drop',
    idleMotionClass: 'animate-sway',
    web: {
      type: 'vertical-top',
      length: 150,
    },
    bubble: {
      placement: 'below',
      pointerDirection: 'top',
    },
    quotes: [
      "Hey! Peter Parker here: Drink some water 💧",
      "Dropping in for a quick hydration check! 🕷️",
      "Great power comes with great hydration responsibility. 💧"
    ],
    drinkReaction: "Yesss! 💧 That's what I like to see!",
    snoozeReaction: "Alright, 5 minutes on the clock! 😑",
  },

  // 7. COMIC UPSIDE-DOWN HANGING (Stylized Mask)
  {
    id: 'hanging-comic',
    name: '7. Playful Ceiling Web Hang',
    src: hangingComicImg,
    naturalPose: 'vertical-hang',
    width: 180,
    screenPosition: 'top-center',
    containerClasses: 'top-0 left-1/2 -translate-x-1/2 items-center',
    entranceClass: 'anim-top-drop',
    exitClass: 'exit-top-drop',
    idleMotionClass: 'animate-sway',
    web: {
      type: 'vertical-top',
      length: 160,
    },
    bubble: {
      placement: 'below',
      pointerDirection: 'top',
    },
    quotes: [
      "Ceiling check: Glug glug time! 💧",
      "Come on... just drink some water 😭",
      "Stay hydrated, stay awesome! 🕷️✨"
    ],
    drinkReaction: "Nice! Peter Parker approves this sip. 🕸️✨",
    snoozeReaction: "Fine... I'll be right back down in 5. 😑",
  }
];

export const SNOOZE_REPEAT_QUOTES = [
  "You STILL haven't had water? 😭",
  "Hey... did you drink water? 👀",
  "Second hydration check! Time to drink 💧",
  "Come on, just one big gulp!",
  "I'm keeping my spider-eyes on you... WATER! 🕷️"
];
