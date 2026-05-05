'use client';

import { useState } from 'react';
import { generateWeeklyContentAction } from './actions';
import { Sparkles } from 'lucide-react';

export default function RefreshContentButton() {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await generateWeeklyContentAction();
    setLoading(false);
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
    >
      <Sparkles className="w-4 h-4" />
      <span>{loading ? 'Generating...' : 'Generate Weekly Calendar'}</span>
    </button>
  );
}
