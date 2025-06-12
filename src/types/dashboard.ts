

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

export interface NewClientFilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  location: string[];
  homeLocation: string[];
  trainer: string[];
  paymentMethod: string[];
  retentionStatus: string[];
  conversionStatus: string[];
  isNew: string[];
  minLTV?: number;
  maxLTV?: number;
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

// Generic table data type for flexible table structures
export type TableData = Record<string, any>;

// Union type for data that can be displayed in tables
export type DisplayableData = SalesData | NewClientData | TableData;

