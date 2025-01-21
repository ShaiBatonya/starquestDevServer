// src/api/utils/appResponse.js

import { Response } from 'express';
import ModelTypes from '@/api/types/model.types';

/**
 * Send a standardized success response.
 * @param {Response} res - The response object from Express.js
 * @param {number} statusCode - HTTP status code to send
 * @param {string} [status='success'] - The response status, defaults to 'success'
 * @param {object} [data] - Optional payload to include in the response. If provided, it will be included in the `data` field of the response.
 * @param {string} [message] - Optional message to include in the response. If provided, it will be included in the response.
 */
export const sendSuccessResponse = (
  res: Response,
  statusCode: number,
  data?: ModelTypes[keyof ModelTypes] | object | null,
  message?: string | void,
  status: string = 'success',
): void => {
  const response: { status: string; data?: object; message?: string } = { status };

  if (data && Object.keys(data).length > 0) {
    response.data = data;
  }

  if (data && Object.keys(data).length === 0) {
    response.data = {};
  }

  if (message) {
    response.message = message;
  }

  res.status(statusCode).json(response);
};
