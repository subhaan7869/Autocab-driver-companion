/**
 * High-fidelity Audio Synthesizer for Autocab Companion Terminal
 * Synthesizes highly realistic taxi mobile data terminal (MDT) sound effects using standard Web Audio API
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Autocab MDT urgent job offer sound (High-pitched repeating triple beep alert)
 */
export function playOfferChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Create a triple-beep rapid sequence
    const notes = [950, 1150, 1350];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.12);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + index * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + index * 0.12);
      osc.stop(now + index * 0.12 + 0.16);
    });
  } catch (error) {
    console.warn('Audio play offer chime error', error);
  }
}

/**
 * Autocab job acceptance confirmation (Clear, positive dual ascending chime)
 */
export function playAcceptChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // Slide to E5
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.15); // G5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35); // Slide to C6
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.2);
    
    osc2.start(now + 0.15);
    osc2.stop(now + 0.4);
  } catch (error) {
    console.warn('Audio play accept chime error', error);
  }
}

/**
 * Autocab message notification sound (Sweet double digital chirp)
 */
export function playMessageChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    [880, 1174.66].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + index * 0.08 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.11);
    });
  } catch (error) {
    console.warn('Audio play message chime error', error);
  }
}

/**
 * Autocab driver status change or arrived sound (Deeper, secure ding)
 */
export function playArrivedChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(440.00, now + 0.25); // Slur to A4
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (error) {
    console.warn('Audio play arrived chime error', error);
  }
}

/**
 * Taximeter Start sound (Dual mechanical tick-tick switch sounds)
 */
export function playMeterStartChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    [0, 0.12].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now + delay);
      osc.frequency.exponentialRampToValueAtTime(80, now + delay + 0.03);
      
      gain.gain.setValueAtTime(0.2, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + delay);
      osc.stop(now + delay + 0.05);
    });
  } catch (error) {
    console.warn('Audio play meter start chime error', error);
  }
}

/**
 * Shift payment settlement or successful cash collection sound (Sweet digital cash register chime)
 */
export function playCashSettlementChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Sweet, bright ringing frequency with standard coin impact pattern
    const frequencies = [987.77, 1318.51, 1567.98, 1975.53]; // B5, E6, G6, B6
    
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.05);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + index * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + index * 0.05);
      osc.stop(now + index * 0.05 + 0.3);
    });
  } catch (error) {
    console.warn('Audio play cash settlement chime error', error);
  }
}

/**
 * Driver error or invalid selection sound (A harsh low-frequency buzzer)
 */
export function playWarningBuzzer() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.setValueAtTime(115, now + 0.12);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
  } catch (error) {
    console.warn('Audio play warning buzzer error', error);
  }
}
