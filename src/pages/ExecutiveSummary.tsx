import React from 'react';
import ExecutiveSummarySection from '@/components/dashboard/ExecutiveSummarySection';
import { Footer } from '@/components/ui/footer';
import { PageHeader } from '@/components/ui/PageHeader';
import { BarChart3 } from 'lucide-react';

const ExecutiveSummary = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <PageHeader
        icon={<BarChart3 className="w-5 h-5" />}
        title="Executive Summary"
        subtitle="Strategic performance overview and key business metrics across all operations"
      />

      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          <ExecutiveSummarySection />
        </main>
      </div>

      <Footer />

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};

export default ExecutiveSummary;
