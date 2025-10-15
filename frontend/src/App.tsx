import { useState, useEffect } from 'react';
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

export default function VisitTracker() {
  const [stats, setStats] = useState<CountryStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalVisits, setTotalVisits] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Fetch statistics from backend
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/stats`);
      const data = response.data;

      // Convert object format {us: 5, ru: 3} to array format [{country: 'us', visits: 5}]
      const statsArray: CountryStats[] = Object.entries(data)
        .map(([country, visits]) => ({
          country,
          visits: visits as number,
        }))
        .sort((a, b) => b.visits - a.visits);

      setStats(statsArray);
      const total = statsArray.reduce(
        (sum: number, item: CountryStats) => sum + item.visits,
        0,
      );
      setTotalVisits(total);
    } catch (err) {
      // Extract error message from backend response
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (axios.isAxiosError(err) && err.message) {
        setError(err.message);
      } else {
        setError('Failed to fetch statistics');
      }
    } finally {
      setLoading(false);
    }
  };

  // Record a visit
  const recordVisit = async () => {
    setIsRecording(true);
    setError(null);
    try {
      // Send empty POST - backend will detect country from IP
      await axios.post(`${API_URL}/visits`, {});
      await fetchStats();
    } catch (err) {
      // Extract error message from backend response
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (axios.isAxiosError(err) && err.message) {
        setError(err.message);
      } else {
        setError('Failed to record visit');
      }
    } finally {
      setIsRecording(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

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
