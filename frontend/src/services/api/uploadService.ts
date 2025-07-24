import apiClient from './axiosConfig';

export interface UploadResponse {
  message: string;
  file: {
    originalName: string;
    filename: string;
    size: number;
    url: string;
  };
}

export const uploadService = {
  // Upload a document file
  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('document', file);

    const response = await apiClient.post('/api/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}; 