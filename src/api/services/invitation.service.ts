// src/api/services/invitation.service.ts

import DataAccess from '@/api/utils/dataAccess';
import Invitation, { IInvitation } from '@/api/models/invitation.model';
import { IWorkspace } from '@/api/types/workspace.interface';
import { IUser } from '@/api/types/user.interface';
import { findUserByToken } from '@/api/services/jwt.service';
import logger from '@/config/logger';
import AppError from '@/api/utils/appError';
import sendEmail from '@/config/nodeMailer';
import { generateInvitationEmailContent } from '@/api/emailTemplate/invitationEmailTemplate';

/**
 * Get all invitations for a specific workspace
 */
export const getWorkspaceInvitations = async (
  workspaceId: string,
  token: string,
  status?: string
): Promise<any[]> => {
  const userId = await findUserByToken(token);
  
  // Verify user has access to this workspace
  const workspace = await DataAccess.findById<IWorkspace>('Workspace', workspaceId);
  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }

  const userInWorkspace = workspace.users.find(
    (user) => user.userId.toString() === userId
  );
  
  if (!userInWorkspace) {
    throw new AppError('Access denied. User not in workspace', 403);
  }

  // Only admins and mentors can view invitations
  if (!['admin', 'mentor'].includes(userInWorkspace.role)) {
    throw new AppError('Access denied. Insufficient permissions', 403);
  }

  const query: any = { workspaceId };
  if (status) {
    query.status = status;
  }

  const invitations = await Invitation.find(query)
    .populate('inviterUserId', 'firstName lastName email')
    .populate('workspaceId', 'name')
    .sort({ createdAt: -1 });

  return invitations.map(invitation => ({
    _id: invitation._id,
    inviteeEmail: invitation.inviteeEmail,
    inviteeRole: invitation.inviteeRole,
    status: invitation.status,
    invitationToken: invitation.invitationToken,
    tokenExpires: invitation.tokenExpires,
    positionId: invitation.positionId,
    planet: invitation.planet,
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt,
    acceptedAt: invitation.acceptedAt,
    cancelledAt: invitation.cancelledAt,
    inviter: invitation.inviterUserId,
    workspace: invitation.workspaceId,
  }));
};

/**
 * Get all pending invitations across all workspaces (admin only)
 */
export const getAllPendingInvitations = async (token: string) => {
  try {
    logger.debug('getAllPendingInvitations: Starting...');

    logger.debug('Step 1: Finding user by token...');
    const userId = await findUserByToken(token);
    logger.debug('Step 1: User ID found:', userId);

    logger.debug('Step 2: Finding admin workspaces...');
    logger.debug('Query:', { 'users.userId': userId, 'users.role': 'admin' });

    const adminWorkspaces = await Promise.race([
      DataAccess.findByConditions('workspace', {
        'users.userId': userId,
        'users.role': 'admin'
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Workspace query timeout')), 10000)
      )
    ]) as any[];

    logger.debug('Step 2: Admin workspaces found:', adminWorkspaces.length);
    logger.debug('Admin workspaces details:', adminWorkspaces.map(ws => ({ _id: ws._id, name: ws.name })));

    if (!adminWorkspaces || adminWorkspaces.length === 0) {
      logger.warn('No admin workspaces found, returning empty array instead of error');
      return [];
    }

    const workspaceIds = adminWorkspaces.map(workspace => workspace._id);
    logger.debug('Step 3: Workspace IDs:', workspaceIds);

    logger.debug('Step 4: Finding pending invitations...');
    const query = {
      workspaceId: { $in: workspaceIds },
      status: 'pending'
    };

    logger.debug('Invitation query:', query);

    const invitations = await Promise.race([
      Invitation.find(query)
        .populate('workspaceId', 'name')
        .populate('invitedBy', 'firstName lastName email')
        .lean(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Invitation query timeout')), 10000)
      )
    ]) as any[];

    logger.debug('Step 4: Invitations found:', invitations.length);
    logger.debug('Raw invitations:', invitations);

    logger.debug('Step 5: Mapping invitations...');
    const mappedInvitations = invitations.map((invitation: any) => ({
      id: invitation._id?.toString() || '',
      _id: invitation._id?.toString() || '',
      email: invitation.email || '',
      role: invitation.role || 'member',
      status: invitation.status || 'pending',
      workspaceId: invitation.workspaceId?._id?.toString() || '',
      workspaceName: invitation.workspaceId?.name || 'Unknown Workspace',
      invitedBy: invitation.invitedBy ? {
        id: invitation.invitedBy._id?.toString() || '',
        name: `${invitation.invitedBy.firstName || ''} ${invitation.invitedBy.lastName || ''}`.trim() || 'Unknown',
        email: invitation.invitedBy.email || ''
      } : null,
      createdAt: invitation.createdAt || new Date(),
      expiresAt: invitation.expiresAt || null
    }));

    logger.debug('Step 5: Mapped invitations:', mappedInvitations.length);
    logger.debug('Mapped invitations sample:', mappedInvitations[0] || 'None');

    logger.info('getAllPendingInvitations: Completed successfully');
    return mappedInvitations;

  } catch (error: any) {
    logger.error('getAllPendingInvitations: Error occurred:', error);
    logger.error('Error name:', error.name);
    logger.error('Error message:', error.message);

    // Return empty array as fallback instead of throwing
    logger.info('Returning empty array as fallback');
    return [];
  }
};

/**
 * Cancel a pending invitation
 */
export const cancelInvitation = async (
  invitationId: string,
  token: string
): Promise<{ message: string }> => {
  const userId = await findUserByToken(token);
  
  const invitation = await Invitation.findOne({
    _id: invitationId,
    status: 'pending'
  }).populate('workspaceId');

  if (!invitation) {
    throw new AppError('Invitation not found or already processed', 404);
  }

  const workspace = invitation.workspaceId as any as IWorkspace;
  
  // Verify user has permission to cancel (admin or the inviter)
  const userInWorkspace = workspace.users.find(
    (user) => user.userId.toString() === userId
  );
  
  if (!userInWorkspace) {
    throw new AppError('Access denied. User not in workspace', 403);
  }

  const isAdmin = userInWorkspace.role === 'admin';
  const isInviter = invitation.inviterUserId.toString() === userId;
  
  if (!isAdmin && !isInviter) {
    throw new AppError('Access denied. Only admins or the inviter can cancel invitations', 403);
  }

  // Update invitation status
  await DataAccess.updateById('Invitation', invitationId, {
    status: 'cancelled',
    cancelledAt: new Date()
  });

  return {
    message: `Invitation to ${invitation.inviteeEmail} has been cancelled`
  };
};

/**
 * Resend invitation email
 */
export const resendInvitation = async (
  invitationId: string,
  token: string
): Promise<{ message: string }> => {
  const userId = await findUserByToken(token);
  
  const invitation = await Invitation.findOne({
    _id: invitationId,
    status: 'pending'
  }).populate('workspaceId');

  if (!invitation) {
    throw new AppError('Invitation not found or already processed', 404);
  }

  // Check if invitation is expired
  if (invitation.tokenExpires < new Date()) {
    throw new AppError('Invitation has expired. Please create a new invitation', 400);
  }

  const workspace = invitation.workspaceId as any as IWorkspace;
  
  // Verify user has permission to resend (admin or the inviter)
  const userInWorkspace = workspace.users.find(
    (user) => user.userId.toString() === userId
  );
  
  if (!userInWorkspace) {
    throw new AppError('Access denied. User not in workspace', 403);
  }

  const isAdmin = userInWorkspace.role === 'admin';
  const isInviter = invitation.inviterUserId.toString() === userId;
  
  if (!isAdmin && !isInviter) {
    throw new AppError('Access denied. Only admins or the inviter can resend invitations', 403);
  }

  // Send invitation email
  const { subject, plainMessage, htmlMessage } = generateInvitationEmailContent(
    true, // isNewUser (since it's a pending invitation)
    workspace.name,
    invitation.invitationToken,
  );

  const isEmailSent = await sendEmail({
    email: invitation.inviteeEmail,
    subject: subject,
    message: plainMessage,
    html: htmlMessage,
  });

  if (!isEmailSent) {
    throw new AppError('Failed to resend invitation email', 500);
  }

  // Update the updatedAt timestamp
  await DataAccess.updateById('Invitation', invitationId, {
    updatedAt: new Date()
  });

  return {
    message: `Invitation resent to ${invitation.inviteeEmail}`
  };
};

/**
 * Accept invitation using invitation token (for registration flow)
 */
export const acceptInvitationByToken = async (
  invitationToken: string,
  userId: string
): Promise<{ message: string; workspace: any }> => {
  const invitation = await Invitation.findOne({
    invitationToken,
    status: 'pending',
    tokenExpires: { $gt: new Date() }
  }).populate('workspaceId');

  if (!invitation) {
    throw new AppError('Invalid or expired invitation token', 400);
  }

  const workspace = invitation.workspaceId as any as IWorkspace;

  // Check if user is already in workspace
  const userExists = workspace.users.some(
    (user) => user.userId.toString() === userId
  );

  if (userExists) {
    throw new AppError('User already exists in the workspace', 400);
  }

  // Add user to workspace
  await DataAccess.updateById<IWorkspace>('Workspace', workspace._id, {
    $push: {
      users: {
        userId: userId,
        role: invitation.inviteeRole,
        isVerified: true,
        position: invitation.positionId || undefined,
        planet: invitation.planet || undefined,
        joinedAt: new Date(),
      },
    },
  });

  // Add workspace to user's workspace list
  await DataAccess.updateById<IUser>('User', userId, {
    $push: { workspaces: { workspaceId: workspace._id } },
  });

  // Mark invitation as accepted
  await DataAccess.updateById('Invitation', invitation._id.toString(), {
    status: 'accepted',
    acceptedAt: new Date()
  });

  return {
    message: `Successfully joined workspace ${workspace.name}`,
    workspace: {
      _id: workspace._id,
      name: workspace.name,
      description: workspace.description,
      role: invitation.inviteeRole
    }
  };
};

/**
 * Get invitation status by token (for registration page)
 */
export const getInvitationByToken = async (
  invitationToken: string
): Promise<any> => {
  const invitation = await Invitation.findOne({
    invitationToken,
    status: 'pending',
    tokenExpires: { $gt: new Date() }
  }).populate('workspaceId', 'name description');

  if (!invitation) {
    throw new AppError('Invalid or expired invitation token', 400);
  }

  return {
    _id: invitation._id,
    workspaceName: (invitation.workspaceId as any).name,
    workspaceDescription: (invitation.workspaceId as any).description,
    inviteeEmail: invitation.inviteeEmail,
    inviteeRole: invitation.inviteeRole,
    positionId: invitation.positionId,
    planet: invitation.planet,
    tokenExpires: invitation.tokenExpires,
  };
}; 