export interface Member {
  id: number;
  name: string;
  phone: string | null;
  notes: string | null;
  defaultCommissionRate: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberListParams {
  search?: string;
  groupId?: number;
  page?: number;
  pageSize?: number;
  sortBy?: "name" | "createdAt" | "defaultCommissionRate";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CreateMemberInput {
  name: string;
  phone?: string;
  notes?: string;
  defaultCommissionRate?: number;
}

export type UpdateMemberInput = Partial<CreateMemberInput>;
