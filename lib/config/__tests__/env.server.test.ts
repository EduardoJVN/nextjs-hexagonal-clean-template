import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("validateServerEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns parsed env when all required vars are valid", async () => {
    process.env.NODE_ENV = "test";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

    const { serverEnv } = await import("../env.server");

    expect(serverEnv.NODE_ENV).toBe("test");
    expect(serverEnv.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("applies default for NODE_ENV when not set", async () => {
    delete process.env.NODE_ENV;
    delete process.env.NEXT_PUBLIC_APP_URL;

    const { serverEnv } = await import("../env.server");

    expect(serverEnv.NODE_ENV).toBe("development");
    expect(serverEnv.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("throws with descriptive message when required var is invalid", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "not-a-url";

    await expect(import("../env.server")).rejects.toThrow("Invalid environment variables");
  });

  it("rejects an invalid NODE_ENV value", async () => {
    process.env.NODE_ENV = "staging" as never;

    await expect(import("../env.server")).rejects.toThrow("Invalid environment variables");
  });
});
