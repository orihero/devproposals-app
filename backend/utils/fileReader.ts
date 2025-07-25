import textract from 'textract';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import pdf from 'pdf-parse';

export class FileReader {
  static async readFileContent(filePath: string): Promise<string> {
    try {
      // Handle both local files and URLs
      if (filePath.startsWith('http')) {
        // For URLs, download the file first
        const response = await axios.get(filePath, {
          responseType: 'arraybuffer',
          timeout: 10000 // 10 second timeout
        });
        
        // Create a temporary file path
        const tempDir = path.join(__dirname, '..', 'temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Get file extension from URL or use .pdf as default
        const urlPath = new URL(filePath).pathname;
        const fileExtension = path.extname(urlPath) || '.pdf';
        const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${fileExtension}`);
        
        // Write the downloaded content to temp file
        fs.writeFileSync(tempFilePath, response.data);
        
        try {
          // Extract text from the temp file
          let text: string;
          
          if (fileExtension.toLowerCase() === '.pdf') {
            // Use pdf-parse for PDF files
            const dataBuffer = fs.readFileSync(tempFilePath);
            const data = await pdf(dataBuffer);
            text = data.text;
          } else {
            // Use textract for other file types
            text = await new Promise<string>((resolve, reject) => {
              textract.fromFileWithPath(tempFilePath, (error: any, extractedText: string) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(extractedText || '');
                }
              });
            });
          }
          
          return text;
        } finally {
          // Clean up temp file
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        }
      } else {
        // For local files, resolve the path
        let fullPath: string;
        
        if (path.isAbsolute(filePath)) {
          fullPath = filePath;
        } else {
          // Assume it's relative to uploads directory
          fullPath = path.join(process.cwd(), 'uploads', filePath);
        }
        
        // Check if file exists
        if (!fs.existsSync(fullPath)) {
          throw new Error(`File not found: ${fullPath}. Please ensure the file was uploaded successfully.`);
        }

        // Extract text from the file
        let text: string;
        
        const fileExtension = path.extname(fullPath).toLowerCase();
        
        if (fileExtension === '.pdf') {
          // Use pdf-parse for PDF files
          const dataBuffer = fs.readFileSync(fullPath);
          const data = await pdf(dataBuffer);
          text = data.text;
        } else {
          // Use textract for other file types
          text = await new Promise<string>((resolve, reject) => {
            textract.fromFileWithPath(fullPath, (error: any, extractedText: string) => {
              if (error) {
                reject(error);
              } else {
                resolve(extractedText || '');
              }
            });
          });
        }

        return text;
      }
    } catch (error: any) {
      console.error('❌ File reading error:', error);
      
      // Provide more specific error messages
      if (error.response?.status === 404) {
        throw new Error(`File not found at URL: ${filePath}. The file may have been deleted or the URL is incorrect.`);
      } else if (error.code === 'ENOTFOUND') {
        throw new Error(`Cannot reach the server. Please check if the backend is running and the URL is correct: ${filePath}`);
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error(`Connection refused. Please check if the backend server is running on the correct port.`);
      } else {
        throw new Error(`Failed to read file: ${filePath}. ${error.message || 'Unknown error'}`);
      }
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
      console.error('❌ Error reading text file:', error);
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