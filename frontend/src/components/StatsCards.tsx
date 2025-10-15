import { TrendingUp } from 'lucide-react';
import type { CountryStats } from '../types';

interface StatsCardsProps {
  totalVisits: number;
  stats: CountryStats[];
}

export default function StatsCards({ totalVisits, stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Visits</p>
            <p className="text-3xl font-bold text-gray-800">{totalVisits}</p>
          </div>
          <TrendingUp className="w-10 h-10 text-blue-500 opacity-30" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-sm">Countries Tracked</p>
        <p className="text-3xl font-bold text-gray-800">{stats.length}</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-sm">Top Country</p>
        <p className="text-3xl font-bold text-gray-800">
          {stats.length > 0 ? stats[0].country.toUpperCase() : '—'}
        </p>
      </div>
    </div>
  );
}
