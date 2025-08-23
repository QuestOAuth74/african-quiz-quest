import { useRef, useCallback } from 'react';

interface GameAudioHook {
  playCorrectAnswer: () => void;
  playWrongAnswer: () => void;
  playCountdown: () => void;
  stopCountdown: () => void;
  playThinkingCountdown: () => void;
  stopThinkingCountdown: () => void;
  playPebbleDrop: () => void;
  setEffectsVolume: (volume: number) => void;
}

export const useGameAudio = (): GameAudioHook => {
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);
  const thinkingCountdownAudioRef = useRef<HTMLAudioElement | null>(null);
  const pebbleDropAudioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef<number>(0.5); // Default 50% volume

  const initializeAudio = useCallback((audioRef: React.MutableRefObject<HTMLAudioElement | null>, src: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.preload = 'auto';
      audioRef.current.volume = volumeRef.current;
    }
    return audioRef.current;
  }, []);

  const playCorrectAnswer = useCallback(() => {
    const audio = initializeAudio(correctAudioRef, 'https://tvfqqzphwwcgrvmkilzr.supabase.co/storage/v1/object/public/question-images/cheers.mp3');
    audio.currentTime = 0;
    audio.play().catch(console.warn);
  }, [initializeAudio]);

  const playWrongAnswer = useCallback(() => {
    const audio = initializeAudio(wrongAudioRef, 'https://tvfqqzphwwcgrvmkilzr.supabase.co/storage/v1/object/public/question-images/boo.mp3');
    audio.currentTime = 0;
    audio.play().catch(console.warn);
  }, [initializeAudio]);

  const playCountdown = useCallback(() => {
    const audio = initializeAudio(countdownAudioRef, 'https://tvfqqzphwwcgrvmkilzr.supabase.co/storage/v1/object/public/question-images/countdown%20ha1.mp3');
    audio.currentTime = 0;
    audio.loop = true;
    audio.play().catch(console.warn);
  }, [initializeAudio]);

  const stopCountdown = useCallback(() => {
    if (countdownAudioRef.current) {
      countdownAudioRef.current.pause();
      countdownAudioRef.current.currentTime = 0;
    }
  }, []);

  const playThinkingCountdown = useCallback(() => {
    const audio = initializeAudio(thinkingCountdownAudioRef, 'https://tvfqqzphwwcgrvmkilzr.supabase.co/storage/v1/object/public/question-images/thinking-music.mp3');
    audio.currentTime = 0;
    audio.loop = true;
    audio.play().catch(console.warn);
  }, [initializeAudio]);

  const stopThinkingCountdown = useCallback(() => {
    if (thinkingCountdownAudioRef.current) {
      thinkingCountdownAudioRef.current.pause();
      thinkingCountdownAudioRef.current.currentTime = 0;
    }
  }, []);

  const playPebbleDrop = useCallback(() => {
    // Create a simple pebble drop sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a short percussive sound
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(volumeRef.current * 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) {
      console.warn('Could not create pebble drop sound:', e);
    }
  }, []);

  const setEffectsVolume = useCallback((volume: number) => {
    volumeRef.current = volume;
    // Update volume for all existing audio instances
    if (correctAudioRef.current) correctAudioRef.current.volume = volume;
    if (wrongAudioRef.current) wrongAudioRef.current.volume = volume;
    if (countdownAudioRef.current) countdownAudioRef.current.volume = volume;
    if (thinkingCountdownAudioRef.current) thinkingCountdownAudioRef.current.volume = volume;
    if (pebbleDropAudioRef.current) pebbleDropAudioRef.current.volume = volume;
  }, []);

  return {
    playCorrectAnswer,
    playWrongAnswer,
    playCountdown,
    stopCountdown,
    playThinkingCountdown,
    stopThinkingCountdown,
    playPebbleDrop,
    setEffectsVolume
  };
};