import api from '@/lib/api';

export interface DocumentDTO {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  imageUrl: string | null;
  category: string;
  fileSize: string;
  visibility: 'NORMAL_AND_VIP' | 'ALL';
}

export const documentService = {
  getPublishedDocuments: async () => {
    const response = await api.get('/documents/published');
    // Handle both array directly or wrapped in data property
    return Array.isArray(response.data) ? response.data : response.data.data;
  },
};
