/**
 * Server-side environment validation.
 * Import ONLY in: Server Actions, Server Components, Infrastructure, Composition Root.
 * Never import this in client components — it will expose secrets.
 */
import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),

  // Uncomment and add your server-side secrets here:
  // DATABASE_URL: z.url({ error: "DATABASE_URL must be a valid URL" }),
  // API_SECRET_KEY: z.string().min(1, { error: "API_SECRET_KEY is required" }),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function validateServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const formatted = Object.entries(errors)
      .map(([key, messages]) => `  ${key}: ${messages?.join(", ")}`)
      .join("\n");

    throw new Error(`Invalid environment variables:\n${formatted}`);
  }

  return parsed.data;
}

export const serverEnv = validateServerEnv();
