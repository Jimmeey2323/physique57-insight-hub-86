
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import DashboardTitle from '@/components/ui/DashboardTitle';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RefinedLoader } from '@/components/ui/RefinedLoader';

const Index = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useGoogleSheets();

  const handleSectionClick = (sectionId: string) => {
    navigate(`/${sectionId}`);
  };

  if (loading) {
    return <RefinedLoader subtitle="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center p-4">
        <Card className="p-12 bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl max-w-lg">
          <CardContent className="text-center space-y-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div>
              <p className="text-xl font-semibold text-slate-800">Connection Error</p>
              <p className="text-sm text-slate-600 mt-2">{error}</p>
            </div>
            <Button onClick={refetch} className="gap-2 bg-slate-800 hover:bg-slate-900 text-white">
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Refined Background with Animated Barre Illustration */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-white to-pink-50/20"></div>
        
        {/* Animated Barre Studio Background */}
        <div className="absolute right-0 top-0 h-full w-2/5 opacity-15">
          {/* SVG Animated Illustration of Woman Performing Barre Workout */}
          <svg 
            viewBox="0 0 400 600" 
            className="h-full w-full object-cover"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Elements */}
            <defs>
              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="outfitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            
            {/* Barre */}
            <rect x="50" y="200" width="8" height="200" fill="#8b4513" rx="4">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 54 300;2 54 300;0 54 300"
                dur="6s"
                repeatCount="indefinite"
              />
            </rect>
            
            {/* Woman's Body */}
            <g transform="translate(120, 150)">
              {/* Head */}
              <circle cx="40" cy="30" r="18" fill="url(#bodyGrad)">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 40 30;-5 40 30;0 40 30;5 40 30;0 40 30"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </circle>
              
              {/* Hair */}
              <path d="M25 25 Q40 10 55 25 Q50 15 40 12 Q30 15 25 25" fill="#4a5568">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 40 20;-2 40 20;0 40 20;2 40 20;0 40 20"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </path>
              
              {/* Ponytail */}
              <ellipse cx="55" cy="25" rx="8" ry="15" fill="#4a5568">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 55 25;-10 55 25;0 55 25;10 55 25;0 55 25"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </ellipse>
              
              {/* Body */}
              <ellipse cx="40" cy="80" rx="20" ry="35" fill="url(#outfitGrad)">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 40 80;-3 40 80;0 40 80;3 40 80;0 40 80"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </ellipse>
              
              {/* Arms */}
              <ellipse cx="15" cy="70" rx="8" ry="25" fill="url(#bodyGrad)" transform="rotate(-20 15 70)">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="-20 15 70;-30 15 70;-20 15 70;-10 15 70;-20 15 70"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </ellipse>
              <ellipse cx="65" cy="70" rx="8" ry="25" fill="url(#bodyGrad)" transform="rotate(20 65 70)">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="20 65 70;10 65 70;20 65 70;30 65 70;20 65 70"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </ellipse>
              
              {/* Legs in Barre Position */}
              <ellipse cx="25" cy="140" rx="10" ry="30" fill="url(#bodyGrad)" transform="rotate(-15 25 140)">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="-15 25 140;-25 25 140;-15 25 140;-5 25 140;-15 25 140"
                  dur="7s"
                  repeatCount="indefinite"
                />
              </ellipse>
              <ellipse cx="55" cy="140" rx="10" ry="30" fill="url(#bodyGrad)" transform="rotate(15 55 140)">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="15 55 140;25 55 140;15 55 140;5 55 140;15 55 140"
                  dur="7s"
                  repeatCount="indefinite"
                />
              </ellipse>
              
              {/* Feet */}
              <ellipse cx="20" cy="175" rx="12" ry="6" fill="#2d3748" transform="rotate(-10 20 175)">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="-10 20 175;-15 20 175;-10 20 175;-5 20 175;-10 20 175"
                  dur="7s"
                  repeatCount="indefinite"
                />
              </ellipse>
              <ellipse cx="60" cy="175" rx="12" ry="6" fill="#2d3748" transform="rotate(10 60 175)">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="10 60 175;15 60 175;10 60 175;5 60 175;10 60 175"
                  dur="7s"
                  repeatCount="indefinite"
                />
              </ellipse>
            </g>
            
            {/* Floating Elements */}
            <circle cx="300" cy="100" r="3" fill="#fbbf24" opacity="0.6">
              <animate attributeName="cy" values="100;80;100" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="320" cy="150" r="2" fill="#8b5cf6" opacity="0.4">
              <animate attributeName="cy" values="150;130;150" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="280" cy="200" r="4" fill="#ec4899" opacity="0.5">
              <animate attributeName="cy" values="200;180;200" dur="5s" repeatCount="indefinite" />
            </circle>
          </svg>
          
          {/* Additional overlay for better text readability */}
          <div className="absolute inset-0 bg-white/30"></div>
        </div>
        
        {/* Subtle Decorative Elements */}
        <div className="absolute top-32 left-16 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-64 right-32 w-32 h-32 bg-pink-200/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-24 w-28 h-28 bg-yellow-100/25 rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-8 py-16">
          {/* Refined Header Section */}
          <header className="mb-20 text-center">
            {/* Business Badge - Full Width */}
            <div className="inline-flex items-center justify-center mb-8 w-full max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-purple-800 to-pink-800 text-white px-12 py-4 rounded-full text-base font-medium shadow-xl w-full text-center tracking-wide">
                Business Intelligence Dashboard
              </div>
            </div>
            
            {/* Main Title with Stylish Font */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-slate-900 mb-4 tracking-tight font-serif">
              <span className="font-extralight">Physique</span>{' '}
              <span className="font-bold animate-color-cycle text-8xl">57</span>
              <span className="text-slate-600 font-light">, India</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-600 font-light mb-12 max-w-4xl mx-auto leading-relaxed">
              Advanced Business Analytics
            </p>
            
            {/* Refined Stats Cards */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-8 py-6 shadow-lg border border-purple-200/50">
                <div className="text-3xl font-bold text-purple-900">Real-time</div>
                <div className="text-sm text-purple-600 font-medium">Data Insights</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-8 py-6 shadow-lg border border-pink-200/50">
                <div className="text-3xl font-bold text-pink-900">8+</div>
                <div className="text-sm text-pink-600 font-medium">Analytics Modules</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-8 py-6 shadow-lg border border-yellow-200/50">
                <div className="text-3xl font-bold text-yellow-900">Precision</div>
                <div className="text-sm text-yellow-600 font-medium">Data Accuracy</div>
              </div>
            </div>

            {/* Elegant Divider */}
            <div className="w-24 h-px bg-gradient-to-r from-purple-300 to-pink-300 mx-auto mb-8"></div>
          </header>

          {/* Dashboard Grid */}
          <main className="max-w-7xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-purple-200/30">
              <DashboardGrid onButtonClick={handleSectionClick} />
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
      
      <style>{`
        @keyframes color-cycle {
          0% { color: #8b5cf6; }
          25% { color: #ec4899; }
          50% { color: #f59e0b; }
          75% { color: #8b5cf6; }
          100% { color: #ec4899; }
        }
        
        .animate-color-cycle {
          animation: color-cycle 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Index;
