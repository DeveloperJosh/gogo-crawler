import scrapeRecentAnime from './scrapers/animeLatest.js';
import { validateEnvVariables } from './validators/envCheck.js';
import { logError, logSuccess } from './utils/logger.js';
import dotenv from 'dotenv';
import connectToDB from './config/db.js';
dotenv.config();

(async () => {
  try {
    validateEnvVariables();
    await connectToDB();
    logSuccess('\nThis script will only go up to page 5 on all types, this may take a while.');
    await scrapeRecentAnime().then(() => {
        logSuccess(`All types scraped successfully.`);
        process.exit(0);
    }).catch((err) => {
        logError(`Error in main execution: ${err.message}`);
        process.exit(1);
    });
  } catch (err) {
    logError(`Error in main execution: ${err.message}`);
    process.exit(1);
  }
})();
