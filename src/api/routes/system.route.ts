// src/api/routes/system.route.ts

import express from 'express';
import { 
  getSystemConfigController, 
  testEmailSystemController,
  getProductionReadinessController 
} from '@/api/controllers/system.controller';
import { protect } from '@/api/controllers/auth.controller';

const router = express.Router();

// System configuration routes (admin only)
router.get('/config', protect, getSystemConfigController);
router.get('/email-test', protect, testEmailSystemController);
router.get('/production-readiness', protect, getProductionReadinessController);

export default router; 