export interface Sale {
  id: number;
  applicationId: number;
  shares: number;
  sellPrice: string;
  soldAt: string;
  createdAt: string;
}

export interface CreateSaleInput {
  shares: number;
  sellPrice: number;
}
