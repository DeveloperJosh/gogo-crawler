import get from '../utils/get.js';
import { delay } from '../utils/delay.js';
import { withRetry } from '../utils/delay.js';
import { load } from 'cheerio';
import { fetchHianimeDetails } from './hianimeDetails.js';

const baseUrl = 'https://hianime.to/az-list/?page=';

const fetchFilmDetails = async (page) => {
  try {
    const response = await get(`${baseUrl}${page}`);
    const htmlContent = response.data;
    const $ = load(htmlContent);

    // Extract the href attributes from film-detail and film-name
    const filmDetails = [];
    $('.film-detail .film-name a').each((index, element) => {
      let filmHref = $(element).attr('href').trim();
      filmHref = filmHref.replace(/^\//, '');
      filmDetails.push(filmHref);
    });

    return filmDetails;
  } catch (error) {
    console.error(`An error occurred while fetching the HTML content from page ${page}:`, error);
    return [];
  }
};

export const fetchHianimeList = async () => {
  for (let page = 1; page <= 100; page++) {
    console.log(`Fetching page ${page}...`);
    const filmDetails = await fetchFilmDetails(page);
    for (const href of filmDetails) {
      try {
        await withRetry(() => fetchHianimeDetails(href));
      } catch (err) {
        console.error(`Error fetching details for film ${href}: ${err.message}`);
      }
      await delay(2000);
    }
  }
};