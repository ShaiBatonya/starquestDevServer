// src/config/awsConfig.ts
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { vars } from './vars';
import AppError from '@/api/utils/appError';

const { bucketRegion, accessKey, secretAccessKey } = vars;

if (!accessKey || !secretAccessKey || !bucketRegion) {
  throw new AppError(
    `AWS configuration is not complete. Please check your environment variables.`,
    500,
  );
}

const s3ClientConfig: S3ClientConfig = {
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
};

const s3Client = new S3Client(s3ClientConfig);

export default s3Client;
