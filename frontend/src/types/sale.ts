export interface Sale {
  id: number;
  applicationId: number;
  shares: number;
  sellPrice: string;
  /** Actual amount credited after taxes/charges; overrides shares * sellPrice when present. */
  netAmount: string | null;
  soldAt: string;
  createdAt: string;
}

export interface CreateSaleInput {
  shares: number;
  sellPrice: number;
  netAmount?: number;
}
