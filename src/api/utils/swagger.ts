// src/api/utils/swagger.ts

import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express, Request, Response } from 'express';
import { vars } from '@/config/vars';
import * as authDoc from '@/api/docs/auth.doc';
import * as userDoc from '@/api/docs/user.doc';
import * as dashboardDoc from '@/api/docs/dashboard.doc';
import * as dailyReportdDoc from '@/api/docs/dailyReport.doc';
import * as weeklyDoc from '@/api/docs/weekly.doc';

const swaggerDefinition: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "StarQuest-server API's",
      version: '1.0.0',
      description:
        'This is a REST API application made with Express. It retrieves data from the server.',
    },
    servers: [
      {
        url: `http://localhost:${vars.port}/api`,
        description: 'Development server',
      },
    ],
    security: [
      {
        cookieAuth: [],
      },
    ],
    components: {
      schemas: {
        ...authDoc.components.schemas,
        ...userDoc.components.schemas,
        ...dailyReportdDoc.components.schemas,
        ...weeklyDoc.components.schemas,
        ...dashboardDoc.components.schemas,
      },
    },
    paths: {
      ...authDoc.paths,
      ...userDoc.paths,
      ...dailyReportdDoc.paths,
      ...weeklyDoc.paths,
      ...dashboardDoc.paths,
    },
  },
  // Specify where to find other API documentations if needed
  apis: ['./src/api/routes/*.ts', './src/api/docs/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerDefinition);

export const setupSwaggerDocs = (app: Express): void => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('/docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Docs available at http://localhost:${vars.port}/docs`);
};
