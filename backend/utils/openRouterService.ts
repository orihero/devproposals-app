import axios from 'axios';
import { FileReader } from './fileReader';
import dotenv from 'dotenv';
dotenv.config();  

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface ProposalAnalysis {
  totalCost?: number;
  timeline?: number;
  features: string[];
  companyName?: string;
  companyLogo?: string;
  analysis: {
    comparisonScore: number;
    aiQuestions: string[];
    aiSuggestions: string[];
  };
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;

    constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.baseUrl = 'https://openrouter.ai/api/v1';

    console.log(`🔑 OpenRouter API Key Status: ${this.apiKey ? 'Configured' : 'Not configured'}`);
    if (!this.apiKey) {
      console.warn('⚠️  OPENROUTER_API_KEY is not set. Please add it to your .env file.');
    }
  }

  private async analyzeWithAI(fileContent: string): Promise<ProposalAnalysis> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    console.log(`🤖 Sending ${fileContent.length} characters to OpenRouter for analysis`);
    console.log(`🤖 First 300 characters of content:`, fileContent.substring(0, 300));

    const prompt = `
Please analyze this proposal document and extract the following information in JSON format:

{
  "totalCost": number (extract the total cost in dollars),
  "timeline": number (extract the timeline in days),
  "features": ["feature1", "feature2", ...] (list of features/deliverables),
  "companyName": "string" (extract company name if mentioned),
  "companyLogo": "string" (extract company logo URL if mentioned),
  "analysis": {
    "comparisonScore": number (0-100, rate how well this proposal matches typical project requirements),
    "aiQuestions": ["question1", "question2", ...] (3-5 questions to ask the vendor),
    "aiSuggestions": ["suggestion1", "suggestion2", ...] (3-5 suggestions for improvement)
  }
}

Proposal content:
${fileContent}

Please respond with only the JSON object, no additional text.
`;

    console.log(`🤖 Sending prompt to OpenRouter...`);

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'anthropic/claude-sonnet-4',
          // model: 'google/gemini-2.0-flash-exp:free',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
            'X-Title': 'DevProposals AI Analysis'
          }
        }
      );

      const aiResponse = response.data as OpenRouterResponse;
      const content = aiResponse.choices[0]?.message?.content;

      console.log(`🤖 OpenRouter response received`);
      console.log(`🤖 Response content:`, content);

      if (!content) {
        throw new Error('No response from AI');
      }

      // Try to parse JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error(`🤖 No JSON found in response:`, content);
        throw new Error('Invalid JSON response from AI');
      }

      console.log(`🤖 Extracted JSON:`, jsonMatch[0]);
      const parsed = JSON.parse(jsonMatch[0]);
      console.log(`🤖 Parsed analysis result:`, parsed);
      
      return {
        totalCost: parsed.totalCost || undefined,
        timeline: parsed.timeline || undefined,
        features: Array.isArray(parsed.features) ? parsed.features : [],
        companyName: parsed.companyName,
        companyLogo: parsed.companyLogo,
        analysis: {
          comparisonScore: parsed.analysis?.comparisonScore || 0,
          aiQuestions: Array.isArray(parsed.analysis?.aiQuestions) ? parsed.analysis.aiQuestions : [],
          aiSuggestions: Array.isArray(parsed.analysis?.aiSuggestions) ? parsed.analysis.aiSuggestions : []
        }
      };
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw new Error('Failed to analyze proposal with AI');
    }
  }

  async analyzeProposal(filePath: string): Promise<ProposalAnalysis> {
    try {
      console.log(`📁 Analyzing proposal file: ${filePath}`);
      const fileContent = await FileReader.readFileContent(filePath);
      console.log(`📁 File content extracted successfully, length: ${fileContent.length}`);
      return await this.analyzeWithAI(fileContent);
    } catch (error) {
      console.error('Proposal analysis error:', error);
      throw error;
    }
  }

  async generateComparisonSummary(project: any, proposals: any[]): Promise<string> {
    try {
      console.log(`📊 Generating comparison summary for ${proposals.length} proposals`);
      
      // Read project document content if available
      let projectContent = '';
      if (project.documentFile) {
        try {
          projectContent = await FileReader.readFileContent(project.documentFile);
          console.log(`📄 Project document content extracted, length: ${projectContent.length}`);
        } catch (error) {
          console.warn('⚠️  Could not read project document:', error);
        }
      }

      // Read all proposal contents
      const proposalContents: { [key: string]: string } = {};
      for (const proposal of proposals) {
        if (proposal.proposalFile) {
          try {
            const content = await FileReader.readFileContent(proposal.proposalFile);
            proposalContents[proposal.companyName || `Proposal ${proposal._id}`] = content;
            console.log(`📄 Proposal content extracted for ${proposal.companyName || proposal._id}, length: ${content.length}`);
          } catch (error) {
            console.warn(`⚠️  Could not read proposal file for ${proposal.companyName || proposal._id}:`, error);
          }
        }
      }

      // Create the comparison prompt
      const comparisonPrompt = this.createComparisonPrompt(project, proposals, projectContent, proposalContents);
      
      console.log(`🤖 Sending comparison analysis to OpenRouter...`);
      console.log(`🤖 Prompt size: ${comparisonPrompt.length} characters`);
      
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'anthropic/claude-sonnet-4',
          messages: [
            {
              role: 'user',
              content: comparisonPrompt
            }
          ],
          temperature: 0.1,
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
            'X-Title': 'DevProposals Comparison Analysis'
          }
        }
      );

      const aiResponse = response.data as OpenRouterResponse;
      const content = aiResponse.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from AI');
      }

      console.log(`🤖 Comparison summary generated successfully`);
      return content;
    } catch (error: any) {
      console.error('Comparison summary generation error:', error);
      
      // Log more details about the error
      if (error.response) {
        console.error('OpenRouter API Error Details:');
        console.error('Status:', error.response.status);
        console.error('Status Text:', error.response.statusText);
        console.error('Response Data:', error.response.data);
      }
      
      throw new Error('Failed to generate comparison summary');
    }
  }

  private createComparisonPrompt(project: any, proposals: any[], projectContent: string, proposalContents: { [key: string]: string }): string {
    const projectInfo = `
Project Title: ${project.title}
Project Budget: ${project.budget ? `$${project.budget}` : 'Not specified'}
Project Duration: ${project.duration ? `${project.duration} days` : 'Not specified'}
Project Status: ${project.status}
`;

    // Truncate project content to reasonable size (max 50,000 chars)
    const truncatedProjectContent = projectContent.length > 50000 
      ? projectContent.substring(0, 50000) + '\n\n[Content truncated due to length...]'
      : projectContent;

    const sowContent = truncatedProjectContent ? `
## SOW/PRD Document Content:
${truncatedProjectContent}
` : '';

    const proposalsInfo = proposals.map((proposal, index) => {
      const content = proposalContents[proposal.companyName || `Proposal ${proposal._id}`] || 'Content not available';
      
      // Truncate each proposal content to reasonable size (max 30,000 chars per proposal)
      const truncatedContent = content.length > 30000 
        ? content.substring(0, 30000) + '\n\n[Content truncated due to length...]'
        : content;
      
      return `
## Proposal ${index + 1} (${proposal.companyName || 'Unknown Company'})
Company: ${proposal.companyName || 'Unknown'}
Total Cost: ${proposal.totalCost ? `$${proposal.totalCost}` : 'Not specified'}
Timeline: ${proposal.timeline ? `${proposal.timeline} days` : 'Not specified'}
Features: ${proposal.features?.join(', ') || 'None specified'}
Status: ${proposal.status}

### Proposal Content:
${truncatedContent}
`;
    }).join('\n');

    // Calculate total content length and truncate if necessary
    const fullPrompt = `
# Proposal Comparison Analysis Prompt

You are an expert procurement analyst tasked with creating a comprehensive comparison between multiple vendor proposals against a Statement of Work (SOW) or Product Requirements Document (PRD). Your goal is to produce a detailed, objective analysis that highlights key differentiators, identifies gaps, and provides actionable insights for decision-making.

## Input Materials

### Project Information:
${projectInfo}

${sowContent}

### Proposals to Compare:
${proposalsInfo}

## Analysis Framework

### 1. Document Header
Create a professional header that includes:
- Title: "Comparison Summary"
- Brief description of what's being compared
- Note any significant red flags or concerns (e.g., misaligned executive summaries, wrong project references)

### 2. Feature/Requirement Comparison Table
Create a detailed comparison table with the following structure:
- **Feature/Requirement** (from SOW/PRD)
- **Company A Response**
- **Company B Response** 
- **[Additional companies as columns]**

For each feature, evaluate:
- **Completeness**: Does the proposal fully address the requirement?
- **Technical Depth**: How detailed and specific is the implementation approach?
- **Value-Add**: Does the proposal exceed basic requirements?
- **Clarity**: Is the solution clearly explained and feasible?

After each comparison table section, include a "Weaknesses in [Company Name]" subsection highlighting:
- Missing features or requirements
- Vague or unclear responses
- Technical gaps or limitations
- Lack of supporting details

### 3. Technical Capabilities Analysis
Compare technical approaches across:
- **Technology Stack**: Specific tools, frameworks, languages mentioned
- **Architecture**: System design approach and scalability
- **Integration Capabilities**: APIs, third-party services, data flow
- **Security & Compliance**: Security measures, compliance standards
- **Performance Considerations**: Load handling, optimization strategies

### 4. Commercial Terms Comparison
Analyze pricing and commercial aspects:
- **Pricing Model**: Fixed-price vs. hourly vs. hybrid approaches
- **Total Cost**: Include all fees, hidden costs, additional charges
- **Payment Terms**: Milestone-based vs. other structures
- **Value Proposition**: Cost per feature or deliverable
- **Risk Factors**: Cost predictability and change management

### 5. Project Execution Comparison
Evaluate delivery capabilities:
- **Timeline**: Total duration and milestone breakdown
- **Team Structure**: Named resources, roles, experience levels
- **Project Management**: Methodology, communication plans, reporting
- **Quality Assurance**: Testing approaches, deliverable reviews
- **Support & Maintenance**: Post-delivery support terms

### 6. Alignment with Requirements
Assess how well each proposal addresses:
- **Core Functional Requirements**: Direct requirement fulfillment
- **Non-Functional Requirements**: Performance, security, usability
- **Business Objectives**: Strategic alignment with goals
- **Industry/Domain Expertise**: Relevant experience and understanding
- **Regulatory/Compliance Needs**: Specific industry requirements

### 7. Risk Assessment
Identify potential risks for each proposal:
- **Technical Risks**: Unproven technologies, complexity
- **Commercial Risks**: Cost overruns, unclear pricing
- **Delivery Risks**: Unrealistic timelines, resource constraints
- **Quality Risks**: Lack of testing, unclear quality standards

### 8. Final Recommendation Section
Provide a clear recommendation structure:

**[Recommended Company] offers:**
- List 3-5 key advantages with specific supporting details
- Highlight unique value propositions
- Mention risk mitigation factors

**[Other Companies] fall short because:**
- Specific gaps or weaknesses identified
- Missing critical requirements
- Higher risk factors or concerns

## Output Requirements

### Tone and Style
- **Objective and Professional**: Avoid emotional language, stick to facts
- **Specific and Detailed**: Use concrete examples and technical details
- **Comparative**: Always frame strengths/weaknesses relative to other proposals
- **Actionable**: Provide clear insights for decision-making

### Structure Requirements
- Use clear headings and subheadings for easy navigation
- Include comparison tables for easy side-by-side analysis
- Highlight critical gaps or red flags prominently
- End with a clear, justified recommendation

### Quality Checks
Before finalizing, ensure:
- All major SOW/PRD requirements are addressed in the comparison
- Each proposal's key strengths and weaknesses are identified
- Commercial and technical aspects are both covered
- The recommendation is well-supported by the analysis
- Any concerning inconsistencies or red flags are highlighted

## Example Weakness Identification Language
When identifying weaknesses, use specific, professional language:
- "Feature descriptions are high-level and lack technical depth"
- "No mention of [specific requirement] or implementation approach"
- "Pricing model introduces cost unpredictability"
- "Timeline appears unrealistic given scope complexity"
- "Lacks demonstration of relevant [industry] experience"

Generate a comprehensive comparison following this framework, ensuring thorough analysis of all proposals against the provided SOW/PRD requirements.
`;

    // Check if the prompt is too long and truncate if necessary
    const maxPromptLength = 200000; // Conservative limit for OpenRouter
    if (fullPrompt.length > maxPromptLength) {
      console.warn(`⚠️  Prompt too long (${fullPrompt.length} chars), truncating to ${maxPromptLength} chars`);
      return fullPrompt.substring(0, maxPromptLength) + '\n\n[Prompt truncated due to length limits...]';
    }

    return fullPrompt;
  }
}

export const openRouterService = new OpenRouterService(); 