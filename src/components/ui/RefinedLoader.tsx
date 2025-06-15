
import React from 'react';

interface RefinedLoaderProps {
  title?: string;
  subtitle?: string;
}

export const RefinedLoader: React.FC<RefinedLoaderProps> = ({
  title = "Physique 57",
  subtitle = "Loading your dashboard..."
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center relative overflow-hidden">
      {/* Elegant Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-slate-200/30 to-gray-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-slate-300/20 to-gray-300/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-slate-100/40 to-gray-100/40 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      {/* Main Loader Container */}
      <div className="relative z-10 text-center space-y-16">
        {/* Sophisticated Modern Loader */}
        <div className="relative flex items-center justify-center">
          {/* Outer elegant rings with subtle gradients */}
          <div className="absolute w-64 h-64 opacity-60">
            <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" 
                 style={{
                   background: 'conic-gradient(from 0deg, transparent, rgba(51, 65, 85, 0.2), rgba(71, 85, 105, 0.4), transparent)',
                   animationDuration: '4s'
                 }}>
            </div>
          </div>
          
          <div className="absolute w-52 h-52 opacity-50">
            <div className="absolute inset-0 rounded-full border border-transparent animate-spin" 
                 style={{
                   background: 'conic-gradient(from 180deg, transparent, rgba(71, 85, 105, 0.15), rgba(100, 116, 139, 0.3), transparent)',
                   animationDuration: '3s',
                   animationDirection: 'reverse'
                 }}>
            </div>
          </div>
          
          <div className="absolute w-40 h-40 opacity-40">
            <div className="absolute inset-0 rounded-full border border-transparent animate-spin" 
                 style={{
                   background: 'conic-gradient(from 90deg, transparent, rgba(100, 116, 139, 0.1), rgba(148, 163, 184, 0.2), transparent)',
                   animationDuration: '5s'
                 }}>
            </div>
          </div>
          
          {/* Refined center circle with 57 */}
          <div className="relative w-32 h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-full flex items-center justify-center shadow-2xl border border-slate-600/30">
            {/* Subtle inner glow */}
            <div className="absolute inset-2 bg-gradient-to-br from-slate-700/20 to-transparent rounded-full animate-pulse" 
                 style={{ animationDuration: '3s' }}>
            </div>
            
            {/* Elegant inner ring */}
            <div className="absolute inset-3 rounded-full border border-slate-500/20"></div>
            
            {/* 57 Text - Refined Typography */}
            <div className="relative z-10">
              <span className="text-5xl font-light text-white tracking-wider drop-shadow-lg" 
                    style={{ fontFamily: 'ui-serif, serif' }}>57</span>
            </div>
            
            {/* Subtle highlight dot */}
            <div className="absolute top-3 right-3 w-2 h-2 bg-white/30 rounded-full animate-pulse" 
                 style={{ animationDuration: '2s' }}>
            </div>
          </div>
          
          {/* Elegant orbiting elements */}
          <div className="absolute w-2 h-2 bg-slate-400 rounded-full shadow-md animate-spin opacity-60" 
               style={{
                 top: '-15px',
                 right: '40px',
                 animationDuration: '6s',
                 transformOrigin: '0 160px'
               }}>
          </div>
          <div className="absolute w-1.5 h-1.5 bg-slate-500 rounded-full shadow-md animate-spin opacity-50" 
               style={{
                 bottom: '-10px',
                 left: '45px',
                 animationDuration: '4s',
                 animationDirection: 'reverse',
                 transformOrigin: '0 -140px'
               }}>
          </div>
          <div className="absolute w-2.5 h-2.5 bg-slate-600 rounded-full shadow-md animate-spin opacity-40" 
               style={{
                 top: '50px',
                 left: '-30px',
                 animationDuration: '7s',
                 transformOrigin: '120px 0'
               }}>
          </div>
        </div>

        {/* Refined Brand Text */}
        <div className="space-y-6">
          <h1 className="text-4xl font-light text-slate-800 tracking-wide" 
              style={{ fontFamily: 'ui-serif, serif' }}>
            <span className="font-extralight">Physique</span>{' '}
            <span className="font-semibold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent">57</span>
            <span className="text-slate-600 font-extralight">, India</span>
          </h1>
          <p className="text-lg text-slate-600/90 font-light tracking-wide">
            {subtitle}
          </p>
        </div>

        {/* Sophisticated progress indicators */}
        <div className="flex justify-center space-x-4">
          <div className="w-2 h-2 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full animate-pulse shadow-sm"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full animate-pulse shadow-sm animation-delay-1000"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full animate-pulse shadow-sm animation-delay-2000"></div>
        </div>

        {/* Refined progress bar */}
        <div className="w-80 mx-auto">
          <div className="h-0.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
