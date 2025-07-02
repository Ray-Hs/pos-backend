import { ZodError } from "zod";
import {
  BAD_REQUEST_BODY_ERR,
  BAD_REQUEST_ID_ERR,
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  NOT_FOUND_ERR,
  NOT_FOUND_STATUS,
} from "../../infrastructure/utils/constants";
import logger from "../../infrastructure/utils/logger";
import validateType from "../../infrastructure/utils/validateType";
import {
  createCompanyDebtDB,
  deleteCompanyDebtDB,
  findCompanyDebtByIdDB,
  getCompanyDebtsDB,
  listCompanyDebtsByCompanyIdDB,
  updateCompanyDebtDB,
} from "./finance.repository"; // adjust import path as needed
import {
  AllCompanyDebt,
  companyDebt,
  CompanyDebtSchema,
  FinanceServiceInterface,
  payment,
  PaymentSchema,
} from "./finance.types";

// Helper functions for payment DB operations (to be implemented in finance.repository)
import prisma from "../../infrastructure/database/prisma/client";
import { getCompanyInfoByIdDB } from "../settings/crm/crm.repository";
import {
  createPaymentDB,
  deletePaymentDB,
  findPaymentByIdDB,
  getPaymentsDB,
  updatePaymentDB,
} from "./finance.repository";
import { User } from "../../types/common";
import { calculatePages } from "../../infrastructure/utils/calculateSkip";

export class FinanceServices implements FinanceServiceInterface {
  async getAllCompanyDebts() {
    try {
      const dataResponse = await prisma.companyDebt.findMany({
        include: {
          company: {
            select: {
              name: true,
              phoneNumber: true,
              code: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (dataResponse.length === 0) {
        logger.warn("No Company Debts Found.");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      const data: AllCompanyDebt[] = dataResponse.map((debt) => ({
        companyDebtId: debt.id,
        companyName: debt.company.name,
        phoneNumber: debt.company.phoneNumber ?? "",
        code: debt.company.code,
        remainingAmount: debt.remainingAmount,
        createdAt: debt.createdAt,
      }));

      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error("Create Payment Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async createPayment(requestData: any) {
    try {
      const data = await validateType(requestData, PaymentSchema);
      if (data instanceof ZodError) {
        logger.warn("Missing Info: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      if (data.amount <= 0) {
        logger.warn("Invalid Amount.");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "Invalid Amount.",
          },
        };
      }

      const company = await getCompanyInfoByIdDB(data.companyId, prisma);
      if (data.currency !== company?.currency) {
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message:
              "The provided currency does not match the company's registered currency.",
          },
        };
      }

      const createdPayment = await prisma.$transaction(async (tx) => {
        // Get company debts sorted by latest first (desc order)
        const companyDebts = await listCompanyDebtsByCompanyIdDB(
          data.companyId,
          tx,
          "asc"
        );

        const allDebtsPaid = companyDebts.every(
          (debt) => debt.status === "PAID"
        );

        if (allDebtsPaid) {
          throw new Error("All debts are already paid.");
        }

        if (!companyDebts || companyDebts.length === 0) {
          throw new Error("No company debts found");
        }

        let availablePaymentAmount = data.amount; // This is how much we still have left to allocate
        const paymentsToCreate = [];
        const debtsToUpdate: companyDebt[] = [];

        // Process debts starting from the latest
        for (const debt of companyDebts) {
          if (availablePaymentAmount <= 0) break; // No more payment left to allocate

          const debtRemainingAmount = debt.remainingAmount || 0;

          if (debtRemainingAmount <= 0) continue; // Skip already paid debts

          // Calculate how much we can pay for this specific debt
          const amountToPaidForThisDebt = Math.min(
            availablePaymentAmount,
            debtRemainingAmount
          );

          // Create payment record for this debt
          paymentsToCreate.push({
            ...data,
            note: data.note,
            amount: amountToPaidForThisDebt, // This is the actual paid amount for this debt
            companyDebtId: debt.id, // Assuming you have a relation to the debt
            currency: debt.currency,
          });

          // Calculate what remains unpaid on this debt after our payment
          const newDebtRemainingAmount =
            debtRemainingAmount - amountToPaidForThisDebt;

          // Update debt with new remaining amount
          debtsToUpdate.push({
            ...debt,
            id: debt.id,
            remainingAmount: newDebtRemainingAmount, // What's still owed on this debt
            status: newDebtRemainingAmount <= 0 ? "PAID" : "PARTIAL", // Assuming you have status field
          });

          // Reduce available payment amount (what we have left to allocate to other debts)
          availablePaymentAmount -= amountToPaidForThisDebt;
        }

        // Create all payment records
        const createdPayments = [];
        for (const paymentData of paymentsToCreate) {
          const payment = await createPaymentDB(paymentData, tx);
          createdPayments.push(payment);
        }

        // Update all affected debts
        for (const debtUpdate of debtsToUpdate) {
          await updateCompanyDebtDB(debtUpdate?.id as number, debtUpdate, tx);
        }

        // If there's still available payment amount left, you might want to handle it
        // (e.g., create a credit balance, throw an error, etc.)
        if (availablePaymentAmount > 0) {
          logger.info(`Excess payment amount: ${availablePaymentAmount}`);
          // Handle excess payment as needed - maybe create a credit balance
        }

        return createdPayments;
      });

      return {
        success: true,
        message: "Created Payment Successfully",
      };
    } catch (error) {
      logger.error("Create Payment Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getPaymentById(requestId: number) {
    try {
      const response = await validateType(
        { id: requestId },
        CompanyDebtSchema.pick({ id: true })
      ); // Replace with PaymentSchema if available
      if (response instanceof ZodError || !response.id) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const data = await findPaymentByIdDB(response.id);
      if (!data) {
        logger.warn("Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const {
        companyDebt: { companyId },
        ...rest
      } = data;

      return {
        success: true,
        data: { ...rest, companyId },
      };
    } catch (error) {
      logger.error("Get Payment By ID Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updatePayment(requestId: any, requestData: any) {
    try {
      const response = await validateType(
        { id: requestId },
        CompanyDebtSchema.pick({ id: true })
      ); // Replace with PaymentSchema if available
      if (response instanceof ZodError || !response.id) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const data = await validateType(requestData, PaymentSchema); // Replace with PaymentSchema if available
      if (data instanceof ZodError || !data) {
        logger.warn("Missing Info: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }
      const existing = await findPaymentByIdDB(response.id);
      if (!existing) {
        logger.warn("Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      await updatePaymentDB(response.id as number, data, prisma);
      return {
        success: true,
        message: "Updated Payment Successfully",
      };
    } catch (error) {
      logger.error("Update Payment Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deletePayment(requestId: number) {
    try {
      const response = await validateType(
        { id: requestId },
        CompanyDebtSchema.pick({ id: true })
      ); // Replace with PaymentSchema if available
      if (response instanceof ZodError || !response.id) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const existing = await findPaymentByIdDB(response.id);
      if (!existing) {
        logger.warn("Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      await deletePaymentDB(response.id);
      return {
        success: true,
        message: "Deleted Payment Successfully",
      };
    } catch (error) {
      logger.error("Delete Payment Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async listPayments(
    {
      fromDate,
      toDate,
    }: {
      fromDate?: string;
      toDate?: string;
    },
    pagination?: {
      limit?: number;
      page?: number;
    }
  ) {
    try {
      const data = await getPaymentsDB(
        {
          fromDate,
          toDate,
        },
        pagination
      );
      if (!data || data.length === 0) {
        logger.warn("No Payments found.");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      // Calculate total debt for IQD and USD
      const totalDebt = await prisma.companyDebt.groupBy({
        by: ["currency"],
        _sum: {
          totalAmount: true,
        },
      });

      // Calculate total paid for IQD and USD
      const totalPaid = await prisma.payment.groupBy({
        by: ["currency"],
        _sum: {
          amount: true,
        },
      });

      const totalPages = await prisma.payment.count();

      // Ensure each payment object matches the expected shape
      const payments: payment[] = data.map((item) => ({
        ...item,
        id: item.id,
        userId: item.userId,
        companyId: item.companyDebt.companyId,
        companyDebtId: item.companyDebtId,
        invoiceNumber: item.invoiceNumber,
        amount: item.amount,
        currency: item.currency,
        note: item.note,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        user: item.user as User,
        company: item.companyDebt.company,
        paymentDate: item.paymentDate,
      }));

      return {
        success: true,
        data: {
          payments,
          totalDebt: {
            IQD:
              totalDebt.find((debt) => debt.currency === "IQD")?._sum
                .totalAmount ?? 0,
            USD:
              totalDebt.find((debt) => debt.currency === "USD")?._sum
                .totalAmount ?? 0,
          },
          totalPaid: {
            IQD:
              totalPaid.find((debt) => debt.currency === "IQD")?._sum.amount ??
              0,
            USD:
              totalPaid.find((debt) => debt.currency === "USD")?._sum.amount ??
              0,
          },
          pages: calculatePages(totalPages, pagination?.limit),
        },
      };
    } catch (error) {
      logger.error("Get Payments Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async listCompanyDebts(
    {
      fromDate,
      toDate,
    }: {
      fromDate?: string;
      toDate?: string;
    },
    pagination?: {
      limit?: number;
      page?: number;
    }
  ) {
    try {
      const data = await getCompanyDebtsDB(
        prisma,
        "desc",
        {
          fromDate,
          toDate,
        },
        pagination
      );
      if (!data) {
        logger.warn("No Company Debts found.");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      // Calculate total debt for IQD and USD
      const totalDebt = await prisma.companyDebt.groupBy({
        by: ["currency"],
        _sum: {
          totalAmount: true,
        },
      });

      // Calculate total paid for IQD and USD
      const totalPaid = await prisma.payment.groupBy({
        by: ["currency"],
        _sum: {
          amount: true,
        },
      });

      const totalPages = await prisma.companyDebt.count();

      return {
        success: true,
        data: {
          companyDebt: data.map((debt) => ({
            ...debt,
            user: debt.user as User,
          })),
          totalDebt: {
            IQD:
              totalDebt.find((debt) => debt.currency === "IQD")?._sum
                .totalAmount ?? 0,
            USD:
              totalDebt.find((debt) => debt.currency === "USD")?._sum
                .totalAmount ?? 0,
          },
          totalPaid: {
            IQD:
              totalPaid.find((debt) => debt.currency === "IQD")?._sum.amount ??
              0,
            USD:
              totalPaid.find((debt) => debt.currency === "USD")?._sum.amount ??
              0,
          },
          pages: calculatePages(totalPages, pagination?.limit),
        },
      };
    } catch (error) {
      logger.error("Get Finances Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getCompanyDebtById(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        CompanyDebtSchema.pick({ id: true })
      );
      if (response instanceof ZodError || !response.id) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const data = await findCompanyDebtByIdDB(response.id);
      if (!data) {
        logger.warn("Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error("Get Finance By ID Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async createCompanyDebt(requestData: any) {
    try {
      const data = await validateType(requestData, CompanyDebtSchema);
      if (data instanceof ZodError) {
        logger.warn("Missing Info: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }
      await createCompanyDebtDB(data, prisma);
      return {
        success: true,
        message: "Created Company Debt Successfully",
      };
    } catch (error) {
      logger.error("Create Finance Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updateCompanyDebt(requestId: any, requestData: any) {
    try {
      const response = await validateType(
        { id: requestId },
        CompanyDebtSchema.pick({ id: true })
      );
      if (response instanceof ZodError || !response.id) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const data = await validateType(requestData, CompanyDebtSchema);
      if (data instanceof ZodError) {
        logger.warn("Missing Info: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }
      const existingFinance = await findCompanyDebtByIdDB(response.id);
      if (!existingFinance) {
        logger.error("Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      await updateCompanyDebtDB(response.id, data, prisma);
      return {
        success: true,
        message: "Updated Company Debt Successfully",
      };
    } catch (error) {
      logger.error("Update Finance Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deleteCompanyDebt(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        CompanyDebtSchema.pick({ id: true })
      );
      if (response instanceof ZodError || !response.id) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const existingFinance = await findCompanyDebtByIdDB(response.id);
      if (!existingFinance) {
        logger.warn("Finance Doesn't exist");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      if (existingFinance.status !== "PENDING") {
        logger.warn(
          "Cannot delete a debt that has payments associated with it."
        );
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message:
              "Cannot delete a debt that has payments associated with it.",
          },
        };
      }
      await deleteCompanyDebtDB(response.id);
      return {
        success: true,
        message: "Deleted Company Debt Successfully",
      };
    } catch (error) {
      logger.error("Delete Finance Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
}
