
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadsMetricType } from '@/types/leads';

interface LeadMetricTabsProps {
  value: LeadsMetricType;
  onValueChange: (value: LeadsMetricType) => void;
  className?: string;
}

export const LeadMetricTabs: React.FC<LeadMetricTabsProps> = ({
  value,
  onValueChange,
  className = ""
}) => {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
        <TabsTrigger
          value="totalLeads"
          className="relative overflow-hidden rounded-md px-4 py-2 font-medium text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-50"
        >
          Total Leads
        </TabsTrigger>
        <TabsTrigger
          value="leadToTrialConversion"
          className="relative overflow-hidden rounded-md px-4 py-2 font-medium text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-50"
        >
          Lead to Trial %
        </TabsTrigger>
        <TabsTrigger
          value="trialToMembershipConversion"
          className="relative overflow-hidden rounded-md px-4 py-2 font-medium text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-50"
        >
          Trial to Member %
        </TabsTrigger>
        <TabsTrigger
          value="ltv"
          className="relative overflow-hidden rounded-md px-4 py-2 font-medium text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-50"
        >
          Average LTV
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
