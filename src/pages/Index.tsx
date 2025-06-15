
import React from 'react';
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

  const handleSectionClick = (sectionId: string) => {
    navigate(`/${sectionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Loading Dashboard</p>
              <p className="text-sm text-gray-600">Fetching latest sales data from Google Sheets...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-2xl border-0 max-w-md">
          <CardContent className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Connection Error</p>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
            </div>
            <Button onClick={refetch} className="gap-2 bg-rose-600 hover:bg-rose-700">
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
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-white to-purple-50/60"></div>
        
        {/* Animated Barre Workout Silhouette */}
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-5">
          <svg viewBox="0 0 400 600" className="h-full w-full animate-pulse">
            {/* Barre */}
            <rect x="50" y="120" width="300" height="8" rx="4" fill="currentColor" className="text-rose-300" />
            
            {/* Woman Figure */}
            <g className="animate-bounce" style={{ animationDuration: '4s' }}>
              {/* Head */}
              <circle cx="200" cy="80" r="25" fill="currentColor" className="text-rose-400" />
              
              {/* Hair */}
              <path d="M175 70 Q190 55 210 65 Q220 75 215 90 Q200 85 185 80" fill="currentColor" className="text-rose-500" />
              
              {/* Body */}
              <ellipse cx="200" cy="180" rx="40" ry="80" fill="currentColor" className="text-rose-400" />
              
              {/* Arms */}
              <ellipse cx="160" cy="140" rx="15" ry="50" fill="currentColor" className="text-rose-400" transform="rotate(-30 160 140)" />
              <ellipse cx="240" cy="140" rx="15" ry="50" fill="currentColor" className="text-rose-400" transform="rotate(30 240 140)" />
              
              {/* Legs in barre position */}
              <ellipse cx="180" cy="300" rx="18" ry="70" fill="currentColor" className="text-rose-400" transform="rotate(-15 180 300)" />
              <ellipse cx="220" cy="300" rx="18" ry="70" fill="currentColor" className="text-rose-400" transform="rotate(45 220 300)" />
              
              {/* Feet */}
              <ellipse cx="160" cy="380" rx="12" ry="8" fill="currentColor" className="text-rose-500" />
              <ellipse cx="250" cy="350" rx="12" ry="8" fill="currentColor" className="text-rose-500" />
            </g>
            
            {/* Floating Elements */}
            <circle cx="100" cy="200" r="3" fill="currentColor" className="text-purple-300 animate-ping" style={{ animationDelay: '1s' }} />
            <circle cx="320" cy="300" r="2" fill="currentColor" className="text-rose-300 animate-ping" style={{ animationDelay: '2s' }} />
            <circle cx="80" cy="350" r="2" fill="currentColor" className="text-purple-300 animate-ping" style={{ animationDelay: '3s' }} />
          </svg>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-purple-200/30 rounded-full blur-xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-12">
          {/* Header Section */}
          <header className="mb-16 text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                ✨ Studio Analytics Dashboard
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
              Studio Insights
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Transform your fitness studio with powerful analytics and data-driven insights. 
              Track performance, optimize operations, and grow your business.
            </p>
            
            {/* Stats Cards */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/20">
                <div className="text-2xl font-bold text-rose-600">24/7</div>
                <div className="text-sm text-gray-600">Real-time Analytics</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/20">
                <div className="text-2xl font-bold text-purple-600">8+</div>
                <div className="text-sm text-gray-600">Analytics Modules</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/20">
                <div className="text-2xl font-bold text-indigo-600">100%</div>
                <div className="text-sm text-gray-600">Data Accuracy</div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent mb-8"></div>
          </header>

          {/* Dashboard Grid */}
          <main className="max-w-7xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
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
