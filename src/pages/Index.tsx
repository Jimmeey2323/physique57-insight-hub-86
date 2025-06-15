
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
          {/* Beautiful animated title with sophisticated styling */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-4 text-slate-300 opacity-50">
                <BarChart3 className="w-8 h-8 animate-pulse" />
                <Calendar className="w-8 h-8 animate-pulse animation-delay-1000" />
                <TrendingUp className="w-8 h-8 animate-pulse animation-delay-2000" />
                <Target className="w-8 h-8 animate-pulse animation-delay-3000" />
              </div>
            </div>
            
            <div className="relative text-center animate-fade-in">
              <div className="mb-4">
                <div className="relative inline-block group">
                  {/* Glowing background effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-700 animate-pulse-slow"></div>
                  
                  {/* Main text container */}
                  <div className="relative px-8 py-4 bg-gradient-to-r from-white/80 via-white/90 to-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-2xl">
                    <div className="flex items-center justify-center space-x-4">
                      {/* Physique text */}
                      <span className="text-5xl md:text-7xl font-light bg-gradient-to-r from-slate-700 via-blue-700 to-slate-800 bg-clip-text text-transparent tracking-wide relative">
                        Physique
                        <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60"></div>
                      </span>
                      
                      {/* 57 text with special styling */}
                      <div className="relative">
                        <span className="text-6xl md:text-8xl font-bold bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent relative">
                          57
                        </span>
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-20 animate-pulse-slow"></div>
                      </div>
                    </div>
                    
                    {/* India text */}
                    <div className="mt-2">
                      <span className="text-3xl md:text-4xl font-light italic bg-gradient-to-r from-slate-600 via-slate-700 to-slate-600 bg-clip-text text-transparent tracking-wider">
                        India
                      </span>
                    </div>
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 w-3 h-3 bg-blue-500 rounded-full animate-bounce animation-delay-1000 opacity-60"></div>
                  <div className="absolute -bottom-4 -left-4 w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-2000 opacity-60"></div>
                  <div className="absolute top-1/2 -right-8 w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping animation-delay-3000 opacity-60"></div>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-xl text-slate-600 font-medium animate-fade-in">
            Advanced Analytics Dashboard
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full animate-fade-in"></div>
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
