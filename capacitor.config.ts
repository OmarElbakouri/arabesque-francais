import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bclt.academy',
  appName: 'BCLT Academy',
  webDir: 'dist',
  server: {
    // For development, you can enable live reload by uncommenting:
    // url: 'http://YOUR_LOCAL_IP:8081',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1a2e',
      androidSplashResourceName: 'splash',
      showSpinner: false
    }
  },
  android: {
    backgroundColor: '#1a1a2e'
  },
  ios: {
    backgroundColor: '#1a1a2e',
    contentInset: 'automatic'
  }
};

export default config;
