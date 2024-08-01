import get from '../utils/get.js';
import { load } from 'cheerio';
import { logInfo, logError } from '../utils/logger.js';
import { Gogoanime } from '../models/gogoanime.js';

const BASE_URL = 'https://gogoanime3.co';
const AJAX_URL = 'https://ajax.gogocdn.net/';
const LIST_EPISODES_URL = `${AJAX_URL}ajax/load-list-episode`;

const fetchAnimePage = async (url) => {
  try {
    const { data } = await get(url);
    return load(data);
  } catch (err) {
    throw new Error(`Error fetching page: ${err.message}`);
  }
};

const extractAnimeDetails = ($) => {
  const genres = [];
  const animeTitle = $("div.anime_info_body_bg > h1").text().trim();
  const animeImage = $("div.anime_info_body_bg > img").attr("src");
  const type = $("div.anime_info_body_bg > p:contains('Type:') > a").text().trim();
  const desc = $("div.anime_info_body_bg > div.description").text().replace("Plot Summary: ", "").trim();
  let releasedDate = parseInt($("div.anime_info_body_bg > p:contains('Released:')").text().replace("Released: ", "").trim(), 10);
  if (isNaN(releasedDate)) {
    releasedDate = 0;
  }
  const status = $("div.anime_info_body_bg > p:contains('Status:') > a").text().trim();
  const otherName = $("div.anime_info_body_bg > p:contains('Other name:')")
    .text()
    .replace("Other name: ", "")
    .replace(/;/g, ",")
    .split(",")
    .map((name) => name.trim());

  $("div.anime_info_body_bg > p:contains('Genre:') > a").each((i, elem) => {
    genres.push($(elem).attr("title").trim());
  });

  let subOrDub = 'sub';
  if (animeTitle.toLowerCase().includes("(dub)")) {
    subOrDub = 'dub';
  }

  return { animeTitle, animeImage, type, desc, releasedDate, status, otherName, genres, subOrDub };
};

const extractEpisodeDetails = async (ep_start, ep_end, movie_id, alias) => {
  const episodesPage = await fetchAnimePage(`${LIST_EPISODES_URL}?ep_start=${ep_start}&ep_end=${ep_end}&id=${movie_id}&default_ep=0&alias=${alias}`);
  const epList = [];

  episodesPage("#episode_related > li").each((i, el) => {
    epList.push({
      id: episodesPage(el).find("a").attr("href").split("/")[1],
      number: parseInt(episodesPage(el).find("div.name").text().replace("EP ", "")),
      url: `${BASE_URL}${episodesPage(el).find("a").attr("href").trim()}`,
    });
  });

  return epList;
};

const saveAnimeDetails = async (animeDetails, animeConfig) => {
  try {
    const anime = await Gogoanime.findOne({ id: animeDetails.id });
    if (anime) {
      await Gogoanime.updateOne({ id: animeDetails.id }, { $set: animeDetails });
      animeConfig.animeUpdated++;
      logInfo(`Updating [${animeDetails.title} - ${animeDetails.subOrDub}]...`);
    } else {
      await Gogoanime.create(animeDetails);
      animeConfig.animeAdded++;
      logInfo(`Inserting [${animeDetails.title} - ${animeDetails.subOrDub}]...`);
    }
  } catch (err) {
    logError(`Error saving anime details for ${animeDetails.id}: ${err.message}`);
  }
};

export const scrapeAnimeDetails = async (id, animeConfig) => {
  try {
    const $ = await fetchAnimePage(`${BASE_URL}/category/${id}`);
    const { animeTitle, animeImage, type, desc, releasedDate, status, otherName, genres, subOrDub } = extractAnimeDetails($);

    const ep_start = $("#episode_page > li").first().find("a").attr("ep_start");
    const ep_end = parseInt($("#episode_page > li").last().find("a").attr("ep_end") ?? "0");
    const movie_id = $("#movie_id").attr("value");
    const alias = $("#alias_anime").attr("value");

    const epList = await extractEpisodeDetails(ep_start, ep_end, movie_id, alias);

    const animeDetails = {
      id: id,
      url: `${BASE_URL}/category/${id}`,
      title: animeTitle,
      subOrDub: subOrDub,
      type: type,
      genres: genres,
      releasedDate: releasedDate,
      status: status,
      otherNames: otherName,
      description: desc,
      image: animeImage,
      totalEpisodes: ep_end,
      episodes: epList,
    };

    await saveAnimeDetails(animeDetails, animeConfig);
    return animeDetails;
  } catch (err) {
    logError(`Error scraping anime details for ${id}: ${err.message}`);
    throw new Error(`Failed to scrape anime details for ${id}: ${err.message}`);
  }
};
