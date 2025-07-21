// src/services/report/report.service.ts
import prisma from "../../infrastructure/database/prisma/client";
import {
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  NOT_FOUND_ERR,
  NOT_FOUND_STATUS,
} from "../../infrastructure/utils/constants";
import logger from "../../infrastructure/utils/logger";
import { TResult } from "../../types/common";
import { getOrderItemsDB } from "../order-item/orderItem.repository";
import { getSuppliesDB } from "../supply/supply.repository";
import {
  getCloseDayDB,
  getDeletedItemsDB,
  getEmployeeSalesDB,
} from "./report.repository";
import { Report, ReportServiceInterface } from "./report.types";

class ReportService implements ReportServiceInterface {
  async getCloseDayReport(
    from?: Date,
    to?: Date,
    company?: string
  ): Promise<TResult<Report[]>> {
    try {
      const response = await getCloseDayDB(prisma, from, to, company);
      if (!response || response.length === 0) {
        return {
          success: false,
          error: { code: NOT_FOUND_STATUS, message: NOT_FOUND_ERR },
        };
      }

      const data: Report[] = response.map((row) => ({
        code: row.barcode || "",
        productName: row.name,
        companyName: row.company?.name || "",
        quantity: row.itemQty * row.packageQty,
        sellingPrice: row.itemSellPrice,
        purchasePrice: row.itemPrice,
        totalSellingPrice: (row.totalItems || 0) * row.itemSellPrice,
        totalPurchasePrice: row.totalPrice || 0,
        profit:
          (row.totalItems || 0) * row.itemSellPrice - (row.totalPrice || 0),
      }));

      return { success: true, data };
    } catch (error) {
      logger.error("Get Close Day Report:", error);
      return {
        success: false,
        error: { code: INTERNAL_SERVER_STATUS, message: INTERNAL_SERVER_ERR },
      };
    }
  }

  async getDailyReport(from?: Date, to?: Date): Promise<TResult<Report[]>> {
    try {
      // build date filter
      const where: any = {};
      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = from;
        if (to) where.createdAt.lte = to;
      }

      const response = await getOrderItemsDB({
        where,
        include: {
          menuItem: {
            include: {
              company: { select: { name: true } },
              SubCategory: {
                select: { Category: { select: { title_en: true } } },
              },
            },
          },
          order: {
            select: {
              Invoice: {
                select: { invoices: { select: { paymentMethod: true } } },
              },
              createdAt: true,
            },
          },
        },
      });

      if (!response || response.length === 0) {
        return {
          success: false,
          error: { code: NOT_FOUND_STATUS, message: NOT_FOUND_ERR },
        };
      }

      // Group by menu item title_en
      const groupedData = response.reduce((acc, orderItem) => {
        const key = orderItem.menuItem.title_en;

        if (!acc[key]) {
          acc[key] = {
            code: orderItem.menuItem.code || "",
            productName: orderItem.menuItem.title_en,
            companyName: orderItem.menuItem.company?.name || "",
            quantity: 0,
            paymentMethod: {
              card: 0,
              cash: 0,
              debt: 0,
            },
            salesTime: [] as Array<{ time: Date; quantity: number }>,
            category: orderItem.menuItem.SubCategory?.Category?.title_en || "",
            sellingPrice: orderItem.price,
            purchasePrice: orderItem.menuItem.price,
            totalSellingPrice: 0,
            totalPurchasePrice: 0,
            profit: 0,
            totalQuantityForPayment: 0,
          };
        }

        // Aggregate quantities
        acc[key].quantity += orderItem.quantity;
        acc[key].totalQuantityForPayment += orderItem.quantity;
        acc[key].totalSellingPrice +=
          (orderItem.price || 0) * orderItem.quantity;
        acc[key].totalPurchasePrice +=
          (orderItem.menuItem.price || 0) * orderItem.quantity;

        // Track payment methods - handle array safely
        const invoices = orderItem.order?.Invoice?.[0]?.invoices;
        if (invoices && invoices.length > 0) {
          const paymentMethod = invoices[0]?.paymentMethod
            ?.toLowerCase()
            ?.trim();
          if (paymentMethod === "card") {
            acc[key].paymentMethod.card += orderItem.quantity;
          } else if (paymentMethod === "cash") {
            acc[key].paymentMethod.cash += orderItem.quantity;
          } else if (paymentMethod === "debt") {
            acc[key].paymentMethod.debt += orderItem.quantity;
          } else {
            // If payment method doesn't match any of the above, default to cash
            acc[key].paymentMethod.cash += orderItem.quantity;
          }
        } else {
          // If no payment method found, default to cash
          acc[key].paymentMethod.cash += orderItem.quantity;
        }

        // Track sales time by hour ONLY (remove duplicate tracking)
        if (orderItem.order?.createdAt) {
          const orderDate = new Date(orderItem.order.createdAt);
          // Create hour key by setting minutes, seconds, milliseconds to 0
          const hourKey = new Date(
            orderDate.getFullYear(),
            orderDate.getMonth(),
            orderDate.getDate(),
            orderDate.getHours(),
            0, // minutes
            0, // seconds
            0 // milliseconds
          );

          const existingHour = acc[key].salesTime.find(
            (st: any) => st.time.getTime() === hourKey.getTime()
          );

          if (existingHour) {
            existingHour.quantity += orderItem.quantity;
          } else {
            acc[key].salesTime.push({
              time: hourKey,
              quantity: orderItem.quantity,
            });
          }
        }

        return acc;
      }, {} as Record<string, any>);

      // Convert to percentages for payment methods and calculate final profit
      const data = Object.values(groupedData).map((item) => {
        const total = item.totalQuantityForPayment;

        // Convert payment method quantities to percentages
        const paymentMethod = {
          card:
            total > 0 ? Math.round((item.paymentMethod.card / total) * 100) : 0,
          cash:
            total > 0 ? Math.round((item.paymentMethod.cash / total) * 100) : 0,
          debt:
            total > 0 ? Math.round((item.paymentMethod.debt / total) * 100) : 0,
        };

        // Ensure percentages add up to 100% by adjusting the largest percentage
        const percentageSum =
          paymentMethod.card + paymentMethod.cash + paymentMethod.debt;
        if (percentageSum !== 100 && total > 0) {
          const difference = 100 - percentageSum;
          // Find the payment method with the highest value and adjust it
          if (
            paymentMethod.cash >= paymentMethod.card &&
            paymentMethod.cash >= paymentMethod.debt
          ) {
            paymentMethod.cash += difference;
          } else if (paymentMethod.card >= paymentMethod.debt) {
            paymentMethod.card += difference;
          } else {
            paymentMethod.debt += difference;
          }
        }

        // Sort sales times by hour
        item.salesTime.sort(
          (a: any, b: any) => a.time.getTime() - b.time.getTime()
        );

        // Calculate final profit
        item.profit = item.totalSellingPrice - item.totalPurchasePrice;

        // Remove helper field and return clean object
        const { totalQuantityForPayment, ...cleanItem } = item;

        return {
          ...cleanItem,
          paymentMethod,
        };
      });

      // Sort by product name
      data.sort((a, b) => a.productName.localeCompare(b.productName));

      return { success: true, data };
    } catch (error) {
      logger.error("Get Daily Report:", error);
      return {
        success: false,
        error: { code: INTERNAL_SERVER_STATUS, message: INTERNAL_SERVER_ERR },
      };
    }
  }

  async getCompanyReport(
    from?: Date,
    to?: Date,
    company?: string
  ): Promise<TResult<Report[]>> {
    try {
      const response = await getSuppliesDB();
      if (!response || response.length === 0) {
        return {
          success: false,
          error: { code: NOT_FOUND_STATUS, message: NOT_FOUND_ERR },
        };
      }

      // optional date filter on supply.createdAt
      const filtered = response.filter((s) => {
        if (from && s.createdAt < from) return false;
        if (to && s.createdAt > to) return false;
        if (company && company.toLowerCase() !== s.company.name.toLowerCase())
          return false;
        return true;
      });

      const data: Report[] = filtered.map((supply) => {
        const totalBuyingPrice = supply.itemPrice * supply.itemQty;
        const totalSellingPrice = supply.itemSellPrice * supply.itemQty;
        return {
          code: supply.barcode || "",
          productName: supply.name,
          companyName: supply.company.name,
          quantity: supply.itemQty,
          sellingPrice: supply.itemSellPrice,
          purchasePrice: supply.itemPrice,
          totalSellingPrice,
          totalPurchasePrice: totalBuyingPrice,
          profit: totalSellingPrice - totalBuyingPrice,
        };
      });

      return { success: true, data };
    } catch (error) {
      logger.error("Get Company Report:", error);
      return {
        success: false,
        error: { code: INTERNAL_SERVER_STATUS, message: INTERNAL_SERVER_ERR },
      };
    }
  }

  async getEmployeeReport(
    from?: Date,
    to?: Date,
    employee?: string
  ): Promise<TResult<any>> {
    try {
      const response = await getEmployeeSalesDB(prisma, from, to, employee);
      if (!response || response.length === 0) {
        return {
          success: false,
          error: { code: NOT_FOUND_STATUS, message: NOT_FOUND_ERR },
        };
      }

      // Group by employee name
      const groupedData: Record<string, Report[]> = {};

      response.forEach((row) => {
        const employeeName = row.employeeName;

        if (!groupedData[employeeName]) {
          groupedData[employeeName] = [];
        }

        groupedData[employeeName].push({
          code: row.code,
          productName: row.productName, // This should be product name, not employee name
          companyName: row.companyName,
          quantity: row.quantity,
          sellingPrice: row.unitPrice,
          purchasePrice: row.costPrice,
          totalSellingPrice: row.quantity * row.unitPrice,
          totalPurchasePrice: row.quantity * row.costPrice,
          profit: row.quantity * (row.unitPrice - row.costPrice),
        });
      });

      return { success: true, data: groupedData };
    } catch (error) {
      logger.error("Get Employee Report:", error);
      return {
        success: false,
        error: { code: INTERNAL_SERVER_STATUS, message: INTERNAL_SERVER_ERR },
      };
    }
  }

  async getDeletedItemsReport(from?: Date, to?: Date) {
    try {
      const response = await getDeletedItemsDB(prisma, from, to);
      if (!response || response.length === 0) {
        return {
          success: false,
          error: { code: NOT_FOUND_STATUS, message: NOT_FOUND_ERR },
        };
      }
      return {
        success: true,
        data: response.map((res) => ({
          orderId: res.orderId,
          order: res.order,
          items: res.items.map(({ order, ...item }) => ({
            ...item,
          })),
        })),
      };
    } catch (error) {
      logger.error("Get Deleted Items Report:", error);
      return {
        success: false,
        error: { code: INTERNAL_SERVER_STATUS, message: INTERNAL_SERVER_ERR },
      };
    }
  }
}

export default ReportService;
