import mongoose, { Document, Schema } from 'mongoose';

export interface IProposalAnalysis {
  comparisonScore?: number;
  aiQuestions?: string[];
  aiSuggestions?: string[];
}

export interface IProposal extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  proposalFile?: string;
  totalCost?: number;
  timeline?: number;
  features: string[];
  companyName?: string;
  companyLogo?: string;
  status: 'pending' | 'accepted' | 'rejected';
  analysis: IProposalAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

const proposalAnalysisSchema = new Schema<IProposalAnalysis>({
  comparisonScore: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
  },
  aiQuestions: [{
    type: String,
    trim: true,
  }],
  aiSuggestions: [{
    type: String,
    trim: true,
  }],
}, { _id: false });

const proposalSchema = new Schema<IProposal>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  proposalFile: {
    type: String,
    required: false, // Optional file path or URL
  },
  totalCost: {
    type: Number,
    required: false,
    min: 0,
  },
  timeline: {
    type: Number,
    required: false,
    min: 1, // At least 1 day if provided
  },
  features: [{
    type: String,
    required: true,
    trim: true,
  }],
  companyName: {
    type: String,
    required: false,
    trim: true,
  },
  companyLogo: {
    type: String,
    required: false, // URL to company logo
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  analysis: {
    type: proposalAnalysisSchema,
    default: {},
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Indexes for better query performance
proposalSchema.index({ projectId: 1 });
proposalSchema.index({ userId: 1 });
proposalSchema.index({ status: 1 });
proposalSchema.index({ createdAt: -1 });

// Compound index for efficient queries
proposalSchema.index({ projectId: 1, status: 1 });

export const Proposal = mongoose.model<IProposal>('Proposal', proposalSchema); 