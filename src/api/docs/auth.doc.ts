// src/api/docs/authDocs.ts

const AUTH_BASE_PATH = '/auth';

export const tags = [
  {
    name: 'Authentication',
    description: 'Authentication management',
  },
];

export const components = {
  schemas: {
    SignUpRequest: {
      type: 'object',
      required: ['firstName', 'lastName', 'email', 'password', 'passwordConfirm'],
      properties: {
        firstName: {
          type: 'string',
          minLength: 2,
          example: 'John',
          description: "User's first name (at least 2 characters).",
        },
        lastName: {
          type: 'string',
          minLength: 2,
          example: 'Doe',
          description: "User's last name (at least 2 characters).",
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'johndoe@example.com',
          description: "User's email address (must be a valid email).",
        },
        password: {
          type: 'string',
          minLength: 8,
          maxLength: 10,
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$',
          example: 'Aa123456',
          description:
            "User's password (8-10 characters, must include at least one lowercase letter, one uppercase letter, and one digit).",
        },
        passwordConfirm: {
          type: 'string',
          example: 'Aa123456',
          description: "Confirmation of the user's password (must match the password).",
        },
        phoneNumber: {
          type: 'string',
          pattern: '^\\d{10}$',
          example: '1234567890',
          description: "User's phone number (10 digits, optional).",
        },
      },
    },
    VerifyEmailRequest: {
      type: 'object',
      required: ['email', 'code'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
          description: "User's email address that needs to be verified.",
        },
        code: {
          type: 'string',
          example: '123456',
          description: 'Verification code sent to the user’s email.',
        },
      },
    },
    LoginRequest: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
          description: "User's email address for login.",
        },
        password: {
          type: 'string',
          example: 'Pass1234',
          description: "User's password for login.",
        },
      },
    },
    ForgotPasswordRequest: {
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: "The user's email address for password reset.",
          example: 'user@example.com',
        },
      },
    },
    ResetPasswordRequest: {
      type: 'object',
      required: ['password', 'passwordConfirm'],
      properties: {
        password: {
          type: 'string',
          minLength: 8,
          maxLength: 10,
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$',
          description:
            "User's new password (8-10 characters, must include at least one lowercase letter, one uppercase letter, and one digit).",
          example: 'NewPass123',
        },
        passwordConfirm: {
          type: 'string',
          description: "Confirmation of the user's new password.",
          example: 'NewPass123',
        },
      },
    },
    ChangePasswordRequest: {
      type: 'object',
      required: ['passwordCurrent', 'password', 'passwordConfirm'],
      properties: {
        passwordCurrent: {
          type: 'string',
          description: "User's current password.",
          example: 'CurrentPass123',
        },
        password: {
          type: 'string',
          minLength: 8,
          maxLength: 10,
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$',
          description:
            "User's new password (must be 8-10 characters and include at least one lowercase letter, one uppercase letter, and one digit).",
          example: 'NewPass123',
        },
        passwordConfirm: {
          type: 'string',
          description: "Confirmation of the user's new password.",
          example: 'NewPass123',
        },
      },
    },
  },
};

export const paths = {
  [`${AUTH_BASE_PATH}/signup`]: {
    post: {
      summary: 'User signup',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SignUpRequest',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Signup successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Bad request',
        },
        '500': {
          description: 'Internal server error',
        },
      },
    },
  },
  [`${AUTH_BASE_PATH}/verifyEmail`]: {
    post: {
      summary: 'Email verification',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/VerifyEmailRequest',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Email verification successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  [`${AUTH_BASE_PATH}/login`]: {
    post: {
      summary: 'User login',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/LoginRequest',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
        },
        '500': {
          description: 'Internal server error',
        },
      },
    },
  },
  [`${AUTH_BASE_PATH}/logout`]: {
    get: {
      summary: 'User logout',
      tags: ['Authentication'],
      description: 'Logs out the current user by clearing the session cookie.',
      responses: {
        '200': {
          description: 'Logout successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'success' },
                  message: { type: 'string', example: 'Logout successful' },
                },
              },
            },
          },
        },
        '500': {
          description: 'Internal server error',
        },
      },
    },
  },
  [`${AUTH_BASE_PATH}/forgotPassword`]: {
    post: {
      summary: 'Forgot Password',
      tags: ['Authentication'],
      description: 'Initiates a password reset process for a user by their email.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ForgotPasswordRequest',
            },
          },
        },
      },
      responses: {
        '200': {
          description: "Password reset token sent to the user's email.",
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Token sent to email!' },
                },
              },
            },
          },
        },
        '404': {
          description: 'No user found with the provided email.',
        },
        '500': {
          description: 'Server error or failed to send the password reset email.',
        },
      },
    },
  },
  [`${AUTH_BASE_PATH}/resetPassword/{token}`]: {
    patch: {
      summary: 'Reset Password',
      tags: ['Authentication'],
      description: 'Allows a user to reset their password using a valid token.',
      parameters: [
        {
          name: 'token',
          in: 'path',
          required: true,
          description: 'Password reset token',
          schema: {
            type: 'string',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ResetPasswordRequest',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Password has been reset successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Password has been reset successfully.' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Bad request. Possible reasons: Token is invalid or has expired.',
        },
        '500': {
          description: 'Internal server error.',
        },
      },
    },
  },
  [`${AUTH_BASE_PATH}/updateMyPassword`]: {
    patch: {
      summary: 'Update My Password',
      tags: ['Authentication'],
      description: 'Allows a logged-in user to change their password.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ChangePasswordRequest',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Password updated successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Password updated successfully.' },
                },
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized. Possible reasons: current password is wrong.',
        },
        '404': {
          description: 'User not found.',
        },
        '500': {
          description: 'Internal server error.',
        },
      },
    },
  },
};
