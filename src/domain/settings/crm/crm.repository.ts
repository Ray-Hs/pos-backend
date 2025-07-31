import prisma from "../../../infrastructure/database/prisma/client";
import {
  calculateSkip,
  Take,
} from "../../../infrastructure/utils/calculateSkip";
import { LIMIT_CONSTANT } from "../../../infrastructure/utils/constants";
import { TxClientType } from "../../../types/common";
import {
  CompanyInfo,
  CustomerDiscount,
  CustomerInfo,
  CustomerPayment,
} from "./crm.types";

//? Customer Info
export async function getCustomersInfoDB(
  pagination?: {
    limit?: number;
    page?: number;
  },
  q?: string
) {
  const whereClause: any = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { phoneNumber: { contains: q, mode: "insensitive" } },
          // { paymentMethod: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};
  return prisma.customerInfo.findMany({
    include: {
      customerDiscount: true,
    },
    where: whereClause,
    take: Take(pagination?.limit),
    skip: calculateSkip(pagination?.page, pagination?.limit),
  });
}

//? Customer Payment
export async function createCustomerPaymentDB(
  data: CustomerPayment,
  client: TxClientType = prisma
) {
  return prisma.$transaction(async (tx) => {
    const {
      customerInfoId,
      invoiceId,
      paymentDate,
      invoiceNumber,
      amount,
      note,
    } = data;

    // Get customer info
    const customerInfo = await tx.customerInfo.findUnique({
      where: { id: customerInfoId },
      include: {
        Invoice: {
          select: {
            total: true,
          },
        },
      },
    });

    if (!customerInfo) {
      throw new Error("Customer not found");
    }

    // Helper function to update customer debt
    const updateCustomerDebt = async () => {
      // Simply subtract the payment amount from the current debt
      const currentDebt = customerInfo.debt || 0;
      const newDebt = Math.max(0, currentDebt - amount); // Ensure debt doesn't go negative

      await tx.customerInfo.update({
        where: { id: customerInfoId },
        data: {
          debt: newDebt,
        },
      });
    };

    // If specific invoice is provided, handle single invoice payment
    if (invoiceId) {
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      if (!invoice.debt) {
        throw new Error("No Debts found");
      }

      if (invoice.paid) {
        throw new Error("Invoice already paid");
      }

      // Create payment record
      const payment = await tx.customerPayment.create({
        data: {
          paymentDate: paymentDate || new Date(),
          customerInfoId,
          invoiceId: invoiceId!,
          invoiceNumber,
          amount,
          note,
        },
      });

      // Update invoice status
      if (amount >= invoice.debt) {
        // Fully paid
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            paid: true,
            status: "PAID",
            debt: 0,
          },
        });
      } else {
        // Partially paid
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            paid: false,
            status: "PARTIAL",
            debt: (invoice?.debt || 0) - amount,
          },
        });
      }

      // Update customer debt
      await updateCustomerDebt();

      return payment;
    }

    // Handle multiple invoice payments (bulk payment)
    const customerInvoices = await tx.invoice.findMany({
      where: {
        customerInfoId,
        paid: false,
        paymentMethod: "DEBT",
      },
      orderBy: { createdAt: "asc" }, // Pay oldest debts first
    });

    if (
      !customerInvoices ||
      (customerInvoices.length === 0 && (customerInfo.debt || 0) > 0)
    ) {
      if ((customerInfo.debt || 0) > amount) {
        const payment = prisma.$transaction(async (tx) => {
          const customer = await updateCustomerInfoDB(
            {
              ...customerInfo,
              debt: (customerInfo.debt || 0) - amount,
            },
            customerInfoId,
            tx
          );

          const payment = await tx.customerPayment.create({
            data: {
              amount,
              customerInfoId,
              note,
              invoiceNumber,
              paymentDate: data.paymentDate || Date(),
            },
          });
          return payment;
        });

        return payment;
      } else {
        const payment = prisma.$transaction(async (tx) => {
          const customer = await updateCustomerInfoDB(
            {
              ...customerInfo,
              debt: 0,
            },
            customerInfoId,
            prisma
          );

          const payment = await tx.customerPayment.create({
            data: {
              amount,
              customerInfoId,
              note,
              invoiceNumber,
              paymentDate: data.paymentDate || Date(),
            },
          });
          return payment;
        });

        return payment;
      }
    }

    if (
      !customerInvoices ||
      (customerInvoices.length === 0 && customerInfo.debt === 0)
    ) {
      throw new Error("No unpaid invoices found for this customer");
    }

    let availablePaymentAmount = amount;
    const paymentsToCreate = [];
    let totalDebtReduction = 0;

    // Process invoices starting from the oldest
    for (const invoice of customerInvoices) {
      if (availablePaymentAmount <= 0) break;

      const amountToPay = Math.min(availablePaymentAmount, invoice.debt || 0);

      // Create payment record
      paymentsToCreate.push({
        customerInfoId,
        invoiceId: invoice.id,
        invoiceNumber,
        amount: amountToPay,
        note,
        paymentDate: paymentDate || new Date(),
      });

      // Update invoice status
      if (amountToPay >= (invoice.debt || 0)) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            paid: true,
            status: "PAID",
            debt: 0,
          },
        });
      } else {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            paid: false,
            status: "PARTIAL",
            debt: (invoice.debt || 0) - amountToPay,
          },
        });
      }

      totalDebtReduction += amountToPay;
      availablePaymentAmount -= amountToPay;
    }

    // Create all payment records
    const createdPayments = [];
    for (const paymentData of paymentsToCreate) {
      const payment = await tx.customerPayment.create({
        data: paymentData,
      });

      createdPayments.push(payment);
    }

    // Update customer debt by reducing it by the total amount paid
    const currentDebt = customerInfo.debt || 0;
    const newDebt = Math.max(0, currentDebt - totalDebtReduction);

    await tx.customerInfo.update({
      where: { id: customerInfoId },
      data: {
        debt: newDebt,
      },
    });

    return createdPayments;
  });
}

export async function getCustomerPaymentsByCustomerIdDB(
  customerInfoId: number
) {
  return prisma.customerPayment.findMany({
    where: { customerInfoId },
    include: {
      invoice: {
        select: {
          total: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
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
    const { CRMId, id, debt, customerDiscount, ...rest } = data;
    const isCRMExist = await tx.cRM.findFirst();
    const crm = isCRMExist ?? (await tx.cRM.create({}));

    return tx.customerInfo.create({
      data: {
        ...rest,
        CRMId: crm.id,
        debt,
        initialDebt: debt,
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
export async function getCompaniesInfoDB(pagination?: {
  page: number;
  limit: number;
}) {
  return prisma.companyInfo.findMany({
    take: Take(pagination?.limit),
    skip: calculateSkip(pagination?.page, pagination?.limit),
  });
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
export async function getCustomerDiscountDB(
  filter: { isActive?: boolean; page?: number } = { page: 1 },
  pagination: { page: number; limit: number } = {
    page: 1,
    limit: LIMIT_CONSTANT,
  }
) {
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
    take: Take(pagination.limit),
    skip: calculateSkip(pagination.page, pagination.limit),
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
