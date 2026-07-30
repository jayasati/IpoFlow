import { ipoRepository } from "../repositories/ipo.repository";
import { NotFoundError } from "../errors/AppError";
import { buildPaginatedResult } from "../utils/pagination";
import { assertValidTransition } from "./ipoStateMachine";
import type { CreateIpoInput, IpoListQuery, UpdateIpoInput } from "../validation/ipo.validation";
import type { IpoStatus } from "../generated/prisma/client";

export const ipoService = {
  async list(query: IpoListQuery) {
    const skip = (query.page - 1) * query.pageSize;
    const { data, total } = await ipoRepository.findMany({
      search: query.search,
      status: query.status,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      skip,
      take: query.pageSize,
    });
    return buildPaginatedResult(data, total, query.page, query.pageSize);
  },

  async getById(id: number) {
    const ipo = await ipoRepository.findById(id);
    if (!ipo) {
      throw new NotFoundError("IPO not found");
    }
    return ipo;
  },

  create(input: CreateIpoInput) {
    return ipoRepository.create(input);
  },

  update(id: number, input: UpdateIpoInput) {
    return ipoRepository.update(id, input);
  },

  remove(id: number) {
    return ipoRepository.delete(id);
  },

  async removeWithTransactions(id: number) {
    await this.getById(id);
    return ipoRepository.deleteWithTransactions(id);
  },

  async updateStatus(id: number, nextStatus: IpoStatus) {
    const ipo = await this.getById(id);
    assertValidTransition(ipo.status, nextStatus);
    return ipoRepository.update(id, { status: nextStatus });
  },

  async clone(id: number) {
    const ipo = await this.getById(id);
    return ipoRepository.create({
      company: `${ipo.company} (Copy)`,
      issuePrice: ipo.issuePrice,
      lotSize: ipo.lotSize,
    });
  },
};
