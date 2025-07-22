// src/api/services/report.service.ts
import DataAccess from '@/api/utils/dataAccess';
import { IReport, IReportSubmission } from '@/api/types/report.interface';
import { IWorkspace } from '@/api/types/workspace.interface';
import { findUserByToken } from '@/api/services/jwt.service';
import AppError from '../utils/appError';
import mongoose from 'mongoose';

const reportModel = 'Report';

// for admin only
export const createReport = async (
  token: string,
  reportData: Partial<IReport>,
): Promise<IReport> => {
  const userId = await findUserByToken(token);
  if (!reportData?.workspaceId) {
    throw new Error('Workspace ID is required.');
  }
  const workspaceId = reportData.workspaceId.toString();

  await validateWorkspace(workspaceId);
  const completeReportData = { ...reportData, createdBy: userId };
  return DataAccess.create(reportModel, completeReportData) as Promise<IReport>;
};

const validateWorkspace = async (workspaceId: string): Promise<void> => {
  const workspace = await DataAccess.findById<IWorkspace>('Workspace', workspaceId.toString());
  if (!workspace) {
    throw new Error('Workspace does not exist.');
  }
};

export const getReport = async (reportId: string): Promise<IReport | null> => {
  return DataAccess.findById<IReport>(reportModel, reportId);
};

export const updateReport = async (
  reportId: string,
  updateData: Partial<IReport>,
): Promise<IReport | null> => {
  return DataAccess.updateById(reportModel, reportId, updateData) as Promise<IReport | null>;
};

export const deleteReport = async (reportId: string): Promise<void> => {
  await DataAccess.deleteById(reportModel, reportId);
};

export const getAllReports = async (): Promise<Array<IReport>> => {
  return DataAccess.findByConditions(reportModel, {}) as Promise<Array<IReport>>;
};

// New function for admin to get all reports in a workspace
export const getWorkspaceReports = async (
  token: string,
  workspaceId: string,
): Promise<IReport[]> => {
  const userId = await findUserByToken(token);
  
  // Verify user has admin access to this workspace
  const workspace = await DataAccess.findById<IWorkspace>('Workspace', workspaceId);
  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }
  
  const userInWorkspace = workspace.users.find(
    (user: any) => user.userId.toString() === userId && user.role === 'admin'
  );
  
  if (!userInWorkspace) {
    throw new AppError('You do not have admin access to this workspace', 403);
  }
  
  // Get all reports for this workspace
  return DataAccess.findByConditions(reportModel, { workspaceId: new mongoose.Types.ObjectId(workspaceId) }) as Promise<IReport[]>;
};

// for mentee
export const submitReport = async (
  token: string,
  reportId: string,
  submissionData: Partial<IReportSubmission>,
): Promise<IReport> => {
  const report = await DataAccess.findById<IReport>(reportModel, reportId);

  if (!report) {
    throw new Error('Report not found.');
  }
  const userId = await findUserByToken(token);

  const updatedReport = await DataAccess.updateById(reportModel, reportId, {
    $push: { submissions: { userId: userId, ...submissionData } },
  });

  if (!updatedReport) {
    throw new Error('Error submitting report.');
  }

  // Correctly cast the result to IReport
  return updatedReport as IReport;
};

export const getAllSubmissionsInWorkspace = async (
  token: string,
  workspaceId: string,
): Promise<any[]> => {
  const userId = await findUserByToken(token);
  const pipeline = [
    { $match: { workspaceId: new mongoose.Types.ObjectId(workspaceId) } },
    { $unwind: '$submissions' },
    { $match: { 'submissions.userId': userId } },
    {
      $group: {
        _id: '$_id',
        workspaceId: { $first: '$workspaceId' },
        reportName: { $first: '$reportName' },
        description: { $first: '$description' },
        fields: { $first: '$fields' },
        schedule: { $first: '$schedule' },
        submissions: { $push: '$submissions' },
      },
    },
  ];

  const userSubmissions = await DataAccess.aggregate(reportModel, pipeline);
  if (!userSubmissions) {
    throw new Error('No Submissions found for this workspace.');
  }
  return userSubmissions;
};

export const updateReportSubmission = async (
  reportId: string,
  submissionId: string,
  submissionData: Partial<IReportSubmission>,
): Promise<IReport | null> => {
  if (!reportId || !submissionId) {
    throw new Error('Report ID and Submission ID are required.');
  }

  // Prepare the update operation for the specific submission
  const filter = { _id: reportId, 'submissions._id': submissionId };
  const update = {
    $set: {
      'submissions.$': {
        ...submissionData,
        _id: submissionId,
      },
    },
  };

  // Update the specific submission within the report using updateOne
  const updatedReport = await DataAccess.updateOne<IReport>(reportModel, filter, update);

  if (!updatedReport) {
    throw new Error('Error updating submission.');
  }

  return updatedReport;
};

export const checkSubmissionExists = async (
  reportId: string,
  submissionId: string,
): Promise<void> => {
  const submission = await DataAccess.findOneByConditions<IReport>(reportModel, {
    _id: reportId,
    'submissions._id': submissionId,
  });

  if (!submission) {
    throw new AppError('Submission not found in the report.', 409);
  }
};
