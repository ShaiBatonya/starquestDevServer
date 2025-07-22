// src/api/validations/invitation.validations.ts

import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const invitationTokenRegex = /^[a-fA-F0-9]+$/;

export const workspaceInvitationsParamsSchema = z.object({
  workspaceId: z.string().regex(objectIdRegex, 'Invalid workspace ID format'),
});

export const workspaceInvitationsQuerySchema = z.object({
  status: z.enum(['pending', 'accepted', 'expired', 'cancelled']).optional(),
});

export const invitationParamsSchema = z.object({
  invitationId: z.string().regex(objectIdRegex, 'Invalid invitation ID format'),
});

export const invitationTokenParamsSchema = z.object({
  token: z.string()
    .min(32, 'Invitation token too short')
    .max(128, 'Invitation token too long')
    .regex(invitationTokenRegex, 'Invalid invitation token format'),
}); 