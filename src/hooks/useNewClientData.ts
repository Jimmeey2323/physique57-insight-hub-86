
import { useQuery } from '@tanstack/react-query';

export interface NewClientData {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  firstVisitDate: string;
  firstVisitEntityName: string;
  firstVisitType: string;
  firstVisitLocation: string;
  paymentMethod: string;
  membershipUsed: string;
  homeLocation: string;
  classNo: number;
  trainerName: string;
  isNew: string;
  visitsPostTrial: number;
  membershipsBoughtPostTrial: string;
  purchaseCountPostTrial: number;
  ltv: number;
  retentionStatus: string;
  conversionStatus: string;
}

const SHEET_ID = '1hBSuSAb6X2LLU-o3yZxJl_Fb6oXgtNI0eZnJI8K3SKw';
const SHEET_NAME = '◉ New';
const API_KEY = 'AIzaSyBIqkqv_jnGcEATPEGQKKL-3FJhDY6_6A8';

export const useNewClientData = () => {
  return useQuery({
    queryKey: ['newClientData'],
    queryFn: async (): Promise<NewClientData[]> => {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}!A:U?key=${API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const rows = data.values || [];
      
      if (rows.length === 0) {
        return [];
      }
      
      // Skip header row
      const dataRows = rows.slice(1);
      
      return dataRows.map((row: any[]): NewClientData => ({
        memberId: row[0] || '',
        firstName: row[1] || '',
        lastName: row[2] || '',
        email: row[3] || '',
        phoneNumber: row[4] || '',
        firstVisitDate: row[5] || '',
        firstVisitEntityName: row[6] || '',
        firstVisitType: row[7] || '',
        firstVisitLocation: row[8] || '',
        paymentMethod: row[9] || '',
        membershipUsed: row[10] || '',
        homeLocation: row[11] || '',
        classNo: parseFloat(row[12]) || 0,
        trainerName: row[13] || '',
        isNew: row[14] || '',
        visitsPostTrial: parseFloat(row[15]) || 0,
        membershipsBoughtPostTrial: row[16] || '',
        purchaseCountPostTrial: parseFloat(row[17]) || 0,
        ltv: parseFloat(row[18]) || 0,
        retentionStatus: row[19] || '',
        conversionStatus: row[20] || ''
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
