
export interface SalesData {
  memberId: string;
  customerName: string;
  customerEmail: string;
  payingMemberId: string;
  saleItemId: string;
  paymentCategory: string;
  membershipType: string;
  paymentDate: string;
  paymentValue: number;
  paidInMoneyCredits: number;
  paymentVAT: number;
  paymentItem: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentTransactionId: string;
  stripeToken: string;
  soldBy: string;
  saleReference: string;
  calculatedLocation: string;
  cleanedProduct: string;
  cleanedCategory: string;
}

export interface NewClientData {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  firstVisitDate: string;
  isNew: string;
  membershipUsed: string;
  paymentMethod: string;
  ltv: number;
  conversionStatus: string;
  retentionStatus: string;
  visitsPostTrial: number;
  location: string;
}

export interface TeacherData {
  teacherId: string;
  teacherName: string;
  email: string;
  location: string;
  totalSessions: number;
  totalNonEmptySessions: number;
  totalCustomers: number;
  totalPaid: number;
  month: string;
  sessionType: string;
}

export interface SessionData {
  sessionId: string;
  sessionName: string;
  date: string;
  time: string;
  trainer: string;
  location: string;
  classType: string;
  capacity: number;
  countCustomersBooked: number;
  countCustomersCheckedIn: number;
  countCustomersLateCancelled: number;
  totalPaid: number;
  dayOfWeek: string;
}

export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  location: string[];
  category: string[];
  product: string[];
  soldBy: string[];
  paymentMethod: string[];
  minAmount?: number;
  maxAmount?: number;
}

export interface MetricCardData {
  title: string;
  value: string;
  change: number;
  description: string;
  calculation: string;
  icon: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  category?: string;
}
