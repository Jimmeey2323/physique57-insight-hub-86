
import React, { useEffect } from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { ClassAttendanceSection } from '@/components/dashboard/ClassAttendanceSection';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { useSessionsData } from '@/hooks/useSessionsData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';

const ClassAttendance = () => {
  const { loading } = useSessionsData();
  const { isLoading, setLoading } = useGlobalLoading();

  useEffect(() => {
    setLoading(loading, 'Processing class attendance analytics and trends...');
  }, [loading, setLoading]);

  if (isLoading) {
    return <RefinedLoader subtitle="Processing class attendance analytics and trends..." />;
  }

  return (
    <SectionLayout title="Class Attendance">
      <ClassAttendanceSection />
    </SectionLayout>
  );
};

export default ClassAttendance;
