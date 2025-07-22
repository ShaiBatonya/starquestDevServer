// src/api/models/invitation.model.ts

import mongoose, { Schema } from 'mongoose';

export interface IInvitation extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  inviterUserId: mongoose.Types.ObjectId;
  inviteeEmail: string;
  inviteeRole: 'admin' | 'mentor' | 'mentee';
  invitationToken: string;
  tokenExpires: Date;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  positionId?: mongoose.Types.ObjectId;
  planet?: string;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt?: Date;
  cancelledAt?: Date;
}

const invitationSchema = new Schema<IInvitation>({
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: [true, 'Workspace ID is required'],
    index: true,
  },
  inviterUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Inviter user ID is required'],
  },
  inviteeEmail: {
    type: String,
    required: [true, 'Invitee email is required'],
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Invalid email format'
    },
    index: true,
  },
  inviteeRole: {
    type: String,
    enum: ['admin', 'mentor', 'mentee'],
    required: [true, 'Invitee role is required'],
    default: 'mentee',
  },
  invitationToken: {
    type: String,
    required: [true, 'Invitation token is required'],
    unique: true,
    index: true,
  },
  tokenExpires: {
    type: Date,
    required: [true, 'Token expiration date is required'],
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired', 'cancelled'],
    default: 'pending',
    index: true,
  },
  positionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
    required: false,
  },
  planet: {
    type: String,
    required: false,
    enum: [
      'Nebulae',
      'Solaris minor', 
      'Solaris major',
      'White dwarf',
      'Supernova',
      'Space station'
    ],
  },
  acceptedAt: {
    type: Date,
    required: false,
  },
  cancelledAt: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Compound indexes for efficient queries
invitationSchema.index({ workspaceId: 1, inviteeEmail: 1 });
invitationSchema.index({ inviteeEmail: 1, status: 1 });
invitationSchema.index({ tokenExpires: 1, status: 1 });

// Clean up expired invitations automatically
invitationSchema.index({ tokenExpires: 1 }, { expireAfterSeconds: 0 });

// Prevent duplicate pending invitations for same email to same workspace
invitationSchema.index(
  { workspaceId: 1, inviteeEmail: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: 'pending' },
    name: 'unique_pending_invitation'
  }
);

// Static methods for common queries
invitationSchema.statics.findPendingByEmail = function(email: string) {
  return this.find({ 
    inviteeEmail: email.toLowerCase(),
    status: 'pending',
    tokenExpires: { $gt: new Date() }
  }).populate('workspaceId', 'name description');
};

invitationSchema.statics.findByToken = function(token: string) {
  return this.findOne({
    invitationToken: token,
    status: 'pending',
    tokenExpires: { $gt: new Date() }
  }).populate(['workspaceId', 'inviterUserId']);
};

invitationSchema.statics.findWorkspaceInvitations = function(workspaceId: string, status?: string) {
  const query: any = { workspaceId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('inviterUserId', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Instance methods
invitationSchema.methods.accept = function() {
  this.status = 'accepted';
  this.acceptedAt = new Date();
  return this.save();
};

invitationSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  return this.save();
};

invitationSchema.methods.isExpired = function() {
  return this.tokenExpires < new Date() || this.status !== 'pending';
};

const Invitation = mongoose.model<IInvitation>('Invitation', invitationSchema);

export default Invitation; 