import { BreakLine, PrinterTypes, ThermalPrinter } from "node-thermal-printer";
import { z, ZodError } from "zod";
import prisma from "../../../infrastructure/database/prisma/client";
import {
  BAD_REQUEST_BODY_ERR,
  BAD_REQUEST_ERR,
  BAD_REQUEST_ID_ERR,
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  NOT_FOUND_ERR,
  NOT_FOUND_STATUS,
} from "../../../infrastructure/utils/constants";
import logger from "../../../infrastructure/utils/logger";
import validateType from "../../../infrastructure/utils/validateType";
import { getBrandDB } from "../branding/brand.repository";
import {
  createPrinterDB,
  deletePrinterDB,
  getPrinterByIdDB,
  getPrinterByNameDB,
  getPrintersDB,
  updatePrinterDB,
} from "./printer.repository";
import { PrinterObjectSchema, PrinterServiceInterface } from "./printer.types";

export class printerService implements PrinterServiceInterface {
  async getPrinters() {
    try {
      const data = await getPrintersDB();

      if (!data || data.length === 0) {
        logger.warn("No Printers Found");
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
      logger.error("Get Printers: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getPrinterByName(name: any) {
    try {
      const validName = await validateType(
        { name: name },
        PrinterObjectSchema.pick({ name: true })
      );
      if (!validName || validName instanceof ZodError) {
        logger.warn("Invalid Printer Name: ", validName);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }
      const data = await getPrinterByNameDB(validName.name);

      if (!data) {
        logger.warn("Printer Not Found");
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
      logger.error("Get Printer By Name: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getPrinterById(requestId: any) {
    try {
      const id = await validateType(
        { id: requestId },
        PrinterObjectSchema.pick({ id: true })
      );
      if (!id || id instanceof ZodError) {
        logger.warn("Invalid Printer ID: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const data = await getPrinterByIdDB(requestId, prisma);

      if (!data) {
        logger.warn("Printer Not Found");
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
      logger.error("Get Printer By ID: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async createPrinter(requestData: any) {
    try {
      const data = await validateType(requestData, PrinterObjectSchema);
      if (!data || data instanceof ZodError) {
        logger.warn("Invalid Printer Data: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const createdPrinter = await createPrinterDB(data);

      return {
        success: true,
        message: "Created Printer Successfully",
      };
    } catch (error) {
      logger.error("Create Printer: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updatePrinter(requestData: any, requestId: any) {
    try {
      const id = await validateType(
        { id: requestId },
        PrinterObjectSchema.pick({ id: true })
      );
      if (!id || id instanceof ZodError || !id.id) {
        logger.warn("Invalid Printer ID: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const data = await validateType(requestData, PrinterObjectSchema);
      if (!data || data instanceof ZodError) {
        logger.warn("Invalid Printer Data: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const updatedPrinter = await updatePrinterDB(data, id.id);

      return {
        success: true,
        message: "Updated Printer Successfully",
      };
    } catch (error) {
      logger.error("Update Printer: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deletePrinter(requestId: any) {
    try {
      const id = await validateType(
        { id: requestId },
        PrinterObjectSchema.pick({ id: true })
      );
      if (!id || id instanceof ZodError) {
        logger.warn("Invalid Printer ID: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      if (!id.id) {
        logger.warn("Invalid Printer ID: ", id.id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const deletedPrinter = await deletePrinterDB(id.id);

      return {
        success: true,
        message: "Deleted Printer Successfully",
      };
    } catch (error) {
      logger.error("Delete Printer: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async print(requestId: any, requestData: any) {
    try {
      const id = await validateType(
        { id: requestId },
        PrinterObjectSchema.pick({ id: true })
      );

      if (!id || id instanceof ZodError || !id.id) {
        logger.warn("Invalid Printer ID: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      // Validate requestData
      const OrderPrintSchema = z.object({
        orderId: z.number(),
        items: z.array(
          z.object({
            title_en: z.string(),
            quantity: z.number(),
            price: z.number(),
          })
        ),
        customer: z
          .object({
            name: z.string(),
            discount: z.number(),
          })
          .optional(),
        subtotal: z.number(),
        tax: z.number(),
        service: z.number(),
        total: z.number(),
      });

      const data = await validateType(requestData, OrderPrintSchema);

      if (!data || data instanceof ZodError) {
        logger.warn("Invalid Print Data: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const printerDevice = await prisma.$transaction(async (tx) => {
        const printerDevice = await getPrinterByIdDB(id?.id as number, tx);

        const brand = await getBrandDB(tx);

        const printer = new ThermalPrinter({
          type: PrinterTypes.EPSON,
          interface: `tcp://${printerDevice?.ip}`,
          removeSpecialCharacters: false,
          lineCharacter: "=",
          breakLine: BreakLine.WORD,
          width: 48, // For a 72mm printer, typically uses 48 characters per line
        });

        let isConnected = await printer.isPrinterConnected();
        if (isConnected) {
          if (brand?.receiptHeader) {
            // Header Section
            printer.alignCenter();
            printer.setTextDoubleHeight();
            printer.bold(true);
            printer.println(
              brand?.receiptHeader || brand?.restaurantName || "Restaurant"
            );
            printer.bold(false);
            printer.setTextNormal();
            printer.newLine();
          }

          // Restaurant Info
          printer.bold(true);
          printer.println(brand?.restaurantName || "Restaurant Name");
          printer.bold(false);
          printer.println(brand?.address || "");
          printer.println(`Tel: ${brand?.phoneNumber || ""}`);
          printer.drawLine();
          printer.newLine();

          // Order Details
          printer.alignLeft();
          printer.println(`Order #: ${data?.orderId}`);
          printer.println(`Date: ${new Date().toLocaleDateString()}`);
          printer.println(`Time: ${new Date().toLocaleTimeString()}`);

          // Customer Info (if available)
          if (data.customer?.name) {
            printer.println(`Customer: ${data.customer.name}`);
          }

          printer.drawLine();
          printer.newLine();

          // Items Header
          printer.bold(true);
          printer.tableCustom([
            { text: "Item", align: "LEFT" },
            { text: "Qty", align: "CENTER" },
            { text: "Price", align: "RIGHT" },
          ]);
          printer.bold(false);
          printer.drawLine();

          // Combine duplicate items by title_en and sum their quantities and prices
          const combinedItems = data.items.reduce((acc: any[], item) => {
            const existing = acc.find((i) => i.title_en === item.title_en);
            if (existing) {
              existing.quantity += item.quantity;
              existing.price += item.price * item.quantity;
            } else {
              acc.push({
                title_en: item.title_en,
                quantity: item.quantity,
                price: item.price * item.quantity,
              });
            }
            return acc;
          }, []);

          // Items List
          combinedItems.forEach((item) => {
            printer.tableCustom([
              { text: item.title_en || "", align: "LEFT" },
              {
                text: item.quantity.toString(),
                align: "CENTER",
              },
              {
                text: `${item.price.toLocaleString("en-US")}`,
                align: "RIGHT",
              },
            ]);
          });

          printer.drawLine();
          printer.newLine();

          // Totals Section
          printer.alignLeft();

          // Subtotal
          const subtotalLine =
            `Subtotal:`.padEnd(25) +
            `IQD ${data?.subtotal.toLocaleString("en-US")}`.padStart(23);
          printer.println(subtotalLine);

          // Customer Discount (if applicable)
          if (data.customer?.discount && data.customer.discount > 0) {
            const discountAmount =
              (data.customer.discount / 100) * data.subtotal;
            const discountLine =
              `Discount (${data.customer.discount.toFixed(0)}%):`.padEnd(25) +
              `- IQD ${discountAmount.toLocaleString("en-US")}`.padStart(23);
            printer.println(discountLine);

            // Subtotal after discount
            const afterDiscountTotal = data.subtotal - discountAmount;
            const afterDiscountLine =
              `After Discount:`.padEnd(25) +
              `IQD ${afterDiscountTotal.toLocaleString("en-US")}`.padStart(23);
            printer.println(afterDiscountLine);
          }

          // Tax (if applicable)
          if (data.tax !== undefined && data.tax > 0) {
            const discountAmount =
              ((data.customer?.discount || 0) / 100) * data.subtotal;
            const taxableAmount = data.customer?.discount
              ? data.subtotal - discountAmount
              : data.subtotal;
            const taxAmount = taxableAmount * data.tax;
            const taxLine =
              `Tax (${(data.tax * 100).toFixed(0)}%):`.padEnd(25) +
              `IQD ${taxAmount.toLocaleString("en-US")}`.padStart(23);
            printer.println(taxLine);
          }

          // Service Charge (if applicable)
          if (data.service && data.service > 0) {
            const serviceLine =
              `Service Charge:`.padEnd(25) +
              `IQD ${data.service.toLocaleString("en-US")}`.padStart(23);
            printer.println(serviceLine);
          }

          // Total
          printer.drawLine();
          printer.bold(true);
          printer.setTextDoubleHeight();
          const totalLine =
            `TOTAL:`.padEnd(5) +
            `IQD ${data.total.toLocaleString("en-US")}`.padStart(5);
          printer.println(totalLine);
          printer.setTextNormal();
          printer.bold(false);
          printer.drawLine();
          printer.newLine();

          // Footer Section
          printer.alignCenter();
          printer.println("Thank you for your visit!");
          printer.println("Please come again!");
          printer.newLine();

          // QR Code (if website available)
          if (brand?.website) {
            printer.printQR(brand.website, {
              cellSize: 6,
              correction: "M",
              model: 2,
            });
            printer.newLine();
            printer.println("Scan for more info");
            printer.newLine();
          }

          // Additional footer text
          if (brand?.receiptFooter) {
            printer.bold(true);
            printer.println(brand.receiptFooter);
            printer.bold(false);
            printer.newLine();
          }

          printer.newLine();
          printer.cut();
          printer.beep(2); // Reduced beeps for better customer experience

          const printStatus = await printer
            .execute()
            .then(() => {
              console.log("Receipt printed successfully");
              return { success: true };
            })
            .catch((err) => {
              console.error("Print execution error:", err);
              throw err;
            });

          return {
            success: true,
            message: "Receipt printed successfully",
          };
        } else {
          console.log("Printer Buffer: ", printer.getBuffer());
          console.warn("Printer not connected: ", isConnected);

          return {
            success: false,
            error: {
              code: BAD_REQUEST_STATUS,
              message: "Printer not connected",
            },
          };
        }
      });

      return printerDevice;
    } catch (error) {
      logger.error("Print Error: ", error);
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
