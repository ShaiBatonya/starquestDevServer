import express from 'express';
import { getLeaderboardController } from '@/api/controllers/leaderboard.controller';
/* import { protect } from '@/api/controllers/auth.controller';
 */
const router = express.Router();

/* router.use(protect); */

router.get('/:workspaceId', getLeaderboardController);

export default router;
