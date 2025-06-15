
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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-200/25 to-indigo-200/25 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '3s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '1.5s' }}></div>
        </div>
      </div>

      {/* Main Loader Container */}
      <div className="relative z-10 flex items-center justify-center">
        {/* P57 Animated Loader - Made Bigger */}
        <div className="p57-loader">
          <svg height="0" width="0" viewBox="0 0 64 64" className="absolute">
            <defs xmlns="http://www.w3.org/2000/svg">
              <linearGradient gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0" id="b">
                <stop stopColor="#973BED"></stop>
                <stop stopColor="#007CFF" offset="1"></stop>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" y2="0" x2="0" y1="64" x1="0" id="c">
                <stop stopColor="#FFC800"></stop>
                <stop stopColor="#F0F" offset="1"></stop>
                <animateTransform repeatCount="indefinite" keySplines=".42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1" keyTimes="0; 0.125; 0.25; 0.375; 0.5; 0.625; 0.75; 0.875; 1" dur="12s" values="0 32 32;-270 32 32;-270 32 32;-540 32 32;-540 32 32;-810 32 32;-810 32 32;-1080 32 32;-1080 32 32" type="rotate" attributeName="gradientTransform"></animateTransform>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0" id="d">
                <stop stopColor="#00E0ED"></stop>
                <stop stopColor="#00DA72" offset="1"></stop>
              </linearGradient>
            </defs>
          </svg>
          
          {/* P Letter */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="64" width="64" className="inline-block">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="8" stroke="url(#b)" d="M 8,4 h 24 c 11.045695,0 20,8.954305 20,20 0,11.045695 -8.954305,20 -20,20 H 16 V 56 H 8 Z M 16,12 V 36 H 32 c 6.627417,0 12,-5.372583 12,-12 0,-6.627417 -5.372583,-12 -12,-12 z" className="dash" pathLength="360"></path>
          </svg>
          
          {/* 5 Number */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="64" width="64" className="inline-block">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="10" stroke="url(#c)" d="M 32 32 m 0 -27 a 27 27 0 1 1 0 54 a 27 27 0 1 1 0 -54" className="spin" pathLength="360"></path>
          </svg>
          
          <div className="w-2"></div>
          
          {/* 7 Number */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="64" width="64" className="inline-block">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="8" stroke="url(#d)" d="M 8,4 H 56 L 32,60 H 24 L 44,12 H 8 Z" className="dash" pathLength="360"></path>
          </svg>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        .p57-loader {
          display: flex;
          margin: 0.25em 0;
          align-items: center;
          justify-content: center;
          scale: 3;
        }

        .w-2 {
          width: 0.5em;
        }

        .absolute {
          position: absolute;
        }

        .inline-block {
          display: inline-block;
        }

        .dash {
          animation: dashArray 4s ease-in-out infinite,
            dashOffset 4s linear infinite;
        }

        .spin {
          animation: spinDashArray 4s ease-in-out infinite,
            spin 12s ease-in-out infinite,
            dashOffset 4s linear infinite;
          transform-origin: center;
        }

        @keyframes dashArray {
          0% {
            stroke-dasharray: 0 1 359 0;
          }
          50% {
            stroke-dasharray: 0 359 1 0;
          }
          100% {
            stroke-dasharray: 359 1 0 0;
          }
        }

        @keyframes spinDashArray {
          0% {
            stroke-dasharray: 270 90;
          }
          50% {
            stroke-dasharray: 0 360;
          }
          100% {
            stroke-dasharray: 270 90;
          }
        }

        @keyframes dashOffset {
          0% {
            stroke-dashoffset: 365;
          }
          100% {
            stroke-dashoffset: 5;
          }
        }

        @keyframes spin {
          0% {
            rotate: 0deg;
          }
          12.5%, 25% {
            rotate: 270deg;
          }
          37.5%, 50% {
            rotate: 540deg;
          }
          62.5%, 75% {
            rotate: 810deg;
          }
          87.5%, 100% {
            rotate: 1080deg;
          }
        }
      `}</style>
    </div>
  );
};
