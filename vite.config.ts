import { defineConfig, loadEnv, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), "");
  const isProd = mode === "production";

  return {
    plugins: [react()],
    build: {
      target: "es2015",
      minify: isProd ? "terser" : "esbuild",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (
                id.includes("react-router") ||
                id.includes("react-dom") ||
                id.includes("/react/")
              ) {
                return "vendor-react";
              }
              if (id.includes("fortawesome")) {
                return "vendor-fontawesome";
              }
            }
          },
        },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
