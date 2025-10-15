import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { CountryStats } from '../types';
import { COLORS } from '../constants';

interface PieChartCardProps {
  stats: CountryStats[];
}

export default function PieChartCard({ stats }: PieChartCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Distribution</h2>
      {stats.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stats}
              dataKey="visits"
              nameKey="country"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {stats.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-500 text-center py-8">No data yet</p>
      )}
    </div>
  );
}
