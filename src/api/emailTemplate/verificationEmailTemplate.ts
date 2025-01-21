// src/api/emailTemplate/verificationEmailTemplate.ts

export const generateVerificationEmailContent = (
  user: { firstName: string; lastName: string },
  verificationCode: string,
): { message: string; htmlMessage: string } => {
  const message = `Hello ${user.firstName} ${user.lastName},\n\nPlease verify your account by entering the following code: ${verificationCode}\n\nIf you did not request this, please ignore this email.`;
  const htmlMessage = `<p>Hello <strong>${user.firstName} ${user.lastName}</strong>,</p><p>Please verify your account by entering the following code: <strong>${verificationCode}</strong></p><p>If you did not request this, please ignore this email.</p>`;

  return { message, htmlMessage };
};
