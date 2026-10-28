"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom polling hook with max retry limits, automatic cleanup, and termination conditions.
 *
 * @param {() => Promise<any>} fetchFn - Async function to call
 * @param {(data: any) => boolean} isDone - Predicate to determine when to stop polling
 * @param {number} interval - Polling interval in ms (default: 2500)
 * @param {number} maxAttempts - Safety limit before stopping (default: 30)
 * @returns {{ data: any, error: any, isPolling: boolean, retry: () => void }}
 */
export function usePolling(fetchFn, isDone, interval = 2500, maxAttempts = 30) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const attempts = useRef(0);
  const isDoneRef = useRef(isDone);

  useEffect(() => {
    isDoneRef.current = isDone;
  }, [isDone]);

  const poll = useCallback(async () => {
    if (!fetchFn) return;
    try {
      const result = await fetchFn();
      setData(result);
      if (isDoneRef.current(result)) {
        setIsPolling(false);
      }
    } catch (err) {
      setError(err);
      setIsPolling(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    attempts.current = 0;
    let isCancelled = false;

    // Run poll async
    const executePoll = async () => {
      if (!fetchFn || isCancelled) return;
      try {
        const result = await fetchFn();
        if (isCancelled) return;
        setData(result);
        if (isDoneRef.current(result)) {
          setIsPolling(false);
        }
      } catch (err) {
        if (isCancelled) return;
        setError(err);
        setIsPolling(false);
      }
    };

    executePoll();

    const timerId = setInterval(() => {
      attempts.current += 1;
      if (attempts.current >= maxAttempts) {
        setIsPolling(false);
        clearInterval(timerId);
        return;
      }
      executePoll();
    }, interval);

    return () => {
      isCancelled = true;
      clearInterval(timerId);
    };
  }, [fetchFn, interval, maxAttempts]);

  const retry = useCallback(() => {
    attempts.current = 0;
    setIsPolling(true);
    poll();
  }, [poll]);

  return { data, error, isPolling, retry };
}
