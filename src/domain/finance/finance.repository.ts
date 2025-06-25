import prisma from "../../infrastructure/database/prisma/client";
import { TxClientType } from "../../types/common";
import { companyDebt, payment } from "./finance.types";

// Get all company debts
export const getCompanyDebtsDB = async () => {
  return prisma.companyDebt.findMany({
    orderBy: { createdAt: "desc" },
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
  const { company, id: _, user, ...rest } = data;
  return prisma.companyDebt.create({
    data: {
      ...rest,
    },
  });
};

// Update company debt
export const updateCompanyDebtDB = async (id: number, data: companyDebt) => {
  const { company, user, ...rest } = data;
  return prisma.companyDebt.update({
    where: { id },
    data: {
      ...rest,
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
  });
};

// Find payment by ID
export const findPaymentByIdDB = async (id: number) => {
  return prisma.payment.findUnique({
    where: { id },
  });
};

// Create payment
export const createPaymentDB = async (data: any, client: TxClientType) => {
  const { id: _, user, companyDebt, ...rest } = data;
  return client.payment.create({
    data: {
      ...rest,
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
