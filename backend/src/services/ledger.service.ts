import { ledgerRepository } from "../repositories/ledger.repository";
import { buildPaginatedResult } from "../utils/pagination";
import { memberService } from "./member.service";
import { LedgerType } from "../generated/prisma/client";
import type {
  LedgerListQuery,
  RecordAdjustmentInput,
  RecordMoneyMovementInput,
} from "../validation/ledger.validation";

export const ledgerService = {
  async listByMember(memberId: number, query: LedgerListQuery) {
    await memberService.getById(memberId);
    const skip = (query.page - 1) * query.pageSize;
    const { data, total } = await ledgerRepository.findManyByMember({
      memberId,
      ipoId: query.ipoId,
      skip,
      take: query.pageSize,
    });
    return buildPaginatedResult(data, total, query.page, query.pageSize);
  },

  async recordMoneySent(memberId: number, input: RecordMoneyMovementInput) {
    await memberService.getById(memberId);
    return ledgerRepository.create({
      member: { connect: { id: memberId } },
      ipo: input.ipoId ? { connect: { id: input.ipoId } } : undefined,
      type: LedgerType.MONEY_SENT,
      credit: input.amount,
      debit: 0,
      description: input.description,
    });
  },

  async recordMoneyReturned(memberId: number, input: RecordMoneyMovementInput) {
    await memberService.getById(memberId);
    return ledgerRepository.create({
      member: { connect: { id: memberId } },
      ipo: input.ipoId ? { connect: { id: input.ipoId } } : undefined,
      type: LedgerType.MONEY_RETURNED,
      credit: 0,
      debit: input.amount,
      description: input.description,
    });
  },

  /** Commission is paid at the operator's discretion, not auto-computed from profit. */
  async recordCommission(memberId: number, input: RecordMoneyMovementInput) {
    await memberService.getById(memberId);
    return ledgerRepository.create({
      member: { connect: { id: memberId } },
      ipo: input.ipoId ? { connect: { id: input.ipoId } } : undefined,
      type: LedgerType.COMMISSION,
      credit: 0,
      debit: input.amount,
      description: input.description,
    });
  },

  /** Freeform correction to a member's balance -- e.g. redirecting a loss the
   * operator personally absorbed onto a "house" member instead of the member
   * whose application it was, or later recouping that amount from their profit. */
  async recordAdjustment(memberId: number, input: RecordAdjustmentInput) {
    await memberService.getById(memberId);
    return ledgerRepository.create({
      member: { connect: { id: memberId } },
      ipo: input.ipoId ? { connect: { id: input.ipoId } } : undefined,
      type: LedgerType.ADJUSTMENT,
      credit: input.direction === "credit" ? input.amount : 0,
      debit: input.direction === "debit" ? input.amount : 0,
      description: input.description,
    });
  },
};
