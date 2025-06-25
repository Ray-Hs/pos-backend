import prisma from "../../infrastructure/database/prisma/client";
import { companyDebt } from "./finance.types";

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
  const { company, id: _, ...rest } = data;
  return prisma.companyDebt.create({
    data: {
      ...rest,
    },
  });
};

// Update company debt
export const updateCompanyDebtDB = async (id: number, data: companyDebt) => {
  const { company, ...rest } = data;
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
