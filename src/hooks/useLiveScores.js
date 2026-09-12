import { useState, useEffect, useRef, useCallback } from 'react';
import { getLiveMatches } from '../api/sportsApi';

const useLiveScores = (sport, pollingInterval = 30000) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const abortRef = useRef(null);

  const fetchMatches = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await getLiveMatches(sport);
      if (!controller.signal.aborted) {
        setMatches(data?.matches || []);
        setError(null);
      }
    } catch (err) {
      if (err.name !== 'AbortError' && !controller.signal.aborted) {
        setError(err.message);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [sport]);

  useEffect(() => {
    setLoading(true);
    fetchMatches();

    intervalRef.current = setInterval(fetchMatches, pollingInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [sport, pollingInterval, fetchMatches]);

  const refetch = useCallback(() => {
    setLoading(true);
    fetchMatches();
  }, [fetchMatches]);

  return { matches, loading, error, refetch };
};

export default useLiveScores;
