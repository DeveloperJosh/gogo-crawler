// db.js
import mongoose from 'mongoose';
import { logSuccess, logError } from '../utils/logger.js';

const url = process.env.MONGO_URI;

const connectToDB = async () => {
  try {
    await mongoose.connect(url); 
    logSuccess('\nConnected to MongoDB.');
  } catch (error) {
    logError(`Error connecting to MongoDB: ${error.message}`);
  }
};

export default connectToDB;

