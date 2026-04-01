'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface AutosaveOptions {
  debounceMs?: number;
  skip?: boolean;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutosave<T>(
  data: T,
  saveFunction: (data: T) => Promise<any>,
  options: AutosaveOptions = {}
) {
  const { debounceMs = 1000, skip = false } = options;
  
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const lastSavedDataRef = useRef<string>(JSON.stringify(data));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  const save = useCallback(async (currentData: T) => {
    const dataString = JSON.stringify(currentData);
    
    // Don't save if data hasn't changed since last successful save
    if (dataString === lastSavedDataRef.current) {
      setHasChanges(false);
      setStatus('saved');
      return;
    }

    try {
      setStatus('saving');
      setError(null);
      await saveFunction(currentData);
      lastSavedDataRef.current = dataString;
      setStatus('saved');
      setHasChanges(false);
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Failed to auto-save');
      console.error('Autosave error:', err);
    }
  }, [saveFunction]);

  useEffect(() => {
    if (skip) return;

    // Skip the very first render as we are just initializing the form
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const currentDataString = JSON.stringify(data);
    
    // Check if data is actually different from last saved state
    if (currentDataString !== lastSavedDataRef.current) {
      setHasChanges(true);
      setStatus('idle');

      // Clear any existing timer
      if (timerRef.current) clearTimeout(timerRef.current);

      // Start a new timer for debounce
      timerRef.current = setTimeout(() => {
        save(data);
      }, debounceMs);
    } else {
      setHasChanges(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, debounceMs, skip, save]);

  const forceSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    return save(data);
  }, [data, save]);

  return {
    status,
    error,
    hasChanges,
    forceSave,
    isSaving: status === 'saving'
  };
}
