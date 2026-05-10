import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';

export function useToggleSet<T>(
  initial?: Set<T> | (() => Set<T>),
): readonly [Set<T>, (item: T) => void, Dispatch<SetStateAction<Set<T>>>] {
  const [set, setSet] = useState<Set<T>>(initial ?? (() => new Set<T>()));
  const toggle = useCallback((item: T) => {
    setSet((prev) => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  }, []);
  return [set, toggle, setSet] as const;
}
