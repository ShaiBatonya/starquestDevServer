// src/api/utils/dataBase/connect.ts

import mongoose from 'mongoose';
import { vars } from '@/config/vars';
import logger from '@/config/logger';
const { databaseURL } = vars;

export const connectDB = async (): Promise<void> => {
        try {
    if (!databaseURL) {
      throw new Error('Database URL is not defined');
    }
    await mongoose.connect(databaseURL);
    logger.info('DB connection successful!');
  } catch (err) {
    logger.error('DB connection failed:', err);
    process.exit(1);
  }
};
