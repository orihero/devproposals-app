import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  userId: mongoose.Types.ObjectId;
  prdFile?: string;
  budget?: number;
  duration?: number;
  status: 'active' | 'completed' | 'on-hold';
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  prdFile: {
    type: String,
    required: false, // Optional file path or URL
  },
  budget: {
    type: Number,
    required: false,
    min: 0,
  },
  duration: {
    type: Number,
    required: false,
    min: 1, // At least 1 day
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'completed', 'on-hold'],
    default: 'active',
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Indexes for better query performance
projectSchema.index({ userId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ createdAt: -1 });

export const Project = mongoose.model<IProject>('Project', projectSchema); 