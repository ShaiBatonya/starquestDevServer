// src/api/controllers/health.controller.ts

import { Request, Response } from 'express';

/**
 * Simple health check endpoint for Docker and load balancers
 * Returns standardized { status: "ok" } response
 * No authentication required for health checks
 */
export const healthCheckController = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok'
  });
};

/**
 * Detailed health check with minimal system information
 * Standardized response format for monitoring
 */
export const detailedHealthController = (req: Request, res: Response): void => {
  try {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error'
    });
  }
}; 