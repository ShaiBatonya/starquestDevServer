// src/api/services/factory.service.ts

import { Request, Response, NextFunction } from 'express';
import catchAsync from '@/api/utils/catchAsync';
import APIFeatures from '@/api/utils/apiFeatures';
import DataAccess from '@/api/utils/dataAccess';
import AppError from '@/api/utils/appError';
import { sendSuccessResponse } from '@/api/utils/appResponse';

export const deleteOne = (
  modelName: string,
): ((_req: Request, _res: Response, _next: NextFunction) => void) =>
  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    await DataAccess.deleteById(modelName, req.params.id);

    sendSuccessResponse(res, 204, undefined, `${modelName} successfully deleted.`);
  });

export const updateOne = (
  modelName: string,
): ((_req: Request, _res: Response, _next: NextFunction) => void) =>
  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const doc = await DataAccess.updateById(modelName, req.params.id, req.body);

    sendSuccessResponse(res, 200, doc);
  });

export const createOne = (
  modelName: string,
): ((_req: Request, _res: Response, _next: NextFunction) => void) =>
  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const doc = await DataAccess.create(modelName, req.body);

    sendSuccessResponse(res, 201, doc);
  });

export const getOne = (
  modelName: string,
  popOptions?: any,
): ((_req: Request, _res: Response, _next: NextFunction) => void) => {
  return catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void | null> => {
      const doc = await DataAccess.findById(modelName, req.params.id, popOptions);

      if (!doc) {
        next(new AppError('No document found with that ID', 404));
        return;
      }

      sendSuccessResponse(res, 200, doc);
    },
  );
};

export const getAll = (
  modelName: string,
): ((_req: Request, _res: Response, _next: NextFunction) => void) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const queryString = req.query as Record<string, string | undefined>;

    const features = new APIFeatures(DataAccess.getModel(modelName).find(), queryString)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query.exec();

    if (!doc) {
      next(new AppError('No document found with that ID', 404));
      return;
    }

    sendSuccessResponse(res, 200, doc);
  });
