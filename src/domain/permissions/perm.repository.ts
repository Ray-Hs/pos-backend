import prisma from "../../infrastructure/database/prisma/client";
import { UserRole } from "../../types/common";

export async function getUserRolesDB() {
  return prisma.userRole.findMany({
    include: {
      permissions: true,
    },
  });
}

export async function findUserRoleByIdDB(id: number) {
  return prisma.userRole.findFirst({
    where: { id },
    include: {
      permissions: true,
    },
  });
}

export async function createUserRoleDB(data: UserRole) {
  const { permissions, permIds, ...rest } = data;

  return prisma.userRole.create({
    data: {
      ...rest,
      permissions: !permIds
        ? {
            connectOrCreate: permissions?.map((perm) => ({
              where: { key: perm.key },
              create: { ...perm },
            })),
          }
        : {
            connect: permIds.map((id) => ({ id })),
          },
    },
    include: {
      permissions: true,
    },
  });
}

export async function updateUserRoleDB(id: number, data: UserRole) {
  const { permissions, permIds, ...rest } = data;

  return prisma.userRole.update({
    where: {
      id,
    },
    data: {
      ...rest,
      permissions: {
        set: permIds?.map((permId) => ({ id: permId })),
      },
    },
    include: {
      permissions: true,
    },
  });
}

export async function deleteUserRoleDB(id: number) {
  return prisma.userRole.delete({
    where: {
      id,
    },
  });
}

//? Permissions Functions
export async function getPermissionsDB() {
  return prisma.permission.findMany();
}
