import { useState, useEffect, useCallback } from 'react';
import api from '../api';

/**
 * useIntelligence: Core Tactical Data Hook
 * Manages unified data streams for Batting, Bowling, and Fielding.
 */
export function useIntelligence() {
  const [metrics, setMetrics] = useState({ data: [], tournament: "TACTICAL_ANALYTICS", active: false });
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/dashboard-all");
      setMetrics({
        data: response.data.data || [],
        tournament: response.data.tournament_name || "TOURNAMENT",
        active: true
      });
    } catch (error) {
      console.error("[System Error]: Intelligence Uplink failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    refreshData(); 
  }, [refreshData]);

  return { metrics, loading, refreshData };
}