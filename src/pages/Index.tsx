
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import DashboardTitle from '@/components/ui/DashboardTitle';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, RefreshCw, TrendingUp, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useGoogleSheets();

  const handleSectionClick = (sectionId: string) => {
    navigate(`/${sectionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <Card className="p-12 bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-3xl">
          <CardContent className="flex items-center gap-6">
            <div className="relative">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
              <div className="absolute inset-0 w-10 h-10 border-2 border-indigo-200 rounded-full animate-pulse"></div>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">Loading Dashboard</p>
              <p className="text-sm text-gray-500">Fetching latest sales data from Google Sheets...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center p-4">
        <Card className="p-12 bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-3xl max-w-md">
          <CardContent className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">Connection Error</p>
              <p className="text-sm text-gray-500 mt-2">{error}</p>
            </div>
            <Button onClick={refetch} className="gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6">
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Sophisticated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-gray-900" />
          </svg>
        </div>

        {/* Animated Barre Workout Silhouette - More Sophisticated */}
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-[0.03]">
          <svg viewBox="0 0 500 700" className="h-full w-full">
            {/* Barre */}
            <rect x="80" y="150" width="340" height="12" rx="6" fill="currentColor" className="text-gray-600" />
            
            {/* Woman Figure - More Detailed */}
            <g className="animate-pulse" style={{ animationDuration: '6s' }}>
              {/* Head */}
              <circle cx="250" cy="100" r="28" fill="currentColor" className="text-gray-500" />
              
              {/* Hair Bun */}
              <circle cx="250" cy="85" r="15" fill="currentColor" className="text-gray-600" />
              
              {/* Neck */}
              <rect x="245" y="125" width="10" height="20" rx="5" fill="currentColor" className="text-gray-500" />
              
              {/* Torso */}
              <ellipse cx="250" cy="220" rx="45" ry="85" fill="currentColor" className="text-gray-500" />
              
              {/* Arms in Ballet Position */}
              <ellipse cx="200" cy="180" rx="18" ry="55" fill="currentColor" className="text-gray-500" transform="rotate(-25 200 180)" />
              <ellipse cx="300" cy="180" rx="18" ry="55" fill="currentColor" className="text-gray-500" transform="rotate(25 300 180)" />
              
              {/* Hands */}
              <circle cx="170" cy="160" r="8" fill="currentColor" className="text-gray-600" />
              <circle cx="330" cy="160" r="8" fill="currentColor" className="text-gray-600" />
              
              {/* Legs in Barre Position */}
              <ellipse cx="230" cy="350" rx="20" ry="75" fill="currentColor" className="text-gray-500" transform="rotate(-10 230 350)" />
              <ellipse cx="270" cy="350" rx="20" ry="75" fill="currentColor" className="text-gray-500" transform="rotate(35 270 350)" />
              
              {/* Ballet Shoes */}
              <ellipse cx="210" cy="430" rx="15" ry="10" fill="currentColor" className="text-gray-600" />
              <ellipse cx="300" cy="410" rx="15" ry="10" fill="currentColor" className="text-gray-600" />
            </g>
            
            {/* Floating Particles */}
            <circle cx="120" cy="250" r="3" fill="currentColor" className="text-gray-400 animate-ping" style={{ animationDelay: '0s', animationDuration: '4s' }} />
            <circle cx="380" cy="320" r="2" fill="currentColor" className="text-gray-400 animate-ping" style={{ animationDelay: '1.5s', animationDuration: '3s' }} />
            <circle cx="100" cy="400" r="2" fill="currentColor" className="text-gray-400 animate-ping" style={{ animationDelay: '3s', animationDuration: '5s' }} />
            <circle cx="420" cy="280" r="3" fill="currentColor" className="text-gray-400 animate-ping" style={{ animationDelay: '2s', animationDuration: '4s' }} />
          </svg>
        </div>
        
        {/* Subtle Gradient Overlays */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-50/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-50/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-50/20 via-indigo-50/20 to-purple-50/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-8 py-16">
          {/* Premium Header Section */}
          <header className="mb-20">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center justify-center mb-8">
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white px-8 py-3 rounded-full text-sm font-bold tracking-wide shadow-lg border border-white/20">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    ✨ Studio Analytics Dashboard
                  </span>
                </div>
              </div>
              
              {/* Main Title */}
              <div className="space-y-6 mb-12">
                <h1 className="text-7xl md:text-8xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    Studio
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                    Insights
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
                  Transform your fitness studio with powerful analytics and data-driven insights. 
                  Track performance, optimize operations, and grow your business.
                </p>
              </div>
              
              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                <Card className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                  <CardContent className="p-8 text-center">
                    <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <BarChart3 className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-3xl font-black text-indigo-600 mb-2">24/7</div>
                    <div className="text-sm font-semibold text-gray-600 tracking-wide">Real-time Analytics</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                  <CardContent className="p-8 text-center">
                    <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-3xl font-black text-purple-600 mb-2">8+</div>
                    <div className="text-sm font-semibold text-gray-600 tracking-wide">Analytics Modules</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                  <CardContent className="p-8 text-center">
                    <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-3xl font-black text-emerald-600 mb-2">100%</div>
                    <div className="text-sm font-semibold text-gray-600 tracking-wide">Data Accuracy</div>
                  </CardContent>
                </Card>
              </div>

              {/* Elegant Separator */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-gray-300 max-w-xs"></div>
                <div className="px-6">
                  <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"></div>
                </div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-300 to-gray-300 max-w-xs"></div>
              </div>
            </div>
          </header>

          {/* Enhanced Dashboard Grid Container */}
          <main className="max-w-7xl mx-auto">
            <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] p-12 shadow-2xl border border-gray-200/60 relative overflow-hidden">
              {/* Subtle Inner Pattern */}
              <div className="absolute inset-0 opacity-[0.01]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]"></div>
              </div>
              
              <div className="relative z-10">
                <DashboardGrid onButtonClick={handleSectionClick} />
              </div>
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
