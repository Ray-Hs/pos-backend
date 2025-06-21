import { BreakLine, PrinterTypes, ThermalPrinter } from "node-thermal-printer";
import { z, ZodError } from "zod";
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
import { OrderItemSchema } from "../../../types/common";
import { getConstantsDB } from "../../constants/constants.repository";
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
      const data = await getPrinterByIdDB(requestId);

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
        item: z.object({
          title_en: z.string(),
          quantity: z.number(),
          price: z.number(),
        }),
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
      const constants = await getConstantsDB();

      const brand = await getBrandDB();
      const printerDevice = await getPrinterByIdDB(id.id);
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
        printer.alignCenter();
        printer.setTextDoubleHeight();
        printer.println(brand?.receiptHeader || "");
        printer.setTextNormal();
        printer.newLine();
        printer.drawLine();
        printer.bold(true);
        printer.println(brand?.restaurantName || "Restaurant Name");
        printer.bold(false);
        printer.println(brand?.address || "");
        printer.println(`Tel: ${brand?.phoneNumber}`);
        printer.drawLine();

        printer.alignLeft();
        printer.println(`Order #: ${data?.orderId}`);
        printer.println("Date: " + new Date().toLocaleString());
        printer.drawLine();

        // Items
        printer.tableCustom([
          { text: "Item", align: "LEFT" },
          { text: "Qty", align: "CENTER" },
          { text: "Price", align: "RIGHT" },
        ]);
        printer.tableCustom([
          { text: data?.item?.title_en || "", align: "LEFT" },
          { text: data?.item?.quantity?.toString() || "1", align: "CENTER" },
          { text: data?.item?.price?.toString() || "", align: "RIGHT" },
        ]);

        printer.drawLine();
        printer.alignLeft();
        printer.println(`Subtotal: $${data?.subtotal}`);
        constants.tax && printer.println(`Tax: $${constants.tax.rate}`);
        constants.service &&
          printer.println(`Service: $${constants.service.amount}`);
        printer.println(`Total: $${data.total}`);

        printer.alignCenter();
        printer.newLine();
        printer.printQR(brand?.website || "", {
          cellSize: 7, // QR Cell Size, default 3
          correction: "M", // QR Correction Level, default 'M'
          model: 2, // QR Model, default 2
        });
        printer.newLine();
        printer.println(brand?.receiptFooter || "");
        printer.cut();
        printer.beep(4);

        const printStatus = await printer
          .execute()
          .then(() => console.log("Printed successfully"))
          .catch((err) => console.error(err));

        return {
          success: true,
          message: "Printed Successfully",
        };
      }

      console.log("Printer Buffer: ", printer.getBuffer());
      console.warn("Is Connected: ", isConnected);
      return {
        success: false,
        error: {
          code: BAD_REQUEST_STATUS,
          message: BAD_REQUEST_ERR,
        },
      };
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
