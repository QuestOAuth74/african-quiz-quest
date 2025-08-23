import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1671202c4e0d4004911fb93b897fa022',
  appName: 'african-quiz-quest',
  webDir: 'dist',
  server: {
    url: 'https://1671202c-4e0d-4004-911f-b93b897fa022.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    ScreenOrientation: {
      orientation: 'any'
    }
  }
};

export default config;