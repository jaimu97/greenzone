import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'greenzone',
  webDir: 'dist',
  /* Ignore the deprecation warning of "bundledWebRuntime".
   * Building an Android Studio will not work properly without it. (At least on my machine)
   */
  bundledWebRuntime: false,
  plugins: {
    Camera: {
      permissions: ["camera"]
    },
    BackgroundRunner: {
      label: 'com.greenzone.locationtracking', // Might need the exact name from Android Studio.
      src: 'app/runners/runner.js',
      event: 'trackLocation',
      repeat: true,
      interval: 30, // Also might need to change this to something more frequent
      autoStart: true,
    }
  }
};

export default config;