import { useCallback, useRef, useEffect } from 'react';
import { useBackgroundMusic } from './useBackgroundMusic';

interface SenetAudioHook {
  // Background music controls
  isPlayingMusic: boolean;
  playMusic: () => void;
  pauseMusic: () => void;
  setMusicVolume: (volume: number) => void;
  
  // Sound effects
  playStickThrow: () => void;
  playPieceMove: () => void;
  playPieceCapture: () => void;
  playGameStart: () => void;
  playGameWin: () => void;
  playGameLose: () => void;
  playTurnChange: () => void;
  playSpecialSquare: () => void;
  setEffectsVolume: (volume: number) => void;
}

// Ancient Egyptian themed background music URL (royalty-free)
const EGYPTIAN_MUSIC_URL = 'https://www.soundjay.com/misc/sounds-961.mp3'; // Placeholder - we'll use procedural audio

export const useSenetAudio = (): SenetAudioHook => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const effectsVolumeRef = useRef<number>(0.3);
  
  // Background music using existing hook
  const {
    isPlaying: isPlayingMusic,
    playMusic,
    pauseMusic,
    setVolumeLevel: setMusicVolume,
    handleUserInteraction
  } = useBackgroundMusic('', {
    autoPlay: false,
    loop: true,
    volume: 0.2
  });

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Create ancient Egyptian-inspired procedural music
  const createEgyptianAmbience = useCallback(() => {
    try {
      const audioContext = getAudioContext();
      
      // Create a complex ambient sound with multiple layers
      const playAmbientTone = (frequency: number, duration: number, delay: number = 0) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          const filterNode = audioContext.createBiquadFilter();
          
          oscillator.connect(filterNode);
          filterNode.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Use ancient scales - pentatonic for Egyptian feel
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          oscillator.type = 'sine';
          
          // Add filtering for mystical sound
          filterNode.type = 'lowpass';
          filterNode.frequency.setValueAtTime(800, audioContext.currentTime);
          filterNode.Q.setValueAtTime(5, audioContext.currentTime);
          
          // Envelope
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.5);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
        }, delay);
      };

      // Play Egyptian pentatonic scale sequence
      const egyptianScale = [220, 247, 277, 330, 370]; // A3 pentatonic
      egyptianScale.forEach((freq, index) => {
        playAmbientTone(freq, 4, index * 1000);
        playAmbientTone(freq * 0.5, 6, index * 1000 + 500); // Add octave below
      });

      // Schedule next sequence
      setTimeout(() => createEgyptianAmbience(), 8000);
    } catch (error) {
      console.warn('Audio context error:', error);
    }
  }, [getAudioContext]);

  // Enhanced procedural music that starts the ambience
  const playProceduralMusic = useCallback(() => {
    createEgyptianAmbience();
  }, [createEgyptianAmbience]);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.2) => {
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * effectsVolumeRef.current, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [getAudioContext]);

  const playSequence = useCallback((notes: Array<{frequency: number, duration: number, delay?: number}>, volume: number = 0.2) => {
    let currentTime = 0;
    notes.forEach(note => {
      setTimeout(() => {
        playTone(note.frequency, note.duration, 'sine', volume);
      }, currentTime);
      currentTime += (note.delay || note.duration) * 1000;
    });
  }, [playTone]);

  // Senet-specific sound effects
  const playStickThrow = useCallback(() => {
    // Sound of throwing sticks - multiple quick wooden clicks
    const stickSounds = [
      { frequency: 150, duration: 0.1, delay: 0.05 },
      { frequency: 180, duration: 0.08, delay: 0.03 },
      { frequency: 160, duration: 0.12, delay: 0.04 },
      { frequency: 140, duration: 0.1, delay: 0.02 },
    ];
    playSequence(stickSounds, 0.3);
  }, [playSequence]);

  const playPieceMove = useCallback(() => {
    // Ancient stone piece sliding on board
    playTone(200, 0.3, 'triangle', 0.15);
  }, [playTone]);

  const playPieceCapture = useCallback(() => {
    // Dramatic capture sound - Egyptian themed
    playSequence([
      { frequency: 100, duration: 0.2, delay: 0.1 },
      { frequency: 150, duration: 0.3, delay: 0.2 },
      { frequency: 80, duration: 0.4, delay: 0.1 }
    ], 0.25);
  }, [playSequence]);

  const playGameStart = useCallback(() => {
    // Ancient Egyptian fanfare
    const fanfare = [
      { frequency: 220, duration: 0.3, delay: 0.1 }, // A3
      { frequency: 277, duration: 0.3, delay: 0.1 }, // C#4
      { frequency: 330, duration: 0.3, delay: 0.1 }, // E4
      { frequency: 440, duration: 0.5, delay: 0.2 }, // A4
    ];
    playSequence(fanfare, 0.2);
    
    // Start background ambience after fanfare
    setTimeout(() => playProceduralMusic(), 1500);
  }, [playSequence, playProceduralMusic]);

  const playGameWin = useCallback(() => {
    // Victorious Egyptian triumph
    const victory = [
      { frequency: 330, duration: 0.4, delay: 0.1 },
      { frequency: 415, duration: 0.4, delay: 0.1 },
      { frequency: 523, duration: 0.4, delay: 0.1 },
      { frequency: 659, duration: 0.6, delay: 0.2 },
    ];
    playSequence(victory, 0.3);
  }, [playSequence]);

  const playGameLose = useCallback(() => {
    // Somber defeat - descending ancient tones
    const defeat = [
      { frequency: 330, duration: 0.5, delay: 0.2 },
      { frequency: 277, duration: 0.5, delay: 0.2 },
      { frequency: 220, duration: 0.5, delay: 0.2 },
      { frequency: 165, duration: 0.8, delay: 0.2 },
    ];
    playSequence(defeat, 0.2);
  }, [playSequence]);

  const playTurnChange = useCallback(() => {
    // Subtle turn indicator
    playTone(370, 0.2, 'sine', 0.1);
  }, [playTone]);

  const playSpecialSquare = useCallback(() => {
    // Mystical special square sound
    playSequence([
      { frequency: 440, duration: 0.15, delay: 0.05 },
      { frequency: 554, duration: 0.15, delay: 0.05 },
      { frequency: 659, duration: 0.25, delay: 0.1 },
    ], 0.2);
  }, [playSequence]);

  const setEffectsVolume = useCallback((volume: number) => {
    effectsVolumeRef.current = Math.max(0, Math.min(1, volume));
  }, []);

  // Handle user interaction for autoplay
  useEffect(() => {
    const handleClick = () => {
      handleUserInteraction();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleUserInteraction]);

  return {
    isPlayingMusic,
    playMusic: playProceduralMusic,
    pauseMusic,
    setMusicVolume,
    playStickThrow,
    playPieceMove,
    playPieceCapture,
    playGameStart,
    playGameWin,
    playGameLose,
    playTurnChange,
    playSpecialSquare,
    setEffectsVolume
  };
};