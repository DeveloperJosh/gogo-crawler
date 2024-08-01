import get from '../utils/get.js';
import { load } from 'cheerio';
import { scrapeAnimeDetails } from './animeDetails.js';
import { logError, logSuccess } from '../utils/logger.js';
import { delay, withRetry } from '../utils/delay.js';

const anime_list_url = 'https://gogoanime3.co/anime-list.html';
/**
 * Maximum number of concurrent requests to make
 * You should leave this at 1 to prevent being blocked
 * If you know what you're doing, you can increase this number
 */
const MAX_CONCURRENT_REQUESTS = 1;

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

const processAnime = async (anime, animeConfig, delayMs) => {
  const animeId = anime.find("a").attr("href")?.split("/")[2];
  if (animeId) {
    try {
      await withRetry(() => scrapeAnimeDetails(animeId, animeConfig));
    } catch (err) {
      logError(`Error scraping details for anime ID ${animeId}: ${err.message}`);
    }
    await delay(delayMs); // Delay between each request to prevent being blocked
  }
};

export const scrapeAnimeList = async (
  page = 1, 
  animeConfig = { animeAdded: 0, animeUpdated: 0 },
  maxPage = 100, 
  delayMs = 2000
) => {
  const start = performance.now();
  const url = `${anime_list_url}?page=${page}`;
  logSuccess(`Scraping anime list page ${page}...\n`);

  try {
    const { data } = await get(url);
    const $ = load(data);
    const animeList = $("div.anime_list_body > ul > li");

    const animePromises = [];
    for (let i = 0; i < animeList.length; i++) {
      const anime = $(animeList[i]);
      animePromises.push(processAnime(anime, animeConfig, delayMs));

      // Control the number of concurrent requests
      if (animePromises.length >= MAX_CONCURRENT_REQUESTS) {
        await Promise.all(animePromises);
        animePromises.length = 0;
      }
    }

    // Wait for any remaining promises
    if (animePromises.length > 0) {
      await Promise.all(animePromises);
    }

    endTimer(start, animeConfig);

    if (page < maxPage) {
      await delay(delayMs);
      await scrapeAnimeList(page + 1, animeConfig, maxPage, delayMs);
    }
  } catch (err) {
    logError(`Error scraping anime list page ${page}: ${err.message}`);
  }
};
