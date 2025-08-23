import { useEffect } from 'react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';

export type OrientationType = 'portrait' | 'landscape' | 'any';

export const useScreenOrientation = (orientation: OrientationType, enabled = true) => {
  useEffect(() => {
    if (!enabled || !Capacitor.isNativePlatform()) {
      return;
    }

    const lockOrientation = async () => {
      try {
        switch (orientation) {
          case 'portrait':
            await ScreenOrientation.lock({ orientation: 'portrait' });
            break;
          case 'landscape':
            await ScreenOrientation.lock({ orientation: 'landscape' });
            break;
          case 'any':
            await ScreenOrientation.unlock();
            break;
        }
      } catch (error) {
        console.log('Screen orientation lock failed:', error);
      }
    };

    lockOrientation();

    // Cleanup function to unlock orientation
    return () => {
      if (Capacitor.isNativePlatform()) {
        ScreenOrientation.unlock().catch(error => {
          console.log('Screen orientation unlock failed:', error);
        });
      }
    };
  }, [orientation, enabled]);

  const lockToOrientation = async (newOrientation: OrientationType) => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      switch (newOrientation) {
        case 'portrait':
          await ScreenOrientation.lock({ orientation: 'portrait' });
          break;
        case 'landscape':
          await ScreenOrientation.lock({ orientation: 'landscape' });
          break;
        case 'any':
          await ScreenOrientation.unlock();
          break;
      }
    } catch (error) {
      console.log('Manual orientation lock failed:', error);
    }
  };

  return { lockToOrientation };
};