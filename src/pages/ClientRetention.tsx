
import React, { useEffect } from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { NewClientSection } from '@/components/dashboard/NewClientSection';
import { NewCsvDataTable } from '@/components/dashboard/NewCsvDataTable';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { useNewClientData } from '@/hooks/useNewClientData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';

const ClientRetention = () => {
  const { loading } = useNewClientData();
  const { isLoading, setLoading } = useGlobalLoading();

  useEffect(() => {
    setLoading(loading, 'Analyzing client conversion and retention patterns...');
  }, [loading, setLoading]);

  if (isLoading) {
    return <RefinedLoader subtitle="Analyzing client conversion and retention patterns..." />;
  }

  return (
    <SectionLayout title="New Client Conversion & Retention">
      <div className="space-y-8">
        <NewCsvDataTable />
        <NewClientSection />
      </div>
    </SectionLayout>
  );
};

export default ClientRetention;
