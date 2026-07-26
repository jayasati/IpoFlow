import { applicationRepository } from "../repositories/application.repository";
import type { BulkApplicationItem } from "../repositories/application.repository";
import { ipoService } from "./ipo.service";
import { APPLICATION_ACCEPTING_STATUSES } from "./ipoStateMachine";
import { NotFoundError, ValidationError } from "../errors/AppError";
import { ApplicationStatus } from "../generated/prisma/client";

/** Once selling has started, the allotted share count is locked in. */
const ALLOTMENT_LOCKED_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.PARTIALLY_SOLD,
  ApplicationStatus.SOLD,
  ApplicationStatus.SETTLED,
];

export const applicationService = {
  listByIpo(ipoId: number) {
    return applicationRepository.findManyByIpo(ipoId);
  },

  async getById(applicationId: number) {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundError("Application not found");
    }
    return application;
  },

  async updateAllotment(applicationId: number, shares: number) {
    const application = await this.getById(applicationId);

    if (ALLOTMENT_LOCKED_STATUSES.includes(application.status)) {
      throw new ValidationError(
        `Cannot change allotment once shares have started selling (status: ${application.status}).`,
      );
    }

    const maxShares = application.lots * application.ipo.lotSize;
    if (shares > maxShares) {
      throw new ValidationError(
        `Cannot allot ${shares} shares — member applied for ${application.lots} lot(s) (${maxShares} shares maximum).`,
      );
    }

    const status = shares > 0 ? ApplicationStatus.ALLOTTED : ApplicationStatus.NOT_ALLOTTED;
    return applicationRepository.updateAllotment(applicationId, { shares, status });
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
