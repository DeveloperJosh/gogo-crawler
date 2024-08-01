import get from '../utils/get.js';
import { load } from 'cheerio';
import { scrapeAnimeDetails } from './animeDetails.js';
import { logInfo, logError, logSuccess } from '../utils/logger.js';
import { delay, withRetry } from '../utils/delay.js';

const AJAX_URL = 'https://ajax.gogocdn.net/';
const anime_recent_url = `${AJAX_URL}ajax/page-recent-release.html`;

let new_anime_names = {
  "kimi-to-boku-no-saigo-no-senjou-aruiwa-sekai-ga-hajimaru-seisen-season-ii": "kimi-to-boku-no-saigo-no-senjou-aruiwa-sekai-ga-hajimaru-seisen-season-2",
  "saint-october": "saint-october-",
  // Add more anime names here if needed, This website's naming is so inconsistent..
};

const endTimer = (start, animeConfig) => {
  const end = performance.now();
  const timeInSeconds = ((end - start) / 1000).toFixed(2);

  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = (timeInSeconds % 60).toFixed(2);

  const timeTaken = minutes > 0 
    ? `${minutes} minutes and ${seconds} seconds`
    : `${seconds} seconds`;

  logSuccess(`\nPage scraped: ${animeConfig.animeAdded} anime(s) added, ${animeConfig.animeUpdated} anime(s) updated. Time taken: ${timeTaken}.`);
};

const scrapePage = async (page, type, animeConfig) => {
  const url = `${anime_recent_url}?page=${page}&type=${type}`;
  logSuccess(`\nScraping anime page ${page} - type ${type}\n`);

  try {
    const { data } = await get(url);
    const $ = load(data);
    const recentAnime = $("div.last_episodes.loaddub > ul > li");
    const list = [];

    for (const anime of recentAnime) {
      let id = $(anime).find("a").attr("href")?.split("/")[1].split("-episode")[0];
      if (new_anime_names[id]) {
        logInfo(`Replacing ${id} with ${new_anime_names[id]}`);
        id = new_anime_names[id];
      }

      try {
        const animeDetails = await withRetry(() => scrapeAnimeDetails(id, animeConfig));
        if (animeDetails) {
          list.push(animeDetails);
        }
      } catch (err) {
        logError(`[SKIPPING] Failed to fetch details for anime with ID ${id}: ${err.message}`);
      }

      await delay(2000);
    }

    return list;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      logError(`Page ${page} not found (404). Skipping.`);
    } else {
      logError(`Error scraping anime list page ${page}: ${err.message}`);
    }
    throw err;
  }
};

const scrapeRecentAnime = async (initialPage = 1, initialType = 1, animeConfig = { animeAdded: 0, animeUpdated: 0 }) => {
  const start = performance.now();
  let page = initialPage;
  let type = initialType;

  try {
    while (type <= 3) {
      while (page <= 5) {
        await scrapePage(page, type, animeConfig);
        page++;
      }
      page = 1;
      type++;
    }
  } finally {
    endTimer(start, animeConfig);
  }
};

export default scrapeRecentAnime;
