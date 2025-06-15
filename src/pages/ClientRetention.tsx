
import React from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { NewClientSection } from '@/components/dashboard/NewClientSection';

const ClientRetention = () => {
  return (
    <SectionLayout title="New Client Conversion & Retention">
      <NewClientSection />
    </SectionLayout>
  );
};

export default ClientRetention;
