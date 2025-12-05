import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/30 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-400 rounded-full animate-spin"></div>
      </div>
      <p className="text-slate-400 text-sm animate-pulse">Constructing Puzzle...</p>
    </div>
  );
};