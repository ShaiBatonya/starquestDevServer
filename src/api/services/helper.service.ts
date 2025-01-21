// src/api/services/helper.service.ts

import AppError from '@/api/utils/appError';
import DataAccess from '@/api/utils/dataAccess';
import APIFeatures from '@/api/utils/apiFeatures';
import { Query } from 'mongoose';

interface QueryObject {
  [key: string]: any;
}

export const executeQueryWithFeatures = async <T>(
  modelName: string,
  queryObject: QueryObject,
  reqQuery: Record<string, any>,
): Promise<Query<T[], T>> => {
  const model = DataAccess.getModel(modelName);
  const features = new APIFeatures(model.find(queryObject), reqQuery)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  return features.query;
};

export const ensureFound = (doc: any, errorMessage = 'No document found'): void => {
  if (!doc) throw new AppError(errorMessage, 404);
};

export const filterObj = (
  obj: Record<string, any>,
  ...allowedFields: string[]
): Record<string, any> => {
  const newObj: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};
