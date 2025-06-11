
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

export interface MetricCardData {
  title: string;
  value: string | number;
  change?: number;
  description: string;
  calculation: string;
  icon: string;
}

export interface FilterOptions {
  dateRange: { start: string; end: string };
  location: string[];
  category: string[];
  product: string[];
  soldBy: string[];
  paymentMethod: string[];
}
