import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';

const notesQueryKey = ['notes'];

export function useNotes(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...notesQueryKey, page, limit],
    queryFn: async () => {
      const response = await axiosInstance.get('/notes', {
        params: { page, limit },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
}

export function useNoteById(noteId) {
  return useQuery({
    queryKey: ['notes', noteId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/notes/${noteId}`);
      return response.data;
    },
    enabled: !!noteId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteData) => {
      const response = await axiosInstance.post('/notes', noteData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesQueryKey });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, data }) => {
      const response = await axiosInstance.put(`/notes/${noteId}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notesQueryKey });
      queryClient.setQueryData(['notes', data.id], data);
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId) => {
      await axiosInstance.delete(`/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesQueryKey });
    },
  });
}
