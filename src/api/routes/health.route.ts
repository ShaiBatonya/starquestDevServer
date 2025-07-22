// src/api/routes/health.route.ts

import express from 'express';
import { healthCheckController, detailedHealthController } from '@/api/controllers/health.controller';

const router = express.Router();

// Simple health check endpoint (no auth required)
router.get('/health', healthCheckController);

// Detailed health check endpoint (no auth required)
router.get('/health/detailed', detailedHealthController);

export default router; 