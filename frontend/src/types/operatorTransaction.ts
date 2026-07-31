export interface OperatorTransaction {
  id: number;
  applicationId: number;
  memberId: number;
  ipoId: number;
  credit: string;
  debit: string;
  description: string | null;
  createdAt: string;
  member: { id: number; name: string };
  ipo: { id: number; company: string };
}

export interface OperatorTransactionList {
  data: OperatorTransaction[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  netProfit: string;
}
