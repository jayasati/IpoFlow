import { ledgerRepository } from "../repositories/ledger.repository";
import { calculateWalletBalance } from "./walletCalculator";
import { memberService } from "./member.service";

export const walletService = {
  async getBalance(memberId: number) {
    await memberService.getById(memberId);
    const totals = await ledgerRepository.aggregateByMember(memberId);
    return calculateWalletBalance(totals);
  },
};
