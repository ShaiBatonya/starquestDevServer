// src/api/emailTemplate/inviterEmailTemplate.ts
export const generateEmailForInviterContent = (
  isSuccessful: boolean,
  inviteeEmail: string,
): { baseSubject: string; baseMessage: string; htmlMessage: string } => {
  const baseSubject = isSuccessful ? 'Invitation Sent' : 'Invitation Failed';
  const baseMessage = isSuccessful
    ? `The invitation to ${inviteeEmail} was successfully sent.`
    : `There was an error sending the invitation to ${inviteeEmail}.`;

  const htmlMessage = `<html><body><p>${baseMessage}</p></body></html>`;
  return {
    baseSubject,
    baseMessage,
    htmlMessage,
  };
};
