import { participantGroupRepository } from "../repositories/participantGroup.repository";
import { NotFoundError } from "../errors/AppError";
import type { CreateGroupInput, UpdateGroupInput } from "../validation/participantGroup.validation";
import type { Prisma } from "../generated/prisma/client";

export const participantGroupService = {
  list(search?: string) {
    const where: Prisma.ParticipantGroupWhereInput = search ? { name: { contains: search } } : {};
    return participantGroupRepository.findMany(where);
  },

  async getById(id: number) {
    const group = await participantGroupRepository.findById(id);
    if (!group) {
      throw new NotFoundError("Participant group not found");
    }
    return group;
  },

  getDefault() {
    return participantGroupRepository.findDefault();
  },

  create(input: CreateGroupInput) {
    return participantGroupRepository.create(input);
  },

  update(id: number, input: UpdateGroupInput) {
    return participantGroupRepository.update(id, input);
  },

  remove(id: number) {
    return participantGroupRepository.delete(id);
  },

  setMembers(groupId: number, memberIds: number[]) {
    return participantGroupRepository.setMembers(groupId, memberIds);
  },

  addMember(groupId: number, memberId: number) {
    return participantGroupRepository.addMember(groupId, memberId);
  },

  removeMember(groupId: number, memberId: number) {
    return participantGroupRepository.removeMember(groupId, memberId);
  },
};
