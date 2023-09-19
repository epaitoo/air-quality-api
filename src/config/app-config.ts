import * as dotenv from "dotenv";

dotenv.config();


const appConfig: Record<string, string | undefined> = {
  PORT: process.env.PORT,
  IQ_API_KEY: process.env.IQ_AIR_API_KEY,
  IQ_API_BASE_URL: process.env.IQ_API_BASE_URL,
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_DB: process.env.POSTGRES_DB
}

// env variables required for the app to run
const requiredEnvVars = ["PORT", "IQ_API_KEY", "IQ_API_BASE_URL", "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB"]

// Check if any required variable is missing or undefined
const missingEnvVars = requiredEnvVars.filter((envVar) => !appConfig[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Required environment variables are missing or undefined: ${missingEnvVars.join(", ")}`)
  process.exit(1);
}

export default appConfig;