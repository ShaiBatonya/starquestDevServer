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

const workspaceModel = 'Workspace';
const userModel = 'User';

interface IWorkspaceInvitationRequest {
  workspaceId: string;
  inviteeEmail: string;
  inviteeRole: string;
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

  return user.workspaces.map(({ workspaceId }) => formatWorkspaceData(workspaceId, userId));
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

/**
 * Send a workspace invitation and notify the inviter of the outcome.
 * @param userToken Token of the user sending the invitation.
 * @param invitationData Data required for sending the invitation.
 * @returns A confirmation message indicating the status of the invitation.
 */
export const sendWorkspaceInvitation = async (
  userToken: string,
  invitationData: IWorkspaceInvitationRequest,
): Promise<string> => {
  const { workspaceId, inviteeEmail, inviteeRole } = invitationData;
  const inviterId = await findUserByToken(userToken);
  const workspace = await fetchWorkspace(workspaceId);

  await verifyInviterPermission({ inviterId, workspace, inviteeRole });
  const inviteeId = await verifyInviteeStatusInWorkspace(workspace, inviteeEmail);

  const isInvitationSent = await createAndSendInvitation({
    workspaceId,
    inviteeId,
    inviteeEmail,
    inviteeRole,
    workspace,
  });
  await sendNotficationToInviter(isInvitationSent, inviteeEmail, inviterId);
  return `Invitation sent to ${inviteeEmail} with token.`;
};
const fetchWorkspace = async (workspaceId: string): Promise<IWorkspace> => {
  const workspace = await DataAccess.findById<IWorkspace>(workspaceModel, workspaceId);
  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }
  return workspace;
};
const verifyInviterPermission = async (
  UserPermissionDetails: IUserPermissionInWorkspace,
): Promise<void> => {
  const { inviterId, workspace, inviteeRole } = UserPermissionDetails;
  const userInWorkspace = workspace.users.find((user) => user.userId.toString() === inviterId);
  const inviterRole = userInWorkspace?.role;
  if ((inviterRole === 'mentor' && inviteeRole !== 'mentee') || inviterRole !== 'admin') {
    throw new AppError('Unauthorized to invite this role', 403);
  }
};
const verifyInviteeStatusInWorkspace = async (
  workspace: IWorkspace,
  inviteeEmail: string,
): Promise<string | null> => {
  const invitee = await DataAccess.findOneByConditions<IUser>(
    userModel,
    { email: inviteeEmail },
    '_id',
  );

  if (!invitee) {
    return null;
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
const createAndSendInvitation = async (processDetails: IProcessDetails): Promise<boolean> => {
  const { workspaceId, inviteeId, inviteeEmail, inviteeRole, workspace } = processDetails;
  const invitationToken = crypto.randomBytes(20).toString('hex');
  const tokenExpiration = Date.now() + 3600000;

  await DataAccess.updateById<IWorkspace>(workspaceModel, workspaceId, {
    $push: {
      users: {
        userId: inviteeId,
        role: inviteeRole,
        isVerified: false,
        verificationToken: invitationToken,
        verificationTokenExpires: tokenExpiration,
      },
    },
  });

  const isNewUser = !inviteeId;

  const { subject, plainMessage, htmlMessage } = generateInvitationEmailContent(
    isNewUser,
    workspace.name,
    invitationToken,
  );

  const isEmailSent = await sendEmail({
    email: inviteeEmail,
    subject: subject,
    message: plainMessage,
    html: htmlMessage,
  });

  return isEmailSent;
};
const sendNotficationToInviter = async (
  isInvitationSent: boolean,
  inviteeEmail: string,
  inviterId: string,
): Promise<void> => {
  const inviter = await DataAccess.findOneByConditions<IUser>(
    userModel,
    { _id: inviterId },
    { firstName: 1, lastName: 1, email: 1 },
  );

  const { baseSubject, baseMessage, htmlMessage } = generateEmailForInviterContent(
    isInvitationSent,
    inviteeEmail,
  );

  if (!inviter?.email) {
    throw new AppError('Inviter data is incomplete or inviter not found.', 404);
  }

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
    { $match: { _id: workspaceId } },
    { $unwind: '$users' },
    { $match: { 'users.role': 'mentee' } },
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
      $addFields: {
        me: { $eq: ['$users.userId', requesterId] },
      },
    },
    {
      $project: {
        firstName: '$userDetails.firstName',
        position: '$users.position',
        planet: '$users.planet',
        stars: '$users.stars',
        me: 1,
      },
    },
    { $sort: { stars: -1 } },
  ];

  const mentees = await DataAccess.aggregate(workspaceModel, pipeline);

  if (!mentees) {
    throw new AppError('No mentees found for the provided workspace ID', 404);
  }

  return mentees;
};
