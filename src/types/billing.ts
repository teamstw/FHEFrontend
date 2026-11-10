export type BillingParticipant =
  | { type: "personal" }
  | { type: "group"; groupId: string };
export type BillingSplit = {
  method: "equal";
  participants: BillingParticipant[];
};
export type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  name: string;
  default: boolean;
};
export type BillingSummary = {
  split?: BillingSplit;
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
