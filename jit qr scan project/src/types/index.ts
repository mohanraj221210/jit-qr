export type Department =
  | 'Computer Science and Engineering'
  | 'Electronics and Communication Engineering'
  | 'Mechanical Engineering'
  | 'Information Technology'
  | 'Artificial Intelligence and Data Science'
  | 'Master of Business Administration'
  | 'Computer Science and Business System';

export type DepartmentType = Department;

export const DEPARTMENTS: Department[] = [
  'Information Technology',
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Artificial Intelligence and Data Science',
  'Mechanical Engineering',
  'Computer Science and Business System',
  'Master of Business Administration',
];

export const DEPARTMENT_FULL_NAMES: Record<Department, string> = {
  'Information Technology': 'Information Technology',
  'Computer Science and Engineering': 'Computer Science Engineering',
  'Electronics and Communication Engineering': 'Electronics & Communication Engineering',
  'Artificial Intelligence and Data Science': 'Artificial Intelligence & Data Science',
  'Mechanical Engineering': 'Mechanical Engineering',
  'Computer Science and Business System': 'Computer Science & Business Systems',
  'Master of Business Administration': 'Master of Business Administration',
};

export const DEPARTMENT_SHORT_NAMES: Record<Department, string> = {
  'Information Technology': 'IT',
  'Computer Science and Engineering': 'CSE',
  'Electronics and Communication Engineering': 'ECE',
  'Artificial Intelligence and Data Science': 'AI&DS',
  'Mechanical Engineering': 'Mechanical',
  'Computer Science and Business System': 'CSBS',
  'Master of Business Administration': 'MBA',
};

export const DEPT_ROUTES: Record<Department, string> = {
  'Information Technology': '/it',
  'Computer Science and Engineering': '/cse',
  'Electronics and Communication Engineering': '/ece',
  'Artificial Intelligence and Data Science': '/aids',
  'Mechanical Engineering': '/mechanical',
  'Computer Science and Business System': '/csbs',
  'Master of Business Administration': '/mba',
};


export type CircularStatus = 'active' | 'expired';

export type Circular = {
  id: string;
  title: string;
  eventName: string;
  description: string;
  posterImage: string | null;
  pdfFile: string | null;
  pdfName: string | null;
  departments: Department[];
  category?: 'Academic' | 'Exam' | 'Placement' | 'Workshop' | 'Events' | 'Holidays' | 'Circulars';
  uploadDate: string;
  startDate: string;
  expiryDate: string;
  status: CircularStatus;
  createdBy: string;
};

export interface NoticeUploadPayload {
  title: string;
  eventName: string;
  description: string;
  attachments: File | null;
  departments: Department[];
  category: string;
  startDate: string;
  expiryDate: string;
  createdBy: string;
}

