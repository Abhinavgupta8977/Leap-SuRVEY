import { useEffect, useState, useRef } from 'react';
import api from '../utils/api';

export interface RealtimeStats {
  activeResponses: number;
  todayResponses: number;
  averageCompletionTime: number;
  completionRate: number;
}

export function useRealtimeStats(surveyId?: string, intervalMs: number = 5000) {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let timer: any = null;

    const fetchStats = async () => {
      try {
        const res = await api.realtime.getStats(surveyId);
        if (!mounted.current) return;
        setStats(res as RealtimeStats);
        setLoading(false);
      } catch (err) {
        console.error('Realtime stats fetch failed', err);
        setLoading(false);
      }
    };

    fetchStats();
    timer = setInterval(fetchStats, intervalMs);

    return () => {
      mounted.current = false;
      if (timer) clearInterval(timer);
    };
  }, [surveyId, intervalMs]);

  return { stats, loading };
}

export default useRealtimeStats;
