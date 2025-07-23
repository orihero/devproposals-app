import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'admin'],
    default: 'user',
  },
  imageUrl: {
    type: String,
    required: false,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Index for better query performance
userSchema.index({ clerkId: 1 });
userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', userSchema); 