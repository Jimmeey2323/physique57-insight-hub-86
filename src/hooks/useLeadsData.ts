
import { useState, useEffect } from 'react';
import { LeadsData } from '@/types/leads';

const GOOGLE_CONFIG = {
  CLIENT_ID: "416630995185-g7b0fm679lb4p45p5lou070cqscaalaf.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REFRESH_TOKEN: "1//0gT2uoYBlNdGXCgYIARAAGBASNwF-L9IrBK_ijYwpce6-TdqDfji4GxYuc4uxIBKasdgoZBPm-tu_EU0xS34cNirqfLgXbJ8_NMk",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

const SPREADSHEET_ID = "1dQMNF69WnXVQdhlLvUZTig3kL97NA21k6eZ9HRu6xiQ";

export const useLeadsData = () => {
  const [data, setData] = useState<LeadsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchLeadsData = async () => {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/◉ Leads?alt=json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch leads data');
      }

      const result = await response.json();
      const rows = result.values || [];
      
      if (rows.length < 2) {
        setData([]);
        return;
      }

      const leadsData: LeadsData[] = rows.slice(1).map((row: any[]) => ({
        id: row[0] || '',
        fullName: row[1] || '',
        phone: row[2] || '',
        email: row[3] || '',
        createdAt: row[4] || '',
        sourceId: row[5] || '',
        source: row[6] || '',
        memberId: row[7] || '',
        convertedToCustomerAt: row[8] || '',
        stage: row[9] || '',
        associate: row[10] || '',
        remarks: row[11] || '',
        followUp1Date: row[12] || '',
        followUpComments1: row[13] || '',
        followUp2Date: row[14] || '',
        followUpComments2: row[15] || '',
        followUp3Date: row[16] || '',
        followUpComments3: row[17] || '',
        followUp4Date: row[18] || '',
        followUpComments4: row[19] || '',
        center: row[20] || '',
        classType: row[21] || '',
        hostId: row[22] || '',
        status: row[23] || '',
        channel: row[24] || '',
        period: row[25] || '',
        purchasesMade: parseInt(row[26]) || 0,
        ltv: parseFloat(row[27]) || 0,
        visits: parseInt(row[28]) || 0,
        trialStatus: row[29] || '',
        conversionStatus: row[30] || '',
        retentionStatus: row[31] || '',
      }));

      setData(leadsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching leads data:', err);
      setError('Failed to load leads data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsData();
  }, []);

  return { data, loading, error, refetch: fetchLeadsData };
};
