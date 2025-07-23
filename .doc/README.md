# DevProposals.com Database Models

This directory contains the MongoDB models for the DevProposals.com MVP backend.

## Models Overview

### 1. User Model (`User.ts`)
Represents all authenticated individuals on the platform.

**Fields:**
- `email` (String, required, unique): Email address for login and identification
- `passwordHash` (String, optional): Hashed password for local authentication
- `name` (String, required): Full name of the user
- `role` (String, required): Either "user" or "admin"
- `googleId` (String, optional): Google OAuth ID for OAuth users
- `createdAt` (Date): Timestamp of creation
- `updatedAt` (Date): Timestamp of last update

**Features:**
- Supports both local authentication and OAuth
- Email is automatically lowercased and trimmed
- Sparse index on googleId allows multiple null values

### 2. Project Model (`Project.ts`)
Projects created by users to outline development requirements.

**Fields:**
- `title` (String, required): The name of the project
- `description` (String, required): Detailed explanation of the project
- `userId` (ObjectId, ref: User, required): ID of the user who created the project
- `prdFile` (String, optional): File path or URL to uploaded PRD/Scope of Work
- `budget` (Number, optional): Estimated budget for the project
- `duration` (Number, optional): Project duration in days
- `status` (String, default: "active"): Status (active, completed, on-hold)
- `createdAt` (Date): Timestamp of creation
- `updatedAt` (Date): Timestamp of last update

**Features:**
- Budget and duration have minimum value constraints
- Indexed for efficient queries by user and status

### 3. Proposal Model (`Proposal.ts`)
Proposals submitted by users in response to projects.

**Fields:**
- `projectId` (ObjectId, ref: Project, required): ID of the associated project
- `userId` (ObjectId, ref: User, required): ID of the user who submitted the proposal
- `proposalFile` (String, optional): Path or URL to the proposal file
- `totalCost` (Number, required): Total cost proposed for the project
- `timeline` (Number, required): Number of days proposed to complete the project
- `features` ([String], required): List of key features or deliverables
- `companyName` (String, optional): Name of the developer or company
- `companyLogo` (String, optional): URL to the company logo
- `status` (String, default: "pending"): Status (pending, accepted, rejected)
- `analysis` (Object): AI-generated metadata from proposal analysis
  - `comparisonScore` (Number, optional): Score indicating alignment with requirements
  - `aiQuestions` ([String], optional): Questions suggested by AI for clarification
  - `aiSuggestions` ([String], optional): AI-generated suggestions or concerns
- `createdAt` (Date): Timestamp of creation
- `updatedAt` (Date): Timestamp of last update

**Features:**
- AI analysis embedded as a subdocument
- Comparison score ranges from 0-100
- Compound indexes for efficient project-based queries

## Entity Relationships

- **User - Project**: One-to-many. A user can create multiple projects.
- **Project - Proposal**: One-to-many. A project can receive multiple proposals.
- **User - Proposal**: One-to-many. A user can submit multiple proposals to different projects.

## Usage

```typescript
import { User, Project, Proposal } from './models';

// Create a new user
const user = new User({
  email: 'user@example.com',
  name: 'John Doe',
  role: 'user'
});

// Create a project
const project = new Project({
  title: 'E-commerce Platform',
  description: 'Build a modern e-commerce platform',
  userId: user._id,
  budget: 50000,
  duration: 90
});

// Create a proposal
const proposal = new Proposal({
  projectId: project._id,
  userId: developer._id,
  totalCost: 45000,
  timeline: 85,
  features: ['User authentication', 'Product catalog', 'Payment processing'],
  companyName: 'Tech Solutions Inc.',
  analysis: {
    comparisonScore: 85,
    aiQuestions: ['What payment gateways do you support?'],
    aiSuggestions: ['Consider adding inventory management']
  }
});
```

## Indexes

All models include appropriate indexes for optimal query performance:
- User: email, googleId
- Project: userId, status, createdAt
- Proposal: projectId, userId, status, createdAt, and compound indexes

## Validation

- Email addresses are automatically lowercased and trimmed
- Budget and cost fields have minimum value constraints
- Timeline and duration fields have minimum value constraints
- Enum fields are validated against allowed values
- Required fields are enforced at the schema level 