
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();

  const handleButtonClick = (buttonId: string) => {
    switch (buttonId) {
      case 'executive-summary':
        navigate('/executive-summary');
        break;
      case 'sales-analytics':
        navigate('/sales-analytics');
        break;
      case 'funnel-leads':
        navigate('/funnel-leads');
        break;
      case 'client-retention':
        navigate('/client-retention');
        break;
      case 'trainer-performance':
        navigate('/trainer-performance');
        break;
      case 'class-attendance':
        navigate('/class-attendance');
        break;
      case 'discounts-promotions':
        navigate('/discounts-promotions');
        break;
      case 'sessions':
        navigate('/sessions');
        break;
      case 'powercycle-vs-barre':
        navigate('/powercycle-vs-barre');
        break;
      default:
        console.log('Unknown button clicked:', buttonId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-tight">
              Business Intelligence
              <span className="block font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed">
              Transform your business data into actionable insights with comprehensive analytics
              and real-time performance monitoring
            </p>
            
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <DashboardGrid onButtonClick={handleButtonClick} />
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <p className="text-lg font-light">
              Powered by advanced analytics and real-time data processing
            </p>
            <p className="text-sm text-slate-500">
              © 2025 Business Intelligence Dashboard. Built with precision and care.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
