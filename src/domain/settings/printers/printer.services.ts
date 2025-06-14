import {
  BreakLine,
  CharacterSet,
  PrinterTypes,
  ThermalPrinter,
} from "node-thermal-printer";
import { ZodError } from "zod";
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

      if (!data.id || data.id !== id.id) {
        logger.warn("Invalid Printer ID: ", id.id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
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

  async print(requestId: any) {
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

      const printerDevice = await getPrinterByIdDB(id.id);
      const printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: `tcp://192.168.1.21`,
        removeSpecialCharacters: false,
        lineCharacter: "=",
        breakLine: BreakLine.WORD,
      });

      let isConnected = await printer.isPrinterConnected();
      if (isConnected) {
        printer.print("Hello from Xprinter XP-80C!");
        printer.cut();

        const printStatus = await printer
          .execute()
          .then(() => console.log("Printed successfully"))
          .catch((err) => console.error(err));

        return {
          success: true,
          message: "Printed Successfully",
        };
      }

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
