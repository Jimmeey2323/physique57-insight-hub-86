
import React from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { TrainerPerformanceSection } from '@/components/dashboard/TrainerPerformanceSection';

const TrainerPerformance = () => {
  return (
    <SectionLayout title="Trainer Performance & Analytics">
      <TrainerPerformanceSection />
    </SectionLayout>
  );
};

export default TrainerPerformance;
