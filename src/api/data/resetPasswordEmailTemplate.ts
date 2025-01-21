// src/api/data/resetPasswordEmailTemplate.ts

export const generateResetPasswordEmailContent = (
  req: { protocol: string; get: (_name: string) => string | string[] | undefined },
  resetToken: string,
): string => {
  const host = req.get('host');
  // Ensure 'host' is a string. If 'host' is undefined or an array, use a default value or handle the error appropriately.
  const resetURL = host
    ? `${req.protocol}://${host}/api/auth/resetPassword/${resetToken}`
    : 'URL not available';
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  return message;
};
