
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="mb-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Physique 57
            </span>
            <span className="text-2xl font-bold italic ml-2">India</span>
          </div>
          <p className="text-slate-400 text-sm">
            All rights reserved - 2025 - Project by <span className="font-semibold text-white">Jimmeey</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
