import axios from 'axios';
import { load } from 'cheerio';
import { scrapeAnimeDetails } from './animeDetails.js';
import { logInfo, logError, logSuccess } from '../utils/logger.js';
import { delay, withRetry } from '../utils/delay.js';

const anime_list_url = 'https://gogoanime3.co/anime-list.html';

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

export const scrapeAnimeList = async (page = 1, animeConfig = { animeAdded: 0, animeUpdated: 0 }) => {
  const start = performance.now();

  const url = `${anime_list_url}?page=${page}`;
  logSuccess(`Scraping anime list page ${page}...\n`);

  try {
    const { data } = await axios.get(url);
    const $ = load(data);
    const animeList = $("div.anime_list_body > ul > li");

    for (let i = 0; i < animeList.length; i++) {
      const anime = animeList[i];
      const animeId = $(anime).find("a").attr("href")?.split("/")[2];
      if (animeId) {
        try {
          await withRetry(() => scrapeAnimeDetails(animeId, animeConfig));
        } catch (err) {
          logError(`Error scraping details for anime ID ${animeId}: ${err.message}`);
        }
        await delay(2000);
      }
    }

    endTimer(start, animeConfig);

    if (page < 100) {
      await scrapeAnimeList(page + 1, animeConfig);
    }

  } catch (err) {
    logError(`Error scraping anime list page ${page}: ${err.message}`);
  }
};
