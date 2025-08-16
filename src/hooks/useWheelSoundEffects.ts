import { useCallback, useRef } from 'react';

interface WheelSoundEffects {
  playWheelSpin: () => void;
  playWheelStop: () => void;
  playCorrectLetter: () => void;
  playWrongLetter: () => void;
  playBankrupt: () => void;
  playLoseTurn: () => void;
  playVowelPurchase: () => void;
  playPuzzleSolve: () => void;
  playVictory: () => void;
  playGameStart: () => void;
  playTurnChange: () => void;
  setVolume: (volume: number) => void;
}

export const useWheelSoundEffects = (): WheelSoundEffects => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const volumeRef = useRef<number>(0.3); // Default 30% volume

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume?: number) => {
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;
      
      const finalVolume = (volume || volumeRef.current) * 0.8; // Reduce overall volume
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(finalVolume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [getAudioContext]);

  const playSequence = useCallback((notes: Array<{frequency: number, duration: number, delay?: number, type?: OscillatorType}>) => {
    let currentTime = 0;
    notes.forEach(note => {
      setTimeout(() => {
        playTone(note.frequency, note.duration, note.type || 'sine');
      }, currentTime);
      currentTime += (note.delay || note.duration) * 1000;
    });
  }, [playTone]);

  const playWheelSpin = useCallback(() => {
    // Create spinning wheel sound effect - ascending pitch with vibrato
    const duration = 2.5;
    const audioContext = getAudioContext();
    
    try {
      // Main spinning sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const lfoOscillator = audioContext.createOscillator(); // For vibrato
      const lfoGain = audioContext.createGain();

      // Connect LFO for vibrato effect
      lfoOscillator.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      lfoOscillator.frequency.setValueAtTime(8, audioContext.currentTime); // 8Hz vibrato
      lfoGain.gain.setValueAtTime(20, audioContext.currentTime); // Vibrato depth

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Start low, go high, then descend
      oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(400, audioContext.currentTime + duration * 0.7);
      oscillator.frequency.linearRampToValueAtTime(150, audioContext.currentTime + duration);
      
      oscillator.type = 'sawtooth';
      
      const finalVolume = volumeRef.current * 0.4;
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(finalVolume, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      lfoOscillator.start(audioContext.currentTime);
      lfoOscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Wheel spin sound failed:', error);
    }
  }, [getAudioContext]);

  const playWheelStop = useCallback(() => {
    // Distinctive "click-click-click" sound as wheel stops
    playSequence([
      { frequency: 800, duration: 0.05, delay: 0.1, type: 'square' },
      { frequency: 700, duration: 0.05, delay: 0.1, type: 'square' },
      { frequency: 600, duration: 0.08, delay: 0.15, type: 'square' },
    ]);
  }, [playSequence]);

  const playCorrectLetter = useCallback(() => {
    // Happy ascending chime
    playSequence([
      { frequency: 523, duration: 0.15, delay: 0.05 }, // C5
      { frequency: 659, duration: 0.15, delay: 0.05 }, // E5
      { frequency: 784, duration: 0.25, delay: 0.1 },  // G5
    ]);
  }, [playSequence]);

  const playWrongLetter = useCallback(() => {
    // Disappointing descending sound
    playSequence([
      { frequency: 400, duration: 0.2, delay: 0.1, type: 'triangle' },
      { frequency: 300, duration: 0.2, delay: 0.1, type: 'triangle' },
      { frequency: 200, duration: 0.3, delay: 0.1, type: 'triangle' },
    ]);
  }, [playSequence]);

  const playBankrupt = useCallback(() => {
    // Dramatic losing sound
    playSequence([
      { frequency: 200, duration: 0.8, delay: 0.2, type: 'sawtooth' },
      { frequency: 150, duration: 0.8, delay: 0.2, type: 'sawtooth' },
      { frequency: 100, duration: 1.0, delay: 0.2, type: 'sawtooth' },
    ]);
  }, [playSequence]);

  const playLoseTurn = useCallback(() => {
    // Gentle disappointment sound
    playSequence([
      { frequency: 300, duration: 0.3, delay: 0.1, type: 'sine' },
      { frequency: 250, duration: 0.4, delay: 0.1, type: 'sine' },
    ]);
  }, [playSequence]);

  const playVowelPurchase = useCallback(() => {
    // Pleasant purchase confirmation
    playSequence([
      { frequency: 440, duration: 0.1, delay: 0.05 }, // A4
      { frequency: 523, duration: 0.1, delay: 0.05 }, // C5
      { frequency: 659, duration: 0.2, delay: 0.1 },  // E5
    ]);
  }, [playSequence]);

  const playPuzzleSolve = useCallback(() => {
    // Triumphant solving sound
    playSequence([
      { frequency: 523, duration: 0.2, delay: 0.1 },  // C5
      { frequency: 659, duration: 0.2, delay: 0.05 }, // E5
      { frequency: 784, duration: 0.2, delay: 0.05 }, // G5
      { frequency: 1047, duration: 0.4, delay: 0.1 }, // C6
    ]);
  }, [playSequence]);

  const playVictory = useCallback(() => {
    // Grand victory fanfare
    playSequence([
      { frequency: 262, duration: 0.3, delay: 0.1 },  // C4
      { frequency: 330, duration: 0.3, delay: 0.05 }, // E4
      { frequency: 392, duration: 0.3, delay: 0.05 }, // G4
      { frequency: 523, duration: 0.3, delay: 0.05 }, // C5
      { frequency: 659, duration: 0.3, delay: 0.05 }, // E5
      { frequency: 784, duration: 0.5, delay: 0.1 },  // G5
      { frequency: 1047, duration: 0.6, delay: 0.1 }, // C6
    ]);
  }, [playSequence]);

  const playGameStart = useCallback(() => {
    // Exciting game start sound
    playSequence([
      { frequency: 392, duration: 0.2, delay: 0.1 }, // G4
      { frequency: 523, duration: 0.2, delay: 0.05 }, // C5
      { frequency: 659, duration: 0.2, delay: 0.05 }, // E5
      { frequency: 784, duration: 0.4, delay: 0.1 }, // G5
    ]);
  }, [playSequence]);

  const playTurnChange = useCallback(() => {
    // Subtle turn change notification
    playSequence([
      { frequency: 440, duration: 0.15, delay: 0.05 }, // A4
      { frequency: 523, duration: 0.2, delay: 0.1 },   // C5
    ]);
  }, [playSequence]);

  const setVolume = useCallback((volume: number) => {
    volumeRef.current = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
  }, []);

  return {
    playWheelSpin,
    playWheelStop,
    playCorrectLetter,
    playWrongLetter,
    playBankrupt,
    playLoseTurn,
    playVowelPurchase,
    playPuzzleSolve,
    playVictory,
    playGameStart,
    playTurnChange,
    setVolume,
  };
};