import prisma from "../../infrastructure/database/prisma/client";
import { TxClientType } from "../../types/common";
import { companyDebt, payment } from "./finance.types";

// Get all company debts
export const getCompanyDebtsDB = async (
  client: TxClientType,
  filter: "asc" | "desc"
) => {
  return client.companyDebt.findMany({
    include: {
      company: {
        select: {
          name: true,
          phoneNumber: true,
          currency: true,
        },
      },
    },
    orderBy: { createdAt: filter },
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
export const createCompanyDebtDB = async (data: companyDebt) => {
  const { company, id: _, remainingAmount, companyId, user, ...rest } = data;
  return prisma.companyDebt.create({
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
  const { company, user, status, ...rest } = data;
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
export const getPaymentsDB = async () => {
  return prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      companyDebt: {
        select: {
          companyId: true,
        },
      },
    },
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
  const { id: _, user, companyDebt, companyId, ...rest } = data;
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
  const { user, companyDebt, ...rest } = data;
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
