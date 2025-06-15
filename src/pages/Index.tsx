
import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { designTokens } from '@/utils/designTokens';

// Memoized stats card component
const StatsCard = memo(({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className={`${designTokens.card.background} backdrop-blur-sm rounded-xl px-8 py-6 ${designTokens.card.shadow} border border-slate-200/50 transform hover:scale-105 transition-all duration-300`}>
    <div className="text-3xl font-bold text-slate-900">{title}</div>
    <div className="text-sm text-slate-600 font-medium">{subtitle}</div>
  </div>
));

// Memoized animated background element
const AnimatedElement = memo(({ className, delay = 0 }: { className: string; delay?: number }) => (
  <div 
    className={className}
    style={{ animationDelay: `${delay}s` }}
  ></div>
));

const Index = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useGoogleSheets();

  const handleSectionClick = useCallback((sectionId: string) => {
    navigate(`/${sectionId}`);
  }, [navigate]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        <div className="container mx-auto px-8 py-16">
          <LoadingSkeleton type="full-page" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center p-4">
        <Card className={`p-12 ${designTokens.card.background} backdrop-blur-sm ${designTokens.card.shadow} ${designTokens.card.border} rounded-2xl max-w-lg`}>
          <CardContent className="text-center space-y-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div>
              <p className="text-xl font-semibold text-slate-800">Connection Error</p>
              <p className="text-sm text-slate-600 mt-2">{error}</p>
            </div>
            <Button onClick={handleRetry} className="gap-2 bg-slate-800 hover:bg-slate-900 text-white">
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
      {/* Optimized Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 via-purple-50/20 to-pink-50/30"></div>
        
        <div className="absolute right-0 top-0 h-full w-3/5 opacity-15">
          <div className="relative h-full w-full">
            {/* Optimized animated elements */}
            <AnimatedElement 
              className="absolute top-1/4 right-1/4 w-32 h-48 animate-pulse"
              delay={0.5}
            />
            
            <AnimatedElement 
              className="absolute top-1/3 right-1/2 w-24 h-32 animate-pulse"
              delay={1}
            />
            
            <div className="absolute top-1/2 right-1/3 space-y-4">
              <AnimatedElement className="w-2 h-2 bg-purple-300 rounded-full animate-bounce opacity-40" delay={0} />
              <AnimatedElement className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce opacity-30" delay={0.5} />
              <AnimatedElement className="w-2.5 h-2.5 bg-rose-300 rounded-full animate-bounce opacity-50" delay={1} />
            </div>
          </div>
          
          <div className="absolute inset-0 bg-white/40"></div>
        </div>
        
        {/* Optimized decorative elements */}
        <AnimatedElement className="absolute top-32 left-16 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl animate-pulse" />
        <AnimatedElement className="absolute top-64 right-32 w-32 h-32 bg-pink-200/15 rounded-full blur-2xl animate-pulse" delay={1} />
        <AnimatedElement className="absolute bottom-32 left-24 w-28 h-28 bg-rose-100/25 rounded-full blur-2xl animate-pulse" delay={2} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-8 py-16">
          {/* Optimized Header Section */}
          <header className="mb-20 text-center">
            <div className="inline-flex items-center justify-center mb-8 w-full max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-12 py-4 rounded-full text-base font-medium shadow-xl w-full text-center tracking-wide">
                Business Intelligence Dashboard
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-slate-900 mb-4 tracking-tight font-serif">
              <span className="font-extralight">Physique</span>{' '}
              <span className="font-bold animate-color-cycle text-8xl">57</span>
              <span className="text-slate-600 font-light">, India</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 font-light mb-12 max-w-4xl mx-auto leading-relaxed">
              Advanced Business Analytics
            </p>
            
            {/* Optimized Stats Cards */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <StatsCard title="Real-time" subtitle="Data Insights" />
              <StatsCard title="8+" subtitle="Analytics Modules" />
              <StatsCard title="Precision" subtitle="Data Accuracy" />
            </div>

            <div className="w-24 h-px bg-slate-300 mx-auto mb-8"></div>
          </header>

          {/* Optimized Dashboard Grid */}
          <main className="max-w-7xl mx-auto">
            <div className={`${designTokens.card.background} backdrop-blur-sm rounded-3xl p-12 ${designTokens.card.shadow} border border-slate-200/30`}>
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
