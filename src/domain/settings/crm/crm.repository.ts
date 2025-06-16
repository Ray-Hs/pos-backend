import prisma from "../../../infrastructure/database/prisma/client";
import { CompanyInfo, CustomerDiscount, CustomerInfo } from "./crm.types";

//? Customer Info
export async function getCustomersInfoDB() {
  return prisma.customerInfo.findMany();
}

export async function getCustomerByPhoneDB(phoneNumber: string) {
  return prisma.customerInfo.findFirst({
    where: {
      phoneNumber: phoneNumber,
    },
  });
}

export async function getCustomerByIdDB(requestId: number) {
  return prisma.customerInfo.findFirst({
    where: {
      id: requestId,
    },
  });
}

export async function createCustomerInfoDB(data: CustomerInfo) {
  return prisma.$transaction(async (tx) => {
    const { CRMId, id, ...rest } = data;
    const isCRMExist = await tx.cRM.findFirst();
    const crm = isCRMExist ?? (await tx.cRM.create({}));

    return tx.customerInfo.create({
      data: {
        ...rest,
        CRMId: crm.id,
      },
    });
  });
}

export async function updateCustomerInfoDB(data: CustomerInfo, id: number) {
  return prisma.$transaction(async (tx) => {
    const { CRMId, id: _, ...rest } = data;
    const isCRMExist = await tx.cRM.findFirst();
    const crm = isCRMExist ?? (await tx.cRM.create({}));

    return tx.customerInfo.update({
      where: {
        id,
      },
      data: {
        ...rest,
        CRMId: crm.id,
      },
    });
  });
}

export async function deleteCustomerInfoDB(id: number) {
  return prisma.customerInfo.delete({
    where: {
      id,
    },
  });
}

//? Company Info
export async function getCompaniesInfoDB() {
  return prisma.companyInfo.findMany();
}

export async function getCompanyInfoByIdDB(id: number) {
  return prisma.companyInfo.findFirst({
    where: { id },
  });
}

export async function createCompanyInfoDB(data: CompanyInfo) {
  return prisma.$transaction(async (tx) => {
    const { CRMId, id: _, ...rest } = data;
    const isCRMExist = await tx.cRM.findFirst();
    const crm = isCRMExist ?? (await tx.cRM.create({}));

    return tx.companyInfo.create({
      data: {
        ...rest,
        CRMId: crm.id,
      },
    });
  });
}

export async function updateCompanyInfoDB(data: CompanyInfo, id: number) {
  return prisma.$transaction(async (tx) => {
    const { CRMId, id: _, ...rest } = data;
    const isCRMExist = await tx.cRM.findFirst();
    const crm = isCRMExist ?? (await tx.cRM.create({}));

    return tx.companyInfo.update({
      where: {
        id,
      },
      data: {
        ...rest,
        CRMId: crm.id,
      },
    });
  });
}

export async function deleteCompanyInfoDB(id: number) {
  return prisma.companyInfo.delete({
    where: {
      id,
    },
  });
}

//? Customer Discount
export async function getCustomerDiscountDB() {
  return prisma.customerDiscount.findMany();
}

export async function getCustomerDiscountByIdDB(id: number) {
  return prisma.customerDiscount.findFirst({
    where: {
      id,
    },
  });
}

export async function createCustomerDiscountDB(data: CustomerDiscount) {
  return prisma.$transaction(async (tx) => {
    const { CRMId, id: _, ...rest } = data;
    const isCRMExist = await tx.cRM.findFirst();
    const crm = isCRMExist ?? (await tx.cRM.create({}));

    return tx.customerDiscount.create({
      data: {
        ...rest,
        CRMId: crm.id,
      },
    });
  });
}

export async function updateCustomerDiscountDB(
  data: CustomerDiscount,
  id: number
) {
  return prisma.$transaction(async (tx) => {
    const { CRMId, id: _, ...rest } = data;
    const isCRMExist = await tx.cRM.findFirst();
    const crm = isCRMExist ?? (await tx.cRM.create({}));

    return tx.customerDiscount.update({
      where: {
        id,
      },
      data: {
        ...rest,
        CRMId: crm.id,
      },
    });
  });
}

export async function deleteCustomerDiscountDB(id: number) {
  return prisma.customerDiscount.delete({
    where: {
      id,
    },
  });
}
