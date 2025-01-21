// src/api/emailTemplate/inviteeJoinedEmailTemplate.ts

export const generateInviteeJoinedEmailContent = (
  inviteeName: string,
  workspaceName: string,
): { subject: string; plainMessage: string; htmlMessage: string } => {
  const subject = `Welcome to ${workspaceName}!`;
  const plainMessage = `Hi ${inviteeName},\n\nYou have successfully joined ${workspaceName}. We're glad to have you on board and excited to see your contributions!`;
  const htmlMessage = `<html>
<body>
  <p>Hi <strong>${inviteeName}</strong>,</p>
  <p>You have successfully joined <strong>${workspaceName}</strong>. We're glad to have you on board and excited to see your contributions!</p>
</body>
</html>`;

  return { subject, plainMessage, htmlMessage };
};
