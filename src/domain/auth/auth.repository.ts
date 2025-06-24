import prisma from "../../infrastructure/database/prisma/client";
import { User } from "../../types/common";

export async function createUserDB(data: User) {
  // Exclude fields that should not be set manually
  const { role, id, roleId, ...rest } = data;
  const userData = { ...rest } as any;
  if (roleId !== undefined) {
    userData.roleId = roleId;
  }
  return prisma.user.create({
    data: userData,
  });
}

export async function deleteUserDB(id: number) {
  return prisma.user.delete({
    where: {
      id,
    },
  });
}

export async function findUserDB(id: number) {
  return prisma.user.findFirst({
    where: {
      id,
    },
    include: {
      role: true,
    },
  });
}

export async function findUserNameDB(username: string) {
  return prisma.user.findFirst({
    where: {
      username,
    },
    include: {
      role: true,
    },
  });
}

export async function updateUserDB(id: number, data: User) {
  const { role, ...rest } = data;

  return prisma.user.update({
    where: {
      id,
    },
    data: {
      ...rest,
    },
    include: {
      role: true,
    },
  });
}

export async function getUsersDB() {
  return prisma.user.findMany({
    include: {
      role: true,
    },
  });
}
