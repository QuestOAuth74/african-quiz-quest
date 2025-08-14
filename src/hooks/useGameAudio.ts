import { useRef, useCallback } from 'react';

interface GameAudioHook {
  playCorrectAnswer: () => void;
  playWrongAnswer: () => void;
  playCountdown: () => void;
  stopCountdown: () => void;
  playThinkingCountdown: () => void;
  stopThinkingCountdown: () => void;
  setEffectsVolume: (volume: number) => void;
}

export const useGameAudio = (): GameAudioHook => {
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);
  const thinkingCountdownAudioRef = useRef<HTMLAudioElement | null>(null);
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

  const setEffectsVolume = useCallback((volume: number) => {
    volumeRef.current = volume;
    // Update volume for all existing audio instances
    if (correctAudioRef.current) correctAudioRef.current.volume = volume;
    if (wrongAudioRef.current) wrongAudioRef.current.volume = volume;
    if (countdownAudioRef.current) countdownAudioRef.current.volume = volume;
    if (thinkingCountdownAudioRef.current) thinkingCountdownAudioRef.current.volume = volume;
  }, []);

  return {
    playCorrectAnswer,
    playWrongAnswer,
    playCountdown,
    stopCountdown,
    playThinkingCountdown,
    stopThinkingCountdown,
    setEffectsVolume
  };
};