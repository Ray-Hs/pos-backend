import prisma from "../../infrastructure/database/prisma/client";
import { ExchangeRate } from "./exchange.types";

export async function getExchangeRates() {
  return prisma.exchangeRate.findMany({
    include: {
      user: {
        select: {
          username: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function getLatestExchangeRate() {
  return prisma.exchangeRate.findFirst({
    include: {
      user: {
        select: {
          username: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createExchangeRate(data: ExchangeRate) {
  const { user, ...rest } = data;
  return prisma.exchangeRate.create({
    data: {
      ...rest,
    },
  });
}
