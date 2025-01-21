// src/config/nodeMailer.ts
import nodemailer from 'nodemailer';
import { vars } from './vars';
import logger from '@/config/logger';

const { emailHost, emailPort, emailUsername, emailPassword } = vars;

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

//  reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailPort === 465, // true for 465, false for other ports
  auth: {
    user: emailUsername,
    pass: emailPassword,
  },
});

/**
 * Sends an email with the provided options.
 * @param {EmailOptions} options - The email options including recipient, subject, message, and optionally HTML content.
 * @returns {Promise<boolean>} - A promise that resolves to true if the email is sent successfully, or false otherwise.
 */
const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  const mailOptions = {
    from: 'Elyahu Anavi <hello@ely.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.email}`);
    return true; // Email sent successfully
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to send email to ${options.email}: ${errorMessage}`);
    return false; // Email failed to send
  }
};

export default sendEmail;
