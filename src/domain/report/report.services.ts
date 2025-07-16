// src/services/report/report.service.ts
import prisma from "../../infrastructure/database/prisma/client";
import {
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  NOT_FOUND_ERR,
  NOT_FOUND_STATUS,
} from "../../infrastructure/utils/constants";
import logger from "../../infrastructure/utils/logger";
import { getSuppliesDB } from "../supply/supply.repository";
import {
  getCloseDayDB,
  getDeletedItemsDB,
  getEmployeeSalesDB,
} from "./report.repository";
import { getOrderItemsDB } from "../order-item/orderItem.repository";
import { DeletedOrderItem } from "@prisma/client";
import { TResult } from "../../types/common";
import { Report, ReportServiceInterface } from "./report.types";

class ReportService implements ReportServiceInterface {
  async getCloseDayReport(from?: Date, to?: Date): Promise<TResult<Report[]>> {
    try {
      const response = await getCloseDayDB(prisma, from, to);
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
            include: { company: { select: { name: true } } },
          },
          order: true,
        },
      });
      if (!response || response.length === 0) {
        return {
          success: false,
          error: { code: NOT_FOUND_STATUS, message: NOT_FOUND_ERR },
        };
      }

      const data: Report[] = response.map((orderItem) => {
        const totalSellingPrice = (orderItem.price || 0) * orderItem.quantity;
        const totalPurchasePrice =
          (orderItem.menuItem.price || 0) * orderItem.quantity;
        return {
          code: orderItem.menuItem.code || "",
          productName: orderItem.menuItem.title_en,
          companyName: orderItem.menuItem.company?.name || "",
          quantity: orderItem.quantity,
          sellingPrice: orderItem.price,
          purchasePrice: orderItem.menuItem.price,
          totalSellingPrice,
          totalPurchasePrice,
          profit: totalSellingPrice - totalPurchasePrice,
        };
      });

      return { success: true, data };
    } catch (error) {
      logger.error("Get Daily Report:", error);
      return {
        success: false,
        error: { code: INTERNAL_SERVER_STATUS, message: INTERNAL_SERVER_ERR },
      };
    }
  }

  async getCompanyReport(from?: Date, to?: Date): Promise<TResult<Report[]>> {
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

  async getEmployeeReport(from?: Date, to?: Date): Promise<TResult<Report[]>> {
    try {
      const response = await getEmployeeSalesDB(prisma, from, to);
      if (!response || response.length === 0) {
        return {
          success: false,
          error: { code: NOT_FOUND_STATUS, message: NOT_FOUND_ERR },
        };
      }
      const data: Report[] = response.map((row) => ({
        code: row.employeeId.toString(),
        productName: row.product,
        companyName: row.employeeName,
        quantity: row.quantity,
        sellingPrice: row.unitPrice,
        purchasePrice: row.costPrice,
        totalSellingPrice: row.quantity * row.unitPrice,
        totalPurchasePrice: row.quantity * row.costPrice,
        profit: row.quantity * (row.unitPrice - row.costPrice),
      }));

      return { success: true, data };
    } catch (error) {
      logger.error("Get Employee Report:", error);
      return {
        success: false,
        error: { code: INTERNAL_SERVER_STATUS, message: INTERNAL_SERVER_ERR },
      };
    }
  }

  async getDeletedItemsReport(
    from?: Date,
    to?: Date
  ): Promise<TResult<DeletedOrderItem[]>> {
    try {
      const response = await getDeletedItemsDB(prisma, from, to);
      if (!response || response.length === 0) {
        return {
          success: false,
          error: { code: NOT_FOUND_STATUS, message: NOT_FOUND_ERR },
        };
      }
      return { success: true, data: response };
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
