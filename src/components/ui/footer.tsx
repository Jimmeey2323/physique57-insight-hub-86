import React from 'react';
export const Footer: React.FC = () => {
  return <footer className="relative h-16 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center">
        <div className="flex items-center gap-6 text-center">
          {/* Main Brand */}
          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-widest">
            PHYSIQUE 57 INDIA
          </span>
          
          {/* Divider */}
          <div className="w-px h-4 bg-slate-400"></div>
          
          {/* Copyright & Credits */}
          <span className="text-sm text-slate-300 tracking-widest">
            ALL RIGHTS RESERVED © 2025
          </span>
          
          <div className="w-px h-4 bg-slate-400"></div>
          
          <span className="text-xs text-slate-400 tracking-widest">
            BUSINESS INTELLIGENCE DASHBOARD
          </span>
          
          <div className="w-px h-4 bg-slate-400"></div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 tracking-widest">PROJECT BY</span>
            <span className="text-slate-200 text-xs text-center bg-transparent tracking-widest ">
              JIMMEEY
            </span>
          </div>
        </div>
      </div>
    </footer>;
};