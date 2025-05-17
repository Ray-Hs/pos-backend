import { randomUUID } from "crypto";
import prisma from "../../infrastructure/database/prisma/client";
import { Table } from "../../types/common";
import {
  BAD_REQUEST_ERR,
  BAD_REQUEST_STATUS,
  NOT_FOUND_STATUS,
} from "../../infrastructure/utils/constants";
import { getLatestOrderDB } from "../order/order.repository";

export function getTablesDB() {
  return prisma.table.findMany({
    include: {
      orders: {
        include: {
          items: true,
        },
      },
    },
  });
}

export function findTableByIdDB(id: number) {
  return prisma.table.findFirst({
    where: {
      id,
    },
    include: {
      orders: {
        include: {
          items: true,
        },
      },
    },
  });
}

export function findTableByNameDB(name: string) {
  return prisma.table.findFirst({
    where: {
      name,
    },
    include: {
      orders: {
        include: {
          items: true,
        },
      },
    },
  });
}

export function createTableDB(
  data: Table,
  quantity: number,
  sectionId: number
) {
  const { orders } = data;
  return prisma.$transaction(async (tx) => {
    if (quantity > 1) {
      return tx.table.createMany({
        data: Array.from({ length: quantity }).map((_, i) => ({
          sectionId,
          status: "AVAILABLE",
          name: `New Table ${randomUUID().slice(0, 6)}`,
        })),
      });
    } else {
      return tx.table.create({
        data: {
          ...data,
          orders: {
            connect: orders?.map((order) => ({ id: order.id })),
          },
        },
        include: {
          orders: {
            include: {
              items: true,
            },
          },
        },
      });
    }
  });
}

export function updateTableDB(id: number, data: Table) {
  const { orders, id: _id, ...rest } = data;
  return prisma.table.update({
    where: {
      id,
    },
    data: {
      ...rest,
      orders: orders
        ? {
            connect: orders?.map((order) => ({ id: order.id })),
          }
        : undefined,
    },
    include: {
      orders: {
        include: {
          items: true,
        },
      },
    },
  });
}

export function deleteTableDB(id: number) {
  return prisma.table.delete({
    where: {
      id,
    },
    include: {
      orders: {
        include: {
          items: true,
        },
      },
    },
  });
}

interface TransferResponse {
  success: boolean;
  message: string;
  code?: number;
  data?: any;
}

export function transferTableDB(
  idOne: number,
  idTwo: number
): Promise<TransferResponse> {
  if (!idOne || !idTwo) {
    return Promise.resolve({
      success: false,
      message: "Both table IDs are required",
      code: BAD_REQUEST_STATUS,
    });
  }

  if (idOne === idTwo) {
    return Promise.resolve({
      success: false,
      message: "Cannot transfer table to itself",
      code: BAD_REQUEST_STATUS,
    });
  }

  return prisma.$transaction(async (tx) => {
    const tableOne = await tx.table.findUnique({
      where: { id: idOne },
      include: { orders: true },
    });

    const tableTwo = await tx.table.findUnique({
      where: { id: idTwo },
      include: { orders: true },
    });

    if (!tableOne || !tableTwo) {
      return {
        success: false,
        message: "Tables not found",
        code: NOT_FOUND_STATUS,
      };
    }

    if (tableTwo.status === "OCCUPIED") {
      return {
        success: false,
        message: "Cannot transfer orders from/to unavailable tables",
        code: BAD_REQUEST_STATUS,
      };
    }

    const latestOrderOne = await getLatestOrderDB(tableTwo.id);

    if (!latestOrderOne) {
      return {
        success: false,
        message: "No orders to transfer",
        code: BAD_REQUEST_STATUS,
      };
    }

    // First disconnect orders from source table
    await tx.table.update({
      where: { id: idOne },
      data: {
        orders: {
          disconnect: {
            id: latestOrderOne?.id,
          },
        },
      },
    });

    // Then connect orders to destination table
    const updatedTable = await tx.table.update({
      where: { id: idTwo },
      data: {
        orders: {
          connect: {
            id: latestOrderOne?.id,
          },
        },
      },
      include: {
        orders: {
          include: {
            items: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Transfer completed successfully",
      data: updatedTable,
    };
  });
}
