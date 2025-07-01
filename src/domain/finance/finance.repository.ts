import prisma from "../../infrastructure/database/prisma/client";
import { LIMIT_CONSTANT } from "../../infrastructure/utils/constants";
import { TxClientType } from "../../types/common";
import { companyDebt, payment } from "./finance.types";

// Get all company debts
export const getCompanyDebtsDB = async (
  client: TxClientType,
  filter: {
    order: "asc" | "desc";
    page: number;
  },
  dates?: { fromDate?: string; toDate?: string } | undefined
) => {
  const normalizeDate = (date?: string, endOfDay = false) =>
    date
      ? new Date(
          endOfDay
            ? `${date.split("T")[0]}T23:59:59.999Z`
            : `${date.split("T")[0]}T00:00:00.000Z`
        )
      : undefined;

  const from = normalizeDate(dates?.fromDate);
  const to = normalizeDate(dates?.toDate, true);

  const whereClause =
    from || to
      ? {
          createdAt: {
            ...(from && { gte: from }),
            ...(to && { lte: to }),
          },
        }
      : {};
  return client.companyDebt.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          role: true,
          username: true,
        },
      },
      company: {
        select: {
          name: true,
          phoneNumber: true,
          currency: true,
          code: true,
        },
      },
    },
    take: LIMIT_CONSTANT,
    skip: Math.abs((filter.page - 1) * LIMIT_CONSTANT),
    orderBy: { createdAt: filter.order },
  });
};
// Get all company debts
export const listCompanyDebtsByCompanyIdDB = async (
  id: number,
  client: TxClientType,
  filter: "asc" | "desc"
) => {
  return client.companyDebt.findMany({
    where: {
      companyId: id,
    },
    orderBy: { createdAt: filter },
  });
};

// Find company debt by ID with error handling
export const findCompanyDebtByIdDB = async (id: number) => {
  return prisma.companyDebt.findUnique({
    where: { id },
  });
};

// Create company debt
export const createCompanyDebtDB = async (
  data: companyDebt,
  client: TxClientType
) => {
  const { company, id: _, remainingAmount, companyId, ...rest } = data;
  return client.companyDebt.create({
    data: {
      ...rest,
      companyId: companyId as number,
      remainingAmount: data.totalAmount,
    },
  });
};

// Update company debt
export const updateCompanyDebtDB = async (
  id: number,
  data: companyDebt,
  client: TxClientType
) => {
  const { company, status, ...rest } = data;
  return client.companyDebt.update({
    where: { id },
    data: {
      ...rest,
      status: status || "PARTIAL",
    },
  });
};

// Delete company debt
export const deleteCompanyDebtDB = async (id: number) => {
  return prisma.companyDebt.delete({
    where: { id },
  });
};

/**
 * Payment DB functions
 */

// Get all payments
export const getPaymentsDB = async ({
  fromDate,
  toDate,
  page,
}: {
  fromDate?: string;
  toDate?: string;
  page: number;
}) => {
  const normalizeDate = (date?: string, endOfDay = false) =>
    date
      ? new Date(
          endOfDay
            ? `${date.split("T")[0]}T23:59:59.999Z`
            : `${date.split("T")[0]}T00:00:00.000Z`
        )
      : undefined;

  const from = normalizeDate(fromDate);
  const to = normalizeDate(toDate, true);

  const whereClause =
    from || to
      ? {
          paymentDate: {
            ...(from && { gte: from }),
            ...(to && { lte: to }),
          },
        }
      : {};
  return prisma.payment.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          role: true,
          username: true,
        },
      },
      companyDebt: {
        include: {
          company: true,
        },
      },
    },
    take: LIMIT_CONSTANT,
    skip: Math.abs((page - 1) * LIMIT_CONSTANT),
  });
};

// Find payment by ID
export const findPaymentByIdDB = async (id: number) => {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      companyDebt: {
        select: {
          companyId: true,
        },
      },
    },
  });
};

// Create payment
export const createPaymentDB = async (data: payment, client: TxClientType) => {
  const { id: _, companyDebt, companyId, ...rest } = data;
  return client.payment.create({
    data: {
      ...rest,
      companyDebtId: data.companyDebtId as number,
    },
  });
};

// Update payment
export const updatePaymentDB = async (
  id: number,
  data: payment,
  client: TxClientType
) => {
  const { companyDebt, ...rest } = data;
  return client.payment.update({
    where: { id },
    data: {
      ...rest,
    },
  });
};

// Delete payment
export const deletePaymentDB = async (id: number) => {
  return prisma.payment.delete({
    where: { id },
  });
};
