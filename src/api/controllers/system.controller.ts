// src/api/controllers/system.controller.ts

import { Request, Response } from 'express';
import { sendSuccessResponse } from '@/api/utils/appResponse';
import { vars } from '@/config/vars';
import { testEmailConnection } from '@/config/nodeMailer';
import catchAsync from '@/api/utils/catchAsync';

/**
 * Get system configuration status for email and other critical services
 */
export const getSystemConfigController = catchAsync(async (req: Request, res: Response) => {
  const config = {
    email: {
      sendGridApiKey: !!vars.sendGridApiKey,
      emailFromAddress: !!vars.emailFromAddress,
      emailFromName: !!vars.emailFromName,
      configured: !!(vars.sendGridApiKey && vars.emailFromAddress && vars.emailFromName),
    },
    environment: {
      nodeEnv: vars.nodeEnv,
      port: vars.port,
      domainUrl: vars.domainUrl,
    },
    database: {
      connected: !!vars.databaseURL,
    },
    jwt: {
      configured: !!vars.jwtSecret,
    },
  };

  sendSuccessResponse(res, 200, config, 'System configuration retrieved successfully');
});

/**
 * Test email system connectivity and configuration
 */
export const testEmailSystemController = catchAsync(async (req: Request, res: Response) => {
  // Check configuration first
  if (!vars.sendGridApiKey || !vars.emailFromAddress) {
    return sendSuccessResponse(res, 400, {
      configured: false,
      connected: false,
      error: 'SendGrid configuration incomplete',
      missing: {
        apiKey: !vars.sendGridApiKey,
        fromAddress: !vars.emailFromAddress,
        fromName: !vars.emailFromName,
      }
    }, 'Email system not properly configured');
  }

  // Test connection
  try {
    const connectionResult = await testEmailConnection();
    
    sendSuccessResponse(res, 200, {
      configured: true,
      connected: connectionResult.success,
      configuration: {
        sendGridApiKey: !!vars.sendGridApiKey,
        emailFromAddress: vars.emailFromAddress,
        emailFromName: vars.emailFromName,
      },
      connectionTest: connectionResult,
    }, connectionResult.success ? 'Email system is working correctly' : 'Email system configuration issue');
    
  } catch (error) {
    sendSuccessResponse(res, 500, {
      configured: true,
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'Email system connection test failed');
  }
});

/**
 * Get detailed environment status for production readiness
 */
export const getProductionReadinessController = catchAsync(async (req: Request, res: Response) => {
  const readinessChecks = {
    email: {
      name: 'Email System (SendGrid)',
      configured: !!(vars.sendGridApiKey && vars.emailFromAddress),
      critical: true,
      details: {
        sendGridApiKey: !!vars.sendGridApiKey,
        emailFromAddress: !!vars.emailFromAddress,
        emailFromName: !!vars.emailFromName,
      }
    },
    database: {
      name: 'Database Connection',
      configured: !!vars.databaseURL,
      critical: true,
      details: {
        databaseURL: !!vars.databaseURL,
      }
    },
    authentication: {
      name: 'JWT Authentication',
      configured: !!vars.jwtSecret,
      critical: true,
      details: {
        jwtSecret: !!vars.jwtSecret,
        jwtExpiresIn: !!vars.jwtExpiresIn,
      }
    },
    security: {
      name: 'Security Configuration',
      configured: !!vars.sessionSecret,
      critical: true,
      details: {
        sessionSecret: !!vars.sessionSecret,
      }
    },
    environment: {
      name: 'Environment Configuration',
      configured: true,
      critical: false,
      details: {
        nodeEnv: vars.nodeEnv,
        port: vars.port,
        domainUrl: vars.domainUrl,
      }
    }
  };

  const criticalChecks = Object.values(readinessChecks).filter(check => check.critical);
  const passedCriticalChecks = criticalChecks.filter(check => check.configured);
  const isProductionReady = passedCriticalChecks.length === criticalChecks.length;

  const summary = {
    productionReady: isProductionReady,
    criticalChecks: criticalChecks.length,
    passedCriticalChecks: passedCriticalChecks.length,
    environment: vars.nodeEnv,
    checks: readinessChecks,
  };

  sendSuccessResponse(res, 200, summary, 
    isProductionReady ? 'System is production ready' : 'System requires configuration before production deployment'
  );
}); 