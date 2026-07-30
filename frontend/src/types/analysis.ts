export interface MonthlyAnalysis {
  month: string;
  cashIn: string;
  cashOut: string;
  netCashFlow: string;
  cumulativeCapital: string;
  profit: string;
  loss: string;
  commission: string;
  netIncome: string;
}

export interface IpoAnalysis {
  ipoId: number;
  company: string;
  capitalDeployed: string;
  profit: string;
  loss: string;
  commission: string;
  netIncome: string;
  roi: string;
}

export interface MemberAnalysis {
  memberId: number;
  name: string;
  capitalSent: string;
  capitalReturned: string;
  profit: string;
  loss: string;
  commission: string;
  netIncome: string;
  walletBalance: string;
  lastActivityAt: string;
  outstandingDays: number;
}

export interface AnalysisSummary {
  monthly: MonthlyAnalysis[];
  ipos: IpoAnalysis[];
  members: MemberAnalysis[];
  avgMonthlyCashIn: string;
  avgMonthlyNetIncome: string;
  avgCapitalDeployed: string;
}
