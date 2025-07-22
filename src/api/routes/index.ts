// src/api/routes/index.ts

import express from 'express';
import userRouter from './user.route';
import authRouter from './auth.route';
import workspaceRouter from './workspace.route';
import invitationRouter from './invitation.route';

import positionRouter from './position.route';
import taskRouter from './task.route';
import questRouter from './quest.route';
import reportRouter from './report.route';
import dailyReportRouter from './dailyReport.route';
import weeklyReportRouter from './weekly.route';
import dashboardRouter from './dashboard.route';
import leaderboardRouter from './leaderboard.route';
import systemRouter from './system.route';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/workspace', workspaceRouter);
router.use('/invitations', invitationRouter);
router.use('/workspace', positionRouter);
router.use('/workspace', taskRouter);
router.use('/quest', questRouter);
router.use('/reports', reportRouter);
router.use('/daily-reports', dailyReportRouter);
router.use('/weekly-reports', weeklyReportRouter);
router.use('/dashboard', dashboardRouter);
router.use('/leaderboard', leaderboardRouter);
router.use('/system', systemRouter);

export default router;
