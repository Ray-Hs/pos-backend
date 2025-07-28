import fs from "fs";
import { PrinterTypes, ThermalPrinter } from "node-thermal-printer";
import path from "path";
import puppeteer from "puppeteer";
import { z, ZodError } from "zod";
import prisma from "../../../infrastructure/database/prisma/client";
import {
  BAD_REQUEST_BODY_ERR,
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
  MenuItemSchema,
  Order,
  OrderItem,
  OrderItemSchema,
  OrderSchema,
  UserSchema,
} from "../../../types/common";
import { getLatestOrderDB } from "../../order/order.repository";
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

  async print(requestData: any): Promise<{
    success: boolean;
    error?: { code: number; message: string };
    details?: Array<{ ip: string; success: boolean; error?: string }>;
  }> {
    const itemSchema = z.object({
      id: z.number(),
      menuItemId: z.number(),
      notes: z.string().nullable().optional(),
      price: z.number(),
      quantity: z.number(),
      menuItem: MenuItemSchema.extend({ Printer: PrinterObjectSchema }),
    });
    // 1) First, fetch menuItems for all items that have menuItemId
    const enrichedMarkedOrders = await Promise.all(
      (requestData.markedOrders || []).map(async (markedOrder: any) => {
        if (markedOrder.item?.menuItemId) {
          const menuItem = await prisma.menuItem.findFirst({
            where: { id: markedOrder.item.menuItemId },
            include: { Printer: true }, // Include printer info
          });

          if (!menuItem) {
            throw new Error(
              `MenuItem not found for ID: ${markedOrder.item.menuItemId}`
            );
          }

          return {
            ...markedOrder,
            item: {
              ...markedOrder.item,
              menuItem,
            },
          };
        }
        return markedOrder;
      })
    );

    // 2) Validate input with enriched data
    const MarkedOrderSchema = z.object({
      item: itemSchema,
      status: z.enum(["ADDED", "REMOVED", "STALE"]),
    });

    const schema = z.object({
      user: UserSchema,
      tableId: z.number(),
      markedOrders: z.array(MarkedOrderSchema),
    });

    let data: z.infer<typeof schema>;
    try {
      data = schema.parse({
        ...requestData,
        markedOrders: enrichedMarkedOrders,
      });
    } catch (err) {
      logger.warn("Invalid Print Data:", err);
      return {
        success: false,
        error: { code: BAD_REQUEST_STATUS, message: BAD_REQUEST_BODY_ERR },
      };
    }

    // 3) Filter only ADDED and REMOVED items (skip STALE)
    const changedOrders = data.markedOrders.filter(
      (markedOrder) =>
        markedOrder.status === "ADDED" || markedOrder.status === "REMOVED"
    );

    if (changedOrders.length === 0) {
      logger.info("No added/removed items to print for table", data.tableId);
      return { success: true, details: [] };
    }

    // 4) Group items by printer IP
    const itemsByPrinter = changedOrders.reduce<
      Record<string, typeof changedOrders>
    >((acc, markedOrder) => {
      const ip = markedOrder.item.menuItem.Printer?.ip;
      if (!ip)
        throw new Error(`No printer for item ${markedOrder.item.menuItem.id}`);
      (acc[ip] ||= []).push(markedOrder);
      return acc;
    }, {});

    // 5) Print each batch via canvas + CanvasTable
    const results = await Promise.all(
      Object.entries(itemsByPrinter).map(async ([ip, markedOrders]) => {
        const printer = new ThermalPrinter({
          type: PrinterTypes.EPSON,
          interface: `tcp://${ip}`,
          options: { timeout: 10000 },
        });

        if (!(await printer.isPrinterConnected())) {
          logger.warn(`Printer ${ip} not connected`);
          return { ip, success: false, error: "Not connected" };
        }

        // Print and cut
        try {
          // 2) Aggregate & count duplicates, grouping by item properties and status
          const aggregated = markedOrders.reduce<
            Array<{
              item: z.infer<typeof schema>["markedOrders"][0]["item"];
              status: z.infer<typeof schema>["markedOrders"][0]["status"];
              quantity: number;
            }>
          >((acc, markedOrder) => {
            const existing = acc.find(
              (aggItem) =>
                aggItem.item.menuItem.title_en ===
                  markedOrder.item.menuItem.title_en &&
                aggItem.item.notes === markedOrder.item.notes &&
                aggItem.status === markedOrder.status
            );
            if (existing) {
              existing.quantity++;
            } else {
              acc.push({
                item: markedOrder.item,
                status: markedOrder.status,
                quantity: 1,
              });
            }
            return acc;
          }, []);

          // 3) Sort so those with notes come first, then by status (ADDED first, then REMOVED)
          aggregated.sort((a, b) => {
            // First sort by notes (items with notes first)
            const noteSort = +!!b.item.notes - +!!a.item.notes;
            if (noteSort !== 0) return noteSort;

            // Then sort by status (ADDED before REMOVED)
            if (a.status === "ADDED" && b.status === "REMOVED") return -1;
            if (a.status === "REMOVED" && b.status === "ADDED") return 1;
            return 0;
          });

          // 4) Build your `<tbody>` rows
          const rowsHtml = aggregated
            .map((aggItem) => {
              const noteHtml = aggItem.item.notes
                ? `<div class="item-note bold">◇ ${aggItem.item.notes}</div>`
                : "";

              const statusPrefix = aggItem.status === "REMOVED" ? "❌ " : "";
              const statusClass =
                aggItem.status === "REMOVED" ? "removed-item" : "";

              return `
    <tr class="${statusClass}">
      <td class="qty-col">${aggItem.quantity} X</td>
      <td class="item-col">
        <div class="item-name">${statusPrefix}${aggItem.item.menuItem.title_en}</div>
        ${noteHtml}
      </td>
    </tr>
  `;
            })
            .join("");

          // 5) Get order info for receipt header
          const order = await getLatestOrderDB(data.tableId);
          const orderId = order?.id || data.tableId;
          const tableName = order?.table?.name || `Table ${data.tableId}`;

          // 6) Final template, with dynamic rows and enhanced styling for removed items
          const kitchenReceiptTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
      body {
        display: flex;
        justify-content: center;
        background: #f0f0f0;
      }
      .receipt {
        padding: 6px;
        width: 300px;
        background: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
        transform: scale(2);
        transform-origin: top center;
        font-family: monospace;
        line-height: 1.4;
      }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      hr {
        border: none;
        border-top: 1px dashed #333;
        margin: 8px 0;
      }
      .item {
        display: flex;
        gap: 0.5em;
      }
      .qty   { width: 2em; }
      .title { flex: 1; }
      .note  {
        margin-left: 2.5em;
        font-size: 0.85em;
        color: #555;
      }
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10px;
      }
        
      .items-table th {
          background: #000;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: bold;
          font-size: 13px;
      }
      
      .items-table td {
          padding: 12px 8px;
          border-bottom: 1px solid #eee;
          vertical-align: top;
      }
      
      .items-table tbody tr:nth-child(even) {
          background: #f9f9f9;
      }
      
      .items-table tbody tr:hover {
          background: #f0f0f0;
      }
      
      .removed-item {
          background: #ffe6e6 !important;
          text-decoration: line-through;
      }
      
      .removed-item:hover {
          background: #ffcccc !important;
      }
      
      .qty-col {
          width: 15%;
          text-align: center;
          font-weight: bold;
      }
      
      .item-col {
          width: 85%;
      }
      
      .item-name {
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
      }
      
      .item-note {
          font-size: 14px;
          color: #666;
          font-style: italic;
          margin-left: 4px;
      }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="center bold">KITCHEN ORDER</div>
    <div>Order #: ${orderId}</div>
    <div>Table   : ${tableName}</div>
    <div>User    : ${data.user.username || ""}</div>
    <div>Time    : ${new Date().toLocaleString()}</div>
    <hr/>

    <table class="items-table">
      <thead>
        <tr>
          <th class="qty-col">QTY</th>
          <th class="item-col">ITEMS TO PREPARE</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <hr/>
    <div class="center">--- END OF ORDER ---</div>
  </div>
</body>
</html>`;

          const outputPath = await renderReceipt(kitchenReceiptTemplate);
          const image = fs.readFileSync(outputPath);
          if (image) {
            await printer.printImageBuffer(image);
            printer.cut();
            await printer.execute();
            fs.unlinkSync(outputPath);
            logger.info(`Printed ${markedOrders.length} items on ${ip}`);
          }
          return { ip, success: true };
        } catch (err) {
          logger.error(`Print failed on ${ip}:`, err);
          return { ip, success: false, error: String(err) };
        }
      })
    );

    // 5) Consolidate
    return { success: results.every((r) => r.success), details: results };
  }
}

async function renderReceipt(html: string) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // 1) Load your HTML
  await page.setContent(html);

  // 2) Grab the receipt container
  const receipt = await page.$(".receipt");
  if (!receipt) {
    throw new Error("Could not find .receipt element");
  }

  // 3) Screenshot just that element
  const buffer = await receipt.screenshot({
    omitBackground: true, // => removes any transparent padding
  });

  await browser.close();

  // 4) Write it out
  const outPath = path.join(__dirname, "kitchen-receipt.png");
  fs.writeFileSync(outPath, buffer);

  return outPath;
}
