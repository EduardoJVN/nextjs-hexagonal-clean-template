/**
 * Client-safe environment variables.
 * Only NEXT_PUBLIC_* vars — safe to import in Client Components.
 * These are embedded in the client bundle at build time by Next.js.
 */
import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),

  // Add more NEXT_PUBLIC_* vars here:
  // NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

function validateClientEnv(): ClientEnv {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    // Mirror each key explicitly — Next.js requires static references for
    // NEXT_PUBLIC_* vars to be included in the client bundle.
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const formatted = Object.entries(errors)
      .map(([key, messages]) => `  ${key}: ${messages?.join(", ")}`)
      .join("\n");

    throw new Error(`Invalid public environment variables:\n${formatted}`);
  }

  return parsed.data;
}

export const clientEnv = validateClientEnv();
