export type IpoStatus = "DRAFT" | "OPEN" | "APPLIED" | "ALLOTTED" | "SOLD" | "SETTLED" | "COMPLETE";

export interface Ipo {
  id: number;
  company: string;
  issuePrice: string;
  lotSize: number;
  status: IpoStatus;
  createdAt: string;
  updatedAt: string;
  _count: { applications: number };
  allowedNextStatuses: IpoStatus[];
}

export interface IpoListParams {
  search?: string;
  status?: IpoStatus;
  page?: number;
  pageSize?: number;
  sortBy?: "company" | "issuePrice" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateIpoInput {
  company: string;
  issuePrice: number;
  lotSize: number;
}

export type UpdateIpoInput = Partial<CreateIpoInput>;
