import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import Controls from './components/Controls';
import ErrorMessage from './components/ErrorMessage';
import BarChartCard from './components/BarChartCard';
import PieChartCard from './components/PieChartCard';
import StatsTable from './components/StatsTable';
import type { CountryStats } from './types';
import { API_URL } from './constants';

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message ?? err.message;
  }
  return fallback;
}

export default function App() {
  const [stats, setStats] = useState<CountryStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fetchAbortRef = useRef<AbortController | null>(null);

  const totalVisits = useMemo(
    () => stats.reduce((sum, s) => sum + s.visits, 0),
    [stats],
  );

  const fetchStats = useCallback(async () => {
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/stats`, {
        signal: controller.signal,
      });
      const data = response.data as Record<string, number>;
      const statsArray: CountryStats[] = Object.entries(data)
        .map(([country, visits]) => ({ country, visits }))
        .sort((a, b) => b.visits - a.visits);
      setStats(statsArray);
      setLoading(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') return;
      setError(extractErrorMessage(err, 'Failed to fetch statistics'));
      setLoading(false);
    }
  }, []);

  const recordVisit = useCallback(async () => {
    setIsRecording(true);
    setError(null);
    try {
      await axios.post(`${API_URL}/visits`, {});
      await fetchStats();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to record visit'));
    } finally {
      setIsRecording(false);
    }
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => {
      clearInterval(interval);
      fetchAbortRef.current?.abort();
    };
  }, [fetchStats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <StatsCards totalVisits={totalVisits} stats={stats} />
        <Controls
          loading={loading}
          isRecording={isRecording}
          onRefresh={fetchStats}
          onSimulateVisit={recordVisit}
        />
        <ErrorMessage error={error} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <BarChartCard stats={stats} />
          <PieChartCard stats={stats} />
        </div>

        <StatsTable stats={stats} totalVisits={totalVisits} />
      </div>
    </div>
  );
}
