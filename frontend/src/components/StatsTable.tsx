import type { CountryStats } from '../types';

interface StatsTableProps {
  stats: CountryStats[];
  totalVisits: number;
}

export default function StatsTable({ stats, totalVisits }: StatsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Detailed Statistics
      </h2>
      {stats.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Country
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Visits
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {item.country.toUpperCase()}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{item.visits}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {((item.visits / totalVisits) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">
          No data yet. Click "Simulate Visit" to get started.
        </p>
      )}
    </div>
  );
}
