import { Globe } from 'lucide-react';

export default function Header() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <Globe className="w-8 h-8 text-blue-600" />
        <h1 className="text-4xl font-bold text-gray-800">Visit Tracker</h1>
      </div>
      <p className="text-gray-600">
        Monitor website visits by country in real-time
      </p>
    </div>
  );
}

