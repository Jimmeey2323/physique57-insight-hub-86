
import React from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { ClassAttendanceSection } from '@/components/dashboard/ClassAttendanceSection';

const ClassAttendance = () => {
  return (
    <SectionLayout title="Class Attendance">
      <ClassAttendanceSection />
    </SectionLayout>
  );
};

export default ClassAttendance;
