
import React from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { SalesAnalyticsSection } from '@/components/dashboard/SalesAnalyticsSection';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';

const SalesAnalytics = () => {
  const { data } = useGoogleSheets();

  return (
    <SectionLayout title="Sales Analytics">
      <SalesAnalyticsSection data={data} />
    </SectionLayout>
  );
};

export default SalesAnalytics;
