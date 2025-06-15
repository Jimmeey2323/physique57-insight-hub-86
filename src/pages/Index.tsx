
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
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Physique 57 India
          </h1>
          <p className="text-xl text-slate-600 font-medium">
            Advanced Analytics Dashboard
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </header>

        <DashboardNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <main className="space-y-8">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
};

export default Index;
