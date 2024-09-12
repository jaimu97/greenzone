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
    }
  }
};

export default config;