import React, { useState, useEffect, useRef } from 'react';
import { projectSummaryService } from '../../services/api/projectSummaryService';
import type { ProjectSummary as ProjectSummaryType } from '../../services/api/projectSummaryService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import generatePDF from 'react-to-pdf';

interface ProjectSummaryProps {
  projectId: string;
  onSummaryGenerated?: (summary: ProjectSummaryType) => void;
  onRegenerate?: () => void;
  onSummaryUpdated?: () => void;
}

const ProjectSummary: React.FC<ProjectSummaryProps> = ({
  projectId,
  onSummaryGenerated,
  onRegenerate,
  onSummaryUpdated
}) => {
  const [summary, setSummary] = useState<ProjectSummaryType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Function to handle downloads from preview modal
  const handleDownload = async (format: 'txt' | 'pdf' | 'doc') => {
    if (!summary) return;
    
    const filename = `project-summary-${projectId}.${format}`;
    
    if (format === 'txt') {
      // Create text content
      let content = `Project Summary\n\n`;
      content += `Summary:\n${summary.summary}\n\n`;
      if (summary.technicalDetails) {
        content += `Technical Details:\n${summary.technicalDetails}\n\n`;
      }
      if (summary.keyPoints && summary.keyPoints.length > 0) {
        content += `Key Points:\n${summary.keyPoints.map(point => `• ${point}`).join('\n')}\n\n`;
      }
      if (summary.recommendations && summary.recommendations.length > 0) {
        content += `Recommendations:\n${summary.recommendations.map(rec => `• ${rec}`).join('\n')}\n\n`;
      }
      if (summary.estimatedCost) {
        content += `Estimated Cost: $${summary.estimatedCost.toLocaleString()}\n`;
      }
      if (summary.estimatedDuration) {
        content += `Estimated Duration: ${summary.estimatedDuration} days\n`;
      }
      content += `Complexity: ${summary.complexity}\n`;
      
      // Create and download text file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    else if (format === 'pdf') {
      // Since we're in the preview modal, the content should be properly rendered
      if (!previewRef.current) {
        console.error('Preview content not found');
        alert('Failed to generate PDF. Please try again.');
        return;
      }

      try {
        console.log('Starting PDF generation...');
        
        // Wait a moment to ensure all content is fully rendered
        await new Promise(resolve => setTimeout(resolve, 500));

        // Temporarily modify the preview container to show all content
        const element = previewRef.current;
        console.log('Preview element found:', element);
        
        const originalMaxHeight = element.style.maxHeight;
        const originalOverflow = element.style.overflow;
        
        // Remove height restrictions to show all content
        element.style.maxHeight = 'none';
        element.style.overflow = 'visible';
        element.style.height = 'auto';
        
        // Also modify the parent modal container
        const modalContent = element.closest('.relative.h-full.w-full');
        let originalModalMaxHeight = '';
        if (modalContent) {
          originalModalMaxHeight = (modalContent as HTMLElement).style.maxHeight;
          (modalContent as HTMLElement).style.maxHeight = 'none';
          (modalContent as HTMLElement).style.overflow = 'visible';
        }

        // Wait for the layout to update
        await new Promise(resolve => setTimeout(resolve, 300));

        // Add CSS overrides to convert modern color functions to standard hex colors
        const style = document.createElement('style');
        style.textContent = `
          * {
            color: #000000 !important;
            background-color: #ffffff !important;
            border-color: #d1d5db !important;
          }
          [class*="text-"] {
            color: #000000 !important;
          }
          [class*="bg-"] {
            background-color: #ffffff !important;
          }
          [class*="border-"] {
            border-color: #d1d5db !important;
          }
          /* Specific overrides for common Tailwind classes */
          .text-gray-900, .text-gray-800, .text-gray-700, .text-gray-600 { color: #000000 !important; }
          .text-blue-600, .text-blue-700, .text-blue-800 { color: #2563eb !important; }
          .text-green-600, .text-green-700, .text-green-800 { color: #16a34a !important; }
          .text-purple-600, .text-purple-700, .text-purple-800 { color: #9333ea !important; }
          .text-red-600, .text-red-700, .text-red-800 { color: #dc2626 !important; }
          .text-yellow-600, .text-yellow-700, .text-yellow-800 { color: #ca8a04 !important; }
          
          .bg-gray-50, .bg-gray-100 { background-color: #f9fafb !important; }
          .bg-blue-50, .bg-blue-100 { background-color: #dbeafe !important; }
          .bg-green-50, .bg-green-100 { background-color: #dcfce7 !important; }
          .bg-purple-50, .bg-purple-100 { background-color: #f3e8ff !important; }
          .bg-red-50, .bg-red-100 { background-color: #fee2e2 !important; }
          .bg-yellow-50, .bg-yellow-100 { background-color: #fef3c7 !important; }
          
          .border-gray-200, .border-gray-300 { border-color: #d1d5db !important; }
          .border-blue-200, .border-blue-300 { border-color: #93c5fd !important; }
          .border-green-200, .border-green-300 { border-color: #86efac !important; }
          .border-purple-200, .border-purple-300 { border-color: #c4b5fd !important; }
          .border-red-200, .border-red-300 { border-color: #fca5a5 !important; }
          .border-yellow-200, .border-yellow-300 { border-color: #fde047 !important; }
          
          /* Ensure proper contrast for readability */
          .text-gray-500, .text-gray-400 { color: #6b7280 !important; }
          .text-gray-300, .text-gray-200 { color: #9ca3af !important; }
          
          /* Code blocks */
          pre { background-color: #1f2937 !important; color: #f9fafb !important; }
          code { background-color: #f3f4f6 !important; color: #000000 !important; }
          
          /* Tables */
          table { border-collapse: collapse !important; }
          th, td { border: 1px solid #d1d5db !important; }
          th { background-color: #f9fafb !important; }
        `;
        document.head.appendChild(style);

        console.log('Element dimensions:', {
          scrollHeight: element.scrollHeight,
          scrollWidth: element.scrollWidth,
          offsetHeight: element.offsetHeight,
          offsetWidth: element.offsetWidth
        });

        // Use react-to-pdf to capture the rendered markdown content
        const options = {
          filename: filename,
          page: {
            margin: 20,
            format: 'a4',
            orientation: 'portrait' as const
          },
          canvas: {
            useCORS: true,
            scale: 1.5,
            logging: true // Enable logging for debugging
          }
        };

        console.log('Generating PDF with options:', options);

        // Generate PDF from the preview content
        await generatePDF(() => element, options);
        console.log('PDF generation completed successfully');
        
        // Restore original styles
        element.style.maxHeight = originalMaxHeight;
        element.style.overflow = originalOverflow;
        element.style.height = '';
        
        if (modalContent) {
          (modalContent as HTMLElement).style.maxHeight = originalModalMaxHeight;
          (modalContent as HTMLElement).style.overflow = '';
        }
        
        // Remove the temporary style
        document.head.removeChild(style);
        
      } catch (error: any) {
        console.error('Error generating PDF:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        alert(`Failed to generate PDF: ${error.message}`);
      }
    }
    
    else if (format === 'doc') {
      // Create DOCX document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Title
            new Paragraph({
              text: "Project Summary",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }), // Spacing
            
            // Summary
            new Paragraph({
              text: "Summary",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: summary.summary,
                  size: 24,
                }),
              ],
            }),
            new Paragraph({ text: "" }), // Spacing
            
            // Technical Details
            ...(summary.technicalDetails ? [
              new Paragraph({
                text: "Technical Details",
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: summary.technicalDetails,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({ text: "" }), // Spacing
            ] : []),
            
            // Key Points
            ...(summary.keyPoints && summary.keyPoints.length > 0 ? [
              new Paragraph({
                text: "Key Points",
                heading: HeadingLevel.HEADING_2,
              }),
              ...summary.keyPoints.map(point => 
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${point}`,
                      size: 24,
                    }),
                  ],
                })
              ),
              new Paragraph({ text: "" }), // Spacing
            ] : []),
            
            // Recommendations
            ...(summary.recommendations && summary.recommendations.length > 0 ? [
              new Paragraph({
                text: "Recommendations",
                heading: HeadingLevel.HEADING_2,
              }),
              ...summary.recommendations.map(rec => 
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${rec}`,
                      size: 24,
                    }),
                  ],
                })
              ),
              new Paragraph({ text: "" }), // Spacing
            ] : []),
            
            // Project Metrics
            new Paragraph({
              text: "Project Metrics",
              heading: HeadingLevel.HEADING_2,
            }),
            ...(summary.estimatedCost ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Estimated Cost: $${summary.estimatedCost.toLocaleString()}`,
                    size: 24,
                  }),
                ],
              }),
            ] : []),
            ...(summary.estimatedDuration ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Estimated Duration: ${summary.estimatedDuration} days`,
                    size: 24,
                  }),
                ],
              }),
            ] : []),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Complexity: ${summary.complexity}`,
                  size: 24,
                }),
              ],
            }),
          ],
        }],
      });
      
      // Generate and download DOCX
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    setShowDownloadDropdown(false);
  };

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const summaryData = await projectSummaryService.getProjectSummary(projectId);
      setSummary(summaryData);
      onSummaryGenerated?.(summaryData);
      onSummaryUpdated?.();
    } catch (error: any) {
      // Handle "not found" as no summary available, not an error
      if (error.message !== 'Resource not found' && error.message !== 'Project summary not found') {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    loadSummary();
  }, [projectId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading project summary...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Summary</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Summary Available</h3>
          <p className="text-gray-600">AI-generated summary will appear here once available.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Project Summary</h3>
          
          <div className="flex items-center space-x-3">
            {/* Regenerate Button */}
            <button
              onClick={onRegenerate}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </button>

            {/* Preview Button */}
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative h-full w-full bg-white flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
              <h3 className="text-xl font-medium text-gray-900">Full Summary Preview</h3>
              <div className="flex items-center space-x-3">
                {/* Download Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showDownloadDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <button
                          onClick={() => handleDownload('txt')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Download as TXT
                        </button>
                        <button
                          onClick={() => handleDownload('pdf')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Download as PDF
                        </button>
                        <button
                          onClick={() => handleDownload('doc')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Download as DOC
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div ref={previewRef} className="flex-1 overflow-y-auto p-6" data-preview-content>
              {/* Summary Content */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Summary</h4>
                <div className="prose prose-sm max-w-none text-gray-800 overflow-x-auto">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      table: ({node, ...props}) => (
                        <table className="min-w-full border-collapse border border-gray-300" {...props} />
                      ),
                      th: ({node, ...props}) => (
                        <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-medium text-gray-900" {...props} />
                      ),
                      td: ({node, ...props}) => (
                        <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />
                      ),
                      tr: ({node, ...props}) => (
                        <tr className="hover:bg-gray-50" {...props} />
                      ),
                                                code: ({node, className, children, ...props}: any) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const isInline = !className || !match;
                            return !isInline ? (
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                                {children}
                              </code>
                            );
                          },
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600" {...props} />
                      ),
                      h1: ({node, ...props}) => (
                        <h1 className="text-2xl font-bold text-gray-900 mb-4" {...props} />
                      ),
                      h2: ({node, ...props}) => (
                        <h2 className="text-xl font-bold text-gray-900 mb-3 mt-6" {...props} />
                      ),
                      h3: ({node, ...props}) => (
                        <h3 className="text-lg font-bold text-gray-900 mb-2 mt-4" {...props} />
                      ),
                      h4: ({node, ...props}) => (
                        <h4 className="text-base font-bold text-gray-900 mb-2 mt-3" {...props} />
                      ),
                      ul: ({node, ...props}) => (
                        <ul className="list-disc list-inside space-y-1 mb-4" {...props} />
                      ),
                      ol: ({node, ...props}) => (
                        <ol className="list-decimal list-inside space-y-1 mb-4" {...props} />
                      ),
                      li: ({node, ...props}) => (
                        <li className="text-gray-700" {...props} />
                      ),
                      p: ({node, ...props}) => (
                        <p className="mb-3 text-gray-700 leading-relaxed" {...props} />
                      ),
                      strong: ({node, ...props}) => (
                        <strong className="font-bold text-gray-900" {...props} />
                      ),
                      em: ({node, ...props}) => (
                        <em className="italic text-gray-700" {...props} />
                      ),
                      hr: ({node, ...props}) => (
                        <hr className="border-gray-300 my-6" {...props} />
                      ),
                    }}
                  >
                    {summary.summary}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Technical Details */}
              {summary.technicalDetails && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Technical Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="prose prose-sm max-w-none overflow-x-auto">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          table: ({node, ...props}) => (
                            <table className="min-w-full border-collapse border border-gray-300" {...props} />
                          ),
                          th: ({node, ...props}) => (
                            <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-medium text-gray-900" {...props} />
                          ),
                          td: ({node, ...props}) => (
                            <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />
                          ),
                          tr: ({node, ...props}) => (
                            <tr className="hover:bg-gray-50" {...props} />
                          ),
                          code: ({node, className, children, ...props}: any) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const isInline = !className || !match;
                            return !isInline ? (
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                                {children}
                              </code>
                            );
                          },
                          blockquote: ({node, ...props}) => (
                            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600" {...props} />
                          ),
                          h1: ({node, ...props}) => (
                            <h1 className="text-2xl font-bold text-gray-900 mb-4" {...props} />
                          ),
                          h2: ({node, ...props}) => (
                            <h2 className="text-xl font-bold text-gray-900 mb-3 mt-6" {...props} />
                          ),
                          h3: ({node, ...props}) => (
                            <h3 className="text-lg font-bold text-gray-900 mb-2 mt-4" {...props} />
                          ),
                          h4: ({node, ...props}) => (
                            <h4 className="text-base font-bold text-gray-900 mb-2 mt-3" {...props} />
                          ),
                          ul: ({node, ...props}) => (
                            <ul className="list-disc list-inside space-y-1 mb-4" {...props} />
                          ),
                          ol: ({node, ...props}) => (
                            <ol className="list-decimal list-inside space-y-1 mb-4" {...props} />
                          ),
                          li: ({node, ...props}) => (
                            <li className="text-gray-700" {...props} />
                          ),
                          p: ({node, ...props}) => (
                            <p className="mb-3 text-gray-700 leading-relaxed" {...props} />
                          ),
                          strong: ({node, ...props}) => (
                            <strong className="font-bold text-gray-900" {...props} />
                          ),
                          em: ({node, ...props}) => (
                            <em className="italic text-gray-700" {...props} />
                          ),
                          hr: ({node, ...props}) => (
                            <hr className="border-gray-300 my-6" {...props} />
                          ),
                        }}
                      >
                        {summary.technicalDetails}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Points */}
              {summary.keyPoints && summary.keyPoints.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Key Points</h4>
                  <ul className="space-y-2">
                    {summary.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {summary.recommendations && summary.recommendations.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {summary.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span className="text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Project Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {summary.estimatedCost !== undefined && summary.estimatedCost !== null && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-blue-900 mb-1">Estimated Cost</h5>
                    <p className="text-2xl font-bold text-blue-600">
                      ${summary.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                )}
                
                {summary.estimatedDuration !== undefined && summary.estimatedDuration !== null && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-green-900 mb-1">Estimated Duration</h5>
                    <p className="text-2xl font-bold text-green-600">
                      {summary.estimatedDuration} days
                    </p>
                  </div>
                )}
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-purple-900 mb-1">Complexity</h5>
                  <p className="text-2xl font-bold text-purple-600 capitalize">
                    {summary.complexity}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectSummary; 