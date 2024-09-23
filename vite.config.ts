import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  root: "client",
  plugins: [solid()],
  resolve: {
    alias: {
      src: "/src",
    },
  },
});
