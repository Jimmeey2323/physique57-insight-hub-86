
import { useQuery } from '@tanstack/react-query';

export interface PayrollData {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  location: string;
  cycleSessions: number;
  emptyCycleSessions: number;
  nonEmptyCycleSessions: number;
  cycleCustomers: number;
  cyclePaid: number;
  barreSessions: number;
  emptyBarreSessions: number;
  nonEmptyBarreSessions: number;
  barreCustomers: number;
  barrePaid: number;
  totalSessions: number;
  totalEmptySessions: number;
  totalNonEmptySessions: number;
  totalCustomers: number;
  totalPaid: number;
  monthYear: string;
  unique: string;
  new: number;
  retained: number;
  retention: string;
  converted: number;
  conversion: string;
  classAverageInclEmpty: number;
  classAverageExclEmpty: number;
}

const mockPayrollData: PayrollData[] = [
  {
    teacherId: '53133',
    teacherName: 'Anisha Shah',
    teacherEmail: 'anisha@physique57india.com',
    location: 'Kwality House, Kemps Corner',
    cycleSessions: 0,
    emptyCycleSessions: 0,
    nonEmptyCycleSessions: 0,
    cycleCustomers: 0,
    cyclePaid: 0,
    barreSessions: 5,
    emptyBarreSessions: 5,
    nonEmptyBarreSessions: 0,
    barreCustomers: 0,
    barrePaid: 0,
    totalSessions: 5,
    totalEmptySessions: 5,
    totalNonEmptySessions: 0,
    totalCustomers: 0,
    totalPaid: 0,
    monthYear: 'Jun-2025',
    unique: '45809Anisha ShahKwality House, Kemps Corner',
    new: 1,
    retained: 1,
    retention: '100%',
    converted: 1,
    conversion: '100%',
    classAverageInclEmpty: 0.0,
    classAverageExclEmpty: 0
  },
  {
    teacherId: '54169',
    teacherName: 'Mrigakshi Jaiswal',
    teacherEmail: 'mrigakshi@physique57mumbai.com',
    location: 'Kwality House, Kemps Corner',
    cycleSessions: 0,
    emptyCycleSessions: 0,
    nonEmptyCycleSessions: 0,
    cycleCustomers: 0,
    cyclePaid: 0,
    barreSessions: 11,
    emptyBarreSessions: 6,
    nonEmptyBarreSessions: 5,
    barreCustomers: 30,
    barrePaid: 31045,
    totalSessions: 11,
    totalEmptySessions: 6,
    totalNonEmptySessions: 5,
    totalCustomers: 30,
    totalPaid: 31045,
    monthYear: 'Jun-2025',
    unique: '45809Mrigakshi JaiswalKwality House, Kemps Corner',
    new: 1,
    retained: 1,
    retention: '100%',
    converted: 1,
    conversion: '100%',
    classAverageInclEmpty: 2.7,
    classAverageExclEmpty: 6.0
  },
  {
    teacherId: '54175',
    teacherName: 'Richard D\'Costa',
    teacherEmail: 'richard@physique57mumbai.com',
    location: 'Kwality House, Kemps Corner',
    cycleSessions: 0,
    emptyCycleSessions: 0,
    nonEmptyCycleSessions: 0,
    cycleCustomers: 0,
    cyclePaid: 0,
    barreSessions: 19,
    emptyBarreSessions: 5,
    nonEmptyBarreSessions: 14,
    barreCustomers: 61,
    barrePaid: 50913,
    totalSessions: 19,
    totalEmptySessions: 5,
    totalNonEmptySessions: 14,
    totalCustomers: 61,
    totalPaid: 50913,
    monthYear: 'Jun-2025',
    unique: '45809Richard D\'CostaKwality House, Kemps Corner',
    new: 1,
    retained: 1,
    retention: '100%',
    converted: 1,
    conversion: '100%',
    classAverageInclEmpty: 3.2,
    classAverageExclEmpty: 4.4
  },
  {
    teacherId: '54176',
    teacherName: 'Rohan Dahima',
    teacherEmail: 'rohan@physique57mumbai.com',
    location: 'Kwality House, Kemps Corner',
    cycleSessions: 0,
    emptyCycleSessions: 0,
    nonEmptyCycleSessions: 0,
    cycleCustomers: 0,
    cyclePaid: 0,
    barreSessions: 18,
    emptyBarreSessions: 7,
    nonEmptyBarreSessions: 11,
    barreCustomers: 96,
    barrePaid: 79315,
    totalSessions: 18,
    totalEmptySessions: 7,
    totalNonEmptySessions: 11,
    totalCustomers: 96,
    totalPaid: 79315,
    monthYear: 'Jun-2025',
    unique: '45809Rohan DahimaKwality House, Kemps Corner',
    new: 1,
    retained: 1,
    retention: '100%',
    converted: 1,
    conversion: '100%',
    classAverageInclEmpty: 5.3,
    classAverageExclEmpty: 8.7
  },
  {
    teacherId: '54195',
    teacherName: 'Pranjali Jain',
    teacherEmail: 'pranjali@physique57mumbai.com',
    location: 'Kwality House, Kemps Corner',
    cycleSessions: 0,
    emptyCycleSessions: 0,
    nonEmptyCycleSessions: 0,
    cycleCustomers: 0,
    cyclePaid: 0,
    barreSessions: 23,
    emptyBarreSessions: 8,
    nonEmptyBarreSessions: 15,
    barreCustomers: 108,
    barrePaid: 98666,
    totalSessions: 23,
    totalEmptySessions: 8,
    totalNonEmptySessions: 15,
    totalCustomers: 108,
    totalPaid: 98666,
    monthYear: 'Jun-2025',
    unique: '45809Pranjali JainKwality House, Kemps Corner',
    new: 1,
    retained: 1,
    retention: '100%',
    converted: 1,
    conversion: '100%',
    classAverageInclEmpty: 4.7,
    classAverageExclEmpty: 7.2
  },
  {
    teacherId: '54196',
    teacherName: 'Atulan Purohit',
    teacherEmail: 'atulan@physique57mumbai.com',
    location: 'Kwality House, Kemps Corner',
    cycleSessions: 0,
    emptyCycleSessions: 0,
    nonEmptyCycleSessions: 0,
    cycleCustomers: 0,
    cyclePaid: 0,
    barreSessions: 14,
    emptyBarreSessions: 4,
    nonEmptyBarreSessions: 10,
    barreCustomers: 90,
    barrePaid: 82017,
    totalSessions: 14,
    totalEmptySessions: 4,
    totalNonEmptySessions: 10,
    totalCustomers: 90,
    totalPaid: 82017,
    monthYear: 'Jun-2025',
    unique: '45809Atulan PurohitKwality House, Kemps Corner',
    new: 1,
    retained: 1,
    retention: '100%',
    converted: 1,
    conversion: '100%',
    classAverageInclEmpty: 6.4,
    classAverageExclEmpty: 9.0
  },
  {
    teacherId: '54197',
    teacherName: 'Vivaran Dhasmana',
    teacherEmail: 'vivaran@physique57mumbai.com',
    location: 'Kwality House, Kemps Corner',
    cycleSessions: 0,
    emptyCycleSessions: 0,
    nonEmptyCycleSessions: 0,
    cycleCustomers: 0,
    cyclePaid: 0,
    barreSessions: 4,
    emptyBarreSessions: 2,
    nonEmptyBarreSessions: 2,
    barreCustomers: 10,
    barrePaid: 8685,
    totalSessions: 4,
    totalEmptySessions: 2,
    totalNonEmptySessions: 2,
    totalCustomers: 10,
    totalPaid: 8685,
    monthYear: 'Jun-2025',
    unique: '45809Vivaran DhasmanaKwality House, Kemps Corner',
    new: 1,
    retained: 1,
    retention: '100%',
    converted: 1,
    conversion: '100%',
    classAverageInclEmpty: 2.5,
    classAverageExclEmpty: 5.0
  }
];

export const usePayrollData = () => {
  return useQuery({
    queryKey: ['payroll-data'],
    queryFn: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockPayrollData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
