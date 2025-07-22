// src/api/emailTemplate/verificationEmailTemplate.ts
import { vars } from '@/config/vars';
import { generateBaseEmailTemplate } from './baseEmailTemplate';

export const generateVerificationEmailContent = (
  user: { firstName: string; lastName: string },
  verificationCode: string,
): { message: string; htmlMessage: string; subject: string } => {
  const { clientUrl } = vars;
  const userFullName = `${user.firstName} ${user.lastName}`;
  
  const subject = `🔐 Verify Your StarQuest Account - Complete Your Registration`;
  
  const preheader = `Enter code ${verificationCode} to complete your account verification and unlock your quest!`;

  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
        <h2 style="color: #FFFFFF; font-size: 24px; margin: 0 0 8px; font-weight: bold;">🔒 Security Checkpoint</h2>
        <p style="color: #FEF3C7; font-size: 16px; margin: 0;">Almost there! Just one more step to secure your account</p>
      </div>
    </div>

    <p style="margin-bottom: 24px;">
      Welcome to the StarQuest universe! To complete your registration and secure your account, 
      please verify your email address using the verification code below.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <div style="background: linear-gradient(135deg, #1F2937 0%, #374151 100%); border: 2px solid #6366F1; border-radius: 12px; padding: 32px; display: inline-block;">
        <p style="color: #9CA3AF; font-size: 14px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
        <div style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; color: #6366F1; letter-spacing: 8px; margin: 12px 0;">${verificationCode}</div>
        <p style="color: #6B7280; font-size: 12px; margin: 8px 0 0;">Enter this code in your browser to continue</p>
      </div>
    </div>

    <div style="background-color: #1E293B; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 24px 0;">
      <h3 style="color: #F59E0B; margin: 0 0 12px; font-size: 16px;">⚡ Quick Steps:</h3>
      <ol style="color: #CBD5E1; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Copy the 6-digit verification code above</li>
        <li style="margin-bottom: 8px;">Return to your browser where you registered</li>
        <li style="margin-bottom: 8px;">Paste the code in the verification field</li>
        <li>Start your StarQuest adventure immediately!</li>
      </ol>
    </div>

    <div style="background-color: #7C2D12; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="color: #FED7AA; margin: 0; font-size: 14px; text-align: center;">
        <strong>⏰ Time Sensitive:</strong> This verification code expires in 20 minutes for your security.
      </p>
    </div>

    <p style="color: #94A3B8; font-size: 14px; margin-top: 24px;">
      <strong>Didn't request this verification?</strong> If you didn't sign up for StarQuest, 
      you can safely ignore this email. Your data is secure.
    </p>
  `;

  const { htmlMessage, plainMessage } = generateBaseEmailTemplate({
    recipientName: user.firstName,
    subject,
    preheader,
    content,
    ctaButton: {
      text: '🔐 Complete Verification',
      url: `${clientUrl}/verification?email=${encodeURIComponent(user.firstName.toLowerCase() + user.lastName.toLowerCase() + '@example.com')}`,
      fallbackText: 'If the button doesn\'t work, manually enter the code in your browser'
    },
    secondaryButton: {
      text: '❓ Need Help?',
      url: `${clientUrl}/support`,
      fallbackText: 'Get support if you\'re having trouble'
    },
    footerText: `For security, this verification code will expire in 20 minutes. Complete verification now to secure your account!`,
    showUnsubscribe: false
  });

  return { 
    message: plainMessage, 
    htmlMessage,
    subject 
  };
};
