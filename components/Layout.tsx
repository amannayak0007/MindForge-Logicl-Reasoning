import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[120px] opacity-20 animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      {/* Title Header */}
      <div className="w-full max-w-lg mb-6 z-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">MindForge</h1>
        <p className="text-slate-400 text-sm">Logic & Reasoning</p>
      </div>
      
      <div className="w-full max-w-lg z-10">
        {children}
      </div>
    </div>
  );
};