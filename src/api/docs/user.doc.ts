// src/api/docs/user.doc.ts

const USER_BASE_PATH = '/users';

export const userTags = [
  {
    name: 'User',
    description: 'Operations related to user management and profile information',
  },
];

export const components = {
  schemas: {
    UserProfileResponse: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          description: "The user's unique identifier.",
          example: '65f7e399d004b4ea47a1272f',
        },
        firstName: {
          type: 'string',
          description: "The user's first name.",
          example: 'ely',
        },
        lastName: {
          type: 'string',
          description: "The user's last name.",
          example: 'admi',
        },
        email: {
          type: 'string',
          description: "The user's email address.",
          example: 'ely1@ti-space.com',
        },
        role: {
          type: 'string',
          description: "The user's role within the application.",
          example: 'admin',
        },
        isEmailVerified: {
          type: 'boolean',
          description: "Indicates whether the user's email is verified.",
          example: true,
        },
        workspaces: {
          type: 'array',
          description: "Array of the user's workspace identifiers.",
          items: {
            type: 'object',
            properties: {
              workspaceId: {
                type: 'string',
                description: "The workspace's unique identifier.",
                example: '65f7e39ad004b4ea47a12731',
              },
            },
          },
        },
      },
    },
    UserUpdateRequest: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: "The user's first name.",
          example: 'Jane',
        },
        lastName: {
          type: 'string',
          description: "The user's last name.",
          example: 'Doe',
        },
        email: {
          type: 'string',
          format: 'email',
          description: "The user's email address.",
          example: 'jane.doe@example.com',
        },
        phoneNumber: {
          type: 'string',
          pattern: '^\\d{10}$',
          description: "The user's 10-digit phone number.",
          example: '1234567890',
        },
      },
      required: [],
      description: 'Payload for updating user details. At least one field must be provided.',
    },
    UserUpdateResponse: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          description: "The user's unique identifier.",
          example: '65f7e399d004b4ea47a1272f',
        },
        firstName: {
          type: 'string',
          description: "The user's first name.",
          example: 'ely',
        },
        lastName: {
          type: 'string',
          description: "The user's last name.",
          example: 'admi',
        },
        email: {
          type: 'string',
          description: "The user's email address.",
          example: 'ely1@ti-space.com',
        },
        role: {
          type: 'string',
          description: "The user's role within the application.",
          example: 'admin',
        },
        isEmailVerified: {
          type: 'boolean',
          description: "Indicates whether the user's email is verified.",
          example: true,
        },
        workspaces: {
          type: 'array',
          description: "Array of the user's workspace identifiers.",
          items: {
            type: 'object',
            properties: {
              workspaceId: {
                type: 'string',
                description: "The workspace's unique identifier.",
                example: '65f7e39ad004b4ea47a12731',
              },
            },
          },
        },
      },
    },
  },
};

export const paths = {
  [`${USER_BASE_PATH}/me`]: {
    get: {
      summary: 'Get Current User Profile',
      tags: ['User'],
      description: 'Retrieves the profile information of the currently authenticated user.',
      operationId: 'getCurrentUserProfile',
      responses: {
        '200': {
          description: 'User profile information retrieved successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserProfileResponse',
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
  [`${USER_BASE_PATH}/updateMe`]: {
    patch: {
      summary: 'Update Current User Profile',
      tags: ['User'],
      description: 'Allows the currently authenticated user to update their profile information.',
      operationId: 'updateCurrentUserProfile',
      requestBody: {
        description: 'JSON payload containing the user details to be updated.',
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UserUpdateRequest',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'User profile updated successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserUpdateResponse',
              },
            },
          },
        },
      },
    },
  },
  [`${USER_BASE_PATH}/deleteMe`]: {
    delete: {
      summary: 'Delete Current User',
      tags: ['User'],
      description:
        'Allows the currently authenticated user to deactivate their account. This action does not physically delete the user but marks them as inactive.',
      operationId: 'deleteCurrentUser',
      responses: {
        '204': {
          description: 'User account deactivated successfully. No content is returned.',
        },
        '401': {
          description: 'Unauthorized. User is not logged in or does not have permission.',
        },
        '404': {
          description: 'Not Found. No user found with the provided ID to deactivate.',
        },
        '500': {
          description: 'Internal server error.',
        },
      },
    },
  },
  [`${USER_BASE_PATH}/`]: {
    get: {
      summary: 'Get All Users',
      tags: ['User'],
      description: 'Retrieves a list of all user accounts. Access is restricted to admin users.',
      operationId: 'getAllUsers',
      responses: {
        '200': {
          description: 'List of users retrieved successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/UserProfileResponse',
                },
              },
            },
          },
        },
        '401': {
          description:
            'Unauthorized. User is not logged in or does not have the necessary permissions.',
        },
        '500': {
          description: 'Internal server error.',
        },
      },
    },
  },
  [`${USER_BASE_PATH}/{id}`]: {
    get: {
      summary: 'Get User by ID',
      tags: ['User'],
      description:
        "Retrieves a user's profile information by their ID. Access is restricted to admin users.",
      operationId: 'getUserById',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'The unique identifier of the user.',
          schema: {
            type: 'string',
          },
        },
      ],
      responses: {
        '200': {
          description: 'User profile information retrieved successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserProfileResponse',
              },
            },
          },
        },
        '401': {
          description:
            'Unauthorized. The requester is not logged in or lacks the necessary permissions.',
        },
        '404': {
          description: 'Not Found. No user found with the specified ID.',
        },
        '500': {
          description: 'Internal server error.',
        },
      },
    },
    patch: {
      summary: 'Update User by ID',
      tags: ['User'],
      description:
        "Updates a user's profile information by their ID. Access is restricted to admin users.",
      operationId: 'updateUserById',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'The unique identifier of the user to update.',
          schema: {
            type: 'string',
          },
        },
      ],
      requestBody: {
        description: 'JSON payload containing the user details to be updated.',
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UserUpdateRequest',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'User profile updated successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserUpdateResponse',
              },
            },
          },
        },
        '401': {
          description:
            'Unauthorized. The requester is not logged in or lacks the necessary permissions.',
        },
        '404': {
          description: 'Not Found. No user found with the specified ID to update.',
        },
        '500': {
          description: 'Internal server error.',
        },
      },
    },
    delete: {
      summary: 'Delete User by ID',
      tags: ['User'],
      description: 'Deletes a user profile by their ID. Access is restricted to admin users.',
      operationId: 'deleteUserById',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'The unique identifier of the user to delete.',
          schema: {
            type: 'string',
          },
        },
      ],
      responses: {
        '204': {
          description: 'User profile deleted successfully. No content is returned.',
        },
        '401': {
          description:
            'Unauthorized. The requester is not logged in or lacks the necessary permissions.',
        },
        '404': {
          description: 'Not Found. No user found with the specified ID to delete.',
        },
        '500': {
          description: 'Internal server error.',
        },
      },
    },
  },
};
