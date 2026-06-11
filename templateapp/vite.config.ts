import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { powerApps } from "@microsoft/power-apps-vite/plugin"

export default defineConfig(({ command }) => ({
  // powerApps() plugin is only needed for the build that gets pushed to Power Apps.
  // In dev mode it wraps the app in a canvas-only init, making localhost blank.
  plugins: [react(), ...(command === 'build' ? [powerApps()] : [])],
  server: { port: 3000 },
}));
