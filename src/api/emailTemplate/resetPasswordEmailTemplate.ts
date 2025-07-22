// src/api/emailTemplate/resetPasswordEmailTemplate.ts
import { vars } from '@/config/vars';
import { generateBaseEmailTemplate } from './baseEmailTemplate';

export const generateResetPasswordEmailContent = (
  userEmail: string,
  userName: string,
  resetToken: string,
): { subject: string; plainMessage: string; htmlMessage: string } => {
  const { clientUrl } = vars;
  
  const subject = `🔐 Reset Your StarQuest Password - Secure Account Recovery`;
  
  const preheader = `Reset your password securely and get back to your quests quickly and safely.`;
  
  // Frontend reset password URL
  const resetURL = `${clientUrl}/reset-password?token=${resetToken}`;
  
  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
        <h2 style="color: #FFFFFF; font-size: 24px; margin: 0 0 8px; font-weight: bold;">🛡️ Account Security</h2>
        <p style="color: #FEE2E2; font-size: 16px; margin: 0;">Password reset requested for your account</p>
      </div>
    </div>

    <p style="margin-bottom: 24px;">
      We received a request to reset the password for your StarQuest account. If you made this request, 
      click the button below to create a new password and regain access to your quests.
    </p>

    <div style="background-color: #1E293B; padding: 20px; border-radius: 8px; border-left: 4px solid #DC2626; margin: 24px 0;">
      <h3 style="color: #DC2626; margin: 0 0 12px; font-size: 16px;">🔒 Security Information:</h3>
      <ul style="color: #CBD5E1; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;"><strong>Account:</strong> ${userEmail}</li>
        <li style="margin-bottom: 8px;"><strong>Requested:</strong> ${new Date().toLocaleString()}</li>
        <li style="margin-bottom: 8px;"><strong>Expires:</strong> In 10 minutes</li>
        <li>If you didn't request this, please ignore this email</li>
      </ul>
    </div>

    <div style="background-color: #064E3B; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="color: #6EE7B7; margin: 0; font-size: 14px; text-align: center;">
        <strong>🔐 Secure Process:</strong> This reset link is unique to you and expires automatically for security.
      </p>
    </div>

    <div style="background-color: #7C2D12; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="color: #FED7AA; margin: 0; font-size: 14px; text-align: center;">
        <strong>⏰ Important:</strong> This password reset link expires in 10 minutes. Act quickly to maintain account security.
      </p>
    </div>

    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #374151;">
      <h3 style="color: #6366F1; margin: 0 0 16px; font-size: 16px;">🛡️ Didn't request this reset?</h3>
      <p style="color: #94A3B8; font-size: 14px; margin: 0;">
        If you didn't request a password reset, please ignore this email. Your account remains secure, 
        and no changes will be made. Consider enabling two-factor authentication for extra security.
      </p>
    </div>
  `;

  const { htmlMessage, plainMessage } = generateBaseEmailTemplate({
    recipientName: userName,
    subject,
    preheader,
    content,
    ctaButton: {
      text: '🔑 Reset My Password',
      url: resetURL,
      fallbackText: 'If the button doesn\'t work, copy and paste this link into your browser'
    },
    secondaryButton: {
      text: '🛡️ Account Security Tips',
      url: `${clientUrl}/security-tips`,
      fallbackText: 'Learn about account security'
    },
    footerText: `This password reset link expires in 10 minutes. If you need a new reset link, please request another one from the login page.`,
    showUnsubscribe: false
  });

  return { subject, plainMessage, htmlMessage };
};

// Legacy function for backward compatibility
export const generateResetPasswordEmailContentLegacy = (
  req: { protocol: string; get: (_name: string) => string | string[] | undefined },
  resetToken: string,
): string => {
  const host = req.get('host');
  const resetURL = host
    ? `${req.protocol}://${host}/api/auth/resetPassword/${resetToken}`
    : 'URL not available';
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  return message;
};
