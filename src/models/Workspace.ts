import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';

export type WorkspaceRole = 'owner' | 'member';

export interface IWorkspaceMember {
  userId: mongoose.Types.ObjectId | IUser;
  role: WorkspaceRole;
}

export interface IWorkspace extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId | IUser;
  members: IWorkspaceMember[];
  inviteToken?: string;
  inviteTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema: Schema<IWorkspace> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['owner', 'member'],
          default: 'member',
        },
      },
    ],
    inviteToken: {
      type: String,
      sparse: true,
    },
    inviteTokenExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Workspace) {
  delete mongoose.models.Workspace;
}

export const Workspace: Model<IWorkspace> = mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
