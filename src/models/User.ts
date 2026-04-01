import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  userType?: 'freelancer' | 'agency';
  agencyName?: string;
  password?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  googleId?: string;
  avatar?: string;
  emailReminders?: boolean;
  currentWorkspace?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    userType: {
      type: String,
      enum: ['freelancer', 'agency'],
      default: 'freelancer',
    },
    agencyName: {
      type: String,
      trim: true,
    },
    emailReminders: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: false, // Optional for Google users
    },
    googleId: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // Allow multiple nulls but unique when present
    },
    avatar: {
      type: String,
      required: false,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
    currentWorkspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.User) {
  delete mongoose.models.User;
}

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
