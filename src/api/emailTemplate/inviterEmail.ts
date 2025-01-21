// src/api/emailTemplates/inviterEmail.ts
export const generateInviterNotificationEmailContent = (
  inviterName: string,
  inviteeName: string,
  workspaceName: string,
): { subject: string; plainMessage: string; htmlMessage: string } => {
  const subject = `Notification: ${inviteeName} has joined ${workspaceName}`;
  const plainMessage = `Hi ${inviterName},\n\nWe are pleased to inform you that ${inviteeName} has successfully joined the ${workspaceName}.`;
  const htmlMessage = `<html>
<body>
  <p>Hi <strong>${inviterName}</strong>,</p>
  <p>We are pleased to inform you that <strong>${inviteeName}</strong> has successfully joined the <strong>${workspaceName}</strong>.</p>
</body>
</html>`;

  return { subject, plainMessage, htmlMessage };
};
