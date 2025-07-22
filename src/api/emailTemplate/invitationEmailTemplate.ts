// src/api/emailTemplate/invitationEmailTemplate.ts
import { vars } from '@/config/vars';
import { generateBaseEmailTemplate } from './baseEmailTemplate';

export const generateInvitationEmailContent = (
  isNewUser: boolean,
  workspaceName: string,
  invitationToken: string,
  inviterName?: string,
): { subject: string; plainMessage: string; htmlMessage: string } => {
  const { clientUrl } = vars;
  
  // Dynamic subject lines with workspace name
  const subject = isNewUser 
    ? `🚀 Welcome to StarQuest - Join "${workspaceName}" Workspace`
    : `🌟 Invitation to join "${workspaceName}" on StarQuest`;

  const preheader = isNewUser
    ? `You've been invited to join ${workspaceName}. Complete your registration to start your quest!`
    : `${inviterName ? `${inviterName} has` : 'You have been'} invited you to collaborate in ${workspaceName}. Accept your invitation to get started.`;

  // Invitation links pointing to frontend
  const registrationUrl = `${clientUrl}/register?invitation=${invitationToken}`;
  const acceptInvitationUrl = `${clientUrl}/accept-invitation?token=${invitationToken}`;
  const loginUrl = `${clientUrl}/login`;

  if (isNewUser) {
    // New user invitation content
    const content = `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: #FFFFFF; font-size: 24px; margin: 0 0 8px; font-weight: bold;">🎯 Mission Briefing</h2>
          <p style="color: #E2E8F0; font-size: 16px; margin: 0;">You've been selected for an important quest!</p>
        </div>
      </div>

      <p style="font-size: 18px; color: #F1F5F9; margin-bottom: 24px;">
        <strong>Greetings, Future Quester!</strong> 🌟
      </p>

      <p style="margin-bottom: 20px;">
        You have been invited to join the <strong style="color: #6366F1;">"${workspaceName}"</strong> workspace on StarQuest - 
        an epic journey of learning, collaboration, and achievement awaits you!
      </p>

      <div style="background-color: #1E293B; padding: 20px; border-radius: 8px; border-left: 4px solid #6366F1; margin: 24px 0;">
        <h3 style="color: #6366F1; margin: 0 0 12px; font-size: 16px;">⚡ What happens next?</h3>
        <ol style="color: #CBD5E1; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Click the button below to create your StarQuest account</li>
          <li style="margin-bottom: 8px;">Complete the quick registration process</li>
          <li style="margin-bottom: 8px;">Verify your email address</li>
          <li>Automatically join the "${workspaceName}" workspace and start your quest!</li>
        </ol>
      </div>

      <div style="background-color: #064E3B; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="color: #6EE7B7; margin: 0; font-size: 14px; text-align: center;">
          <strong>🔐 Secure Registration:</strong> This invitation is personalized for you and expires in 7 days.
        </p>
      </div>
    `;

    const { htmlMessage, plainMessage } = generateBaseEmailTemplate({
      recipientName: undefined, // We don't know the name yet
      subject,
      preheader,
      content,
      ctaButton: {
        text: '🚀 Create Account & Join Quest',
        url: registrationUrl,
        fallbackText: 'If the button doesn\'t work, copy and paste this link into your browser'
      },
      secondaryButton: {
        text: '📖 Learn More About StarQuest',
        url: `${clientUrl}/about`,
        fallbackText: 'Learn more about the platform'
      },
      footerText: `This invitation to join "${workspaceName}" will expire in 7 days. Don't miss out on your adventure!`,
      showUnsubscribe: false
    });

    return { subject, plainMessage, htmlMessage };

  } else {
    // Existing user invitation content
    const content = `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: #FFFFFF; font-size: 24px; margin: 0 0 8px; font-weight: bold;">🎪 New Quest Awaits!</h2>
          <p style="color: #D1FAE5; font-size: 16px; margin: 0;">A new workspace adventure is calling your name</p>
        </div>
      </div>

      <p style="font-size: 18px; color: #F1F5F9; margin-bottom: 24px;">
        <strong>Welcome back, Quester!</strong> 🏆
      </p>

      <p style="margin-bottom: 20px;">
        ${inviterName ? `<strong style="color: #10B981;">${inviterName}</strong> has` : 'You have been'} invited you to join the 
        <strong style="color: #6366F1;">"${workspaceName}"</strong> workspace on StarQuest.
      </p>

      <p style="margin-bottom: 24px;">
        As an experienced quester, you can jump right into the action! Simply accept this invitation to 
        start collaborating with your team and tackle exciting new challenges.
      </p>

      <div style="background-color: #1E293B; padding: 20px; border-radius: 8px; border-left: 4px solid #10B981; margin: 24px 0;">
        <h3 style="color: #10B981; margin: 0 0 12px; font-size: 16px;">🎯 Ready to start?</h3>
        <ul style="color: #CBD5E1; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Click the acceptance button below</li>
          <li style="margin-bottom: 8px;">You'll be instantly added to the workspace</li>
          <li>Start collaborating with your new team immediately!</li>
        </ul>
      </div>

      <div style="background-color: #7C2D12; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="color: #FED7AA; margin: 0; font-size: 14px; text-align: center;">
          <strong>⏰ Quick Action Required:</strong> This invitation expires in 1 hour for security purposes.
        </p>
      </div>
    `;

    const { htmlMessage, plainMessage } = generateBaseEmailTemplate({
      recipientName: undefined, // We could get this from user data if available
      subject,
      preheader,
      content,
      ctaButton: {
        text: '✨ Accept Invitation',
        url: acceptInvitationUrl,
        fallbackText: 'If the button doesn\'t work, copy and paste this link into your browser'
      },
      secondaryButton: {
        text: '🏠 Go to Dashboard',
        url: `${clientUrl}/dashboard`,
        fallbackText: 'Access your main dashboard'
      },
      footerText: `This invitation to join "${workspaceName}" expires in 1 hour. Accept now to avoid missing out!`,
      showUnsubscribe: false
    });

    return { subject, plainMessage, htmlMessage };
  }
};
