import "@testing-library/jest-dom/vitest";
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Auto-cleanup DOM between tests (required when vitest globals are not enabled)
afterEach(() => {
  cleanup();
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: vi.fn(
    ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
      // eslint-disable-next-line @next/next/no-img-element
      return Object.assign(document.createElement("img"), { src, alt, ...props });
    },
  ),
}));
