import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tsconfigPaths()],
  define: {
    global: "window",
  },
  esbuild: {
    // Bỏ toàn bộ console.*/debugger khỏi bản build production.
    // Repo hiện có ~127 lệnh console, nhiều chỗ in ra cả thông tin người dùng.
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  build: {
    // Ngưỡng cảnh báo mặc định (500kB) luôn bị vượt vì antd + pro-components
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Tách vendor thành các chunk ổn định để trình duyệt cache lâu dài:
        // đổi code ứng dụng không làm mất cache của thư viện.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          antd: ["antd", "@ant-design/icons"],
          "antd-pro": ["@ant-design/pro-components"],
          excel: ["exceljs", "react-csv"],
          websocket: ["@stomp/stompjs", "sockjs-client"],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        ...({ api: "modern-compiler" } as any),
        silenceDeprecations: [
          "mixed-decls",
          "color-functions",
          "global-builtin",
          "import",
        ],
      },
    },
  },
}));
