import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

const sharedAlias = {
  "@": path.resolve(__dirname, "./src"),
  "@domain": path.resolve(__dirname, "./src/domain"),
  "@application": path.resolve(__dirname, "./src/application"),
  "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
  "@presentation": path.resolve(__dirname, "./src/presentation"),
  "@components": path.resolve(__dirname, "./components"),
  "@lib": path.resolve(__dirname, "./lib"),
  "@actions": path.resolve(__dirname, "./app/actions"),
};

export default defineConfig({
  plugins: [react()],
  resolve: { alias: sharedAlias },
  test: {
    reporters: ["verbose"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        ".next/**",
        "tests/e2e/**",
        "**/*.config.{ts,js}",
        "**/*.d.ts",
      ],
    },
    projects: [
      {
        plugins: [react()],
        resolve: { alias: sharedAlias },
        test: {
          name: "client",
          environment: "jsdom",
          include: [
            "src/**/*.test.ts",
            "src/**/*.test.tsx",
            "components/**/*.test.ts",
            "components/**/*.test.tsx",
          ],
          exclude: ["src/infrastructure/**"],
          setupFiles: ["./tests/setup.client.ts"],
        },
      },
      {
        resolve: { alias: sharedAlias },
        test: {
          name: "server",
          environment: "node",
          include: [
            "app/actions/**/*.test.ts",
            "src/infrastructure/**/*.test.ts",
          ],
          setupFiles: ["./tests/setup.server.ts"],
        },
      },
    ],
  },
});
