import prisma from "../../infrastructure/database/prisma/client";
import { TxClientType } from "../../types/common";
import { Constant } from "./constants.types";

export async function getConstantsDB(client: TxClientType) {
  const [tax, service] = await Promise.all([
    client.tax.findFirst(),
    client.service.findFirst(),
  ]);

  return { tax, service };
}

export async function createConstantsDB(data: Constant) {
  if (!data.tax && !data.service) {
    throw new Error("Either tax or service data must be provided");
  }

  return prisma.$transaction(async (tx) => {
    try {
      if (data.tax) {
        const tax = await tx.tax.create({ data: data.tax });
        return { tax };
      }

      const service = await tx.service.create({ data: data.service! });
      return { service };
    } catch (error) {
      throw new Error(`Failed to create constant: ${error}`);
    }
  });
}

export async function updateConstantsDB(data: Constant) {
  if (!data.tax?.id && !data.service?.id) {
    throw new Error("Valid ID must be provided for update");
  }

  return prisma.$transaction(async (tx) => {
    try {
      if (data.tax?.id) {
        const tax = await tx.tax.update({
          where: { id: data.tax.id },
          data: data.tax,
        });
        return { tax };
      }

      const service = await tx.service.update({
        where: { id: data.service!.id },
        data: data.service!,
      });
      return { service };
    } catch (error) {
      throw new Error(`Failed to update constant: ${error}`);
    }
  });
}

export async function deleteConstantsDB(data: Constant) {
  if (!data.tax?.id && !data.service?.id) {
    throw new Error("Valid ID must be provided for deletion");
  }

  return prisma.$transaction(async (tx) => {
    try {
      if (data.tax?.id) {
        const tax = await tx.tax.delete({
          where: { id: data.tax.id },
        });
        return { tax };
      }

      const service = await tx.service.delete({
        where: { id: data.service!.id },
      });
      return { service };
    } catch (error) {
      throw new Error(`Failed to delete constant: ${error}`);
    }
  });
}
