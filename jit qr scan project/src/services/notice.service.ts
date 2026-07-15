import { apiClient } from './api';
import type { Circular, Department, NoticeUploadPayload } from '../types';

export interface ApiNotice {
  id?: string;
  _id?: string;
  title: string;
  name: string;
  description: string;
  attachments?: {
    link: string;
    format: string;
  };
  department: string | string[];
  category: string;
  schedule: {
    start: string;
    expiry: string;
  };
  actionby: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedNotices {
  notices: Circular[];
  totalPages: number;
  total: number;
  currentPage: number;
}

// Map API Notice item back to local Circular type
export const mapApiNoticeToCircular = (item: any): Circular => {
  let departmentsList: Department[] = [];
  if (Array.isArray(item.department)) {
    departmentsList = item.department;
  } else if (typeof item.department === 'string') {
    const trimmed = item.department.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        departmentsList = JSON.parse(trimmed);
      } catch (e) {
        departmentsList = trimmed.split(',') as Department[];
      }
    } else {
      departmentsList = trimmed.split(',') as Department[];
    }
  }

  const start = item.schedule?.start || item.startDate || new Date().toISOString();
  const expiry = item.schedule?.expiry || item.expiryDate || new Date().toISOString();
  const status = new Date(expiry) <= new Date() ? 'expired' : 'active';

  let isImage = false;
  let posterImage: string | null = null;
  let pdfFile: string | null = null;
  let pdfName: string | null = null;

  if (item.attachments) {
    let attachmentLink = '';
    let attachmentMime = '';

    if (typeof item.attachments === 'string') {
      attachmentLink = item.attachments;
    } else if (typeof item.attachments === 'object') {
      attachmentLink = item.attachments.link || '';
      attachmentMime = item.attachments.format || item.attachments.mimetype || item.attachments.type || '';
    }

    const lowerLink = attachmentLink.toLowerCase();

    // Detect MIME from a data URI (most reliable — comes from original upload)
    let dataUriMime = '';
    if (attachmentLink.startsWith('data:')) {
      const mimeMatch = attachmentLink.match(/^data:([^;]+);base64,/);
      dataUriMime = mimeMatch ? mimeMatch[1].toLowerCase() : '';
    }

    // A file is an image when:
    //   1. Its data-URI MIME starts with "image/", OR
    //   2. The server-supplied MIME field starts with "image/", OR
    //   3. Its URL path ends with a recognised image extension
    const IMAGE_EXTS = /\.(png|jpe?g|webp|gif|bmp|heic|heif|svg|avif|tiff?)$/;
    isImage =
      dataUriMime.startsWith('image/') ||
      attachmentMime.toLowerCase().startsWith('image/') ||
      IMAGE_EXTS.test(lowerLink);

    if (isImage) {
      posterImage = attachmentLink;
    } else {
      pdfFile = attachmentLink;
      // Determine a human-readable filename for non-image attachments
      try {
        if (attachmentLink.startsWith('data:')) {
          // Use the MIME from the data URI to pick an extension
          const mime = dataUriMime;
          let ext = 'bin';
          if (mime === 'application/pdf') ext = 'pdf';
          else if (mime.includes('word') || mime.includes('msword')) ext = 'docx';
          else if (mime.includes('sheet') || mime.includes('excel')) ext = 'xlsx';
          else if (mime.includes('presentation') || mime.includes('powerpoint')) ext = 'pptx';
          else if (mime.includes('zip')) ext = 'zip';
          else if (mime.includes('gzip')) ext = 'gz';
          else if (mime.includes('text')) ext = 'txt';
          pdfName = `Attachment.${ext}`;
        } else {
          const urlObj = new URL(attachmentLink);
          const filename = urlObj.pathname.split('/').pop();
          pdfName = filename && filename.includes('.') ? decodeURIComponent(filename) : 'Attachment';
        }
      } catch (e) {
        pdfName = 'Attachment';
      }
    }
  }

  return {
    id: item._id || item.id || '',
    title: item.title || '',
    eventName: item.name || '',
    description: item.description || '',
    posterImage,
    pdfFile,
    pdfName,
    departments: departmentsList,
    category: item.category || 'Circulars',
    uploadDate: item.createdAt || start,
    startDate: start,
    expiryDate: expiry,
    status,
    createdBy: item.actionby || 'Admin',
  };
};

export const noticeService = {
  async getNoticeStats(department?: string): Promise<any> {
    const url = department 
      ? `/admin/get/notice/stats?department=${encodeURIComponent(department)}`
      : '/admin/get/notice/stats';
    const response = await apiClient.get<any>(url);
    return response.data;
  },

  async getNotices(page: number = 1): Promise<PaginatedNotices> {
    const response = await apiClient.get<any>(`/admin/get/notice?page=${page}`);
    const data = response.data;

    // Handle both direct array and wrapped paginated structures robustly
    if (Array.isArray(data)) {
      return {
        notices: data.map(mapApiNoticeToCircular),
        totalPages: 1,
        total: data.length,
        currentPage: 1,
      };
    }

    const rawList = data.notices || data.items || data.data || [];
    const total = data.total || data.totalItems || rawList.length;
    const totalPages = data.totalPages || Math.ceil(total / 10) || 1;
    const currentPage = data.currentPage || page;

    return {
      notices: rawList.map(mapApiNoticeToCircular),
      totalPages,
      total,
      currentPage,
    };
  },

  async getNoticeById(id: string): Promise<Circular> {
    const response = await apiClient.get<any>(`/admin/get/notice/${id}`);
    return mapApiNoticeToCircular(response.data);
  },

  async createNotice(notice: NoticeUploadPayload): Promise<Circular> {
    const formData = new FormData();
    formData.append('title', notice.title);
    formData.append('description', notice.description);
    formData.append('category', notice.category);
    formData.append('start', notice.startDate);
    formData.append('expiry', notice.expiryDate);
    formData.append('actionby', notice.createdBy);
    formData.append('department', JSON.stringify(notice.departments));
    if (notice.attachments) {
      formData.append('attachments', notice.attachments);
    }

    const response = await apiClient.post<any>('/admin/create/notice', formData);
    return mapApiNoticeToCircular(response.data);
  },

  async updateNotice(id: string, notice: NoticeUploadPayload): Promise<Circular> {
    const formData = new FormData();
    formData.append('title', notice.title);
    formData.append('description', notice.description);
    formData.append('category', notice.category);
    formData.append('start', notice.startDate);
    formData.append('expiry', notice.expiryDate);
    formData.append('actionby', notice.createdBy);
    formData.append('department', JSON.stringify(notice.departments));
    if (notice.attachments) {
      formData.append('attachments', notice.attachments);
    }

    const response = await apiClient.put<any>(`/admin/update/notice/${id}`, formData);
    return mapApiNoticeToCircular(response.data);
  },

  async deleteNotice(id: string): Promise<void> {
    await apiClient.delete(`/admin/delete/notice/${id}`);
  },
};
