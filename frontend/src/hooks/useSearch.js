import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { useState, useCallback } from 'react';

export function useSearch() {
  const [query, setQuery] = useState('');

  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query.trim()) {
        return [];
      }
      const response = await axiosInstance.get('/search', {
        params: { q: query },
      });
      return response.data.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,
  });

  const search = useCallback((searchQuery) => {
    setQuery(searchQuery);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clear,
    query,
  };
}
