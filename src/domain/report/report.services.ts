// import prisma from "../../infrastructure/database/prisma/client";
// import {
//   INTERNAL_SERVER_ERR,
//   INTERNAL_SERVER_STATUS,
//   NOT_FOUND_ERR,
//   NOT_FOUND_STATUS,
// } from "../../infrastructure/utils/constants";
// import logger from "../../infrastructure/utils/logger";
// import { getCompanyDebtsDB } from "../finance/finance.repository";
// import { getCompaniesInfoDB } from "../settings/crm/crm.repository";
// import { getSuppliesDB } from "../supply/supply.repository";
// import { Report, ReportServiceInterface } from "./report.types";

// class ReportService implements ReportServiceInterface {
//   async getDailyReport() {
//     try {
//       const response = await getSuppliesDB();

//       if (!response || response.length === 0) {
//         return {
//           success: false,
//           error: { code: NOT_FOUND_STATUS, message: NOT_FOUND_ERR },
//         };
//       }

//       const data: Report[] = response.map((supply) => ({
//         code: supply.barcode || "",
//         productName: supply.name,
//         companyName: supply.company.name,
//         quantity: supply.itemQty * supply.packageQty,
//         sellingPrice: supply.itemSellPrice,
//         purchasePrice: supply.itemPrice,
//         profit:
//           (supply.totalPrice || 0) -
//           (supply.totalItems || 0) * supply.itemSellPrice,
//         totalPurchasePrice: supply.totalPrice || 0,
//         totalSellingPrice: (supply.totalItems || 0) * supply.itemSellPrice,
//       }));

//       return {
//         success: true,
//         data,
//       };
//     } catch (error) {
//       logger.error("Get Daily Report: ", error);
//       return {
//         success: false,
//         error: {
//           code: INTERNAL_SERVER_STATUS,
//           message: INTERNAL_SERVER_ERR,
//         },
//       };
//     }
//   }
//   async getCompanyReport() {
//     try {
//       const response = await getCompanyDebtsDB(prisma, "asc");

//       if (!response || response.length === 0) {
//         return {
//           success: false,
//           error: { code: NOT_FOUND_STATUS, message: NOT_FOUND_ERR },
//         };
//       }

//       const data: Report[] = response.map((company) => ({
//         code: company.company.code || "",
//         productName: company.product,
//         companyName: company.company.name,
//         quantity: company.quantity,
//         sellingPrice: 0,
//         purchasePrice: 0,
//         profit:0,
//         totalPurchasePrice: company,
//         totalSellingPrice: (company.totalItems || 0) * company.itemSellPrice,
//       }));

//       return {
//         success: true,
//         data,
//       };
//     } catch (error) {
//       logger.error("Get Daily Report: ", error);
//       return {
//         success: false,
//         error: {
//           code: INTERNAL_SERVER_STATUS,
//           message: INTERNAL_SERVER_ERR,
//         },
//       };
//     }
//   }
// }
