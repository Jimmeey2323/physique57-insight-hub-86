
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import DashboardTitle from '@/components/ui/DashboardTitle';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useGoogleSheets();
  const [colorIndex, setColorIndex] = useState(0);

  const colors = [
    'text-blue-600',
    'text-purple-600',
    'text-pink-600',
    'text-emerald-600',
    'text-orange-600',
    'text-indigo-600',
    'text-teal-600',
    'text-rose-600'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [colors.length]);

  const handleSectionClick = (sectionId: string) => {
    navigate(`/${sectionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="p-12 bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl">
          <CardContent className="flex items-center gap-6">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <div>
              <p className="text-xl font-semibold text-slate-800">Loading Analytics Dashboard</p>
              <p className="text-sm text-slate-600 mt-1">Fetching latest business data from Google Sheets...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="p-12 bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl max-w-lg">
          <CardContent className="text-center space-y-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div>
              <p className="text-xl font-semibold text-slate-800">Connection Error</p>
              <p className="text-sm text-slate-600 mt-2">{error}</p>
            </div>
            <Button onClick={refetch} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Enhanced Background with Colors */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Vibrant Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-purple-100/30 to-pink-100/40"></div>
        
        {/* Colorful Floating Elements */}
        <div className="absolute top-32 left-16 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-64 right-32 w-40 h-40 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-24 w-36 h-36 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-48 right-16 w-28 h-28 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        
        {/* Enhanced Barre Workout Silhouette with Colors */}
        <div className="absolute right-0 top-0 h-full w-2/5 opacity-[0.08]">
          <svg viewBox="0 0 400 600" className="h-full w-full">
            {/* Colorful Barre */}
            <defs>
              <linearGradient id="barreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <rect x="80" y="140" width="240" height="6" rx="3" fill="url(#barreGradient)" />
            
            {/* Refined Woman Figure with Gradient */}
            <g className="animate-pulse" style={{ animationDuration: '6s' }}>
              <defs>
                <linearGradient id="figureGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              
              {/* Head */}
              <circle cx="200" cy="90" r="22" fill="url(#figureGradient)" />
              
              {/* Hair in Bun */}
              <circle cx="190" cy="75" r="12" fill="#4F46E5" />
              
              {/* Torso */}
              <ellipse cx="200" cy="190" rx="35" ry="75" fill="url(#figureGradient)" />
              
              {/* Arms in Barre Position */}
              <ellipse cx="170" cy="150" rx="12" ry="45" fill="url(#figureGradient)" transform="rotate(-20 170 150)" />
              <ellipse cx="230" cy="150" rx="12" ry="45" fill="url(#figureGradient)" transform="rotate(20 230 150)" />
              
              {/* Legs in Elegant Barre Pose */}
              <ellipse cx="185" cy="310" rx="15" ry="65" fill="url(#figureGradient)" transform="rotate(-10 185 310)" />
              <ellipse cx="215" cy="310" rx="15" ry="65" fill="url(#figureGradient)" transform="rotate(35 215 310)" />
              
              {/* Ballet Feet */}
              <ellipse cx="170" cy="385" rx="10" ry="6" fill="#7C3AED" />
              <ellipse cx="240" cy="365" rx="10" ry="6" fill="#7C3AED" />
            </g>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-8 py-16">
          {/* Enhanced Header Section with Colors */}
          <header className="mb-20 text-center">
            {/* Colorful Business Badge */}
            <div className="inline-flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-3 rounded-full text-sm font-medium shadow-lg">
                Business Intelligence Dashboard
              </div>
            </div>
            
            {/* Main Title with Color-Changing 57 */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-slate-900 mb-4 tracking-tight">
              <span className="font-extralight">Physique</span>{' '}
              <span className={`font-bold transition-colors duration-1000 ${colors[colorIndex]}`}>57</span>
              <span className="text-slate-600 font-light">, India</span>
            </h1>
            
            {/* Subtitle with Gradient */}
            <p className="text-xl md:text-2xl bg-gradient-to-r from-slate-600 via-purple-600 to-blue-600 bg-clip-text text-transparent font-light mb-12 max-w-4xl mx-auto leading-relaxed">
              Advanced Business Analytics
            </p>
            
            {/* Colorful Stats Cards */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 backdrop-blur-sm rounded-xl px-8 py-6 shadow-lg border border-blue-200/50">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Real-time</div>
                <div className="text-sm text-blue-600 font-medium">Data Insights</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 backdrop-blur-sm rounded-xl px-8 py-6 shadow-lg border border-purple-200/50">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">8+</div>
                <div className="text-sm text-purple-600 font-medium">Analytics Modules</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 backdrop-blur-sm rounded-xl px-8 py-6 shadow-lg border border-emerald-200/50">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Precision</div>
                <div className="text-sm text-emerald-600 font-medium">Data Accuracy</div>
              </div>
            </div>

            {/* Colorful Divider */}
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto mb-8"></div>
          </header>

          {/* Dashboard Grid with Enhanced Background */}
          <main className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20 ring-1 ring-purple-100/50">
              <DashboardGrid onButtonClick={handleSectionClick} />
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
