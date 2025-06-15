
import React from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { NewClientSection } from '@/components/dashboard/NewClientSection';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { useNewClientData } from '@/hooks/useNewClientData';

const ClientRetention = () => {
  const { loading } = useNewClientData();

  if (loading) {
    return <RefinedLoader subtitle="Loading client conversion & retention data..." />;
  }

  return (
    <SectionLayout title="New Client Conversion & Retention">
      <NewClientSection />
    </SectionLayout>
  );
};

export default ClientRetention;
