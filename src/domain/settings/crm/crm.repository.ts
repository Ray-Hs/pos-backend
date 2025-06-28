import prisma from "../../../infrastructure/database/prisma/client";
import { TxClientType } from "../../../types/common";
import { CompanyInfo, CustomerDiscount, CustomerInfo } from "./crm.types";

//? Customer Info
export async function getCustomersInfoDB() {
  return prisma.customerInfo.findMany({
    include: {
      customerDiscount: true,
    },
  });
}

export async function getCustomerByPhoneDB(phoneNumber: string) {
  return prisma.customerInfo.findFirst({
    where: {
      phoneNumber: phoneNumber,
    },
    include: {
      customerDiscount: true,
    },
  });
}

export async function getCustomerByIdDB(
  requestId: number,
  client: TxClientType
) {
  return client.customerInfo.findFirst({
    where: {
      id: requestId,
    },
    include: {
      customerDiscount: true,
    },
  });
}

export async function createCustomerInfoDB(data: CustomerInfo) {
  return prisma.$transaction(async (tx) => {
    const { CRMId, id, customerDiscount, ...rest } = data;
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

export async function updateCustomerInfoDB(
  data: CustomerInfo,
  id: number,
  client: TxClientType
) {
  const { CRMId, id: _, customerDiscount, ...rest } = data;
  const isCRMExist = await client.cRM.findFirst();
  const crm = isCRMExist ?? (await client.cRM.create({}));

  return client.customerInfo.update({
    where: {
      id,
    },
    data: {
      ...rest,
      CRMId: crm.id,
    },
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

export async function getCompanyInfoByIdDB(id: number, client: TxClientType) {
  return client.companyInfo.findFirst({
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
export async function getCustomerDiscountDB(filter?: { isActive?: boolean }) {
  const whereClause =
    filter !== undefined
      ? {
          isActive: {
            equals: filter?.isActive,
          },
        }
      : {};

  return prisma.customerDiscount.findMany({
    where: whereClause,
  });
}

export async function getCustomerDiscountByIdDB(
  id: number,
  filter?: { isActive?: boolean }
) {
  console.log(filter);
  return prisma.customerDiscount.findFirst({
    where: {
      id,
      ...(filter !== undefined
        ? { isActive: { equals: filter.isActive } }
        : {}),
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
