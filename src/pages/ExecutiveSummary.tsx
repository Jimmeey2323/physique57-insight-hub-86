
import React from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { ExecutiveSummarySection } from '@/components/dashboard/ExecutiveSummarySection';

const ExecutiveSummary = () => {
  return (
    <SectionLayout title="Executive Summary">
      <ExecutiveSummarySection />
    </SectionLayout>
  );
};

export default ExecutiveSummary;
