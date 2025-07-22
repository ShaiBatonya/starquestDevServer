// src/api/controllers/invitation.controller.ts

import { Request, Response, NextFunction } from 'express';
import {
  getWorkspaceInvitations,
  getAllPendingInvitations,
  cancelInvitation,
  resendInvitation,
  getInvitationByToken,
} from '@/api/services/invitation.service';
import { sendSuccessResponse } from '@/api/utils/appResponse';
import logger from '@/config/logger';

/**
 * Get all invitations for a specific workspace
 */
export const getWorkspaceInvitationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { status } = req.query;
    const token = req.cookies?.jwt || '';

    const invitations = await getWorkspaceInvitations(
      workspaceId,
      token,
      status as string
    );

    sendSuccessResponse(res, 200, invitations, 'Workspace invitations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all pending invitations across workspaces (admin only)
 */
export const getAllPendingInvitationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.debug('getAllPendingInvitationsController: Starting...');
    logger.debug('Request method:', req.method);
    logger.debug('Request path:', req.path);
    logger.debug('Request cookies:', req.cookies);

    logger.debug('Step 1: Extracting JWT token from cookies...');
    const token = req.cookies?.jwt;
    logger.debug('Token extracted:', token ? `${token.substring(0, 20)}...` : 'empty');

    logger.debug('Step 2: Calling getAllPendingInvitations service...');
    const invitations = await getAllPendingInvitations(token);
    logger.debug('Step 2: Service call completed, invitations count:', invitations?.length || 0);

    logger.debug('Step 3: Sending success response...');
    sendSuccessResponse(res, 200, invitations, 'Invitations fetched successfully');
    logger.info('getAllPendingInvitationsController: Completed successfully');
  } catch (error: any) {
    logger.error('getAllPendingInvitationsController: Error occurred:', error);
    logger.error('Error name:', error.name);
    logger.error('Error message:', error.message);
    logger.error('Error stack:', error.stack);
    next(error);
  }
};

/**
 * Cancel a pending invitation
 */
export const cancelInvitationController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { invitationId } = req.params;
    const token = req.cookies?.jwt || '';

    const result = await cancelInvitation(invitationId, token);

    sendSuccessResponse(res, 200, result, 'Invitation cancelled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Resend invitation email
 */
export const resendInvitationController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { invitationId } = req.params;
    const token = req.cookies?.jwt || '';

    const result = await resendInvitation(invitationId, token);

    sendSuccessResponse(res, 200, result, 'Invitation resent successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get invitation details by token (public endpoint for registration)
 */
export const getInvitationByTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;

    const invitation = await getInvitationByToken(token);

    sendSuccessResponse(res, 200, invitation, 'Invitation details retrieved successfully');
  } catch (error) {
    next(error);
  }
}; 