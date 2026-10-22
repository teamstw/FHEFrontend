export type BillingSummary = {
  plan: string;
  budget: string;
  threshold: string;
  planAmount: number;
  usage: number;
  included: number;
  overageRate: number;
  period: string;
  role: string;
  payment: string;
  nextBillingDate: string;
  invoices: {
    id: string;
    date: string;
    amount: string;
    status: string;
    description: string;
  }[];
};
export type NotificationRecord = {
  id: string;
  title: string;
  description: string;
  time: string;
  href: string;
  read: boolean;
};
