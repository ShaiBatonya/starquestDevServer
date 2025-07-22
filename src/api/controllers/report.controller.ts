// src/api/controllers/report.controller.ts

import { Request, Response } from 'express';
import catchAsync from '@/api/utils/catchAsync';
import {
  createReport,
  getReport,
  updateReport,
  deleteReport,
  getAllReports,
  submitReport,
  getAllSubmissionsInWorkspace,
  updateReportSubmission,
  getWorkspaceReports,
} from '@/api/services/report.service';
import { sendSuccessResponse } from '@/api/utils/appResponse';

export const createReportController = catchAsync(async (req: Request, res: Response) => {
  const report = await createReport(req.cookies?.jwt, req.body);
  sendSuccessResponse(res, 201, report);
});

export const getReportController = catchAsync(async (req: Request, res: Response) => {
  const report = await getReport(req.params.id);
  sendSuccessResponse(res, 200, report);
});

export const updateReportController = catchAsync(async (req: Request, res: Response) => {
  const report = await updateReport(req.params.id, req.body);
  sendSuccessResponse(res, 200, report);
});

export const deleteReportController = catchAsync(async (req: Request, res: Response) => {
  await deleteReport(req.params.id);
  sendSuccessResponse(res, 204, null);
});

export const getAllReportsController = catchAsync(async (_req: Request, res: Response) => {
  const reports = await getAllReports();
  sendSuccessResponse(res, 200, reports);
});

export const getWorkspaceReportsController = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const reports = await getWorkspaceReports(req.cookies?.jwt, workspaceId);
  sendSuccessResponse(res, 200, reports);
});

export const submitReportController = catchAsync(async (req: Request, res: Response) => {
  const report = await submitReport(req.cookies?.jwt, req.params.id, req.body);
  sendSuccessResponse(res, 200, report);
});

export const getWorkspaceSubmissionsController = catchAsync(async (req: Request, res: Response) => {
  const submissions = await getAllSubmissionsInWorkspace(req.cookies?.jwt, req.body.workspaceId);
  sendSuccessResponse(res, 200, submissions);
});

export const updateSubmissionController = catchAsync(async (req: Request, res: Response) => {
  const submission = await updateReportSubmission(req.params.id, req.params.submissionId, req.body);
  sendSuccessResponse(res, 200, submission);
});
