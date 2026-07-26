import { memberRepository } from "../repositories/member.repository";
import { NotFoundError } from "../errors/AppError";
import { buildPaginatedResult } from "../utils/pagination";
import type {
  CreateMemberInput,
  MemberListQuery,
  UpdateMemberInput,
} from "../validation/member.validation";

export const memberService = {
  async list(query: MemberListQuery) {
    const skip = (query.page - 1) * query.pageSize;
    const { data, total } = await memberRepository.findMany({
      search: query.search,
      groupId: query.groupId,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      skip,
      take: query.pageSize,
    });
    return buildPaginatedResult(data, total, query.page, query.pageSize);
  },

  async getById(id: number) {
    const member = await memberRepository.findById(id);
    if (!member) {
      throw new NotFoundError("Member not found");
    }
    return member;
  },

  create(input: CreateMemberInput) {
    return memberRepository.create(input);
  },

  update(id: number, input: UpdateMemberInput) {
    return memberRepository.update(id, input);
  },

  remove(id: number) {
    return memberRepository.delete(id);
  },
};
