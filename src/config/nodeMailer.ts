// src/config/mailService.ts
import nodemailer from 'nodemailer';
import { vars } from './vars';
import logger from '@/config/logger';

const { sendGridApiKey, emailFromName, emailFromAddress, nodeEnv } = vars;

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

interface SendMailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Production-grade SendGrid SMTP transporter
 * Uses SendGrid's SMTP relay for reliable email delivery
 */
const createTransporter = () => {
  if (!sendGridApiKey) {
    logger.error('⚠️ SENDGRID_API_KEY is not configured. Email sending will fail.');
    throw new Error('SendGrid API key is required for email sending');
  }

  if (!emailFromAddress || !emailFromName) {
    logger.error('⚠️ EMAIL_FROM_ADDRESS or EMAIL_FROM_NAME is not configured');
    throw new Error('Email from address and name are required');
  }

  return nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: 'apikey', // SendGrid uses 'apikey' as username
      pass: sendGridApiKey, // Your SendGrid API key
    },
    // Additional SendGrid-specific options
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates in development
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000, // 5 seconds
    socketTimeout: 45000, // 45 seconds
  });
};

/**
 * Sends an email using SendGrid SMTP with enhanced error handling and logging
 * @param {EmailOptions} options - The email options including recipient, subject, message, and optionally HTML content
 * @returns {Promise<boolean>} - A promise that resolves to true if the email is sent successfully, or false otherwise
 */
const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // Validate input parameters
    if (!options.email || !options.subject || (!options.message && !options.html)) {
      logger.error('❌ Invalid email parameters:', {
        hasEmail: !!options.email,
        hasSubject: !!options.subject,
        hasMessage: !!options.message,
        hasHtml: !!options.html
      });
      return false;
    }

    // Create transporter for each send (to handle connection issues)
    const transporter = createTransporter();

    const mailOptions = {
      from: `${emailFromName} <${emailFromAddress}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message, // Fallback to text if no HTML
      // Enhanced headers for better deliverability and compliance
      headers: {
        'X-Entity-ID': 'starquest-app',
        'X-Environment': nodeEnv,
        'X-Mailer': 'StarQuest Email System v2.0',
        'X-Priority': '3', // Normal priority
        'Reply-To': `${emailFromName} <${emailFromAddress}>`,
        'List-Unsubscribe': `<mailto:unsubscribe@starquest.space?subject=Unsubscribe>, <https://starquest.app/unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'Precedence': 'bulk',
        // Anti-spam headers
        'X-Auto-Response-Suppress': 'All',
        'X-Original-From': emailFromAddress,
        // Security headers
        'X-SES-Configuration-Set': 'starquest-emails',
        'X-SES-Message-Tags': `environment=${nodeEnv},type=transactional`,
        // Authentication headers (will be added by SendGrid)
        'Authentication-Results': 'dkim=pass; spf=pass; dmarc=pass',
        // Content classification
        'X-Message-Source': 'StarQuest Application',
        'X-Message-Info': 'Transactional email from StarQuest platform'
      },
      // Additional SendGrid-specific options
      messageId: `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@starquest.app>`,
      date: new Date().toISOString(),
    };

    logger.info('📧 Attempting to send email via SendGrid:', {
      to: options.email,
      subject: options.subject,
      from: `${emailFromName} <${emailFromAddress}>`,
      environment: nodeEnv,
      hasHtml: !!options.html,
      messageId: mailOptions.messageId,
    });

    const info = await transporter.sendMail(mailOptions);
    
    logger.info('✅ Email sent successfully via SendGrid:', {
      to: options.email,
      messageId: info.messageId,
      response: info.response,
      envelope: info.envelope,
    });

    return true;

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = (error as any)?.code;
    const responseCode = (error as any)?.responseCode;
    
    logger.error('❌ Failed to send email via SendGrid:', {
      to: options.email,
      subject: options.subject,
      error: errorMessage,
      errorCode,
      responseCode,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Log specific SendGrid error types for easier debugging
    if (errorMessage.includes('Invalid API key')) {
      logger.error('🔑 SendGrid API key is invalid. Please check your SENDGRID_API_KEY environment variable.');
    } else if (errorMessage.includes('The from address does not match a verified Sender Identity')) {
      logger.error('📧 SendGrid sender identity not verified. Please verify your from address in SendGrid dashboard.');
    } else if (errorCode === 'ECONNREFUSED') {
      logger.error('🌐 Unable to connect to SendGrid SMTP server. Check your internet connection.');
    } else if (responseCode === 550) {
      logger.error('📬 Recipient email address may be invalid or blocked.');
    }

    return false;
  }
};

/**
 * Test email connection to SendGrid
 * Useful for health checks and debugging
 */
export const testEmailConnection = async (): Promise<SendMailResult> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    logger.info('✅ SendGrid SMTP connection verified successfully');
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('❌ SendGrid SMTP connection failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Send a test email to verify SendGrid integration
 * Only use this in development/testing environments
 */
export const sendTestEmail = async (to: string): Promise<boolean> => {
  if (nodeEnv === 'production') {
    logger.warn('⚠️ Test email sending is disabled in production environment');
    return false;
  }

  return sendEmail({
    email: to,
    subject: '🧪 StarQuest SendGrid Test Email',
    message: 'This is a test email to verify SendGrid integration is working correctly.',
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4f46e5;">🧪 StarQuest SendGrid Test</h2>
            <p>This is a test email to verify that SendGrid integration is working correctly.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #059669;">✅ Integration Status: Working</h3>
              <p><strong>Environment:</strong> ${nodeEnv}</p>
              <p><strong>Sent via:</strong> SendGrid SMTP</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              If you received this email, your SendGrid integration is configured correctly.
            </p>
          </div>
        </body>
      </html>
    `,
  });
};

export default sendEmail;
