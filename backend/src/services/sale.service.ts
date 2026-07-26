import { saleRepository } from "../repositories/sale.repository";
import { applicationService } from "./application.service";
import { ValidationError } from "../errors/AppError";
import { ApplicationStatus } from "../generated/prisma/client";
import type { CreateSaleInput } from "../validation/sale.validation";

/** An application must be allotted (and not yet fully sold) to accept a sale. */
const SELLABLE_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.ALLOTTED,
  ApplicationStatus.PARTIALLY_SOLD,
];

export const saleService = {
  listByApplication(applicationId: number) {
    return saleRepository.findManyByApplication(applicationId);
  },

  async recordSale(applicationId: number, input: CreateSaleInput) {
    const application = await applicationService.getById(applicationId);

    if (!SELLABLE_STATUSES.includes(application.status)) {
      throw new ValidationError(
        `Cannot record a sale for an application with status ${application.status}. Shares must be allotted and not fully sold yet.`,
      );
    }

    const alreadySold = await saleRepository.sumSharesByApplication(applicationId);
    const remaining = application.shares - alreadySold;
    if (input.shares > remaining) {
      throw new ValidationError(
        `Cannot sell ${input.shares} shares — only ${remaining} of ${application.shares} allotted shares remain unsold.`,
      );
    }

    const nextStatus =
      alreadySold + input.shares === application.shares
        ? ApplicationStatus.SOLD
        : ApplicationStatus.PARTIALLY_SOLD;

    return saleRepository.createAndUpdateStatus(applicationId, input, nextStatus);
  },
};
