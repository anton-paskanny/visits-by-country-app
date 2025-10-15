import { RefreshCw } from 'lucide-react';

interface ControlsProps {
  loading: boolean;
  isRecording: boolean;
  onRefresh: () => void;
  onSimulateVisit: () => void;
}

export default function Controls({
  loading,
  isRecording,
  onRefresh,
  onSimulateVisit,
}: ControlsProps) {
  return (
    <div className="flex gap-4 mb-8">
      <button
        onClick={onRefresh}
        disabled={loading || isRecording}
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
      <button
        onClick={onSimulateVisit}
        disabled={loading || isRecording}
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
      >
        {isRecording ? 'Recording...' : 'Simulate Visit'}
      </button>
    </div>
  );
}
