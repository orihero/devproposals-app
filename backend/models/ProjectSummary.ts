import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectSummary extends Document {
  projectId: mongoose.Types.ObjectId;
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  technicalDetails: string;
  estimatedCost: number;
  estimatedDuration: number;
  complexity: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const projectSummarySchema = new Schema<IProjectSummary>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    unique: true, // One summary per project
  },
  summary: {
    type: String,
    required: true,
    trim: true,
  },
  keyPoints: [{
    type: String,
    trim: true,
  }],
  recommendations: [{
    type: String,
    trim: true,
  }],
  technicalDetails: {
    type: String,
    required: false,
    trim: true,
  },
  estimatedCost: {
    type: Number,
    required: false,
    min: 0,
  },
  estimatedDuration: {
    type: Number,
    required: false,
    min: 0, // Allow 0 for cases where duration is not available
  },
  complexity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Indexes for better query performance
projectSummarySchema.index({ projectId: 1 });
projectSummarySchema.index({ complexity: 1 });
projectSummarySchema.index({ createdAt: -1 });

export const ProjectSummary = mongoose.model<IProjectSummary>('ProjectSummary', projectSummarySchema); 