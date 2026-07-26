import { applicationRepository } from "../repositories/application.repository";
import type { BulkApplicationItem } from "../repositories/application.repository";
import { ipoService } from "./ipo.service";
import { APPLICATION_ACCEPTING_STATUSES } from "./ipoStateMachine";
import { ValidationError } from "../errors/AppError";

export const applicationService = {
  listByIpo(ipoId: number) {
    return applicationRepository.findManyByIpo(ipoId);
  },

  async bulkCreate(ipoId: number, applications: BulkApplicationItem[]) {
    const ipo = await ipoService.getById(ipoId);

    if (!APPLICATION_ACCEPTING_STATUSES.includes(ipo.status)) {
      throw new ValidationError(
        `Cannot add applications to an IPO with status ${ipo.status}. Applications can only be added while the IPO is ${APPLICATION_ACCEPTING_STATUSES.join(" or ")}.`,
      );
    }

    const { created, skippedMemberIds } = await applicationRepository.createMany(
      ipoId,
      applications,
    );

    return {
      created,
      skippedMemberIds,
      createdCount: created.length,
      skippedCount: skippedMemberIds.length,
    };
  },
};
