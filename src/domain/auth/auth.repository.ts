import prisma from "../../infrastructure/database/prisma/client";
import { User } from "../../types/common";

export async function createUserDB(username: string, password: string) {
  return prisma.user.create({
    data: { username, password },
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
  });
}

export async function findUserNameDB(username: string) {
  return prisma.user.findFirst({
    where: {
      username,
    },
  });
}

export async function updateUserDB(id: number, data: User) {
  return prisma.user.update({
    where: {
      id,
    },
    data,
  });
}

export async function getUsersDB() {
  return prisma.user.findMany();
}
