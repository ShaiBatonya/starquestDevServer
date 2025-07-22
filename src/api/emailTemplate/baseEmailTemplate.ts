// src/api/emailTemplate/baseEmailTemplate.ts
import { vars } from '@/config/vars';

interface EmailTemplateParams {
  recipientName?: string;
  subject: string;
  preheader?: string;
  content: string;
  ctaButton?: {
    text: string;
    url: string;
    fallbackText?: string;
  };
  secondaryButton?: {
    text: string;
    url: string;
    fallbackText?: string;
  };
  footerText?: string;
  showUnsubscribe?: boolean;
}

/**
 * Professional StarQuest email template with gaming theme
 * Dark mode friendly, mobile responsive, cross-client compatible
 */
export const generateBaseEmailTemplate = (params: EmailTemplateParams): { htmlMessage: string; plainMessage: string } => {
  const {
    recipientName,
    subject,
    preheader,
    content,
    ctaButton,
    secondaryButton,
    footerText,
    showUnsubscribe = false
  } = params;

  const { clientUrl, companyName, companyAddress, supportEmail, emailFromName } = vars;

  // StarQuest Logo (placeholder base64 - replace with actual logo)
  const logoBase64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMUYyOTM3Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiM2MzY2RjEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj5TdGFyUXVlc3Q8L3RleHQ+Cjwvc3ZnPgo=";

  const htmlMessage = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>${subject}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset and base styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .email-container { background-color: #0F172A !important; }
            .content-bg { background-color: #1E293B !important; }
            .text-primary { color: #F1F5F9 !important; }
            .text-secondary { color: #CBD5E1 !important; }
        }
        
        /* Gaming theme colors */
        .bg-primary { background-color: #6366F1; }
        .bg-secondary { background-color: #8B5CF6; }
        .bg-success { background-color: #10B981; }
        .bg-dark { background-color: #1E293B; }
        .text-primary { color: #F1F5F9; }
        .text-secondary { color: #94A3B8; }
        .text-accent { color: #6366F1; }
        
        /* Button styles */
        .btn {
            display: inline-block;
            padding: 16px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        .btn-primary {
            background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
            color: #FFFFFF !important;
            border: 2px solid transparent;
        }
        .btn-secondary {
            background: transparent;
            color: #6366F1 !important;
            border: 2px solid #6366F1;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
        }
        
        /* Mobile responsive */
        @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; }
            .content-wrapper { padding: 20px !important; }
            .btn { padding: 14px 24px !important; font-size: 14px !important; }
            .logo { max-width: 150px !important; }
        }
        
        /* Outlook specific */
        .outlook-spacer { mso-hide: all; }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: transparent;">${preheader}</div>` : ''}
    
    <!-- Email Container -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-container" style="background-color: #0F172A;">
        <tr>
            <td align="center" style="padding: 20px 10px;">
                <!-- Main Content Table -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #1E293B; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);" class="content-bg">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding: 40px 30px 30px; background: linear-gradient(135deg, #1E293B 0%, #334155 100%);">
                            <img src="${logoBase64}" alt="${companyName}" width="200" height="80" style="max-width: 200px; height: auto;" class="logo">
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 0 40px 40px;" class="content-wrapper">
                            ${recipientName ? `
                            <h1 style="color: #F1F5F9; font-size: 28px; font-weight: bold; margin: 0 0 24px; text-align: center;">
                                Welcome, ${recipientName}! 🚀
                            </h1>
                            ` : ''}
                            
                            <div style="color: #CBD5E1; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                                ${content}
                            </div>
                            
                            ${ctaButton ? `
                            <!-- Primary CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${ctaButton.url}" class="btn btn-primary" style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: #FFFFFF; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                                            ${ctaButton.text}
                                        </a>
                                    </td>
                                </tr>
                                ${ctaButton.fallbackText ? `
                                <tr>
                                    <td align="center" style="padding-top: 16px;">
                                        <p style="color: #64748B; font-size: 14px; margin: 0;">
                                            ${ctaButton.fallbackText}:<br>
                                            <a href="${ctaButton.url}" style="color: #6366F1; word-break: break-all;">${ctaButton.url}</a>
                                        </p>
                                    </td>
                                </tr>
                                ` : ''}
                            </table>
                            ` : ''}
                            
                            ${secondaryButton ? `
                            <!-- Secondary CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 16px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${secondaryButton.url}" class="btn btn-secondary" style="background: transparent; color: #6366F1; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; border: 2px solid #6366F1;">
                                            ${secondaryButton.text}
                                        </a>
                                    </td>
                                </tr>
                                ${secondaryButton.fallbackText ? `
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <p style="color: #64748B; font-size: 14px; margin: 0;">
                                            ${secondaryButton.fallbackText}:<br>
                                            <a href="${secondaryButton.url}" style="color: #6366F1; word-break: break-all;">${secondaryButton.url}</a>
                                        </p>
                                    </td>
                                </tr>
                                ` : ''}
                            </table>
                            ` : ''}
                            
                            ${footerText ? `
                            <div style="background-color: #334155; padding: 20px; border-radius: 8px; margin-top: 32px;">
                                <p style="color: #94A3B8; font-size: 14px; margin: 0; text-align: center;">
                                    💡 ${footerText}
                                </p>
                            </div>
                            ` : ''}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #0F172A; border-top: 1px solid #334155;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <p style="color: #64748B; font-size: 14px; margin: 0 0 16px;">
                                            <strong style="color: #94A3B8;">${companyName}</strong><br>
                                            ${companyAddress}
                                        </p>
                                        
                                        <p style="color: #64748B; font-size: 12px; margin: 0 0 16px;">
                                            Questions? Contact us at 
                                            <a href="mailto:${supportEmail}" style="color: #6366F1; text-decoration: none;">${supportEmail}</a>
                                        </p>
                                        
                                        ${showUnsubscribe ? `
                                        <p style="color: #475569; font-size: 12px; margin: 0;">
                                            <a href="${clientUrl}/unsubscribe" style="color: #6366F1; text-decoration: none;">Unsubscribe</a> | 
                                            <a href="${clientUrl}/preferences" style="color: #6366F1; text-decoration: none;">Email Preferences</a>
                                        </p>
                                        ` : ''}
                                        
                                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #334155;">
                                            <p style="color: #475569; font-size: 11px; margin: 0;">
                                                © ${new Date().getFullYear()} ${companyName}. All rights reserved.<br>
                                                This email was sent by ${emailFromName}. Please do not reply to this email.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    
    <!-- Tracking pixel -->
    <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" width="1" height="1" style="display: block;" alt="">
</body>
</html>
`;

  // Plain text version for better deliverability
  const plainMessage = `
${subject}
${preheader ? `\n${preheader}\n` : ''}

${recipientName ? `Welcome, ${recipientName}!\n\n` : ''}

${content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()}

${ctaButton ? `\n${ctaButton.text}: ${ctaButton.url}\n` : ''}
${secondaryButton ? `\n${secondaryButton.text}: ${secondaryButton.url}\n` : ''}

${footerText ? `\n💡 ${footerText}\n` : ''}

---
${companyName}
${companyAddress}

Questions? Contact us at ${supportEmail}

© ${new Date().getFullYear()} ${companyName}. All rights reserved.
This email was sent by ${emailFromName}.
`;

  return { htmlMessage, plainMessage };
}; 