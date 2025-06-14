
import { useState, useEffect } from 'react';
import { useGoogleSheets } from './useGoogleSheets';
import { SalesData } from '@/types/dashboard';

export const useDiscountsData = () => {
  const { data: rawData, loading, error, refetch } = useGoogleSheets('◉ Sales');
  const [data, setData] = useState<SalesData[]>([]);

  useEffect(() => {
    if (rawData && rawData.length > 0) {
      console.log('Raw discounts data received:', rawData);
      
      const processedData = rawData.map((row: any) => ({
        memberId: row['Member Id'] || '',
        customerName: row['Customer Name'] || '',
        customerEmail: row['Customer Email'] || '',
        payingMemberId: row['Paying Member ID'] || '',
        saleItemId: row['Sale Item ID'] || '',
        paymentCategory: row['Payment Category'] || '',
        membershipType: row['Membership Type'] || '',
        paymentDate: row['Payment Date'] || '',
        paymentValue: parseFloat(row['Payment Value']) || 0,
        paidInMoneyCredits: parseFloat(row['Paid In Money Credits']) || 0,
        paymentVAT: parseFloat(row['Payment VAT']) || 0,
        paymentItem: row['Payment Item'] || '',
        paymentStatus: row['Payment Status'] || '',
        paymentMethod: row['Payment Method'] || '',
        paymentTransactionId: row['Payment Transaction ID'] || '',
        stripeToken: row['Stripe Token'] || '',
        soldBy: row['Sold By'] || '',
        saleReference: row['Sale Reference'] || '',
        calculatedLocation: row['Calculated Location'] || '',
        cleanedProduct: row['Cleaned Product'] || '',
        cleanedCategory: row['Cleaned Category'] || '',
        discountAmount: parseFloat(row['Discount Amount']) || 0,
        grossRevenue: parseFloat(row['Gross Revenue']) || 0,
        preTaxMrp: parseFloat(row['Pre Tax Mrp']) || 0,
        vat: parseFloat(row['VAT']) || 0,
        netRevenue: parseFloat(row['Net Revenue']) || 0,
        postTaxMrp: parseFloat(row['Post Tax MRP']) || 0,
        grossDiscountPercent: parseFloat(row['Gross Discount %']?.replace('%', '')) || 0,
        netDiscountPercent: parseFloat(row['Net Discount %']?.replace('%', '')) || 0
      }));

      console.log('Processed discounts data:', processedData);
      setData(processedData);
    }
  }, [rawData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};
