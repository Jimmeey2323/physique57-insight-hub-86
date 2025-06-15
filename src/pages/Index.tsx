
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <Card className="p-12 bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl">
          <CardContent className="flex items-center gap-6">
            <Loader2 className="w-10 h-10 animate-spin text-slate-700" />
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
      {/* Refined Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-white to-gray-50/20"></div>
        
        {/* Elegant Barre Workout Silhouette */}
        <div className="absolute right-0 top-0 h-full w-2/5 opacity-3">
          <svg viewBox="0 0 400 600" className="h-full w-full">
            {/* Barre */}
            <rect x="80" y="140" width="240" height="6" rx="3" fill="currentColor" className="text-slate-300" />
            
            {/* Refined Woman Figure */}
            <g className="animate-pulse" style={{ animationDuration: '6s' }}>
              {/* Head */}
              <circle cx="200" cy="90" r="22" fill="currentColor" className="text-slate-400" />
              
              {/* Hair in Bun */}
              <circle cx="190" cy="75" r="12" fill="currentColor" className="text-slate-500" />
              
              {/* Torso */}
              <ellipse cx="200" cy="190" rx="35" ry="75" fill="currentColor" className="text-slate-400" />
              
              {/* Arms in Barre Position */}
              <ellipse cx="170" cy="150" rx="12" ry="45" fill="currentColor" className="text-slate-400" transform="rotate(-20 170 150)" />
              <ellipse cx="230" cy="150" rx="12" ry="45" fill="currentColor" className="text-slate-400" transform="rotate(20 230 150)" />
              
              {/* Legs in Elegant Barre Pose */}
              <ellipse cx="185" cy="310" rx="15" ry="65" fill="currentColor" className="text-slate-400" transform="rotate(-10 185 310)" />
              <ellipse cx="215" cy="310" rx="15" ry="65" fill="currentColor" className="text-slate-400" transform="rotate(35 215 310)" />
              
              {/* Ballet Feet */}
              <ellipse cx="170" cy="385" rx="10" ry="6" fill="currentColor" className="text-slate-500" />
              <ellipse cx="240" cy="365" rx="10" ry="6" fill="currentColor" className="text-slate-500" />
            </g>
          </svg>
        </div>
        
        {/* Subtle Decorative Elements */}
        <div className="absolute top-32 left-16 w-24 h-24 bg-slate-200/20 rounded-full blur-2xl"></div>
        <div className="absolute top-64 right-32 w-32 h-32 bg-gray-200/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-24 w-28 h-28 bg-slate-100/25 rounded-full blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-8 py-16">
          {/* Refined Header Section */}
          <header className="mb-20 text-center">
            {/* Business Badge */}
            <div className="inline-flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-8 py-3 rounded-full text-sm font-medium shadow-lg animate-pulse">
                Business Intelligence Dashboard
              </div>
            </div>
            
            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-slate-900 mb-4 tracking-tight">
              <span className="font-extralight">Physique</span>{' '}
              <span className="font-bold animate-pulse" style={{
                background: 'linear-gradient(-45deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899)',
                backgroundSize: '400% 400%',
                animation: 'gradient 4s ease infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>57</span>
              <span className="text-slate-600 font-light">, India</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-600 font-light mb-12 max-w-4xl mx-auto leading-relaxed">
              Advanced Business Analytics
            </p>
            
            {/* Refined Stats Cards */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-8 py-6 shadow-lg border border-slate-200/50">
                <div className="text-3xl font-bold text-slate-900">Real-time</div>
                <div className="text-sm text-slate-600 font-medium">Data Insights</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-8 py-6 shadow-lg border border-slate-200/50">
                <div className="text-3xl font-bold text-slate-900">8+</div>
                <div className="text-sm text-slate-600 font-medium">Analytics Modules</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-8 py-6 shadow-lg border border-slate-200/50">
                <div className="text-3xl font-bold text-slate-900">Precision</div>
                <div className="text-sm text-slate-600 font-medium">Data Accuracy</div>
              </div>
            </div>

            {/* Elegant Divider */}
            <div className="w-24 h-px bg-slate-300 mx-auto mb-8"></div>
          </header>

          {/* Dashboard Grid */}
          <main className="max-w-7xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-slate-200/30">
              <DashboardGrid onButtonClick={handleSectionClick} />
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
      
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default Index;
