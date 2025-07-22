// src/api/services/workspace.service.ts

import crypto from 'crypto';
import DataAccess from '@/api/utils/dataAccess';
import { IWorkspace, IWorkspaceUser } from '@/api/types/workspace.interface';
import { IUser } from '@/api/types/user.interface';
import { findUserByToken, verifyToken } from '@/api/services/jwt.service';
import sendEmail from '@/config/nodeMailer';
import AppError from '@/api/utils/appError';
import { generateInvitationEmailContent } from '@/api/emailTemplate/invitationEmailTemplate';
import { generateEmailForInviterContent } from '@/api/emailTemplate/inviterEmailTemplate';
import { generateInviteeJoinedEmailContent } from '../emailTemplate/inviteeJoinedEmailTemplate';
import { generateInviterNotificationEmailContent } from '../emailTemplate/inviterEmail';
import Invitation, { IInvitation } from '@/api/models/invitation.model';

const workspaceModel = 'Workspace';
const userModel = 'User';

interface IWorkspaceInvitationRequest {
  workspaceId: string;
  inviteeEmail: string;
  inviteeRole: string;
  positionId?: string;
  planet?: string;
}

interface IUserPermissionInWorkspace {
  inviterId: string;
  workspace: IWorkspace;
  inviteeRole: string;
}

interface IProcessDetails {
  workspaceId: string;
  inviteeId: string | null;
  inviteeEmail: string;
  inviteeRole: string;
  workspace: IWorkspace;
  inviterId: string;
  positionId?: string;
  planet?: string;
}

export const createWorkspace = async (
  userToken: string,
  workspaceData: Partial<IWorkspace>,
): Promise<IWorkspace> => {
  const userId = await findUserByToken(userToken);

  const newWorkspaceData = {
    ...workspaceData,
    users: [
      {
        userId,
        role: 'admin',
        isVerified: true,
      },
    ],
  };

  const workspace = await DataAccess.create<IWorkspace>(workspaceModel, newWorkspaceData);
  await DataAccess.updateById<IUser>(userModel, userId, {
    $push: { workspaces: { workspaceId: workspace._id } },
  });
  return workspace;
};

export const getUserWorkspaces = async (
  userToken: string,
): Promise<Array<IWorkspace | Partial<IWorkspace>>> => {
  const userId = await findUserByToken(userToken);
  const user = await DataAccess.findById<IUser>('User', userId, {
    path: 'workspaces.workspaceId',
    model: 'Workspace',
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user.workspaces.map(({ workspaceId }) => {
    // After population, workspaceId is the full workspace object
    const workspace = workspaceId as any as IWorkspace;
    return formatWorkspaceData(workspace, userId);
  });
};

const formatWorkspaceData = (workspace: IWorkspace, userId: string): IWorkspace | object => {
  if (!workspace) {
    return {};
  }

  const isAdmin = isAdminUser(workspace, userId);
  return isAdmin ? workspace : { ...workspace.toObject(), users: [] };
};

const isAdminUser = (workspace: IWorkspace, userId: string): boolean => {
  return workspace.users.some((user) => user.userId.toString() === userId && user.role === 'admin');
};

const fetchWorkspace = async (workspaceId: string): Promise<IWorkspace> => {
  const workspace = await DataAccess.findById<IWorkspace>(workspaceModel, workspaceId);
  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }
  return workspace;
};

/**
 * Enhanced workspace invitation system supporting both existing and non-existing users
 * @param userToken Token of the user sending the invitation
 * @param invitationData Data required for sending the invitation
 * @returns A confirmation message indicating the status of the invitation
 */
export const sendWorkspaceInvitation = async (
  userToken: string,
  invitationData: IWorkspaceInvitationRequest,
): Promise<{ message: string; isNewUser: boolean; invitationId?: string }> => {
  const { workspaceId, inviteeEmail, inviteeRole, positionId, planet } = invitationData;
  const inviterId = await findUserByToken(userToken);
  const workspace = await fetchWorkspace(workspaceId);

  // Verify inviter has permission to invite with the specified role
  await verifyInviterPermission({ inviterId, workspace, inviteeRole });

  // Check if user already exists and their status
  const inviteeId = await verifyInviteeStatusInWorkspace(workspace, inviteeEmail);
  const isNewUser = !inviteeId;

  if (isNewUser) {
    // Handle invitation for non-registered user
    const result = await createPendingInvitation({
      workspaceId,
      inviteeId: null,
      inviteeEmail,
      inviteeRole,
      workspace,
      inviterId,
      positionId,
      planet,
    });
    
    await sendNotificationToInviter(true, inviteeEmail, inviterId, isNewUser);
    
    return {
      message: `Invitation sent to ${inviteeEmail}. They will automatically join the workspace when they register.`,
      isNewUser: true,
      invitationId: result.invitationId,
    };
  } else {
    // Handle invitation for existing registered user
    const result = await createAndSendInvitation({
      workspaceId,
      inviteeId,
      inviteeEmail,
      inviteeRole,
      workspace,
      inviterId,
      positionId,
      planet,
    });
    
    await sendNotificationToInviter(result, inviteeEmail, inviterId, isNewUser);
    
    return {
      message: `Invitation sent to existing user ${inviteeEmail}.`,
      isNewUser: false,
    };
  }
};

/**
 * Create a pending invitation for non-registered users
 */
const createPendingInvitation = async (processDetails: IProcessDetails): Promise<{ invitationId: string }> => {
  const { workspaceId, inviteeEmail, inviteeRole, workspace, inviterId, positionId, planet } = processDetails;
  
  // Get inviter details for personalized email
  const inviter = await DataAccess.findById<IUser>(userModel, inviterId);
  const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName}` : undefined;
  
  // Check for existing pending invitation
  const existingInvitation = await Invitation.findOne({
    workspaceId,
    inviteeEmail: inviteeEmail.toLowerCase(),
    status: 'pending',
    tokenExpires: { $gt: new Date() }
  });

  if (existingInvitation) {
    throw new AppError(`A pending invitation already exists for ${inviteeEmail} in this workspace`, 400);
  }

  // Create invitation token
  const invitationToken = crypto.randomBytes(32).toString('hex');
  const tokenExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Create invitation record
  const invitation = await DataAccess.create<IInvitation>('Invitation', {
    workspaceId,
    inviterUserId: inviterId,
    inviteeEmail: inviteeEmail.toLowerCase(),
    inviteeRole,
    invitationToken,
    tokenExpires: tokenExpiration,
    status: 'pending',
    positionId: positionId || undefined,
    planet: planet || undefined,
  });

  // Send invitation email with enhanced template
  const { subject, plainMessage, htmlMessage } = generateInvitationEmailContent(
    true, // isNewUser
    workspace.name,
    invitationToken,
    inviterName, // Pass inviter name for personalization
  );

  const isEmailSent = await sendEmail({
    email: inviteeEmail,
    subject: subject,
    message: plainMessage,
    html: htmlMessage,
  });

  if (!isEmailSent) {
    // Clean up invitation if email failed
    await DataAccess.deleteById('Invitation', invitation._id.toString());
    throw new AppError('Failed to send invitation email', 500);
  }

  return { invitationId: invitation._id.toString() };
};

/**
 * Create invitation for existing registered users (original logic)
 */
const createAndSendInvitation = async (processDetails: IProcessDetails): Promise<boolean> => {
  const { workspaceId, inviteeId, inviteeEmail, inviteeRole, workspace, inviterId, positionId, planet } = processDetails;
  
  // Get inviter details for personalized email
  const inviter = await DataAccess.findById<IUser>(userModel, inviterId);
  const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName}` : undefined;
  
  const invitationToken = crypto.randomBytes(20).toString('hex');
  const tokenExpiration = Date.now() + 3600000; // 1 hour

  // Add user to workspace with verification pending
  await DataAccess.updateById<IWorkspace>(workspaceModel, workspaceId, {
    $push: {
      users: {
        userId: inviteeId,
        role: inviteeRole,
        isVerified: false,
        verificationToken: invitationToken,
        verificationTokenExpires: tokenExpiration,
        position: positionId || undefined,
        planet: planet || undefined,
      },
    },
  });

  // Send invitation email with enhanced template
  const { subject, plainMessage, htmlMessage } = generateInvitationEmailContent(
    false, // isNewUser
    workspace.name,
    invitationToken,
    inviterName, // Pass inviter name for personalization
  );

  const isEmailSent = await sendEmail({
    email: inviteeEmail,
    subject: subject,
    message: plainMessage,
    html: htmlMessage,
  });

  return isEmailSent;
};

const verifyInviterPermission = async (
  UserPermissionDetails: IUserPermissionInWorkspace,
): Promise<void> => {
  const { inviterId, workspace, inviteeRole } = UserPermissionDetails;
  const userInWorkspace = workspace.users.find((user) => user.userId.toString() === inviterId);
  const inviterRole = userInWorkspace?.role;
  
  if (!userInWorkspace) {
    throw new AppError('User not found in workspace', 404);
  }
  
  // Check permission hierarchy
  if (inviterRole === 'mentor' && inviteeRole !== 'mentee') {
    throw new AppError('Mentors can only invite mentees', 403);
  }
  
  if (inviterRole === 'mentee') {
    throw new AppError('Mentees cannot send invitations', 403);
  }
  
  // Admin can invite anyone
};

const verifyInviteeStatusInWorkspace = async (
  workspace: IWorkspace,
  inviteeEmail: string,
): Promise<string | null> => {
  const invitee = await DataAccess.findOneByConditions<IUser>(
    userModel,
    { email: inviteeEmail.toLowerCase() },
    '_id',
  );

  if (!invitee) {
    return null; // User doesn't exist - will create pending invitation
  }

  const inviteeId = invitee._id;
  const userExists = workspace.users.some(
    (user) => user.userId.toString() === inviteeId.toString(),
  );

  if (userExists) {
    throw new AppError('User already exists in the workspace', 400);
  }

  return inviteeId;
};

const sendNotificationToInviter = async (
  isInvitationSent: boolean,
  inviteeEmail: string,
  inviterId: string,
  isNewUser: boolean,
): Promise<void> => {
  const inviter = await DataAccess.findOneByConditions<IUser>(
    userModel,
    { _id: inviterId },
    { firstName: 1, lastName: 1, email: 1 },
  );

  if (!inviter?.email) {
    throw new AppError('Inviter data is incomplete or inviter not found.', 404);
  }

  const message = isNewUser 
    ? `Invitation sent to ${inviteeEmail}. They will join automatically when they register.`
    : `Invitation sent to existing user ${inviteeEmail}.`;

  const { baseSubject, baseMessage, htmlMessage } = generateEmailForInviterContent(
    isInvitationSent,
    message,
  );

  await sendEmail({
    email: inviter.email,
    subject: baseSubject,
    message: baseMessage,
    html: htmlMessage,
  });
};

export const userWorkspaceRegistration = async (
  inviteeToken: string,
  invitationToken: string,
): Promise<string> => {
  let { workspaceId, userId, workspaceName } = await verifyWorkspaceAndUser(invitationToken);

  let isNewUser = false;
  if (!userId) {
    userId = await validateAndExtractUserIdFromToken(inviteeToken);
    isNewUser = true;
  }

  const { inviteeName, email } = await updateUserWorkspaceList(userId, workspaceId);

  await updateWorkspaceUserEntry(workspaceId, userId, invitationToken, isNewUser);

  const { positionId, userPlanet, userRole } = await fetchUserDetails(workspaceId, userId);

  if (userRole === 'mentee') {
    await fetchAndAssignTasks(workspaceId, userId, positionId, userPlanet);
  }

  await notifyInvitee(inviteeName, workspaceName, email);

  await notifyInviter(userId, inviteeName, workspaceName, workspaceId);

  return 'User registration to workspace successful.';
};
const verifyWorkspaceAndUser = async (
  invitationToken: string,
): Promise<{ workspaceId: string; userId: string; workspaceName: string }> => {
  const workspace = await DataAccess.findOneByConditions<IWorkspace>(
    workspaceModel,
    {
      'users.verificationToken': invitationToken,
      'users.verificationTokenExpires': { $gt: Date.now() },
    },
    'users.$',
  );

  if (!workspace?.users.length) {
    throw new AppError('Invalid or expired invitation token', 400);
  }

  const userId = workspace.users[0].userId;
  return { workspaceId: workspace._id, userId: userId.toString(), workspaceName: workspace.name };
};
const validateAndExtractUserIdFromToken = async (token: string): Promise<string> => {
  const decodedToken = await verifyToken(token);
  if (!decodedToken) {
    throw new AppError('Invalid or expired token', 401);
  }

  return decodedToken.id;
};
const updateUserWorkspaceList = async (
  userId: string,
  workspaceId: string,
): Promise<{ inviteeName: string; email: string }> => {
  const user = await DataAccess.findById<IUser>(userModel, userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.workspaces.push({ workspaceId });
  const { inviteeName, email } = {
    inviteeName: user.firstName + ' ' + user.lastName,
    email: user.email,
  };
  await DataAccess.saveDocument(user, { validateBeforeSave: true });
  return { inviteeName, email };
};
const updateWorkspaceUserEntry = async (
  workspaceId: string,
  userId: string,
  invitationToken: string,
  isNewUser: boolean,
): Promise<void> => {
  const updateFields: { [key: string]: any } = {
    'users.$.isVerified': true,
    'users.$.verificationToken': undefined,
    'users.$.verificationTokenExpires': undefined,
  };

  if (isNewUser) {
    updateFields['users.$.userId'] = userId;
  }

  const updateResult = await DataAccess.updateOne<IWorkspace>(
    workspaceModel,
    { _id: workspaceId, 'users.verificationToken': invitationToken },
    {
      $set: updateFields,
    },
  );

  if (!updateResult) {
    throw new AppError('Failed to verify user in workspace', 404);
  }
};
const fetchUserDetails = async (
  workspaceId: string,
  userId: string,
): Promise<{ positionId: string; userPlanet: string; userRole: string }> => {
  const user = await DataAccess.findOneByConditions<IWorkspaceUser>(
    'Workspace',
    { _id: workspaceId, 'users.userId': userId },
    'users.$',
  );

  if (!user) {
    throw new AppError('User not found in workspace', 404);
  }

  if (!user.position || !user.planet) {
    throw new AppError('User position or planet is undefined', 400);
  }

  return {
    positionId: user.position.toString(),
    userPlanet: user.planet,
    userRole: user.role,
  };
};
const fetchAndAssignTasks = async (
  workspaceId: string,
  userId: string,
  positionId: string,
  userPlanet: string,
): Promise<void> => {
  const pipeline = [
    {
      $match: {
        _id: workspaceId,
      },
    },
    {
      $unwind: '$backlog',
    },
    {
      $match: {
        $or: [
          {
            'backlog.positions': positionId,
            'backlog.planets': userPlanet,
          },
          {
            'backlog.isGlobal': true,
          },
        ],
      },
    },
    {
      $project: {
        _id: '$backlog._id',
      },
    },
  ];

  const tasks = await DataAccess.aggregate(workspaceModel, pipeline);

  if (!tasks.length) {
    throw new AppError('No matching tasks found for the user position and planet', 404);
  }

  await assignTasksToUser(workspaceId, userId, tasks);
};
const assignTasksToUser = async (
  workspaceId: string,
  userId: string,
  tasks: any[],
): Promise<void> => {
  const taskEntries = tasks.map((task) => ({
    taskId: task._id,
    status: 'Backlog',
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: [],
  }));

  const result = await DataAccess.updateOne(
    workspaceModel,
    { _id: workspaceId, 'users.userId': userId },
    { $push: { 'users.$.quest': { $each: taskEntries } } },
  );

  if (!result) {
    throw new AppError('Failed to assign tasks to user', 500);
  }
};
const fetchInviterDetails = async (
  workspaceId: string,
  inviteeUserId: string,
): Promise<{ inviterName: string; inviterEmail: string }> => {
  const pipeline = [
    {
      $match: { _id: workspaceId },
    },
    {
      $unwind: '$users',
    },
    {
      $match: { 'users.userId': inviteeUserId },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'users.inviterId',
        foreignField: '_id',
        as: 'inviterDetails',
      },
    },
    {
      $unwind: '$inviterDetails',
    },
    {
      $project: {
        _id: 0,
        inviterName: { $concat: ['$inviterDetails.firstName', ' ', '$inviterDetails.lastName'] }, // Concatenate to form a full name
        inviterEmail: '$inviterDetails.email',
      },
    },
  ];

  const results = await DataAccess.aggregate(workspaceModel, pipeline);

  if (results?.length === 0) {
    throw new AppError('Inviter not found', 404);
  }

  return results[0];
};
const notifyInvitee = async (
  inviteeName: string,
  workspaceName: string,
  inviteeEmail: string,
): Promise<void> => {
  const { subject, plainMessage, htmlMessage } = await generateInviteeJoinedEmailContent(
    inviteeName,
    workspaceName,
  );

  await sendEmail({
    email: inviteeEmail,
    subject: subject,
    message: plainMessage,
    html: htmlMessage,
  });
};
const notifyInviter = async (
  inviteeId: string,
  inviteeName: string,
  workspaceName: string,
  workspaceId: string,
): Promise<void> => {
  const { inviterName, inviterEmail } = await fetchInviterDetails(workspaceId, inviteeId);

  const { subject, plainMessage, htmlMessage } = generateInviterNotificationEmailContent(
    inviterName,
    inviteeName,
    workspaceName,
  );

  await sendEmail({
    email: inviterEmail,
    subject: subject,
    message: plainMessage,
    html: htmlMessage,
  });
};

export const getWorkspaceUsers = async (workspaceId: string, token: string): Promise<any> => {
  const userId = await findUserByToken(token);
  const workspace = await DataAccess.findById<IWorkspace>(workspaceModel, workspaceId);
  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }

  const requestingUser = workspace.users.find((user) => user.userId.toString() === userId);
  if (!requestingUser) {
    throw new AppError('User not found in the workspace', 404);
  }

  const pipeline: any[] = [
    { $match: { _id: workspaceId } },
    { $unwind: '$users' },
    {
      $lookup: {
        from: 'users',
        localField: 'users.userId',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    { $unwind: '$userDetails' },
    {
      $project: {
        email: '$userDetails.email',
        role: '$users.role',
        position: '$users.position',
        planet: '$users.planet',
        status: {
          $cond: {
            if: { $eq: ['$users.isVerified', true] },
            then: 'confirm',
            else: 'pending',
          },
        },
      },
    },
  ];

  if (requestingUser.role === 'mentor') {
    pipeline.push({ $match: { 'users.role': 'mentee' } });
  }

  const results = await DataAccess.aggregate(workspaceModel, pipeline);

  if (!results) {
    throw new AppError('No users found for the provided workspace ID', 404);
  }

  return results;
};

export const getLeaderboard = async (workspaceId: string, token: string): Promise<any> => {
  const requesterId = await findUserByToken(token);
  const pipeline = [
    {
      $match: {
        _id: workspaceId,
      },
    },
    {
      $unwind: '$users',
    },
    {
      $match: {
        'users.role': { $in: ['mentee'] },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'users.userId',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
    {
      $unwind: '$userInfo',
    },
    {
      $project: {
        userId: '$users.userId',
        firstName: '$userInfo.firstName',
        lastName: '$userInfo.lastName',
        email: '$userInfo.email',
        score: '$users.stars',
        completedTasks: {
          $size: {
            $filter: {
              input: '$users.quest',
              cond: { $eq: ['$$this.status', 'Done'] },
            },
          },
        },
        position: '$users.position',
      },
    },
    {
      $sort: { score: -1 },
    },
  ];

  const results = await DataAccess.aggregate(workspaceModel, pipeline);
  return results;
};

export const getWorkspaceTasks = async (workspaceId: string, token: string): Promise<any> => {
  const userId = await findUserByToken(token);
  const workspace = await DataAccess.findById<IWorkspace>(workspaceModel, workspaceId);
  
  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }

  const requestingUser = workspace.users.find((user) => user.userId.toString() === userId);
  if (!requestingUser) {
    throw new AppError('User not found in the workspace', 404);
  }

  // Only admins and mentors can view workspace tasks
  if (!['admin', 'mentor'].includes(requestingUser.role)) {
    throw new AppError('Access denied. Only admins and mentors can view workspace tasks', 403);
  }

  return workspace.backlog || [];
};

export const deleteWorkspace = async (workspaceId: string, token: string): Promise<void> => {
  const userId = await findUserByToken(token);
  const workspace = await DataAccess.findById<IWorkspace>(workspaceModel, workspaceId);
  
  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }

  const requestingUser = workspace.users.find((user) => user.userId.toString() === userId);
  if (!requestingUser) {
    throw new AppError('User not found in the workspace', 404);
  }

  // Only admins can delete workspaces
  if (requestingUser.role !== 'admin') {
    throw new AppError('Access denied. Only admins can delete workspaces', 403);
  }

  // Remove workspace reference from all users
  await DataAccess.updateMany(
    userModel,
    { 'workspaces.workspaceId': workspaceId },
    { $pull: { workspaces: { workspaceId } } }
  );

  // Delete the workspace
  await DataAccess.deleteById(workspaceModel, workspaceId);
};

/**
 * Process pending invitations when a user registers
 * This function is called during user registration to auto-join workspaces
 */
export const processPendingInvitations = async (userEmail: string, userId: string): Promise<void> => {
  try {
    // Find all pending invitations for this email
    const pendingInvitations = await Invitation.find({
      inviteeEmail: userEmail.toLowerCase(),
      status: 'pending',
      tokenExpires: { $gt: new Date() }
    }).populate('workspaceId');

    if (pendingInvitations.length === 0) {
      return; // No pending invitations
    }

    console.log(`🔍 Found ${pendingInvitations.length} pending invitation(s) for ${userEmail}`);

    // Process each invitation
    for (const invitation of pendingInvitations) {
      try {
        const workspace = invitation.workspaceId as any as IWorkspace;
        
        // Add user to workspace
        await DataAccess.updateById<IWorkspace>(workspaceModel, workspace._id, {
          $push: {
            users: {
              userId: userId,
              role: invitation.inviteeRole,
              isVerified: true, // Auto-verify since they registered with the invited email
              position: invitation.positionId || undefined,
              planet: invitation.planet || undefined,
              joinedAt: new Date(),
            },
          },
        });

        // Add workspace to user's workspace list
        await DataAccess.updateById<IUser>(userModel, userId, {
          $push: { workspaces: { workspaceId: workspace._id } },
        });

        // Mark invitation as accepted
        await DataAccess.updateById('Invitation', invitation._id.toString(), {
          status: 'accepted',
          acceptedAt: new Date()
        });

        // Assign tasks if user is a mentee
        if (invitation.inviteeRole === 'mentee') {
          await assignTasksToNewMentee(
            workspace._id.toString(), 
            userId, 
            invitation.positionId ? invitation.positionId.toString() : undefined, 
            invitation.planet
          );
        }

        // Note: Invitation already marked as accepted above

        // Send confirmation emails
        await sendJoinConfirmationEmails(workspace, invitation, userId);

        console.log(`✅ Auto-joined user ${userEmail} to workspace ${workspace.name}`);
        
      } catch (error) {
        console.error(`❌ Failed to process invitation ${invitation._id}:`, error);
        // Continue processing other invitations even if one fails
      }
    }
  } catch (error) {
    console.error(`❌ Failed to process pending invitations for ${userEmail}:`, error);
    // Don't throw error - registration should still succeed even if invitation processing fails
  }
};

/**
 * Assign tasks to new mentee based on their position and planet
 */
const assignTasksToNewMentee = async (
  workspaceId: string,
  userId: string,
  positionId?: string,
  userPlanet?: string,
): Promise<void> => {
  if (!positionId && !userPlanet) {
    return; // No specific position or planet to match tasks
  }

  const pipeline = [
    {
      $match: {
        _id: workspaceId,
      },
    },
    {
      $unwind: '$backlog',
    },
    {
      $match: {
        $or: [
          {
            ...(positionId && { 'backlog.positions': positionId }),
            ...(userPlanet && { 'backlog.planets': userPlanet }),
          },
          {
            'backlog.isGlobal': true,
          },
        ],
      },
    },
    {
      $project: {
        _id: '$backlog._id',
      },
    },
  ];

  const tasks = await DataAccess.aggregate(workspaceModel, pipeline);

  if (tasks.length > 0) {
    await assignTasksToUser(workspaceId, userId, tasks);
  }
};

/**
 * Send confirmation emails after successful auto-join
 */
const sendJoinConfirmationEmails = async (
  workspace: IWorkspace,
  invitation: IInvitation,
  userId: string,
): Promise<void> => {
  try {
    const user = await DataAccess.findById<IUser>(userModel, userId, 'firstName lastName email');
    if (!user) return;

    const inviteeName = `${user.firstName} ${user.lastName}`;

    // Notify the new member
    await notifyInvitee(inviteeName, workspace.name, user.email);

    // Notify the inviter
    await notifyInviter(userId, inviteeName, workspace.name, workspace._id.toString());
    
  } catch (error) {
    console.error('Failed to send join confirmation emails:', error);
    // Don't throw - email failure shouldn't break the join process
  }
};

