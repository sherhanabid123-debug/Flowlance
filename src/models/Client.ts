import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';

export type ClientStatus = 'potential' | 'confirmed' | 'completed';

export interface IClient extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  contact?: string;
  phoneNumber?: string;
  projectName: string;
  status: ClientStatus;
  
  // Fields for varying statuses
  expectedBudget?: number; // Potential
  advanceAmount?: number;  // Confirmed
  totalAmount?: number;    // Confirmed / Completed
  finalAmount?: number;    // Completed
  
  notes?: string;
  startDate?: Date;
  completionDate?: Date;
  
  sampleProvided?: boolean;
  sampleLink?: string;
  
  lastFollowUp?: Date;
  nextFollowUp?: Date;
  followUpInterval?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema<IClient> = new Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['potential', 'confirmed', 'completed'],
      default: 'potential',
      required: true,
    },
    
    // Financials
    expectedBudget: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 },
    
    // Additional Details
    notes: { type: String, trim: true },
    startDate: { type: Date },
    completionDate: { type: Date },
    
    // Samples
    sampleProvided: { type: Boolean, default: false },
    sampleLink: { type: String, trim: true },
    
    // Follow-ups
    lastFollowUp: { type: Date },
    nextFollowUp: { type: Date },
    followUpInterval: { type: Number, default: 3 },
  },
  {
    timestamps: true,
  }
);

export const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
