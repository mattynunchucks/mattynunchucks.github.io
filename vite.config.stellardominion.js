import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "stellardominion",
  plugins: [react()],
  base: "/stellardominion/",
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    outDir: "../dist/stellardominion",
  },
});
