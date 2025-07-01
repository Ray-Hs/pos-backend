import { ZodError } from "zod";
import prisma from "../../../infrastructure/database/prisma/client";
import {
  BAD_REQUEST_BODY_ERR,
  BAD_REQUEST_ID_ERR,
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  LIMIT_CONSTANT,
  NOT_FOUND_ERR,
  NOT_FOUND_STATUS,
} from "../../../infrastructure/utils/constants";
import logger from "../../../infrastructure/utils/logger";
import validateType from "../../../infrastructure/utils/validateType";
import {
  createCompanyInfoDB,
  createCustomerDiscountDB,
  createCustomerInfoDB,
  createCustomerPaymentDB,
  deleteCompanyInfoDB,
  deleteCustomerDiscountDB,
  deleteCustomerInfoDB,
  getCompaniesInfoDB,
  getCompanyInfoByIdDB,
  getCustomerByIdDB,
  getCustomerByPhoneDB,
  getCustomerDiscountByIdDB,
  getCustomerDiscountDB,
  getCustomersInfoDB,
  updateCompanyInfoDB,
  updateCustomerDiscountDB,
  updateCustomerInfoDB,
} from "./crm.repository";
import {
  CompanyInfoSchema,
  CRMServiceInterface,
  CustomerDiscountSchema,
  CustomerInfoSchema,
  CustomerPaymentRequestSchema,
} from "./crm.types";

export class CRMServices implements CRMServiceInterface {
  async getCustomers(
    pagination: { limit?: number; page?: number } = {
      page: 1,
      limit: LIMIT_CONSTANT,
    }
  ) {
    try {
      const data = await getCustomersInfoDB(pagination);
      if (!data) {
        logger.warn("Customers Not Found");
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
      logger.error("Get Customers: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async createCustomerPayment(requestData: any) {
    try {
      const data = await validateType(
        requestData,
        CustomerPaymentRequestSchema
      );

      if (!data || data instanceof ZodError) {
        logger.warn("Type Error: ", data);
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

      // Validate customer exists
      const customer = await getCustomerByIdDB(data.customerInfoId, prisma);
      if (!customer) {
        logger.warn("Customer not found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: "Customer not found",
          },
        };
      }

      await createCustomerPaymentDB(data, prisma);

      return {
        success: true,
        message: "Created Customer Payment Successfully",
      };
    } catch (error) {
      logger.error("Create Customer Payment: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: error instanceof Error ? error.message : INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getCustomerDebts() {
    try {
      const customerInfos = await prisma.customerInfo.findMany({
        include: {
          Invoice: {
            where: { isLatestVersion: true, paymentMethod: "DEBT" },
            select: {
              id: true,
              subtotal: true,
              total: true,
              paymentMethod: true,
              paid: true,
              createdAt: true,
              invoiceRef: {
                select: {
                  Order: {
                    select: {
                      items: {
                        select: {
                          menuItem: {
                            select: {
                              title_ar: true,
                              title_en: true,
                              title_ku: true,
                              price: true,
                              image: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          customerDiscount: {
            select: {
              discount: true,
              customerInfo: {
                select: {
                  initialDebt: true,
                },
              },
            },
          },
        },
      });
      if (!customerInfos || customerInfos.length === 0) {
        logger.warn("Customers Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const data = customerInfos.map((customer) => {
        return {
          customer: {
            id: customer.id,
            name: customer.name,
            phoneNumber: customer.phoneNumber,
            email: customer.email,
            debt: customer.debt,
            initialDebt: customer.initialDebt,
            code: customer.code,
            note: customer.note,
            discount: customer.customerDiscount?.discount,
          },
          invoices: customer.Invoice.map((invoice) => ({
            id: invoice.id,
            subtotal: invoice.subtotal,
            total: invoice.total,
            paymentMethod: invoice.paymentMethod,
            paid: invoice.paid,
            createdAt: invoice.createdAt,
            items: invoice.invoiceRef.Order?.items.map((item) => ({
              title_en: item.menuItem.title_en,
              title_ar: item.menuItem.title_ar,
              title_ku: item.menuItem.title_ku,
              price: item.menuItem.price,
              image: item.menuItem.image,
            })),
          })),
        };
      });

      return { success: true, data };
    } catch (error) {
      logger.error("Get Customers: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getCustomerByPhone(phone: any) {
    try {
      const validated = await validateType(
        { phoneNumber: phone },
        CustomerInfoSchema.pick({ phoneNumber: true })
      );
      if (!validated || validated instanceof ZodError) {
        logger.warn("Type Error: ", validated);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const data = await getCustomerByPhoneDB(validated.phoneNumber);
      if (!data) {
        logger.warn("Customer Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      return { success: true, data };
    } catch (error) {
      logger.error("Get Customer By Phone: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getCustomerById(requestId: any) {
    try {
      const validated = await validateType(
        { id: requestId },
        CustomerInfoSchema.pick({ id: true })
      );
      if (!validated || validated instanceof ZodError) {
        logger.warn("Type Error: ", validated);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      if (!validated.id) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const data = await getCustomerByIdDB(validated.id, prisma);
      if (!data) {
        logger.warn("Customer Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      return { success: true, data };
    } catch (error) {
      logger.error("Get Customer By Id: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async createCustomer(requestData: any) {
    try {
      const data = await validateType(requestData, CustomerInfoSchema);
      if (!data || data instanceof ZodError) {
        logger.warn("Error: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }
      const phoneNumberExists = await getCustomerByPhoneDB(data.phoneNumber);
      if (phoneNumberExists) {
        logger.warn("A User with the same phone number exists already.");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "A User with the same phone number exists already.",
          },
        };
      }
      await createCustomerInfoDB(data);
      return {
        success: true,
        message: "Created Customer Successfully",
      };
    } catch (error) {
      logger.error("Create Customer: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updateCustomer(requestData: any, requestId: any) {
    try {
      const data = await validateType(requestData, CustomerInfoSchema);
      if (!data || data instanceof ZodError) {
        logger.warn("Error: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }
      const id = await validateType(
        { id: requestId },
        CustomerInfoSchema.pick({ id: true })
      );
      if (!id || id instanceof ZodError || !id.id) {
        logger.warn("Type Error: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      await updateCustomerInfoDB(data, id.id, prisma);
      return {
        success: true,
        message: "Updated Customer Successfully",
      };
    } catch (error) {
      logger.error("Update Customer: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deleteCustomer(requestId: any) {
    try {
      const id = await validateType(
        { id: requestId },
        CustomerInfoSchema.pick({ id: true })
      );
      if (!id || id instanceof ZodError || !id.id) {
        logger.warn("Type Error: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      await deleteCustomerInfoDB(id.id);
      return {
        success: true,
        message: "Deleted Customer Successfully",
      };
    } catch (error) {
      logger.error("Delete Customer: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getCompanies(pagination: { page: number; limit: number }) {
    try {
      const data = await getCompaniesInfoDB(pagination);
      if (!data) {
        logger.warn("Companies Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      return { success: true, data };
    } catch (error) {
      logger.error("Get Companies: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getCompanyById(requestId: any) {
    try {
      const id = await validateType(
        { id: requestId },
        CompanyInfoSchema.pick({ id: true })
      );
      if (!id || id instanceof ZodError || !id.id) {
        logger.warn("Type Error: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const data = await getCompanyInfoByIdDB(id.id, prisma);
      if (!data) {
        logger.warn("Company Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      return { success: true, data };
    } catch (error) {
      logger.error("Get Company By Id: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async createCompany(requestData: any) {
    try {
      const data = await validateType(requestData, CompanyInfoSchema);
      if (!data || data instanceof ZodError) {
        logger.warn("Error: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }
      await createCompanyInfoDB(data);
      return {
        success: true,
        message: "Created Company Successfully",
      };
    } catch (error) {
      logger.error("Create Company: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updateCompany(requestData: any, requestId: any) {
    try {
      const data = await validateType(requestData, CompanyInfoSchema);
      if (!data || data instanceof ZodError) {
        logger.warn("Error: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }
      const id = await validateType(
        { id: requestId },
        CompanyInfoSchema.pick({ id: true })
      );
      if (!id || id instanceof ZodError || !id.id) {
        logger.warn("Type Error: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      await updateCompanyInfoDB(data, id.id);
      return {
        success: true,
        message: "Updated Company Successfully",
      };
    } catch (error) {
      logger.error("Update Company: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deleteCompany(requestId: any) {
    try {
      const id = await validateType(
        { id: requestId },
        CompanyInfoSchema.pick({ id: true })
      );
      if (!id || id instanceof ZodError || !id.id) {
        logger.warn("Type Error: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      await deleteCompanyInfoDB(id.id);
      return {
        success: true,
        message: "Deleted Company Successfully",
      };
    } catch (error) {
      logger.error("Delete Company: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getCustomerDiscounts(
    filter: { isActive?: boolean; page?: number },
    pagination: { page: number; limit: number }
  ) {
    try {
      const data = await getCustomerDiscountDB(filter, pagination);
      if (!data) {
        logger.warn("Customer Discounts Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      return { success: true, data };
    } catch (error) {
      logger.error("Get Customer Discounts: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getCustomerDiscountById(
    requestId: any,
    filter: {
      isActive: boolean;
    }
  ) {
    try {
      const id = await validateType(
        { id: requestId },
        CustomerDiscountSchema.pick({ id: true })
      );
      if (!id || id instanceof ZodError || !id.id) {
        logger.warn("Type Error: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const data = await getCustomerDiscountByIdDB(id.id, filter);
      if (!data) {
        logger.warn("Customer Discount Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      return { success: true, data };
    } catch (error) {
      logger.error("Get Customer Discount By Id: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async createCustomerDiscount(requestData: any) {
    try {
      const data = await validateType(requestData, CustomerDiscountSchema);
      if (!data || data instanceof ZodError) {
        logger.warn("Error: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }
      await createCustomerDiscountDB(data);
      return {
        success: true,
        message: "Created Customer Discount Successfully",
      };
    } catch (error) {
      logger.error("Create Customer Discount: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updateCustomerDiscount(requestData: any, requestId: any) {
    try {
      const data = await validateType(requestData, CustomerDiscountSchema);
      if (!data || data instanceof ZodError) {
        logger.warn("Error: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }
      const id = await validateType(
        { id: requestId },
        CustomerDiscountSchema.pick({ id: true })
      );
      if (!id || id instanceof ZodError || !id.id) {
        logger.warn("Type Error: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      await updateCustomerDiscountDB(data, id.id);
      return {
        success: true,
        message: "Updated Customer Discount Successfully",
      };
    } catch (error) {
      logger.error("Update Customer Discount: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deleteCustomerDiscount(requestId: any) {
    try {
      const id = await validateType(
        { id: requestId },
        CustomerDiscountSchema.pick({ id: true })
      );
      if (!id || id instanceof ZodError || !id.id) {
        logger.warn("Type Error: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      await deleteCustomerDiscountDB(id.id);
      return {
        success: true,
        message: "Deleted Customer Discount Successfully",
      };
    } catch (error) {
      logger.error("Delete Customer Discount: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getCustomerPayments(
    pagination: {
      limit: number;
      page: number;
    } = {
      limit: LIMIT_CONSTANT,
      page: 1,
    }
  ) {
    try {
      const payments = await prisma.customerPayment.findMany({
        include: {
          customerInfo: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              email: true,
              debt: true,
              initialDebt: true,
            },
          },
          invoice: {
            select: {
              total: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: pagination.limit,
        skip: Math.abs((pagination.page - 1) * pagination.limit),
      });

      const formattedData = payments.reduce((acc: any, payment) => {
        const customerKey = payment.customerInfo.id;

        if (!acc[customerKey]) {
          acc[customerKey] = {
            customer: {
              name: payment.customerInfo.name,
              phoneNumber: payment.customerInfo.phoneNumber,
              email: payment.customerInfo.email,
              debt: payment.customerInfo.debt,
              initialDebt: payment.customerInfo.initialDebt,
            },
            payments: payments.map(
              ({ customerInfo, customerInfoId, invoice, ...payment }) => ({
                ...payment,
              })
            ),
          };
        }

        return acc;
      }, {});

      return { success: true, data: Object.values(formattedData) };
    } catch (error) {
      logger.error("Get Customer Payments: ", error);
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
