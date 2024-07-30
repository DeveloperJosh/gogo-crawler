import { scrapeAnimeList } from './scrapers/animeList.js';
import { validateEnvVariables } from './validators/envCheck.js';
import { logError, logSuccess } from './utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

import connectToDB from './config/db.js';

(async () => {
  try {
    validateEnvVariables();
    await connectToDB();
    await scrapeAnimeList(1);
    logSuccess('Scraping completed successfully.');
  } catch (err) {
    logError(`Error in main execution: ${err.message}`);
    process.exit(1);
  }
})();
