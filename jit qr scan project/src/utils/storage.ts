import type { Circular } from '../types';

const STORAGE_KEY = 'jit_circulars';
const AUTH_KEY = 'jit_admin_auth';

export const getCirculars = (): Circular[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveCirculars = (circulars: Circular[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(circulars));
};

export const addCircular = (circular: Circular): void => {
  const circulars = getCirculars();
  circulars.unshift(circular);
  saveCirculars(circulars);
};

export const updateCircular = (updated: Circular): void => {
  const circulars = getCirculars().map((c) =>
    c.id === updated.id ? updated : c
  );
  saveCirculars(circulars);
};

export const deleteCircular = (id: string): void => {
  const circulars = getCirculars().filter((c) => c.id !== id);
  saveCirculars(circulars);
};

export const checkAndExpireCirculars = (): boolean => {
  const circulars = getCirculars();
  const now = new Date();
  let changed = false;
  const updated = circulars.map((c) => {
    if (c.status === 'active' && new Date(c.expiryDate) <= now) {
      changed = true;
      return { ...c, status: 'expired' as const };
    }
    return c;
  });
  if (changed) saveCirculars(updated);
  return changed;
};

export const setAdminAuth = (token: string): void => {
  localStorage.setItem(AUTH_KEY, token);
};

export const getAdminAuth = (): string | null => {
  return localStorage.getItem(AUTH_KEY);
};

export const clearAdminAuth = (): void => {
  localStorage.removeItem(AUTH_KEY);
};
