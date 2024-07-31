import axios from 'axios';
import { load } from 'cheerio';
import { scrapeAnimeDetails } from './animeDetails.js';
import { logInfo, logError, logSuccess } from '../utils/logger.js';

const anime_recent_url = `https://ajax.gogocdn.net/ajax/page-recent-release.html`;

// Retry logic wrapper
const withRetry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i < retries - 1) {
        logError(`Retrying operation... Attempt ${i + 2}/${retries}`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const endTimer = (start, animeConfig) => {
  const end = performance.now();
  const timeInSeconds = ((end - start) / 1000).toFixed(2);

  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = (timeInSeconds % 60).toFixed(2);

  const timeTaken = minutes > 0 
    ? `${minutes} minutes and ${seconds} seconds`
    : `${seconds} seconds`;

  logSuccess(`\nPage scraped: ${animeConfig.animeAdded} anime(s) added, ${animeConfig.animeUpdated} anime(s) updated. Time taken: ${timeTaken}.\n`);
};

const scrapeRecentAnime = async (initialPage = 1, initialType = 1, animeConfig = { animeAdded: 0, animeUpdated: 0 }) => {
  const start = performance.now();
  let page = initialPage;
  let type = initialType;

  while (type <= 3) {
    while (page <= 10) {
      const url = `${anime_recent_url}?page=${page}&type=${type}`;
      logInfo(`Scraping anime page ${page} - type ${type}\n`);

      try {
        const { data } = await axios.get(url);
        const $ = load(data);
        const recentAnime = $("div.last_episodes.loaddub > ul > li");
        const list = [];

        for (const anime of recentAnime) {
          let id = $(anime).find("a").attr("href")?.split("/")[1].split("-episode")[0];
          try {
            const animeDetails = await withRetry(() => scrapeAnimeDetails(id, animeConfig));

            if (animeDetails) {
              list.push(animeDetails);
            }
          } catch (err) {
            logError(`Failed to fetch details for anime with ID ${id}: ${err.message}`);
          }
            await delay(2000);
        }

        endTimer(start, animeConfig);

      } catch (err) {
        if (err.response && err.response.status === 404) {
          logError(`Page ${page} not found (404). Skipping.`);
        } else {
          logError(`Error scraping anime list page ${page}: ${err.message}`);
        }
      }

      page++;
    }

    page = 1;
    type++;
  }
};

export default scrapeRecentAnime;
