// src/api/models/user.model.ts

import crypto from 'crypto';
import mongoose, { Schema, Query } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { IUser } from '@/api/types/user.interface';

const workspacesSchema = new Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  lastName: {
    type: String,
    required: [true, 'Please tell us your last name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  workspaces: [workspacesSchema],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'admin',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  phoneNumber: {
    type: String,
    required: [false, 'Please provide your phone number'],
  },
  emailVerificationCode: {
    type: String,
  },
  emailVerificationCodeExpires: {
    type: Date,
  },
  isEmailVerified: {
    type: Boolean,
    default: true,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Pre-save middleware to hash the password
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

// Pre-save middleware to update the passwordChangedAt timestamp
userSchema.pre<IUser>('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  return next();
});

// Pre-find middleware to exclude inactive users from queries
userSchema.pre<Query<any, IUser>>(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Compare candidate password with user password
userSchema.methods.correctPassword = async function (candidatePassword: string): Promise<boolean> {
  // Use 'this.password' to access the hashed password stored in the user instance
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt((this.passwordChangedAt.getTime() / 1000).toString(), 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.generateEmailVerificationCode = function (): string {
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationCode = crypto.createHash('sha256').update(verificationCode).digest('hex');
  this.emailVerificationCodeExpires = new Date(Date.now() + 20 * 60 * 1000);

  return verificationCode;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
