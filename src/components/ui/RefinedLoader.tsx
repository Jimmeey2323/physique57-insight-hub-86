
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
      {/* Colorful Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      {/* Main Loader Container */}
      <div className="relative z-10 text-center space-y-12">
        {/* Sophisticated Compact Loader */}
        <div className="relative flex items-center justify-center">
          {/* Outer colorful rings with vibrant gradients */}
          <div className="absolute w-48 h-48 opacity-70">
            <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" 
                 style={{
                   background: 'conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.4), rgba(147, 51, 234, 0.6), rgba(236, 72, 153, 0.4), transparent)',
                   animationDuration: '3s'
                 }}>
            </div>
          </div>
          
          <div className="absolute w-36 h-36 opacity-60">
            <div className="absolute inset-0 rounded-full border border-transparent animate-spin" 
                 style={{
                   background: 'conic-gradient(from 180deg, transparent, rgba(16, 185, 129, 0.4), rgba(245, 158, 11, 0.5), rgba(239, 68, 68, 0.3), transparent)',
                   animationDuration: '2.5s',
                   animationDirection: 'reverse'
                 }}>
            </div>
          </div>
          
          <div className="absolute w-28 h-28 opacity-50">
            <div className="absolute inset-0 rounded-full border border-transparent animate-spin" 
                 style={{
                   background: 'conic-gradient(from 90deg, transparent, rgba(168, 85, 247, 0.3), rgba(34, 197, 94, 0.4), rgba(249, 115, 22, 0.2), transparent)',
                   animationDuration: '4s'
                 }}>
            </div>
          </div>
          
          {/* Enhanced center circle with prominent color-changing 57 */}
          <div className="relative w-24 h-24 bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-full flex items-center justify-center shadow-2xl border-2 border-slate-700/50">
            {/* Dynamic inner glow */}
            <div className="absolute inset-1 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full animate-pulse" 
                 style={{ animationDuration: '2s' }}>
            </div>
            
            {/* Elegant inner ring */}
            <div className="absolute inset-2 rounded-full border border-slate-400/30 animate-pulse" 
                 style={{ animationDuration: '3s' }}>
            </div>
            
            {/* 57 Text - Prominent Color-Changing Typography */}
            <div className="relative z-10">
              <span className="text-4xl font-bold text-white tracking-wider drop-shadow-xl animate-color-cycle" 
                    style={{ fontFamily: 'ui-serif, serif' }}>57</span>
            </div>
            
            {/* Multiple highlight dots */}
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-pulse" 
                 style={{ animationDuration: '1.5s' }}>
            </div>
            <div className="absolute bottom-2 left-2 w-1 h-1 bg-purple-400/60 rounded-full animate-pulse" 
                 style={{ animationDuration: '2.5s' }}>
            </div>
          </div>
          
          {/* Colorful orbiting elements */}
          <div className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-lg animate-spin opacity-70" 
               style={{
                 top: '-12px',
                 right: '32px',
                 animationDuration: '5s',
                 transformOrigin: '0 120px'
               }}>
          </div>
          <div className="absolute w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-lg animate-spin opacity-60" 
               style={{
                 bottom: '-8px',
                 left: '36px',
                 animationDuration: '3.5s',
                 animationDirection: 'reverse',
                 transformOrigin: '0 -105px'
               }}>
          </div>
          <div className="absolute w-2.5 h-2.5 bg-gradient-to-r from-pink-400 to-orange-500 rounded-full shadow-lg animate-spin opacity-50" 
               style={{
                 top: '40px',
                 left: '-24px',
                 animationDuration: '6s',
                 transformOrigin: '90px 0'
               }}>
          </div>
        </div>

        {/* Refined Brand Text */}
        <div className="space-y-4">
          <h1 className="text-3xl font-light text-slate-800 tracking-wide" 
              style={{ fontFamily: 'ui-serif, serif' }}>
            <span className="font-extralight">Physique</span>{' '}
            <span className="font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-color-cycle text-4xl">57</span>
            <span className="text-slate-600 font-extralight">, India</span>
          </h1>
          <p className="text-base text-slate-600/90 font-light tracking-wide">
            {subtitle}
          </p>
        </div>

        {/* Colorful progress indicators */}
        <div className="flex justify-center space-x-3">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse shadow-sm"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse shadow-sm animation-delay-1000"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-pink-600 to-orange-600 rounded-full animate-pulse shadow-sm animation-delay-2000"></div>
        </div>

        {/* Enhanced progress bar */}
        <div className="w-64 mx-auto">
          <div className="h-0.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes color-cycle {
          0% { color: #3b82f6; }
          20% { color: #8b5cf6; }
          40% { color: #ec4899; }
          60% { color: #f59e0b; }
          80% { color: #10b981; }
          100% { color: #3b82f6; }
        }
        
        .animate-color-cycle {
          animation: color-cycle 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
