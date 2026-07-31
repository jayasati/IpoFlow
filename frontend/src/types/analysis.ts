export interface MonthlyAnalysis {
  month: string;
  cashIn: string;
  cashOut: string;
  netCashFlow: string;
  cumulativeCapital: string;
  profit: string;
  loss: string;
  commission: string;
  /** Cuts taken minus compensation paid on self-funded settlements this month. */
  operatorNet: string;
  netIncome: string;
}

export interface IpoAnalysis {
  ipoId: number;
  company: string;
  capitalDeployed: string;
  profit: string;
  loss: string;
  commission: string;
  /** Cuts taken minus compensation paid on this IPO's self-funded settlements. */
  operatorNet: string;
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
  /** Wallet-affecting net (Profit - Loss - Commission from the Ledger only). */
  netIncome: string;
  /** This member's own profit/loss on self-funded trades — never touches their wallet. */
  selfFundedProfit: string;
  /** What you earned (or paid out) from this member's self-funded deals. */
  yourCut: string;
  /** The member's total profit after commission, across both funding types. */
  totalProfit: string;
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
