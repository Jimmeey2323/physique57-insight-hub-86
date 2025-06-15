
import React from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { PowerCycleVsBarreSection } from '@/components/dashboard/PowerCycleVsBarreSection';

const PowerCycleVsBarre = () => {
  return (
    <SectionLayout title="PowerCycle vs Barre Analysis">
      <PowerCycleVsBarreSection />
    </SectionLayout>
  );
};

export default PowerCycleVsBarre;
