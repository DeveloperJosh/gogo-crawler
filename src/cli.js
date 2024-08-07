import { Command } from 'commander';
import { scrapeAnimeDetails, fetchHianimeList, scrapeAnimeList, scrapeRecentAnime } from './scrapers/index.js';
import { validateEnvVariables } from './validators/envCheck.js';
import { Gogoanime } from './models/gogoanime.js';
import connectToDB from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const program = new Command();

validateEnvVariables();
await connectToDB();

program
    .name('crawler cli')
    .version('1.0.0')
    .description('CLI for crawling gogoanime');

program
    .command('add')
    .alias('a')
    .option('-i, --id <id>', 'Id of the anime to add')
    .description('Add a new anime to the database')
    .action(async (cmdObj) => {
        const id = cmdObj.id;

        if (!id) {
            console.error('Please provide a id');
            process.exit(1);
        }

        if (id.includes('https://' || id.includes('http://'))) {
            console.error('Please provide a valid id');
            process.exit(1);
        }
        try {
            await scrapeAnimeDetails(id, {});
            console.log('Anime added successfully');
            process.exit(0);
        } catch (err) {
            console.error(`Error adding anime: ${err.message}`);
            process.exit(1);
        }
    });

program
   .command('info')
    .alias('i')
    .description('Get information about the database')
    .action(async () => {
        try {
            const count = await Gogoanime.countDocuments();
            let animeInfo = `Total number of animes: ${count}\nDatabase: MongoDB\nModel: GoGoAnime\n`;
            console.log(animeInfo);
            process.exit(0);
        } catch (err) {
            console.error(`Error getting database information: ${err.message}`);
            process.exit(1);
        }
    });

program
    .command('scrape')
    // can pick gogo or hianime 
    .alias('s')
    .option('-s, --site <site>', 'Site to scrape')
    .description('Scrape anime details')
    .action(async (cmdObj) => {
        const site = cmdObj.site;

        if (!site) {
            console.error('Please provide a site');
            process.exit(1);
        }

        if (site === 'gogo') {
            try {
                await scrapeAnimeList().then(() => {
                    console.log('Scraping completed successfully.');
                    process.exit(0);
                }).catch((err) => {
                    console.error(`Error in main execution: ${err.message}`);
                    process.exit(1);
              });
            } catch (err) {
                console.error(`Error scraping anime details: ${err.message}`);
                process.exit(1);
            }
        } else if (site === 'hianime') {
            try {
                await fetchHianimeList().then(() => {
                    console.log('Anime details scraped successfully');
                }).catch((err) => {
                    console.error(`Error scraping anime details: ${err.message}`);
                });
            } catch (err) {
                console.error(`Error scraping anime details: ${err.message}`);
                process.exit(1);
            }
        } else {
            console.error('Please provide a valid site');
            process.exit(1);
        }
    });

program
    .command('refresh')
    .alias('r')
    .description('Refresh the database')
    .action(async () => {
        console.log('\nThis will only scrape GoGoAnime for now, as HiAnime is not yet supported.');
        try {
            await scrapeRecentAnime().then(() => {
                console.log('All types scraped successfully.');
                process.exit(0);
            }).catch((err) => {
                console.error(`Error in main execution: ${err.message}`);
                process.exit(1);
            });
        } catch (err) {
            console.error(`Error refreshing the database: ${err.message}`);
            process.exit(1);
        }
    });


program.parse(process.argv);
