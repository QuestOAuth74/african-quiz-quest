import { useCallback, useRef } from 'react';

interface SoundEffects {
  playButtonClick: () => void;
  playCorrectAnswer: () => void;
  playWrongAnswer: () => void;
  playQuestionReveal: () => void;
  playCategorySelect: () => void;
  playTimerTick: () => void;
  playGameStart: () => void;
  playSuccess: () => void;
  playError: () => void;
}

export const useSoundEffects = (): SoundEffects => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) => {
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [getAudioContext]);

  const playSequence = useCallback((notes: Array<{frequency: number, duration: number, delay?: number}>, volume: number = 0.1) => {
    let currentTime = 0;
    notes.forEach(note => {
      setTimeout(() => {
        playTone(note.frequency, note.duration, 'sine', volume);
      }, currentTime);
      currentTime += (note.delay || note.duration) * 1000;
    });
  }, [playTone]);

  const playButtonClick = useCallback(() => {
    playTone(800, 0.1, 'square', 0.05);
  }, [playTone]);

  const playCorrectAnswer = useCallback(() => {
    // Classic "ding ding ding" correct answer sound
    playSequence([
      { frequency: 523, duration: 0.2, delay: 0.1 }, // C5
      { frequency: 659, duration: 0.2, delay: 0.1 }, // E5
      { frequency: 784, duration: 0.4, delay: 0.1 }, // G5
    ], 0.15);
  }, [playSequence]);

  const playWrongAnswer = useCallback(() => {
    // Classic "buzzer" wrong answer sound
    playTone(150, 0.8, 'sawtooth', 0.1);
  }, [playTone]);

  const playQuestionReveal = useCallback(() => {
    // Dramatic question reveal sound
    playSequence([
      { frequency: 200, duration: 0.1, delay: 0.05 },
      { frequency: 300, duration: 0.1, delay: 0.05 },
      { frequency: 400, duration: 0.2, delay: 0.1 },
    ], 0.08);
  }, [playSequence]);

  const playCategorySelect = useCallback(() => {
    // Gentle category selection sound
    playTone(440, 0.15, 'sine', 0.06);
  }, [playTone]);

  const playTimerTick = useCallback(() => {
    // Subtle timer tick
    playTone(600, 0.05, 'square', 0.03);
  }, [playTone]);

  const playGameStart = useCallback(() => {
    // Exciting game start fanfare
    playSequence([
      { frequency: 261, duration: 0.2, delay: 0.1 }, // C4
      { frequency: 329, duration: 0.2, delay: 0.1 }, // E4
      { frequency: 392, duration: 0.2, delay: 0.1 }, // G4
      { frequency: 523, duration: 0.4, delay: 0.2 }, // C5
    ], 0.12);
  }, [playSequence]);

  const playSuccess = useCallback(() => {
    // Success notification sound
    playSequence([
      { frequency: 523, duration: 0.15, delay: 0.08 },
      { frequency: 659, duration: 0.15, delay: 0.08 },
      { frequency: 784, duration: 0.3, delay: 0.1 },
    ], 0.1);
  }, [playSequence]);

  const playError = useCallback(() => {
    // Error notification sound
    playSequence([
      { frequency: 300, duration: 0.15, delay: 0.08 },
      { frequency: 250, duration: 0.15, delay: 0.08 },
      { frequency: 200, duration: 0.3, delay: 0.1 },
    ], 0.08);
  }, [playSequence]);

  return {
    playButtonClick,
    playCorrectAnswer,
    playWrongAnswer,
    playQuestionReveal,
    playCategorySelect,
    playTimerTick,
    playGameStart,
    playSuccess,
    playError,
  };
};