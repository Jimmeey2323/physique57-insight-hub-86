
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative mt-16 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900"></div>
      
      {/* Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-1/3 w-28 h-28 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          {/* Main Brand */}
          <div className="mb-6">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              PHYSIQUE 57 INDIA
            </span>
          </div>
          
          {/* Divider */}
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto mb-6"></div>
          
          {/* Copyright & Credits */}
          <div className="space-y-2">
            <p className="text-sm text-slate-300 tracking-wide">
              ALL RIGHTS RESERVED © 2025
            </p>
            <p className="text-xs text-slate-400 tracking-widest">
              BUSINESS INTELLIGENCE DASHBOARD
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-xs text-slate-400">PROJECT BY</span>
              <span className="text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 rounded-full">
                JIMMEEY
              </span>
            </div>
          </div>
          
          {/* Decorative Bottom Line */}
          <div className="pt-6">
            <div className="w-16 h-px bg-gradient-to-r from-blue-400 to-purple-400 mx-auto"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};
