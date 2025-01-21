// src/api/validations/workspace.validations.ts

import { z } from 'zod';

const emailSchema = z.string().email({ message: 'Invalid email format' });
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createWorkspaceValidation = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  description: z.string().min(1, 'Workspace description is required'),
  rules: z.string().min(1, 'Workspace rules are required'),
});

export const sendInvitationValidation = z.object({
  workspaceId: z.string().regex(objectIdRegex, 'Invalid ObjectId format'),
  inviteeEmail: emailSchema,
});

export const invitationTokenValidation = z.object({
  invitationToken: z.string().min(1, 'Invitation token is required'),
});

export const workspaceIdValidation = z.object({
  workspaceId: z.string().regex(objectIdRegex, 'Invalid ObjectId format'),
});
