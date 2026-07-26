import { apiGet, apiPost } from "./client";
import type { Application } from "../types/application";
import type { CreateSaleInput, Sale } from "../types/sale";

export function listSales(applicationId: number): Promise<{ data: Sale[] }> {
  return apiGet(`/applications/${applicationId}/sales`);
}

export function createSale(
  applicationId: number,
  input: CreateSaleInput,
): Promise<{ sale: Sale; application: Application }> {
  return apiPost(`/applications/${applicationId}/sales`, input);
}
