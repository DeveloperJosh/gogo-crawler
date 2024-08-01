import { Command } from 'commander';
import { scrapeAnimeDetails } from './scrapers/index.js';
import { validateEnvVariables } from './validators/envCheck.js';
import connectToDB from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const program = new Command();

validateEnvVariables();

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
            await connectToDB();
            await scrapeAnimeDetails(id, {});
            console.log('Anime added successfully');
            process.exit(0);
        } catch (err) {
            console.error(`Error adding anime: ${err.message}`);
            process.exit(1);
        }
    });

program.parse(process.argv);
