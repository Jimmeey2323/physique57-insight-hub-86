
import { useState, useEffect } from 'react';

interface SalesData {
  'Member ID': string;
  'Customer Name': string;
  'Customer Email': string;
  'Paying Member ID': string;
  'Sale Item ID': string;
  'Payment Category': string;
  'Membership Type': string;
  'Payment Date': string;
  'Payment Value': number;
  'Paid In Money Credits': string;
  'Payment VAT': number;
  'Payment Item': string;
  'Payment Status': string;
  'Payment Method': string;
  'Payment Transaction ID': string;
  'Stripe Token': string;
  'Sold By': string;
  'Sale Reference': string;
  'Calculated Location': string;
  'Cleaned Product': string;
  'Cleaned Category': string;
}

const GOOGLE_OAUTH = {
  CLIENT_ID: "416630995185-g7b0fm679lb4p45p5lou070cqscaalaf.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REFRESH_TOKEN: "1//0gT2uoYBlNdGXCgYIARAAGBASNwF-L9IrBK_ijYwpce6-TdqDfji4GxYuc4uxIBKasdgoZBPm-tu_EU0xS34cNirqfLgXbJ8_NMk",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

export const useSalesData = () => {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAccessToken = async () => {
    try {
      const response = await fetch(GOOGLE_OAUTH.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_OAUTH.CLIENT_ID,
          client_secret: GOOGLE_OAUTH.CLIENT_SECRET,
          refresh_token: GOOGLE_OAUTH.REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  };

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = await getAccessToken();
      
      const spreadsheetId = '1ms082PTG8lt566ndWBf687baIl-knERPL1r2v7-dPxg';
      const range = '◉ Sales!A:U'; // Covers all columns A to U
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const rows = result.values || [];

      if (rows.length < 2) {
        setData([]);
        return;
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);

      const formattedData: SalesData[] = dataRows.map(row => {
        const item: any = {};
        headers.forEach((header: string, index: number) => {
          const value = row[index] || '';
          
          // Parse numeric values
          if (header === 'Payment Value' || header === 'Payment VAT') {
            item[header] = parseFloat(value) || 0;
          } else {
            item[header] = value;
          }
        });
        return item as SalesData;
      });

      console.log('Fetched sales data:', formattedData);
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
      
      // Fallback to sample data for development
      const sampleData: SalesData[] = [
        {
          'Member ID': '15339532',
          'Customer Name': 'Nandita Dalmia',
          'Customer Email': 'nandita@lemill.in',
          'Paying Member ID': '15339532',
          'Sale Item ID': '160038151',
          'Payment Category': 'subscription',
          'Membership Type': 'subscription',
          'Payment Date': '10/06/2025 20:23:15',
          'Payment Value': 14396,
          'Paid In Money Credits': '',
          'Payment VAT': 2196,
          'Payment Item': 'Studio 1 Month Unlimited Membership',
          'Payment Status': 'succeeded',
          'Payment Method': 'multiple-payment-methods',
          'Payment Transaction ID': '167800053',
          'Stripe Token': 'multiple-payment-methods',
          'Sold By': 'Akshay Rane',
          'Sale Reference': '167800053',
          'Calculated Location': 'Kwality House, Kemps Corner',
          'Cleaned Product': 'Studio 1 Month Unlimited',
          'Cleaned Category': 'Membership'
        },
        {
          'Member ID': '24675005',
          'Customer Name': 'Ariane Shah',
          'Customer Email': 'arianeshah2001@gmail.com',
          'Paying Member ID': '24675005',
          'Sale Item ID': '160037579',
          'Payment Category': 'subscription',
          'Membership Type': 'subscription',
          'Payment Date': '10/06/2025 20:19:36',
          'Payment Value': 17995,
          'Paid In Money Credits': '',
          'Payment VAT': 2745,
          'Payment Item': 'Studio 1 Month Unlimited Membership',
          'Payment Status': 'succeeded',
          'Payment Method': 'POS Machine',
          'Payment Transaction ID': '167799486',
          'Stripe Token': 'custom',
          'Sold By': 'Akshay Rane',
          'Sale Reference': '167799486',
          'Calculated Location': 'Kwality House, Kemps Corner',
          'Cleaned Product': 'Studio 1 Month Unlimited',
          'Cleaned Category': 'Membership'
        }
      ];
      setData(sampleData);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchSalesData();
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  return { data, loading, error, refreshData };
};
