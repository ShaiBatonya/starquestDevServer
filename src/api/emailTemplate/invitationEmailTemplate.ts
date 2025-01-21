// src/api/emailTemplate/invitationEmailTemplate.ts
import { vars } from '@/config/vars';

export const generateInvitationEmailContent = (
  isNewUser: boolean,
  workspaceName: string,
  invitationToken: string,
): { subject: string; plainMessage: string; htmlMessage: string } => {
  const subject = isNewUser ? 'Welcome to StarQuest' : 'Workspace Invitation';

  const plainMessage = isNewUser
    ? `Welcome to StarQuest! You have been invited to the workspace of ${workspaceName}. Please sign up at ${vars.domainUrl}/signup and then use the following link to join your workspace: ${vars.domainUrl}/workspace/accept-invitation/?invitationToken=${invitationToken}`
    : `You're invited to join the workspace '${workspaceName}'. Use this link to confirm your participation: ${vars.domainUrl}/workspace/accept-invitation/?invitationToken=${invitationToken}`;

  const htmlMessage = isNewUser
    ? `<html><body><p>Welcome to StarQuest! You have been invited to the workspace of <strong>${workspaceName}</strong>.</p><p>Please <a href="${vars.domainUrl}/signup">sign up here</a> and then use the following link to join your workspace: <a href="${vars.domainUrl}/workspace/accept-invitation/?invitationToken=${invitationToken}">Join Workspace</a></p></body></html>`
    : `<html><body><p>You're invited to join the workspace '<strong>${workspaceName}</strong>'.</p><p>Use this link to confirm your participation: <a href="${vars.domainUrl}/workspace/accept-invitation/?invitationToken=${invitationToken}">Confirm Participation</a></p></body></html>`;

  return {
    subject,
    plainMessage,
    htmlMessage,
  };
};
