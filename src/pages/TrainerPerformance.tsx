
import React, { useEffect } from 'react';
import { TrainerPerformanceSection } from '@/components/dashboard/TrainerPerformanceSection';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { usePayrollData } from '@/hooks/usePayrollData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';

const TrainerPerformance = () => {
  const { isLoading } = usePayrollData();
  const { isLoading: globalLoading, setLoading } = useGlobalLoading();

  useEffect(() => {
    setLoading(isLoading, 'Analyzing trainer performance metrics and insights...');
  }, [isLoading, setLoading]);

  if (globalLoading) {
    return <RefinedLoader subtitle="Analyzing trainer performance metrics and insights..." />;
  }

  return <TrainerPerformanceSection />;
};

export default TrainerPerformance;
