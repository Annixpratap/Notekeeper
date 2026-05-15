import { useCallback, useRef, useState } from 'react';
import { useUpdateNote } from './useNotes';

export function useAutoSave(noteId, debounceMs = 2000) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const debounceTimerRef = useRef(null);
  const updateNoteMutation = useUpdateNote();

  const save = useCallback(
    async (data) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(async () => {
        try {
          setIsSaving(true);
          setError(null);
          await updateNoteMutation.mutateAsync({ noteId, data });
          setLastSaved(new Date());
        } catch (err) {
          setError(err.message || 'Failed to save');
          // Retry after 5 seconds on error
          debounceTimerRef.current = setTimeout(() => {
            save(data);
          }, 5000);
        } finally {
          setIsSaving(false);
        }
      }, debounceMs);
    },
    [noteId, debounceMs, updateNoteMutation]
  );

  const cancel = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  return {
    save,
    cancel,
    isSaving,
    error,
    lastSaved,
  };
}
