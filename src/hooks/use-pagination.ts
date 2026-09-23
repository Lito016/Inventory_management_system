import { useCallback, useState } from 'react';
import { PAGE_SIZE } from '@/lib/constants';

export function usePagination(totalItems: number = 0, pageSize: number = PAGE_SIZE) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const goToPage = useCallback(
    (newPage: number) => {
      const clamped = Math.max(0, Math.min(newPage, totalPages - 1));
      setPage(clamped);
    },
    [totalPages]
  );

  const resetPage = useCallback(() => setPage(0), []);

  return {
    page,
    totalPages,
    pageSize,
    offset: page * pageSize,
    goToPage,
    resetPage,
    hasNextPage: page < totalPages - 1,
    hasPreviousPage: page > 0,
  };
}
