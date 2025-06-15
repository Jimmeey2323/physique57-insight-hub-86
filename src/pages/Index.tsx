
import React, { useState } from 'react';
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation';
import { SalesAnalyticsSection } from '@/components/dashboard/SalesAnalyticsSection';
import { NewClientSection } from '@/components/dashboard/NewClientSection';
import { TrainerPerformanceSection } from '@/components/dashboard/TrainerPerformanceSection';
import { LeadsSection } from '@/components/dashboard/LeadsSection';
import { ClassAttendanceSection } from '@/components/dashboard/ClassAttendanceSection';
import { DiscountsSection } from '@/components/dashboard/DiscountsSection';
import { SessionsSection } from '@/components/dashboard/SessionsSection';
import { ExecutiveSummarySection } from '@/components/dashboard/ExecutiveSummarySection';
import { Footer } from '@/components/ui/footer';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, RefreshCw, BarChart3, Calendar, TrendingUp, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeSection, setActiveSection] = useState('executive-summary');
  const { data, loading, error, refetch } = useGoogleSheets();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <div>
              <p className="text-lg font-semibold text-slate-800">Loading Dashboard</p>
              <p className="text-sm text-slate-600">Fetching latest sales data from Google Sheets...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl max-w-md">
          <CardContent className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-slate-800">Connection Error</p>
              <p className="text-sm text-slate-600 mt-2">{error}</p>
            </div>
            <Button onClick={refetch} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'executive-summary':
        return <ExecutiveSummarySection />;
      case 'sales-analytics':
        return <SalesAnalyticsSection data={data} />;
      case 'client-retention':
        return <NewClientSection />;
      case 'funnel-leads':
        return <LeadsSection />;
      case 'trainer-performance':
        return <TrainerPerformanceSection />;
      case 'class-attendance':
        return <ClassAttendanceSection />;
      case 'discounts-promotions':
        return <DiscountsSection />;
      case 'sessions':
        return <SessionsSection />;
      default:
        return <ExecutiveSummarySection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          {/* Ultra-modern sophisticated title */}
          <div className="relative mb-8 group">
            {/* Background effects */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            </div>
            
            {/* Main title container */}
            <div className="relative">
              {/* Glassmorphism container */}
              <div className="relative p-12 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/30 shadow-2xl overflow-hidden group-hover:shadow-3xl transition-all duration-700">
                {/* Animated border gradient */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 animate-border-rotate"></div>
                <div className="absolute inset-[1px] rounded-3xl bg-white/80 backdrop-blur-xl"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Physique 57 */}
                  <div className="flex items-center justify-center gap-6 mb-4">
                    <div className="relative">
                      <h1 className="text-6xl md:text-7xl lg:text-8xl font-extralight tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 animate-text-shimmer-slow">
                        Physique
                      </h1>
                      <div className="absolute -bottom-2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-400 to-transparent animate-shimmer-line"></div>
                    </div>
                    
                    {/* 57 with special treatment */}
                    <div className="relative">
                      <div className="absolute inset-0 blur-lg bg-gradient-to-r from-blue-600 to-purple-600 opacity-30 animate-pulse-soft"></div>
                      <span className="relative text-7xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 bg-clip-text text-transparent animate-gradient-flow">
                        57
                      </span>
                    </div>
                  </div>
                  
                  {/* India */}
                  <div className="relative">
                    <p className="text-3xl md:text-4xl lg:text-5xl font-light italic tracking-[0.2em] text-slate-700 opacity-90 animate-fade-in-up">
                      India
                    </p>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-[1px] bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
                  </div>
                </div>
                
                {/* Floating decorative elements */}
                <div className="absolute top-6 right-6 w-2 h-2 bg-blue-500 rounded-full animate-float opacity-60"></div>
                <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-purple-500 rounded-full animate-float-delayed opacity-60"></div>
                <div className="absolute top-1/3 right-12 w-1 h-1 bg-pink-500 rounded-full animate-pulse opacity-40"></div>
              </div>
            </div>
          </div>
          
          <p className="text-xl text-slate-600 font-medium animate-fade-in opacity-80">
            Advanced Analytics Dashboard
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full animate-shimmer"></div>
        </header>

        <DashboardNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <main className="space-y-8">
          {renderActiveSection()}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
