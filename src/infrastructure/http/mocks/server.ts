/**
 * MSW Node Server
 *
 * Used in Vitest integration tests (node environment).
 * Intercepts real fetch calls at the Node.js level without a browser.
 *
 * Usage in test setup files:
 *   server.listen({ onUnhandledRequest: 'warn' })
 *   server.resetHandlers()
 *   server.close()
 */
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
