// High-fidelity Web Audio API Procedural Sound Synthesizer & Custom Audio Player
// Supports procedural audio synthesis and custom user-uploaded audio files.

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.6;
    this.currentAudio = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSettings(enabled, volume = 0.6) {
    this.enabled = enabled;
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Play custom audio data URL or fallback to synthesizer
  playAudioData(dataUrl, fallbackFn) {
    if (!this.enabled) return;
    if (dataUrl) {
      try {
        if (this.currentAudio) {
          this.currentAudio.pause();
          this.currentAudio = null;
        }
        const audio = new Audio(dataUrl);
        audio.volume = this.volume;
        this.currentAudio = audio;
        audio.play().catch(() => {
          if (fallbackFn) fallbackFn.call(this);
        });
        return;
      } catch (err) {
        // Fallback on error
      }
    }
    if (fallbackFn) {
      fallbackFn.call(this);
    }
  }

  // Reminder Sound (custom or procedural web-shoot)
  playReminder(customData = null) {
    if (customData) {
      this.playAudioData(customData, () => this.playWebShoot());
    } else {
      this.playWebShoot();
    }
  }

  // Drink Success Sound (custom or celebration fanfare)
  playDrinkSuccess(customData = null) {
    if (customData) {
      this.playAudioData(customData, () => this.playCelebration());
    } else {
      this.playCelebration();
    }
  }

  // Snooze Sound (custom or playful sigh chime)
  playSnooze(customData = null) {
    if (customData) {
      this.playAudioData(customData, () => this.playSnoozeGroan());
    } else {
      this.playSnoozeGroan();
    }
  }

  // Realistic Spider-Man Web Shooting "THWIP!"
  playWebShoot() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.8, t);
    masterGain.connect(this.ctx.destination);

    // 1. High frequency compressed noise burst for the gas/web expulsion
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.12);
    filter.Q.setValueAtTime(4.0, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(1, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start(t);

    // 2. High-speed fluid string 'zip'
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.14);

    oscGain.gain.setValueAtTime(0.4, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Soft elastic web swing swoosh
  playWebSwing() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.45, t);
    masterGain.connect(this.ctx.destination);

    // Filtered pink noise swoosh
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.linearRampToValueAtTime(900, t + 0.18);
    filter.frequency.linearRampToValueAtTime(250, t + 0.38);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, t);
    noiseGain.gain.linearRampToValueAtTime(0.7, t + 0.18);
    noiseGain.gain.linearRampToValueAtTime(0.001, t + 0.4);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start(t);
  }

  // Pure crystal harmonic water drop "plink"
  playWaterDrop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.7, t);
    masterGain.connect(this.ctx.destination);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(1450, t + 0.22);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.26);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2400, t);
    gain2.gain.setValueAtTime(0.15, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(t);
    osc2.stop(t + 0.13);
  }

  // Celebratory hydration fanfare
  playCelebration() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.5, t);
    masterGain.connect(this.ctx.destination);

    notes.forEach((freq, index) => {
      const startTime = t + (index * 0.08);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.01, startTime);
      gain.gain.linearRampToValueAtTime(0.5, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });

    setTimeout(() => {
      this.playWaterDrop();
    }, 180);
  }

  // Comic sigh chime for Snooze
  playSnoozeGroan() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440.0, 392.0, 349.23]; // A4, G4, F4 descending
    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.45, t);
    masterGain.connect(this.ctx.destination);

    notes.forEach((freq, index) => {
      const startTime = t + (index * 0.1);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.95, startTime + 0.2);

      gain.gain.setValueAtTime(0.01, startTime);
      gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.26);
    });
  }

  // Soft speech bubble pop
  playBubblePop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.5, t);
    masterGain.connect(this.ctx.destination);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.06);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }
}

export const soundSynth = new SoundSynthesizer();
