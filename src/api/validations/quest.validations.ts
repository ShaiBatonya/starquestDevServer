// src/api/validations/quest.validations.ts

import { z } from 'zod';

const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

export const workspaceIdParamsSchema = z.object({
  params: z.object({
    workspaceId: ObjectIdSchema,
  }),
});

export const changeTaskStatusSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID format'),
  taskId: z.string().uuid('Invalid task ID format'),
  newStatus: z
    .enum(['In Progress', 'In Review'])
    .refine((status) => ['In Progress', 'In Review'].includes(status), {
      message: 'Invalid status value',
    }),
});

export const addCommentToTaskSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID format'),
  taskId: z.string().uuid('Invalid task ID format'),
  content: z.string().min(1, 'Content cannot be empty'),
});

const taskDetailSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  description: z.string().min(1, 'Description cannot be empty'),
  category: z
    .enum(['Learning courses', 'Product refinement', 'Mandatory sessions'])
    .refine(
      (data) => ['Learning courses', 'Product refinement', 'Mandatory sessions'].includes(data),
      {
        message: 'Invalid category',
      },
    ),
  priority: z.number().min(1, 'Priority must be a positive number'),
});

export const addBacklogTaskSchema = z.object({
  workspaceId: ObjectIdSchema,
  menteeId: ObjectIdSchema,
  tasksDetails: z.array(taskDetailSchema),
});

export const changeTaskStatusByMentorSchema = z.object({
  workspaceId: ObjectIdSchema,
  menteeId: ObjectIdSchema,
  taskId: ObjectIdSchema,
  status: z
    .enum(['Backlog', 'To Do', 'In Progress', 'In Review', 'Done'])
    .refine((status) => ['Backlog', 'To Do', 'In Progress', 'In Review', 'Done'].includes(status), {
      message: 'Invalid status value',
    }),
});

export const deleteTaskSchema = z.object({
  workspaceId: ObjectIdSchema,
  menteeId: ObjectIdSchema,
  taskId: ObjectIdSchema,
});
