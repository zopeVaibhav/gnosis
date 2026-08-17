import { z } from "zod";
import chalk from "chalk";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    SERVER_PORT: z.coerce.number().default(8080),
    WEB_ORIGIN: z.url(),
    DATABASE_URL: z.url(),
    INTERNAL_API_SECRET: z.string().min(32),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    ACCESS_TOKEN_TTL_SEC: z.coerce.number().default(900), // 15 mins
    REFRESH_TOKEN_TTL_SEC: z.coerce.number().default(2592000), // 30 days
    GEMINI_API_KEY: z.string(),
    LLM_MODEL: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error(chalk.red.bold("\n✖ Invalid environment configuration:\n"));
    for (const issue of parsed.error.issues) {
        const field = issue.path.join(".") || "(root)";
        console.error(`  ${chalk.yellow(field)}: ${chalk.red(issue.message)}`);
    }
    console.error(chalk.dim("\nCheck your .env file (see .env.example for required vars).\n"));
    process.exit(1);
}

export const env = parsed.data;
