import { logInfo, logError } from '../utils/logger.js';

export const validateEnvVariables = () => {
  console.clear();
  logInfo("Checking environment variables...\n");

  const requiredVariables = ["MONGO_URI"];
  const missingVariables = requiredVariables.filter(variable => !process.env[variable]);

  if (missingVariables.length > 0) {
    logError(`Missing environment variables: ${missingVariables.join(", ")}. Please check the README.md file for more information.`);
    throw new Error("Missing environment variables.");
  }

  logInfo("Environment variables checked successfully.");
};
