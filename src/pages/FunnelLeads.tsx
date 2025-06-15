
import React from 'react';
import { LeadsSection } from '@/components/dashboard/LeadsSection';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Filter } from 'lucide-react';
import { Footer } from '@/components/ui/footer';

const FunnelLeads = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-green-900/90 to-teal-900/80">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-teal-600/20 to-green-600/20" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(34,197,94,0.3),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(20,184,166,0.2),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,_rgba(16,185,129,0.2),_transparent_50%)]" />
        </div>
        
        <div className="relative px-8 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                size="sm" 
                className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
            </div>
            
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                <Filter className="w-5 h-5 text-green-300" />
                <span className="font-semibold text-white">Lead Analytics</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-green-100 to-teal-200 bg-clip-text text-transparent">
                Funnel & Lead Performance
              </h1>
              
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Track lead generation, conversion rates, and funnel performance to optimize your customer acquisition strategy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content Area */}
      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          <LeadsSection />
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default FunnelLeads;
