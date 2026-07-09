export type Department =
  | 'IT'
  | 'CSE'
  | 'ECE'
  | 'AI&DS'
  | 'Mechanical'
  | 'CSBS'
  | 'MBA';

export const DEPARTMENTS: Department[] = [
  'IT',
  'CSE',
  'ECE',
  'AI&DS',
  'Mechanical',
  'CSBS',
  'MBA',
];

export const DEPARTMENT_FULL_NAMES: Record<Department, string> = {
  IT: 'Information Technology',
  CSE: 'Computer Science Engineering',
  ECE: 'Electronics & Communication Engineering',
  'AI&DS': 'Artificial Intelligence & Data Science',
  Mechanical: 'Mechanical Engineering',
  CSBS: 'Computer Science & Business Systems',
  MBA: 'Master of Business Administration',
};

export const DEPT_ROUTES: Record<Department, string> = {
  IT: '/it',
  CSE: '/cse',
  ECE: '/ece',
  'AI&DS': '/aids',
  Mechanical: '/mechanical',
  CSBS: '/csbs',
  MBA: '/mba',
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
  uploadDate: string;
  startDate: string;
  expiryDate: string;
  status: CircularStatus;
  createdBy: string;
};
