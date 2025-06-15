
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
      {/* Animated Barre Studio Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 via-purple-50/20 to-pink-50/30"></div>
        
        {/* Animated Barre Studio Illustration */}
        <div className="absolute right-0 top-0 h-full w-3/5 opacity-15">
          <div className="relative h-full w-full">
            {/* Animated woman figure at barre */}
            <div className="absolute top-1/4 right-1/4 w-32 h-48 animate-pulse">
              <svg viewBox="0 0 200 300" className="w-full h-full text-purple-300">
                {/* Barre */}
                <rect x="10" y="120" width="80" height="4" fill="currentColor" className="animate-pulse" />
                <rect x="8" y="0" width="4" height="140" fill="currentColor" />
                <rect x="86" y="0" width="4" height="140" fill="currentColor" />
                
                {/* Woman figure */}
                <g className="animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>
                  {/* Head */}
                  <circle cx="120" cy="30" r="15" fill="currentColor" opacity="0.6" />
                  {/* Hair bun */}
                  <circle cx="125" cy="20" r="8" fill="currentColor" opacity="0.4" />
                  
                  {/* Body */}
                  <rect x="110" y="45" width="20" height="40" rx="10" fill="currentColor" opacity="0.5" />
                  
                  {/* Arms */}
                  <rect x="95" y="50" width="15" height="4" rx="2" fill="currentColor" opacity="0.6" transform="rotate(-15 102 52)" />
                  <rect x="130" y="50" width="15" height="4" rx="2" fill="currentColor" opacity="0.6" transform="rotate(15 137 52)" />
                  
                  {/* Legs in barre position */}
                  <rect x="105" y="85" width="6" height="30" rx="3" fill="currentColor" opacity="0.6" transform="rotate(-10 108 100)" />
                  <rect x="125" y="85" width="6" height="30" rx="3" fill="currentColor" opacity="0.6" transform="rotate(45 128 100)" />
                  
                  {/* Extended leg */}
                  <rect x="135" y="95" width="25" height="4" rx="2" fill="currentColor" opacity="0.6" transform="rotate(10 147 97)" />
                </g>
              </svg>
            </div>
            
            {/* Additional animated elements */}
            <div className="absolute top-1/3 right-1/2 w-24 h-32 animate-pulse" style={{ animationDelay: '1s' }}>
              <svg viewBox="0 0 150 200" className="w-full h-full text-pink-300">
                {/* Mirror */}
                <rect x="20" y="20" width="60" height="80" rx="5" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                <rect x="25" y="25" width="50" height="70" rx="3" fill="currentColor" opacity="0.1" />
                
                {/* Reflection of movement */}
                <g opacity="0.2" className="animate-pulse" style={{ animationDuration: '2s' }}>
                  <circle cx="50" cy="40" r="8" fill="currentColor" />
                  <rect x="45" y="48" width="10" height="20" rx="5" fill="currentColor" />
                  <rect x="40" y="68" width="8" height="15" rx="4" fill="currentColor" transform="rotate(-20 44 75)" />
                  <rect x="52" y="68" width="8" height="15" rx="4" fill="currentColor" transform="rotate(30 56 75)" />
                </g>
              </svg>
            </div>
            
            {/* Floating elements representing movement */}
            <div className="absolute top-1/2 right-1/3 space-y-4">
              <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce opacity-40" style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
              <div className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce opacity-30" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}></div>
              <div className="w-2.5 h-2.5 bg-rose-300 rounded-full animate-bounce opacity-50" style={{ animationDelay: '1s', animationDuration: '1.8s' }}></div>
            </div>
          </div>
          
          {/* Soft overlay for better text readability */}
          <div className="absolute inset-0 bg-white/40"></div>
        </div>
        
        {/* Subtle Decorative Elements */}
        <div className="absolute top-32 left-16 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-64 right-32 w-32 h-32 bg-pink-200/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-24 w-28 h-28 bg-rose-100/25 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-8 py-16">
          {/* Refined Header Section */}
          <header className="mb-20 text-center">
            {/* Business Badge - Full Width */}
            <div className="inline-flex items-center justify-center mb-8 w-full max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-12 py-4 rounded-full text-base font-medium shadow-xl w-full text-center tracking-wide">
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
      
      <style>{`
        @keyframes color-cycle {
          0% { color: #3b82f6; }
          25% { color: #ef4444; }
          50% { color: #6366f1; }
          75% { color: #8b5cf6; }
          100% { color: #3b82f6; }
        }
        
        .animate-color-cycle {
          animation: color-cycle 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Index;
