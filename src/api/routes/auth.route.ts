// src/api/routes/auth.route.ts

import express from 'express';

import {
  signupController,
  verifyEmailController, 
  loginController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  updatePasswordController,
   protect, 
} from '@/api/controllers/auth.controller';

import {
  signUpSchema,
  changePasswordValidationSchema,
  forgotPasswordValidationSchena,
  resetPasswordValidationSchema,
  verifyEmailSchema,
  loginSchema,
} from '@/api/validations/user.validations';

import { validateRequest } from '@/api/middleware/validateRequest';
import { testEmailConnection, sendTestEmail } from '@/config/nodeMailer';
import sendEmail from '@/config/nodeMailer';
import { sendSuccessResponse } from '@/api/utils/appResponse';

const router = express.Router();

router.post('/signup',  validateRequest(signUpSchema),  signupController);

router.post('/verifyEmail',  validateRequest(verifyEmailSchema),verifyEmailController );

router.post('/login',  validateRequest(loginSchema), loginController);

router.get('/logout', logoutController);

router.post(
  '/forgotPassword',
  validateRequest(forgotPasswordValidationSchena),
  forgotPasswordController,
);

router.patch(
  '/resetPassword/:token',
  validateRequest(resetPasswordValidationSchema),
  resetPasswordController,
);

/* router.use(protect); */

router.patch(
  '/updateMyPassword',
  validateRequest(changePasswordValidationSchema),
  updatePasswordController,
);

// SendGrid test endpoints (development only)
if (process.env.NODE_ENV !== 'production') {
  // Test SendGrid connection
  router.post('/test-sendgrid-connection', async (req, res) => {
    try {
      const result = await testEmailConnection();
      sendSuccessResponse(res, 200, result, result.success ? 'SendGrid connection successful' : 'SendGrid connection failed');
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to test SendGrid connection', error });
    }
  });

  // Send test email
  router.post('/send-test-email', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ status: 'error', message: 'Email address is required' });
      }
      const result = await sendTestEmail(email);
      sendSuccessResponse(res, 200, { sent: result }, result ? 'Test email sent successfully' : 'Failed to send test email');
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to send test email', error });
    }
  });

  // Test enhanced invitation email (new user)
  router.post('/test-invitation-new-user', async (req, res) => {
    try {
      const { email, workspaceName = 'Test Workspace', inviterName = 'John Doe' } = req.body;
      if (!email) {
        return res.status(400).json({ status: 'error', message: 'Email address is required' });
      }
      
      const { generateInvitationEmailContent } = require('../emailTemplate/invitationEmailTemplate');
      const { subject, plainMessage, htmlMessage } = generateInvitationEmailContent(
        true, // isNewUser
        workspaceName,
        'test-token-12345', // dummy token
        inviterName
      );
      
      const result = await sendEmail({
        email,
        subject,
        message: plainMessage,
        html: htmlMessage,
      });
      
      sendSuccessResponse(res, 200, { sent: result }, result ? 'New user invitation email sent' : 'Failed to send invitation email');
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to send invitation email', error });
    }
  });

  // Test enhanced invitation email (existing user)
  router.post('/test-invitation-existing-user', async (req, res) => {
    try {
      const { email, workspaceName = 'Test Workspace', inviterName = 'Jane Smith' } = req.body;
      if (!email) {
        return res.status(400).json({ status: 'error', message: 'Email address is required' });
      }
      
      const { generateInvitationEmailContent } = require('../emailTemplate/invitationEmailTemplate');
      const { subject, plainMessage, htmlMessage } = generateInvitationEmailContent(
        false, // isNewUser
        workspaceName,
        'test-token-67890', // dummy token
        inviterName
      );
      
      const result = await sendEmail({
        email,
        subject,
        message: plainMessage,
        html: htmlMessage,
      });
      
      sendSuccessResponse(res, 200, { sent: result }, result ? 'Existing user invitation email sent' : 'Failed to send invitation email');
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to send invitation email', error });
    }
  });

  // Test enhanced verification email
  router.post('/test-verification-email', async (req, res) => {
    try {
      const { email, firstName = 'Test', lastName = 'User' } = req.body;
      if (!email) {
        return res.status(400).json({ status: 'error', message: 'Email address is required' });
      }
      
      const { generateVerificationEmailContent } = require('../emailTemplate/verificationEmailTemplate');
      const { subject, message, htmlMessage } = generateVerificationEmailContent(
        { firstName, lastName },
        '123456' // dummy verification code
      );
      
      const result = await sendEmail({
        email,
        subject,
        message,
        html: htmlMessage,
      });
      
      sendSuccessResponse(res, 200, { sent: result }, result ? 'Verification email sent' : 'Failed to send verification email');
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to send verification email', error });
    }
  });

  // Test enhanced password reset email
  router.post('/test-password-reset-email', async (req, res) => {
    try {
      const { email, userName = 'Test User' } = req.body;
      if (!email) {
        return res.status(400).json({ status: 'error', message: 'Email address is required' });
      }
      
      const { generateResetPasswordEmailContent } = require('../emailTemplate/resetPasswordEmailTemplate');
      const { subject, plainMessage, htmlMessage } = generateResetPasswordEmailContent(
        email,
        userName,
        'test-reset-token-abc123' // dummy reset token
      );
      
      const result = await sendEmail({
        email,
        subject,
        message: plainMessage,
        html: htmlMessage,
      });
      
      sendSuccessResponse(res, 200, { sent: result }, result ? 'Password reset email sent' : 'Failed to send password reset email');
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to send password reset email', error });
    }
  });
}

export default router;
