import fs from 'fs';
import path from 'path';
import axios from 'axios';
import textract from 'textract';

export class FileReader {
  static async readFileContent(filePath: string): Promise<string> {
    try {
      // Handle both local files and URLs
      if (filePath.startsWith('http')) {
        const response = await axios.get(filePath);
        return response.data;
      } else {
        // For local files, read from uploads directory
        const fullPath = path.join(process.cwd(), 'uploads', filePath);
        
        if (!fs.existsSync(fullPath)) {
          throw new Error('File not found');
        }

        // Use Textract to extract text from any supported file format
        return new Promise((resolve, reject) => {
          console.log(`📄 Attempting to extract text from file: ${fullPath}`);
          textract.fromFileWithPath(fullPath, {
            preserveLineBreaks: true,
            preserveOnlyMultipleLineBreaks: true
          }, (error: any, text: string) => {
            if (error) {
              console.error('Textract error:', error);
              reject(new Error('Failed to extract text from file'));
            } else {
              console.log(`📄 Extracted text length: ${text?.length || 0} characters`);
              console.log(`📄 First 500 characters of extracted text:`, text?.substring(0, 500));
              
              // Clean the extracted text
              const cleanedText = FileReader.cleanExtractedText(text || '');
              resolve(cleanedText);
            }
          });
        });
      }
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error('Failed to read proposal file');
    }
  }

  static cleanExtractedText(text: string): string {
    if (!text) return '';
    
    return text
      // Remove PDF artifacts and binary data
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove PDF-specific markers
      .replace(/%PDF-[^\n]*/g, '')
      .replace(/obj[\s\n]*<</g, '')
      .replace(/>>[\s\n]*endobj/g, '')
      // Clean up line breaks
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive punctuation
      .replace(/[.]{3,}/g, '...')
      // Trim whitespace
      .trim();
  }

  static async readTextFile(filePath: string): Promise<string> {
    try {
      if (filePath.startsWith('http')) {
        const response = await axios.get(filePath);
        return response.data;
      } else {
        const fullPath = path.join(process.cwd(), 'uploads', filePath);
        return fs.readFileSync(fullPath, 'utf-8');
      }
    } catch (error) {
      console.error('Error reading text file:', error);
      throw new Error('Failed to read text file');
    }
  }

  static getSupportedFormats(): string[] {
    return [
      '.txt', '.md', '.csv',
      '.pdf', '.doc', '.docx', '.rtf',
      '.xls', '.xlsx', '.ppt', '.pptx',
      '.odt', '.ods', '.odp',
      '.html', '.htm', '.xml'
    ];
  }
} 