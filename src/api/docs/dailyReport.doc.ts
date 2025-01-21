// Add this to your dailyReport.doc.ts or wherever you keep the API documentation for daily reports

const DAILY_REPORT_BASE_PATH = '/daily-reports';

export const dailyReportTags = [
  {
    name: 'DailyReport',
    description: 'Operations related to daily report management',
  },
];

export const components = {
  schemas: {
    Activity: {
      type: 'object',
      properties: {
        duration: {
          type: 'number',
          description: 'Duration of the activity in hours.',
          example: 2,
        },
        category: {
          type: 'string',
          enum: [
            'learning',
            'better me',
            'project',
            'product refinement',
            'technical sessions',
            'networking',
          ],
          description: 'Category of the activity.',
        },
      },
    },
    Goal: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Description of the goal.',
          example: 'Finish the project report',
        },
        completed: {
          type: 'boolean',
          description: 'Whether the goal was completed.',
          example: false,
        },
      },
    },
    Mood: {
      type: 'object',
      properties: {
        startOfDay: {
          type: 'number',
          description: 'Mood at the start of the day, on a scale.',
          example: 7,
        },
        endOfDay: {
          type: 'number',
          description: 'Mood at the end of the day, on a scale.',
          example: 5,
        },
      },
    },
    DailyReport: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '660bc0eeb7e5a10ced1db631' },
        userId: { type: 'string', example: '65f7e399d004b4ea47a1272f' },
        date: { type: 'string', format: 'date-time', example: '2024-04-02T08:25:18.075Z' },
        wakeupTime: { type: 'string', example: '07:30' },
        mood: { $ref: '#/components/schemas/Mood' },
        morningRoutine: {
          type: 'object',
          properties: {
            routine: { type: 'string', example: 'Meditation and exercise' },
            completed: { type: 'boolean', example: false },
          },
        },
        dailyGoals: {
          type: 'array',
          items: { $ref: '#/components/schemas/Goal' },
        },
        expectedActivity: {
          type: 'array',
          items: { $ref: '#/components/schemas/Activity' },
        },
        actualActivity: {
          type: 'array',
          items: { $ref: '#/components/schemas/Activity' },
        },
        createdAt: { type: 'string', format: 'date-time', example: '2024-04-02T08:25:18.083Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-04-02T08:25:18.083Z' },
        __v: { type: 'number', example: 0 },
      },
    },
    CreateDailyReportRequest: {
      type: 'object',
      properties: {
        wakeupTime: {
          $ref: '#/components/schemas/DailyReport/properties/wakeupTime',
        },
        mood: {
          $ref: '#/components/schemas/Mood',
        },
        morningRoutine: {
          type: 'object',
          properties: {
            routine: {
              $ref: '#/components/schemas/DailyReport/properties/morningRoutine/properties/routine',
            },
            completed: {
              $ref: '#/components/schemas/DailyReport/properties/morningRoutine/properties/completed',
            },
          },
        },
        dailyGoals: {
          $ref: '#/components/schemas/DailyReport/properties/dailyGoals',
        },
        expectedActivity: {
          $ref: '#/components/schemas/DailyReport/properties/expectedActivity',
        },
      },
      required: ['wakeupTime', 'mood', 'morningRoutine', 'dailyGoals', 'expectedActivity'],
    },
    UpdateDailyReportRequest: {
      type: 'object',
      properties: {
        wakeupTime: {
          $ref: '#/components/schemas/DailyReport/properties/wakeupTime',
        },
        mood: {
          $ref: '#/components/schemas/Mood',
        },
        morningRoutine: {
          type: 'object',
          properties: {
            routine: {
              $ref: '#/components/schemas/DailyReport/properties/morningRoutine/properties/routine',
            },
            completed: {
              $ref: '#/components/schemas/DailyReport/properties/morningRoutine/properties/completed',
            },
          },
        },
        dailyGoals: {
          $ref: '#/components/schemas/DailyReport/properties/dailyGoals',
        },
        expectedActivity: {
          $ref: '#/components/schemas/DailyReport/properties/expectedActivity',
        },
      },
    },
    UpdateEndOfDayReportRequest: {
      type: 'object',
      properties: {
        mood: {
          properties: {
            endOfDay: {
              $ref: '#/components/schemas/Mood/properties/endOfDay',
            },
          },
        },
        dailyGoals: {
          $ref: '#/components/schemas/DailyReport/properties/dailyGoals',
        },
        actualActivity: {
          $ref: '#/components/schemas/DailyReport/properties/actualActivity',
        },
      },
    },
    DailyReportResponse: {
      $ref: '#/components/schemas/DailyReport',
    },
  },
};

export const paths = {
  [`${DAILY_REPORT_BASE_PATH}/`]: {
    post: {
      summary: 'Create a Daily Report',
      tags: ['DailyReport'],
      description:
        'Submits a new daily report. This operation is protected and requires authentication.',
      operationId: 'submitDailyReport',
      requestBody: {
        description: 'JSON payload containing the details of the daily report.',
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateDailyReportRequest',
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Daily report created successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/DailyReportResponse',
              },
            },
          },
          '400': {
            description:
              'Bad Request. Possible reasons include duplicate reports for the same date.',
          },
          '401': {
            description: 'Unauthorized. User is not logged in.',
          },
          '500': {
            description: 'Internal server error.',
          },
        },
      },
    },
  },
  [`${DAILY_REPORT_BASE_PATH}/end-of-day-report/{reportId}`]: {
    patch: {
      summary: 'Update End-of-Day Report',
      tags: ['DailyReport'],
      description:
        "Updates an end-of-day report with the user's mood and actual activities. This operation is protected and requires authentication.",
      operationId: 'updateEndOfDayReport',
      parameters: [
        {
          name: 'reportId',
          in: 'path',
          required: true,
          description: 'The unique identifier of the daily report to update.',
          schema: {
            type: 'string',
          },
        },
      ],
      requestBody: {
        description: 'JSON payload containing the updates to the end-of-day report.',
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateEndOfDayReportRequest',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'End-of-day report updated successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/DailyReportResponse',
              },
            },
          },
        },
        '400': {
          description: 'Bad Request. The request body did not match the expected format.',
        },
        '401': {
          description: 'Unauthorized. User is not logged in.',
        },
        '404': {
          description: 'Not Found. No report found with the specified ID to update.',
        },
        '500': {
          description: 'Internal server error.',
        },
      },
    },
  },
  [`${DAILY_REPORT_BASE_PATH}/all`]: {
    get: {
      summary: 'Get All My Daily Reports',
      tags: ['DailyReport'],
      description: 'Retrieves all daily report entries for the currently authenticated user.',
      operationId: 'getMyDailyReports',
      responses: {
        '200': {
          description: 'List of daily reports retrieved successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    mood: {
                      type: 'object',
                      properties: {
                        startOfDay: { type: 'number', example: 8 },
                        endOfDay: { type: 'number', example: 8 },
                      },
                    },
                    morningRoutine: {
                      type: 'object',
                      properties: {
                        routine: { type: 'string', example: 'Meditation and exercise' },
                        completed: { type: 'boolean', example: false },
                      },
                    },
                    _id: { type: 'string', example: '660bc0eeb7e5a10ced1db631' },
                    userId: { type: 'string', example: '65f7e399d004b4ea47a1272f' },
                    wakeupTime: { type: 'string', example: '07:30' },
                    dailyGoals: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          description: { type: 'string', example: 'Finish the project report' },
                          completed: { type: 'boolean', example: false },
                        },
                      },
                    },
                    expectedActivity: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          duration: { type: 'number', example: 120 },
                          category: {
                            type: 'string',
                            enum: [
                              'learning',
                              'better me',
                              'project',
                              'product refinement',
                              'technical sessions',
                              'networking',
                            ],
                            example: 'learning',
                          },
                        },
                      },
                    },
                    date: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-04-02T08:25:18.075Z',
                    },
                    actualActivity: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          duration: { type: 'number', example: 30 },
                          category: { type: 'string', example: 'learning' },
                        },
                      },
                    },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-04-02T08:25:18.083Z',
                    },
                    updatedAt: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-04-02T08:25:18.083Z',
                    },
                    __v: { type: 'number', example: 0 },
                  },
                },
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized. User is not logged in.',
        },
        '500': {
          description: 'Internal server error.',
        },
      },
    },
  },
  [`${DAILY_REPORT_BASE_PATH}/{reportId}`]: {
    patch: {
      summary: 'Update Daily Report',
      tags: ['DailyReport'],
      description:
        'Updates an existing daily report identified by the reportId. This operation is protected and requires authentication.',
      operationId: 'updateDailyReport',
      parameters: [
        {
          name: 'reportId',
          in: 'path',
          required: true,
          description: 'The unique identifier of the daily report to update.',
          schema: {
            type: 'string',
          },
        },
      ],
      requestBody: {
        description: 'JSON payload containing the updates to the daily report.',
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateDailyReportRequest',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Daily report updated successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/DailyReportResponse',
              },
            },
          },
        },
        '400': {
          description: 'Bad Request. The request body did not match the expected format.',
        },
        '401': {
          description: 'Unauthorized. User is not logged in.',
        },
        '404': {
          description: 'Not Found. No report found with the specified ID to update.',
        },
        '500': {
          description: 'Internal server error.',
        },
      },
    },
  },
  [`${DAILY_REPORT_BASE_PATH}/{id}`]: {
    get: {
      summary: 'Get Daily Report by ID',
      tags: ['DailyReport'],
      description:
        'Retrieves a specific daily report by its unique identifier. This operation is protected and requires authentication.',
      operationId: 'getDailyReportById',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'The unique identifier of the daily report to retrieve.',
          schema: {
            type: 'string',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Daily report retrieved successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/DailyReportResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized. User is not logged in.',
        },
        '404': {
          description: 'Not Found. No report found with the specified ID.',
        },
        '500': {
          description: 'Internal server error.',
        },
      },
    },
  },
};
