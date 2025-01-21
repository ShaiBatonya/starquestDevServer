// src/api/utils/dataBase/connect.ts

import mongoose from 'mongoose';
import { vars } from '@/config/vars';
const { databaseURL } = vars;

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(databaseURL);
    console.log('DB connection successful!');
  } catch (err) {
    console.error('DB connection failed.', err);
    process.exit(1);
  }
};
