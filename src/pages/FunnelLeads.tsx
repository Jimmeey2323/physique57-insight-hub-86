
import React from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { LeadsSection } from '@/components/dashboard/LeadsSection';

const FunnelLeads = () => {
  return (
    <SectionLayout title="Funnel & Lead Performance">
      <LeadsSection />
    </SectionLayout>
  );
};

export default FunnelLeads;
