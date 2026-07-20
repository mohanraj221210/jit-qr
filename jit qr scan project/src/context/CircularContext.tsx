import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { Circular, Department, NoticeUploadPayload } from '../types';
import { DEPT_ROUTES } from '../types';
import { noticeService } from '../services/notice.service';
import toast from 'react-hot-toast';
import { getAdminAuth } from '../utils/storage';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';

interface CircularContextType {
  circulars: Circular[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  setPage: (page: number) => void;
  addNewCircular: (circular: NoticeUploadPayload) => Promise<void>;
  editCircular: (id: string, circular: NoticeUploadPayload) => Promise<void>;
  removeCircular: (id: string) => Promise<void>;
  getCircularsForDept: (dept: Department) => Circular[];
  refreshCirculars: () => void;
}

const CircularContext = createContext<CircularContextType>({
  circulars: [],
  loading: false,
  page: 1,
  totalPages: 1,
  total: 0,
  setPage: () => { },
  addNewCircular: async () => { },
  editCircular: async () => { },
  removeCircular: async () => { },
  getCircularsForDept: () => [],
  refreshCirculars: () => { },
});

export const CircularProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Cache/store all active circulars for department dashboards to read
  const [deptCirculars, setDeptCirculars] = useState<Circular[]>([]);

  const getDepartmentFromPath = (path: string): string | undefined => {
    const entry = Object.entries(DEPT_ROUTES).find(([_, route]) => path === route);
    return entry ? entry[0] : undefined;
  };

  const fetchPage = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const isAdmin = location.pathname.startsWith('/admin');
      const dept = getDepartmentFromPath(location.pathname);
      const result = await noticeService.getNotices(pageNum, isAdmin, dept);
      setCirculars(result.notices);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch notices:', err);
    } finally {
      setLoading(false);
    }
  }, [location.pathname]);

  // Fetch a larger set or poll in background for department views
  const fetchDeptCirculars = useCallback(async () => {
    try {
      const isAdmin = location.pathname.startsWith('/admin');
      const dept = getDepartmentFromPath(location.pathname);
      const result = await noticeService.getNotices(1, isAdmin, dept);
      let allNotices = [...result.notices];

      if (result.totalPages > 1) {
        const promises = [];
        for (let p = 2; p <= Math.min(result.totalPages, 10); p++) {
          promises.push(noticeService.getNotices(p, isAdmin, dept));
        }
        const pages = await Promise.all(promises);
        pages.forEach(p => {
          allNotices = [...allNotices, ...p.notices];
        });
      }
      setDeptCirculars(allNotices);
    } catch (err) {
      console.error('Failed to fetch dept circulars:', err);
    }
  }, [location.pathname]);

  const pageRef = React.useRef(page);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const shouldFetchNotices = useCallback(() => {
    const path = location.pathname;
    if (path === '/login' || path === '/') return false;
    if (path.startsWith('/admin') && !isAuthenticated && !getAdminAuth()) return false;
    return true;
  }, [location.pathname, isAuthenticated]);

  const refreshCirculars = useCallback(() => {
    if (!shouldFetchNotices()) return;
    fetchPage(pageRef.current);
    fetchDeptCirculars();
  }, [fetchPage, fetchDeptCirculars, shouldFetchNotices]);

  // Fetch page whenever page changes
  useEffect(() => {
    if (!shouldFetchNotices()) return;
    fetchPage(page);
  }, [page, fetchPage, shouldFetchNotices]);

  // Fetch dept circulars on mount and set up periodic 60s reload
  useEffect(() => {
    if (!shouldFetchNotices()) return;
    fetchDeptCirculars();
    const interval = setInterval(() => {
      if (!shouldFetchNotices()) return;
      fetchDeptCirculars();
      fetchPage(pageRef.current);
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchDeptCirculars, fetchPage, shouldFetchNotices]);

  const addNewCircular = useCallback(
    async (noticeData: NoticeUploadPayload) => {
      try {
        await noticeService.createNotice(noticeData);
        toast.success('Notice Created Successfully');
        refreshCirculars();
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to create notice.';
        toast.error(msg);
        throw err;
      }
    },
    [refreshCirculars]
  );

  const editCircular = useCallback(
    async (id: string, noticeData: NoticeUploadPayload) => {
      try {
        await noticeService.updateNotice(id, noticeData);
        toast.success('Notice Updated Successfully');
        refreshCirculars();
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to update notice.';
        toast.error(msg);
        throw err;
      }
    },
    [refreshCirculars]
  );

  const removeCircular = useCallback(
    async (id: string) => {
      try {
        await noticeService.deleteNotice(id);
        toast.success('Notice Deleted Successfully');
        refreshCirculars();
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to delete notice.';
        toast.error(msg);
        throw err;
      }
    },
    [refreshCirculars]
  );

  const getCircularsForDept = useCallback(
    (dept: Department): Circular[] => {
      // Read from the pre-aggregated deptCirculars list
      return deptCirculars.filter(
        (c) => c.status === 'active' && c.departments.includes(dept)
      );
    },
    [deptCirculars]
  );

  return (
    <CircularContext.Provider
      value={{
        circulars,
        loading,
        page,
        totalPages,
        total,
        setPage,
        addNewCircular,
        editCircular,
        removeCircular,
        getCircularsForDept,
        refreshCirculars,
      }}
    >
      {children}
    </CircularContext.Provider>
  );
};

export const useCirculars = () => useContext(CircularContext);
