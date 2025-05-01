import dotenv from "dotenv";
import path from "path";
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env"
    : process.env.NODE_ENV === "test"
    ? ".env.test"
    : ".env.development";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const SERVER_CONFIG = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV,
  PORT: parseInt(process.env.PORT || "3001", 10) as number,
  HOST: process.env.HOST || "localhost",
  API_PREFIX: process.env.API_PREFIX || "/api",

  //Rate limiting
  RATE_LIMIT: {
    windowMs: 10 * 60 * 1000,
    max: 100,
  },

  // performance
  PERFORMANCE: {
    BODY_LIMIT: process.env.BODY_LIMIT || "10mb",
    COMPRESSION: process.env.COMPRESSION === "true",
  },
};

const validateEnv = () => {
  const requiredEnvVars = ["DATABASE_URL"];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing environment variable ${missingEnvVars.join(", ")}`
    );
  }
};

//validate env only on production
if (process.env.NODE_ENV === "production") {
  validateEnv();
}

export default SERVER_CONFIG;
