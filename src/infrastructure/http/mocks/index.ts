export { handlers } from "./handlers";
export { server } from "./server";
// Note: 'browser' is intentionally NOT re-exported here to avoid importing
// msw/browser (which references ServiceWorker browser APIs) in Node environments.
// Import browser directly: import { worker } from "@infrastructure/http/mocks/browser"
