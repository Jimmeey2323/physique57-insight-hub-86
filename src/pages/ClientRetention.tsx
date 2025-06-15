
import React from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { PremiumNewClientSection } from '@/components/dashboard/PremiumNewClientSection';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { useNewClientData } from '@/hooks/useNewClientData';

const ClientRetention = () => {
  const { loading } = useNewClientData();

  if (loading) {
    return <RefinedLoader subtitle="Loading premium client conversion & retention analytics..." />;
  }

  return (
    <SectionLayout title="Client Conversion & Retention Analytics">
      <PremiumNewClientSection />
    </SectionLayout>
  );
};

export default ClientRetention;
