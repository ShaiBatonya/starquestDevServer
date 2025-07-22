// src/api/routes/invitation.route.ts

import express from 'express';
import { 
  getWorkspaceInvitationsController,
  getAllPendingInvitationsController,
  cancelInvitationController,
  resendInvitationController,
  getInvitationByTokenController
} from '../controllers/invitation.controller';
import { authenticate } from '@/api/services/auth.service';
import { validateRequest } from '@/api/middleware/validateRequest';
import { 
  workspaceInvitationsParamsSchema,
  workspaceInvitationsQuerySchema,
  invitationParamsSchema,
  invitationTokenParamsSchema
} from '../validations/invitation.validations';
import catchAsync from '@/api/utils/catchAsync';

const router = express.Router();

/**
 * @swagger
 * /api/invitations/workspace/{workspaceId}:
 *   get:
 *     summary: Get all invitations for a specific workspace
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, expired, cancelled]
 *         description: Filter by invitation status
 *     responses:
 *       200:
 *         description: List of invitations
 *       403:
 *         description: Access denied
 *       404:
 *         description: Workspace not found
 */
router.get(
  '/workspace/:workspaceId',
  catchAsync(authenticate),
  validateRequest(workspaceInvitationsParamsSchema, 'params'),
  validateRequest(workspaceInvitationsQuerySchema, 'query'),
  catchAsync(getWorkspaceInvitationsController)
);

/**
 * @swagger
 * /api/invitations/pending:
 *   get:
 *     summary: Get all pending invitations across workspaces (admin only)
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending invitations
 *       403:
 *         description: Access denied - admin only
 */
router.get(
  '/pending',
  catchAsync(authenticate),
  catchAsync(getAllPendingInvitationsController)
);

/**
 * @swagger
 * /api/invitations/{invitationId}/cancel:
 *   patch:
 *     summary: Cancel a pending invitation
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation ID
 *     responses:
 *       200:
 *         description: Invitation cancelled successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Invitation not found
 */
router.patch(
  '/:invitationId/cancel',
  catchAsync(authenticate),
  validateRequest(invitationParamsSchema, 'params'),
  catchAsync(cancelInvitationController)
);

/**
 * @swagger
 * /api/invitations/{invitationId}/resend:
 *   post:
 *     summary: Resend invitation email
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation ID
 *     responses:
 *       200:
 *         description: Invitation resent successfully
 *       400:
 *         description: Invitation expired
 *       403:
 *         description: Access denied
 *       404:
 *         description: Invitation not found
 */
router.post(
  '/:invitationId/resend',
  catchAsync(authenticate),
  validateRequest(invitationParamsSchema, 'params'),
  catchAsync(resendInvitationController)
);

/**
 * @swagger
 * /api/invitations/token/{token}:
 *   get:
 *     summary: Get invitation details by token (public endpoint for registration)
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation token
 *     responses:
 *       200:
 *         description: Invitation details
 *       400:
 *         description: Invalid or expired token
 */
router.get(
  '/token/:token',
  validateRequest(invitationTokenParamsSchema, 'params'),
  catchAsync(getInvitationByTokenController)
);

// Debug endpoint to test invitation system (development only)
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug/test', catchAsync(async (req, res) => {
    try {
      const response = {
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          collections: []
        },
        invitations: {
          total: 0,
          pending: 0,
          sample: null
        }
      };

      // Test database connection and get invitation stats
      const Invitation = require('@/api/models/invitation.model').default;
      
      // Get total invitations
      const totalInvitations = await Invitation.countDocuments();
      const pendingInvitations = await Invitation.countDocuments({ status: 'pending' });
      const sampleInvitation = await Invitation.findOne().limit(1);
      
      response.invitations = {
        total: totalInvitations,
        pending: pendingInvitations,
        sample: sampleInvitation
      };

      res.status(200).json({
        status: 'success',
        data: response,
        message: 'Debug test completed successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: 'Debug test failed',
        error: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace'
      });
    }
  }));
}

export default router; 