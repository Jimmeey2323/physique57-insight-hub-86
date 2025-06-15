
import React from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { SessionsSection } from '@/components/dashboard/SessionsSection';

const Sessions = () => {
  return (
    <SectionLayout title="Sessions">
      <SessionsSection />
    </SectionLayout>
  );
};

export default Sessions;
