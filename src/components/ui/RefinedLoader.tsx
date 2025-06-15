
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center relative overflow-hidden">
      {/* Sophisticated Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-200/25 to-indigo-200/25 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Main Loader Container */}
      <div className="relative z-10 text-center space-y-16">
        {/* Sophisticated Multi-Layer Loader */}
        <div className="relative flex items-center justify-center">
          {/* Outer rotating rings with gradient borders */}
          <div className="absolute w-48 h-48 opacity-40">
            <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 p-1" style={{ animationDuration: '6s' }}>
              <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20"></div>
            </div>
          </div>
          
          <div className="absolute w-36 h-36 opacity-50">
            <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-600 p-1" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
              <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20"></div>
            </div>
          </div>
          
          <div className="absolute w-24 h-24 opacity-60">
            <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-600 p-1" style={{ animationDuration: '3s' }}>
              <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20"></div>
            </div>
          </div>

          {/* Premium Center Logo */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20 backdrop-blur-sm">
            {/* Inner glow effect */}
            <div className="absolute inset-1 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
            
            {/* Elegant inner ring */}
            <div className="absolute inset-2 rounded-full border border-white/10"></div>
            
            {/* Premium 57 Text with gradient */}
            <div className="relative z-10">
              <span className="text-2xl font-light tracking-wider bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent animate-shimmer" 
                    style={{ 
                      fontFamily: 'ui-serif, serif',
                      textShadow: '0 0 20px rgba(255,255,255,0.2)'
                    }}>57</span>
            </div>
            
            {/* Sophisticated highlight elements */}
            <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
            <div className="absolute bottom-1.5 left-1.5 w-0.5 h-0.5 bg-blue-300/40 rounded-full animate-pulse" style={{ animationDuration: '4s', animationDelay: '1.5s' }}></div>
          </div>
          
          {/* Premium orbiting particles */}
          <div className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-lg animate-spin opacity-70" 
               style={{
                 top: '-12px',
                 right: '20px',
                 animationDuration: '8s',
                 transformOrigin: '0 120px'
               }}>
          </div>
          <div className="absolute w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full shadow-md animate-spin opacity-60" 
               style={{
                 bottom: '-8px',
                 left: '25px',
                 animationDuration: '6s',
                 animationDirection: 'reverse',
                 transformOrigin: '0 -110px'
               }}>
          </div>
          <div className="absolute w-1 h-1 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-full shadow-sm animate-spin opacity-50" 
               style={{
                 top: '30px',
                 left: '-15px',
                 animationDuration: '10s',
                 transformOrigin: '90px 0'
               }}>
          </div>
        </div>

        {/* Premium Brand Text */}
        <div className="space-y-6">
          <h1 className="text-4xl font-light text-slate-800 tracking-wide" 
              style={{ fontFamily: 'ui-serif, serif' }}>
            <span className="font-extralight bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">Physique</span>{' '}
            <span className="font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent animate-shimmer">57</span>
            <span className="text-slate-600 font-extralight">, India</span>
          </h1>
          <p className="text-lg text-slate-600/90 font-light tracking-wide max-w-md mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Premium progress indicators */}
        <div className="flex justify-center space-x-4">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse shadow-lg"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.5s' }}></div>
          <div className="w-2 h-2 bg-gradient-to-r from-indigo-700 to-blue-800 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Elegant progress bar */}
        <div className="w-80 mx-auto">
          <div className="h-0.5 bg-slate-200/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 rounded-full animate-progress"></div>
          </div>
        </div>
      </div>

      {/* Premium Animation Styles */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
