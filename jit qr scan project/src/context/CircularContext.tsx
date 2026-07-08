import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { Circular, Department } from '../types';
import {
  getCirculars,
  addCircular,
  updateCircular,
  deleteCircular,
  checkAndExpireCirculars,
} from '../utils/storage';

interface CircularContextType {
  circulars: Circular[];
  addNewCircular: (circular: Circular) => void;
  editCircular: (circular: Circular) => void;
  removeCircular: (id: string) => void;
  getCircularsForDept: (dept: Department) => Circular[];
  refreshCirculars: () => void;
}

const CircularContext = createContext<CircularContextType>({
  circulars: [],
  addNewCircular: () => {},
  editCircular: () => {},
  removeCircular: () => {},
  getCircularsForDept: () => [],
  refreshCirculars: () => {},
});

export const CircularProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [circulars, setCirculars] = useState<Circular[]>([]);

  const refreshCirculars = useCallback(() => {
    checkAndExpireCirculars();
    setCirculars(getCirculars());
  }, []);

  useEffect(() => {
    refreshCirculars();
    // Check expiry every 60 seconds
    const interval = setInterval(() => {
      const changed = checkAndExpireCirculars();
      if (changed) setCirculars(getCirculars());
    }, 60000);
    return () => clearInterval(interval);
  }, [refreshCirculars]);

  const addNewCircular = useCallback(
    (circular: Circular) => {
      addCircular(circular);
      refreshCirculars();
    },
    [refreshCirculars]
  );

  const editCircular = useCallback(
    (circular: Circular) => {
      updateCircular(circular);
      refreshCirculars();
    },
    [refreshCirculars]
  );

  const removeCircular = useCallback(
    (id: string) => {
      deleteCircular(id);
      setCirculars((prev) => prev.filter((c) => c.id !== id));
    },
    []
  );

  const getCircularsForDept = useCallback(
    (dept: Department): Circular[] => {
      return circulars.filter(
        (c) => c.status === 'active' && c.departments.includes(dept)
      );
    },
    [circulars]
  );

  return (
    <CircularContext.Provider
      value={{
        circulars,
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
