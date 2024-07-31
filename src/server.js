import express from 'express';
import bodyParser from 'body-parser';
import { Gogoanime } from './models/gogoanime.js';
import connectToDB from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/api/all', async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    try {
        const animeList = await Gogoanime.find({}, { episodes: 0 }).skip(skip).limit(limit);
        const totalAnimes = await Gogoanime.countDocuments();
        const totalPages = Math.ceil(totalAnimes / limit);

        res.json({
            totalAnimes,
            totalPages,
            currentPage: page,
            animeList
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/search', async (req, res) => {
    const title = req.query.title;

    try {
        const animes = await Gogoanime.find({
            $or: [
                { title: { $regex: new RegExp(title, 'i') } },
                { id: { $regex: new RegExp(title, 'i') } }
            ]
        });

        if (animes.length === 0) {
            return res.status(404).json({ message: 'Anime not found' });
        }

        const mappedAnimes = animes.map(anime => ({
            id: anime.id,
            title: anime.title,
            image: anime.image
        }));

        res.json(mappedAnimes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/info/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const anime = await Gogoanime.findOne({ id });

        if (!anime) {
            return res.status(404).json({ message: 'Anime not found' });
        }

        res.json(anime);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    connectToDB();
    console.log(`Server running on port ${PORT}`);
});