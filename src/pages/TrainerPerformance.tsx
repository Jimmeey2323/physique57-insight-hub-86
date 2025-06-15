
import React from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { TrainerPerformanceSection } from '@/components/dashboard/TrainerPerformanceSection';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { usePayrollData } from '@/hooks/usePayrollData';

const TrainerPerformance = () => {
  const { isLoading } = usePayrollData();

  if (isLoading) {
    return <RefinedLoader subtitle="Loading trainer performance analytics..." />;
  }

  return (
    <SectionLayout title="Trainer Performance & Analytics">
      <TrainerPerformanceSection />
    </SectionLayout>
  );
};

export default TrainerPerformance;
