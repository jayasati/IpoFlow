import { prisma } from "../config/prisma";
import type { Prisma } from "../generated/prisma/client";

const withMembers = {
  members: { include: { member: true } },
} satisfies Prisma.ParticipantGroupInclude;

export const participantGroupRepository = {
  findMany(where: Prisma.ParticipantGroupWhereInput) {
    return prisma.participantGroup.findMany({
      where,
      orderBy: { name: "asc" },
      include: withMembers,
    });
  },

  findById(id: number) {
    return prisma.participantGroup.findUnique({
      where: { id },
      include: withMembers,
    });
  },

  findDefault() {
    return prisma.participantGroup.findFirst({
      where: { isDefault: true },
      include: withMembers,
    });
  },

  create(data: { name: string; isDefault: boolean; memberIds: number[] }) {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.participantGroup.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.participantGroup.create({
        data: {
          name: data.name,
          isDefault: data.isDefault,
          members: { create: data.memberIds.map((memberId) => ({ memberId })) },
        },
        include: withMembers,
      });
    });
  },

  update(id: number, data: { name?: string; isDefault?: boolean }) {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.participantGroup.updateMany({
          where: { isDefault: true, NOT: { id } },
          data: { isDefault: false },
        });
      }
      return tx.participantGroup.update({
        where: { id },
        data,
        include: withMembers,
      });
    });
  },

  delete(id: number) {
    return prisma.participantGroup.delete({ where: { id } });
  },

  setMembers(groupId: number, memberIds: number[]) {
    return prisma.$transaction(async (tx) => {
      await tx.participantGroupMember.deleteMany({ where: { groupId } });
      if (memberIds.length > 0) {
        await tx.participantGroupMember.createMany({
          data: memberIds.map((memberId) => ({ groupId, memberId })),
          skipDuplicates: true,
        });
      }
      return tx.participantGroup.findUnique({ where: { id: groupId }, include: withMembers });
    });
  },

  addMember(groupId: number, memberId: number) {
    return prisma.participantGroupMember.create({ data: { groupId, memberId } });
  },

  removeMember(groupId: number, memberId: number) {
    return prisma.participantGroupMember.delete({
      where: { groupId_memberId: { groupId, memberId } },
    });
  },
};
