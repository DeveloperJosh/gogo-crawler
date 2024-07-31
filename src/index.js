import { scrapeAnimeList } from './scrapers/animeList.js';
import { validateEnvVariables } from './validators/envCheck.js';
import { logError, logSuccess } from './utils/logger.js';
import dotenv from 'dotenv';
import connectToDB from './config/db.js';
dotenv.config();

(async () => {
  try {
    validateEnvVariables();
    await connectToDB();
    logSuccess('\nPlease note that this script will take up to 2 hours to complete.\n');
    await scrapeAnimeList(1).then(() => {
      logSuccess('Scraping completed successfully.');
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
