
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

const GOOGLE_CONFIG = {
  CLIENT_ID: "416630995185-g7b0fm679lb4p45p5lou070cqscaalaf.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REFRESH_TOKEN: "1//0gT2uoYBlNdGXCgYIARAAGBASNwF-L9IrBK_ijYwpce6-TdqDfji4GxYuc4uxIBKasdgoZBPm-tu_EU0xS34cNirqfLgXbJ8_NMk",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

const SHEET_ID = '1ms082PTG8lt566ndWBf687baIl-knERPL1r2v7-dPxg';
const SHEET_NAME = '◉ New';

const getAccessToken = async () => {
  try {
    const response = await fetch(GOOGLE_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        client_secret: GOOGLE_CONFIG.CLIENT_SECRET,
        refresh_token: GOOGLE_CONFIG.REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await response.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

export const useNewClientData = () => {
  return useQuery({
    queryKey: ['newClientData'],
    queryFn: async (): Promise<NewClientData[]> => {
      const accessToken = await getAccessToken();
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}!A:U?alt=json`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
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
