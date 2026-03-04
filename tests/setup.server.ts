import { vi, beforeAll, afterEach, afterAll } from "vitest";
import { server } from "../src/infrastructure/http/mocks/server";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn: () => unknown) => fn),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn(),
      getAll: vi.fn(() => []),
    }),
  ),
  headers: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
      has: vi.fn(),
      entries: vi.fn(() => []),
    }),
  ),
}));

// MSW Node server — intercepts fetch in all server-project tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
