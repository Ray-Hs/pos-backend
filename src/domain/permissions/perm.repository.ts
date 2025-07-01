import prisma from "../../infrastructure/database/prisma/client";
import { TxClientType, UserRole } from "../../types/common";

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

export async function createUserRoleDB(data: UserRole, client: TxClientType) {
  const { permissions, name, description } = data;

  return client.userRole.create({
    data: {
      name,
      description,
      permissions: {
        connectOrCreate: permissions?.map((perm) => ({
          where: { key: perm.key },
          create: { ...perm },
        })),
      },
    },
    include: {
      permissions: true,
    },
  });
}

export async function updateUserRoleDB(id: number, data: UserRole) {
  const { permissions, ...rest } = data;

  return prisma.userRole.update({
    where: {
      id,
    },
    data: {
      ...rest,
      permissions: {
        set:
          permissions?.map(({ createdAt, updatedAt, ...perm }) => ({
            ...perm,
            key: perm.key,
          })) || [],
      },
    },
    include: {
      permissions: true,
    },
  });
}

export async function deleteUserRoleDB(id: number, client: TxClientType) {
  return client.userRole.delete({
    where: {
      id,
    },
  });
}

//? Permissions Functions
export async function getPermissionsDB() {
  return prisma.permission.findMany();
}
