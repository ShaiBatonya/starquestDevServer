// src/api/docs/weekly.doc.ts

const WEEKLY_REPORT_BASE_PATH = '/weekly-reports';

export const weeklyReportTags = [
  {
    name: 'WeeklyReport',
    description: 'Operations related to weekly report management',
  },
];

export const components = {
  schemas: {
    WeeklyReport: {
      type: 'object',
      properties: {
        moodRating: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Weekly mood rating on a scale of 1 to 5.',
          example: 4,
        },
        moodExplanation: {
          type: 'string',
          description: 'Explanation of the mood rating.',
          example: 'Felt productive and positive.',
        },
        significantEvent: {
          type: 'string',
          description: 'Description of any significant event during the week.',
          example: 'Completed a major project milestone.',
        },
        newInterestingLearning: {
          type: 'string',
          description: 'New and interesting things learned during the week.',
          example: 'Learned about new project management tools.',
        },
        maintainWeeklyRoutine: {
          type: 'object',
          properties: {
            status: {
              type: 'boolean',
              description: 'Status of maintaining weekly routine.',
              example: true,
            },
            details: {
              type: 'string',
              description: 'Details on maintaining weekly routine.',
              example: 'Continued with early morning yoga sessions.',
            },
          },
        },
        achievedGoals: {
          type: 'object',
          properties: {
            goals: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of achieved goals.',
              example: ['Complete frontend module', 'Fix backend bugs'],
            },
            shared: {
              type: 'boolean',
              description: 'Whether the goals were shared with peers or supervisors.',
              example: true,
            },
          },
        },
        freeTime: {
          type: 'object',
          properties: {
            status: {
              type: 'boolean',
              description: 'Status of having free time.',
              example: false,
            },
            details: {
              type: 'string',
              description: 'Details on how the free time was spent.',
              example: 'Spent time learning a new language.',
            },
          },
        },
        productProgress: {
          type: 'string',
          description: 'Progress made on the product or project during the week.',
          example: 'Finalized the new feature design.',
        },
        courseChapter: {
          type: 'string',
          description: 'Course or chapter learned during the week.',
          example: 'Completed Chapter 5 of the advanced programming course.',
        },
        learningGoalAchievement: {
          type: 'object',
          properties: {
            status: {
              type: 'boolean',
              description: 'Status of achieving the learning goal.',
              example: true,
            },
            details: {
              type: 'string',
              description: 'Details on achieving the learning goal.',
              example: 'Mastered the use of new development tools.',
            },
          },
        },
        mentorInteraction: {
          type: 'object',
          properties: {
            status: {
              type: 'boolean',
              description: 'Status of interaction with the mentor.',
              example: true,
            },
            details: {
              type: 'string',
              description: 'Details of the interaction with the mentor.',
              example: 'Received valuable feedback on career progression.',
            },
          },
        },
        supportInteraction: {
          type: 'object',
          properties: {
            status: {
              type: 'boolean',
              description: 'Status of interaction with the support team.',
              example: false,
            },
            details: {
              type: 'string',
              description: 'Details of the interaction with the support team.',
              example: 'Discussed technical issues with the IT department.',
            },
          },
        },
        additionalSupport: {
          type: 'string',
          description: 'Additional support needed for the upcoming week.',
          example: 'Need more resources for the upcoming project phase.',
        },
        openQuestions: {
          type: 'string',
          description: 'Any open questions or concerns at the end of the week.',
          example: 'How to improve team collaboration in remote settings?',
        },
      },
    },
    CreateWeeklyReportRequest: {
      $ref: '#/components/schemas/WeeklyReport',
    },
    UpdateWeeklyReportRequest: {
      type: 'object',
      properties: {
        moodRating: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Weekly mood rating on a scale of 1 to 5.',
          example: 4,
          nullable: true,
        },
        moodExplanation: {
          type: 'string',
          description: 'Explanation of the mood rating.',
          example: 'Felt more challenged this week.',
          nullable: true,
        },
        significantEvent: {
          type: 'string',
          description: 'Description of any significant event during the week.',
          example: 'Had a successful product launch.',
          nullable: true,
        },
        newInterestingLearning: {
          type: 'string',
          description: 'Description of new and interesting things learned during the week.',
          example: 'Learned about microservice architecture.',
          nullable: true,
        },
        maintainWeeklyRoutine: {
          type: 'object',
          properties: {
            status: {
              type: 'boolean',
              description: 'Whether the weekly routine was maintained.',
              example: false,
              nullable: true,
            },
            details: {
              type: 'string',
              description: 'Details about maintaining the weekly routine.',
              example: 'Struggled with maintaining the exercise routine.',
              nullable: true,
            },
          },
          nullable: true,
        },
        achievedGoals: {
          type: 'object',
          properties: {
            goals: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of achieved goals.',
              example: ['Finish project report', 'Attend team meeting'],
              nullable: true,
            },
            shared: {
              type: 'boolean',
              description: 'Whether the goals were shared with the team.',
              example: true,
              nullable: true,
            },
          },
          nullable: true,
        },
        freeTime: {
          type: 'object',
          properties: {
            status: {
              type: 'boolean',
              description: 'Whether there was free time during the week.',
              example: true,
              nullable: true,
            },
            details: {
              type: 'string',
              description: 'Details about how the free time was spent.',
              example: 'Took a short trip to the countryside.',
              nullable: true,
            },
          },
          nullable: true,
        },
        productProgress: {
          type: 'string',
          description: 'Progress made on the product during the week.',
          example: 'Implemented a new feature based on user feedback.',
          nullable: true,
        },
        courseChapter: {
          type: 'string',
          description: 'The course chapter completed during the week.',
          example: 'Finished the advanced module on cybersecurity.',
          nullable: true,
        },
        learningGoalAchievement: {
          type: 'object',
          properties: {
            status: {
              type: 'boolean',
              description: 'Whether the learning goal for the week was achieved.',
              example: false,
              nullable: true,
            },
            details: {
              type: 'string',
              description: 'Details about the learning goal achievement.',
              example: 'Need more time to understand functional programming concepts.',
              nullable: true,
            },
          },
          nullable: true,
        },
        mentorInteraction: {
          type: 'object',
          properties: {
            status: {
              type: 'boolean',
              description: 'Whether there was interaction with a mentor.',
              example: true,
              nullable: true,
            },
            details: {
              type: 'string',
              description: 'Details about the interaction with the mentor.',
              example: 'Received valuable feedback on project design.',
              nullable: true,
            },
          },
          nullable: true,
        },
        supportInteraction: {
          type: 'object',
          properties: {
            status: {
              type: 'boolean',
              description: 'Whether there was interaction with the support team.',
              example: false,
              nullable: true,
            },
            details: {
              type: 'string',
              description: 'Details about the interaction with the support team.',
              example: 'Discussed resource allocation for the next phase.',
              nullable: true,
            },
          },
          nullable: true,
        },
        additionalSupport: {
          type: 'string',
          description: 'Additional support needed for the upcoming week.',
          example: 'Need assistance with data analysis for the new market study.',
          nullable: true,
        },
        openQuestions: {
          type: 'string',
          description: 'Any open questions at the end of the week.',
          example: 'How can we improve our response time to customer inquiries?',
          nullable: true,
        },
      },
    },
    WeeklyReportResponse: {
      $ref: '#/components/schemas/WeeklyReport',
    },
  },
};

export const paths = {
  [`${WEEKLY_REPORT_BASE_PATH}/`]: {
    post: {
      summary: 'Create a Weekly Report',
      tags: ['WeeklyReport'],
      description: 'Submits a new weekly report. Requires authentication.',
      operationId: 'createWeeklyReport',
      requestBody: {
        description: 'JSON payload containing the details of the weekly report.',
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateWeeklyReportRequest',
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Weekly report created successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/WeeklyReportResponse',
              },
            },
          },
        },
      },
    },
  },
  [`${WEEKLY_REPORT_BASE_PATH}/{reportId}`]: {
    patch: {
      summary: 'Update Weekly Report',
      tags: ['WeeklyReport'],
      description: 'Updates an existing weekly report. Requires authentication.',
      operationId: 'updateWeeklyReport',
      parameters: [
        {
          name: 'reportId',
          in: 'path',
          required: true,
          description: 'The unique identifier of the weekly report to update.',
          schema: {
            type: 'string',
          },
        },
      ],
      requestBody: {
        description: 'JSON payload containing the updates to the weekly report.',
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateWeeklyReportRequest',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Weekly report updated successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/WeeklyReportResponse',
              },
            },
          },
        },
      },
    },
  },
  [`${WEEKLY_REPORT_BASE_PATH}/all`]: {
    get: {
      summary: 'Get All Weekly Reports for the Authenticated User',
      tags: ['WeeklyReport'],
      description:
        'Retrieves all weekly reports for the currently authenticated user, sorted by creation date in descending order.',
      operationId: 'getUserWeeklyReports',
      responses: {
        '200': {
          description: 'List of weekly reports retrieved successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/WeeklyReport',
                },
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized. User is not logged in or token is invalid.',
        },
        '500': {
          description: 'Internal server error. Could not retrieve the reports.',
        },
      },
    },
  },
  [`${WEEKLY_REPORT_BASE_PATH}/{id}`]: {
    get: {
      summary: 'Get a Specific Weekly Report',
      tags: ['WeeklyReport'],
      description: 'Retrieves a specific weekly report by its unique identifier.',
      operationId: 'getWeeklyReport',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Unique identifier of the weekly report to retrieve',
          schema: {
            type: 'string',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Weekly report retrieved successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/WeeklyReport',
              },
            },
          },
        },
        '404': {
          description: 'Not Found. No weekly report found with the specified ID.',
        },
        '401': {
          description: 'Unauthorized. User is not logged in or token is invalid.',
        },
        '500': {
          description: 'Internal server error. Could not retrieve the report.',
        },
      },
    },
  },
};
