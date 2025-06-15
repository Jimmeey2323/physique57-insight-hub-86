
import React, { useEffect } from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { NewClientSection } from '@/components/dashboard/NewClientSection';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { useNewClientData } from '@/hooks/useNewClientData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';

const ClientRetention = () => {
  const { loading } = useNewClientData();
  const { isLoading, setLoading } = useGlobalLoading();

  useEffect(() => {
    setLoading(loading, 'Loading client conversion & retention data...');
  }, [loading, setLoading]);

  if (isLoading) {
    return <RefinedLoader subtitle="Loading client conversion & retention data..." />;
  }

  return (
    <SectionLayout title="New Client Conversion & Retention">
      <NewClientSection />
    </SectionLayout>
  );
};

export default ClientRetention;
