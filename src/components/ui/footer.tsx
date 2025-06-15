
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white py-6 mt-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-xs text-slate-400 tracking-widest leading-relaxed">
            <span className="font-semibold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              PHYSIQUE 57 INDIA
            </span>
            {' • '}
            ALL RIGHTS RESERVED - 2025
            {' • '}
            PROJECT BY{' '}
            <span className="font-semibold text-white">JIMMEEY</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
