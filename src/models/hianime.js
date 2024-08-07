import mongoose from 'mongoose';

const SeasonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  poster: { type: String, required: true }
});

const animeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  title: { type: String, required: true },
  poster: { type: String, required: true },
  seasons: { type: [SeasonSchema], required: false },
  description: { type: String, required: true },
  japaneseTitle: { type: String, required: false },
  synonyms: { type: String, required: false },
  aired: { type: String, required: false },
  duration: { type: String, required: false },
  status: { type: String, required: false },
  malScore: { type: String, required: false },
  genres: { type: [String], required: false },
  studios: { type: [String], required: false },
  producers: { type: [String], required: false },
}, { timestamps: true, versionKey: false });

const Hianime = mongoose.model('Hianime', animeSchema);

export default Hianime;
