// src/api/docs/dashboard.doc.ts

const DASHBOARD_BASE_PATH = '/dashboard';

export const tags = [
  {
    name: 'Dashboard',
    description: 'Endpoints for dashboard statistics',
  },
];

export const components = {
  schemas: {
    WeeklyDashboardResponse: {
      type: 'object',
      properties: {
        averageMood: {
          type: 'number',
          description: 'The average mood score for the week.',
          example: 7.5,
        },
        averageWakeupHour: {
          type: 'number',
          description: 'The average hour of waking up during the week.',
          example: 6,
        },
        morningRoutineSuccessRate: {
          type: 'number',
          description: 'The success rate of completing the morning routine.',
          example: 0.85,
        },
        goalsAchievedDays: {
          type: 'number',
          description: 'The number of days goals were achieved.',
          example: 5,
        },
        averageStudyHoursPerWeek: {
          type: 'number',
          description: 'Average study hours per week.',
          example: 12,
        },
      },
    },
    MonthlyDashboardResponse: {
      type: 'object',
      properties: {
        totalStudyHours: {
          type: 'number',
          description: 'Total study hours for the past six months.',
          example: 300,
        },
        totalExerciseHours: {
          type: 'number',
          description: 'Total exercise hours for the past six months.',
          example: 150,
        },
        averageSleepHours: {
          type: 'number',
          description: 'Average sleep hours per night over the past six months.',
          example: 8,
        },
        productivityScore: {
          type: 'number',
          description: 'Average productivity score over the past six months.',
          example: 75,
        },
      },
    },
  },
};

export const paths = {
  [`${DASHBOARD_BASE_PATH}/weekly`]: {
    get: {
      summary: 'Get weekly dashboard statistics',
      tags: ['Dashboard'],
      description: 'Retrieve statistics for the current user for the current week.',
      operationId: 'getWeeklyDashboardStats',
      responses: {
        '200': {
          description: 'Weekly statistics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/WeeklyDashboardResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized access',
        },
        '500': {
          description: 'Internal server error',
        },
      },
    },
  },
  [`${DASHBOARD_BASE_PATH}/monthly`]: {
    get: {
      summary: 'Get monthly dashboard statistics',
      tags: ['Dashboard'],
      description: 'Retrieve statistics for the current user for the past six months.',
      operationId: 'getMonthlyDashboardStats',
      responses: {
        '200': {
          description: 'Monthly statistics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MonthlyDashboardResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized access',
        },
        '500': {
          description: 'Internal server error',
        },
      },
    },
  },
};
