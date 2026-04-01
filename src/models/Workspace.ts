import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';

export interface IWorkspace extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId | IUser;
  members: mongoose.Types.ObjectId[] | IUser[];
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
