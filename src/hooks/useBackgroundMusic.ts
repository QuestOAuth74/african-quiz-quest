import { useEffect, useRef, useState } from 'react';

interface BackgroundMusicOptions {
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
}

export const useBackgroundMusic = (
  audioUrl: string, 
  options: BackgroundMusicOptions = {}
) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    autoPlay = true,
    loop = true,
    volume = 0.3
  } = options;

  useEffect(() => {
    // Create audio element
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // Configure audio
    audio.loop = loop;
    audio.volume = volume;
    audio.preload = 'auto';

    // Event listeners
    const handleCanPlayThrough = () => {
      setIsLoaded(true);
      if (autoPlay) {
        playMusic();
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setError('Failed to load background music');
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Cleanup
    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audioRef.current = null;
    };
  }, [audioUrl, autoPlay, loop, volume]);

  const playMusic = async () => {
    if (audioRef.current && isLoaded) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.warn('Audio autoplay prevented by browser:', error);
        setError('Click anywhere to enable background music');
      }
    }
  };

  const pauseMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const setVolumeLevel = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  };

  // Handle user interaction to enable autoplay
  const handleUserInteraction = () => {
    if (!isPlaying && isLoaded && autoPlay) {
      playMusic();
    }
  };

  return {
    isPlaying,
    isLoaded,
    error,
    playMusic,
    pauseMusic,
    stopMusic,
    setVolumeLevel,
    handleUserInteraction
  };
};