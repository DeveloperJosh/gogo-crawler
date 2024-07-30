import mongoose from 'mongoose';

const GogoEpisodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  number: { type: Number, required: true },
  url: { type: String },
}, { _id: false }); 

const GogoanimeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String },
  subOrDub: { type: String, enum: ['sub', 'dub'] },
  image: { type: String },
  status: { type: String },
  releasedDate: { type: Number },
  genres: { type: [String] },
  otherNames: { type: [String] },
  description: { type: String },
  totalEpisodes: { type: Number },
  episodes: { type: [GogoEpisodeSchema] },
}, { strict: false, versionKey: false }); 

const Gogoanime = mongoose.model('Gogoanime', GogoanimeSchema);

export { Gogoanime };
