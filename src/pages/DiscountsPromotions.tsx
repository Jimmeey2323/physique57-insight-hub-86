
import React from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { DiscountsSection } from '@/components/dashboard/DiscountsSection';

const DiscountsPromotions = () => {
  return (
    <SectionLayout title="Discounts & Promotions">
      <DiscountsSection />
    </SectionLayout>
  );
};

export default DiscountsPromotions;
