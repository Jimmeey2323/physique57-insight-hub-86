
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
      {/* Ultra-Elegant Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-slate-200/20 to-gray-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-gradient-to-r from-slate-300/15 to-gray-300/15 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-slate-100/25 to-gray-100/25 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      {/* Main Loader Container - Smaller & More Refined */}
      <div className="relative z-10 text-center space-y-12">
        {/* Sophisticated Compact Loader */}
        <div className="relative flex items-center justify-center">
          {/* Outer elegant rings - Smaller */}
          <div className="absolute w-44 h-44 opacity-50">
            <div className="absolute inset-0 rounded-full border border-transparent animate-spin" 
                 style={{
                   background: 'conic-gradient(from 0deg, transparent, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.4), transparent)',
                   animationDuration: '4s'
                 }}>
            </div>
          </div>
          
          <div className="absolute w-36 h-36 opacity-40">
            <div className="absolute inset-0 rounded-full border border-transparent animate-spin" 
                 style={{
                   background: 'conic-gradient(from 180deg, transparent, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.3), transparent)',
                   animationDuration: '3s',
                   animationDirection: 'reverse'
                 }}>
            </div>
          </div>
          
          <div className="absolute w-28 h-28 opacity-30">
            <div className="absolute inset-0 rounded-full border border-transparent animate-spin" 
                 style={{
                   background: 'conic-gradient(from 90deg, transparent, rgba(168, 85, 247, 0.15), rgba(196, 181, 253, 0.25), transparent)',
                   animationDuration: '5s'
                 }}>
            </div>
          </div>
          
          {/* Ultra-Refined center circle with color-changing 57 */}
          <div className="relative w-24 h-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-full flex items-center justify-center shadow-2xl border border-slate-600/20">
            {/* Subtle inner glow */}
            <div className="absolute inset-1.5 bg-gradient-to-br from-slate-700/15 to-transparent rounded-full animate-pulse" 
                 style={{ animationDuration: '3s' }}>
            </div>
            
            {/* Elegant inner ring */}
            <div className="absolute inset-2 rounded-full border border-slate-500/15"></div>
            
            {/* Color-Changing 57 Text - Ultra Refined */}
            <div className="relative z-10">
              <span className="text-3xl font-light tracking-wider drop-shadow-lg animate-color-change" 
                    style={{ 
                      fontFamily: 'ui-serif, serif',
                      textShadow: '0 0 20px rgba(255,255,255,0.3)'
                    }}>57</span>
            </div>
            
            {/* Subtle highlight dots */}
            <div className="absolute top-2 right-2 w-1 h-1 bg-white/40 rounded-full animate-pulse" 
                 style={{ animationDuration: '2s' }}>
            </div>
            <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-slate-300/30 rounded-full animate-pulse" 
                 style={{ animationDuration: '3s', animationDelay: '1s' }}>
            </div>
          </div>
          
          {/* Elegant orbiting elements - Smaller */}
          <div className="absolute w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-sm animate-spin opacity-60" 
               style={{
                 top: '-10px',
                 right: '30px',
                 animationDuration: '6s',
                 transformOrigin: '0 120px'
               }}>
          </div>
          <div className="absolute w-1 h-1 bg-purple-500 rounded-full shadow-sm animate-spin opacity-50" 
               style={{
                 bottom: '-8px',
                 left: '35px',
                 animationDuration: '4s',
                 animationDirection: 'reverse',
                 transformOrigin: '0 -110px'
               }}>
          </div>
          <div className="absolute w-2 h-2 bg-violet-600 rounded-full shadow-sm animate-spin opacity-40" 
               style={{
                 top: '40px',
                 left: '-25px',
                 animationDuration: '7s',
                 transformOrigin: '100px 0'
               }}>
          </div>
        </div>

        {/* Ultra-Refined Brand Text */}
        <div className="space-y-4">
          <h1 className="text-3xl font-light text-slate-800 tracking-wide" 
              style={{ fontFamily: 'ui-serif, serif' }}>
            <span className="font-extralight">Physique</span>{' '}
            <span className="font-semibold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent">57</span>
            <span className="text-slate-600 font-extralight">, India</span>
          </h1>
          <p className="text-base text-slate-600/90 font-light tracking-wide">
            {subtitle}
          </p>
        </div>

        {/* Sophisticated progress indicators - Smaller */}
        <div className="flex justify-center space-x-3">
          <div className="w-1.5 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse shadow-sm"></div>
          <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-600 to-violet-700 rounded-full animate-pulse shadow-sm animation-delay-1000"></div>
          <div className="w-1.5 h-1.5 bg-gradient-to-r from-violet-700 to-indigo-800 rounded-full animate-pulse shadow-sm animation-delay-2000"></div>
        </div>

        {/* Ultra-Refined progress bar */}
        <div className="w-64 mx-auto">
          <div className="h-px bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-600 via-purple-700 to-violet-800 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Ultra-Sophisticated Color Animation Styles */}
      <style>{`
        @keyframes color-change {
          0% { color: #3b82f6; text-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
          16% { color: #8b5cf6; text-shadow: 0 0 20px rgba(139, 92, 246, 0.4); }
          32% { color: #a855f7; text-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
          48% { color: #ec4899; text-shadow: 0 0 20px rgba(236, 72, 153, 0.4); }
          64% { color: #f59e0b; text-shadow: 0 0 20px rgba(245, 158, 11, 0.4); }
          80% { color: #10b981; text-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
          100% { color: #3b82f6; text-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
        }
        
        .animate-color-change {
          animation: color-change 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
