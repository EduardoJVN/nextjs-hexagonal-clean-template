/**
 * MSW Browser Worker
 *
 * Used in development mode to intercept fetch calls in the browser via a
 * Service Worker. Call worker.start() in the application entry point when
 * process.env.NODE_ENV === 'development'.
 *
 * Example (app/layout.tsx or an instrumentation file):
 *   if (process.env.NODE_ENV === 'development') {
 *     const { worker } = await import('@infrastructure/http/mocks/browser')
 *     await worker.start({ onUnhandledRequest: 'bypass' })
 *   }
 *
 * Note: requires `npx msw init public/ --save` to copy the service worker
 * script to the public directory before the first run.
 */
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
