import axios from 'axios';
import { load } from 'cheerio';
import Hianime from '../models/hianime.js';

const baseUrl = 'https://hianime.to/';

const saveAnimeDetails = async (animeDetails) => {
  try {
    const anime = await Hianime.findOne({ id: animeDetails.id });
    if (anime) {
      await Hianime.updateOne({ id: animeDetails.id }, { $set: animeDetails });
      console.log(`Updating [${animeDetails.title}]...`);
    } else {
      await Hianime.create(animeDetails);
      console.log(`Inserting [${animeDetails.title}]...`);
    }
  } catch (err) {
    console.error(`Error saving anime details for ${animeDetails.id}: ${err.message}`);
  }
};

export const fetchHianimeDetails = async (href) => {
  try {
    const url = `${baseUrl}${href}`;
    const response = await axios.get(url);
    const htmlContent = response.data;
    const $ = load(htmlContent);

    // Extract the ID from the href
    const id = href.split('-').pop();

    // Extract the details
    const animeDetails = {
      id: id,
      url: url,
      title: $('h2.film-name.dynamic-name').text().trim(),
      poster: $('.film-poster img').attr('src'),
      description: $('.film-description .text').text().trim(),
      japaneseTitle: $('.item-title:contains("Japanese:") .name').text().trim(),
      synonyms: $('.item-title:contains("Synonyms:") .name').text().trim(),
      aired: $('.item-title:contains("Aired:") .name').text().trim(),
      duration: $('.item-title:contains("Duration:") .name').text().trim(),
      status: $('.item-title:contains("Status:") .name').text().trim(),
      malScore: $('.item-title:contains("MAL Score:") .name').text().trim(),
      genres: $('.item-list:contains("Genres:") a')
        .map((i, el) => $(el).text().trim())
        .get(),
      studios: $('.item-title:contains("Studios:") a')
        .map((i, el) => $(el).text().trim())
        .get(),
      producers: $('.item-title:contains("Producers:") a')
        .map((i, el) => $(el).text().trim())
        .get(),
      seasons: $('.block_area.block_area-seasons .os-list .os-item').map((i, el) => ({
        title: $(el).find('.title').text().trim(),
        url: $(el).attr('href'),
        poster: $(el).find('.season-poster').css('background-image').replace(/url\((['"])?(.*?)\1\)/gi, '$2').split(',')[0]
      })).get()
    };

    //console.log(animeDetails);

    await saveAnimeDetails(animeDetails);

  } catch (error) {
    console.error('An error occurred while fetching the HTML content:', error);
  }
};
