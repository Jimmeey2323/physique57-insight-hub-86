
import { useState, useEffect } from 'react';
import { SalesData, NewClientData, TeacherData, SessionData } from '@/types/dashboard';

const GOOGLE_CONFIG = {
  CLIENT_ID: "416630995185-g7b0fm679lb4p45p5lou070cqscaalaf.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REFRESH_TOKEN: "1//0gT2uoYBlNdGXCgYIARAAGBASNwF-L9IrBK_ijYwpce6-TdqDfji4GxYuc4uxIBKasdgoZBPm-tu_EU0xS34cNirqfLgXbJ8_NMk",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

const SPREADSHEET_ID = "1ms082PTG8lt566ndWBf687baIl-knERPL1r2v7-dPxg";

export const useAllSheetsData = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [newClientData, setNewClientData] = useState<NewClientData[]>([]);
  const [teacherData, setTeacherData] = useState<TeacherData[]>([]);
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
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

  const fetchSheetData = async (sheetName: string) => {
    try {
      const accessToken = await getAccessToken();
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}?alt=json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${sheetName} data`);
      }

      const result = await response.json();
      return result.values || [];
    } catch (error) {
      console.error(`Error fetching ${sheetName} data:`, error);
      throw error;
    }
  };

  const parseNewClientData = (rows: any[]): NewClientData[] => {
    if (rows.length < 2) return [];
    
    return rows.slice(1).map((row: any[]) => ({
      memberId: row[0] || '',
      firstName: row[1] || '',
      lastName: row[2] || '',
      email: row[3] || '',
      phone: row[4] || '',
      firstVisitDate: row[5] || '',
      isNew: row[6] || '',
      membershipUsed: row[7] || '',
      paymentMethod: row[8] || '',
      ltv: parseFloat(row[9]) || 0,
      conversionStatus: row[10] || '',
      retentionStatus: row[11] || '',
      visitsPostTrial: parseInt(row[12]) || 0,
      location: row[13] || '',
    }));
  };

  const parseTeacherData = (rows: any[]): TeacherData[] => {
    if (rows.length < 2) return [];
    
    return rows.slice(1).map((row: any[]) => ({
      teacherId: row[0] || '',
      teacherName: row[1] || '',
      email: row[2] || '',
      location: row[3] || '',
      totalSessions: parseInt(row[4]) || 0,
      totalNonEmptySessions: parseInt(row[5]) || 0,
      totalCustomers: parseInt(row[6]) || 0,
      totalPaid: parseFloat(row[7]) || 0,
      month: row[8] || '',
      sessionType: row[9] || '',
    }));
  };

  const parseSessionData = (rows: any[]): SessionData[] => {
    if (rows.length < 2) return [];
    
    return rows.slice(1).map((row: any[]) => ({
      sessionId: row[0] || '',
      sessionName: row[1] || '',
      date: row[2] || '',
      time: row[3] || '',
      trainer: row[4] || '',
      location: row[5] || '',
      classType: row[6] || '',
      capacity: parseInt(row[7]) || 0,
      countCustomersBooked: parseInt(row[8]) || 0,
      countCustomersCheckedIn: parseInt(row[9]) || 0,
      countCustomersLateCancelled: parseInt(row[10]) || 0,
      totalPaid: parseFloat(row[11]) || 0,
      dayOfWeek: row[12] || '',
    }));
  };

  const parseSalesData = (rows: any[]): SalesData[] => {
    if (rows.length < 2) return [];
    
    return rows.slice(1).map((row: any[]) => ({
      memberId: row[0] || '',
      customerName: row[1] || '',
      customerEmail: row[2] || '',
      payingMemberId: row[3] || '',
      saleItemId: row[4] || '',
      paymentCategory: row[5] || '',
      membershipType: row[6] || '',
      paymentDate: row[7] || '',
      paymentValue: parseFloat(row[8]) || 0,
      paidInMoneyCredits: parseFloat(row[9]) || 0,
      paymentVAT: parseFloat(row[10]) || 0,
      paymentItem: row[11] || '',
      paymentStatus: row[12] || '',
      paymentMethod: row[13] || '',
      paymentTransactionId: row[14] || '',
      stripeToken: row[15] || '',
      soldBy: row[16] || '',
      saleReference: row[17] || '',
      calculatedLocation: row[18] || '',
      cleanedProduct: row[19] || '',
      cleanedCategory: row[20] || '',
    }));
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [salesRows, newClientRows, teacherRows, sessionRows] = await Promise.all([
        fetchSheetData('◉ Sales'),
        fetchSheetData('◉ New'),
        fetchSheetData('◉ Payroll'),
        fetchSheetData('◉ Sessions'),
      ]);

      setSalesData(parseSalesData(salesRows));
      setNewClientData(parseNewClientData(newClientRows));
      setTeacherData(parseTeacherData(teacherRows));
      setSessionData(parseSessionData(sessionRows));
      
      setError(null);
    } catch (err) {
      console.error('Error fetching all data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return { 
    salesData, 
    newClientData, 
    teacherData, 
    sessionData, 
    loading, 
    error, 
    refetch: fetchAllData 
  };
};
