import { ZodError } from "zod";
import prisma from "../../../infrastructure/database/prisma/client";
import { Brand } from "./brand.types";

export async function getBrandDB() {
  return prisma.branding.findFirst();
}

export async function createBrandDB(data: Brand) {
  return prisma.$transaction(async (tx) => {
    const [existingBrand, existingSettings] = await Promise.all([
      tx.branding.findFirst(),
      tx.settings.findFirst(),
    ]);

    if (existingBrand) {
      throw new ZodError([
        {
          code: "custom",
          message:
            "A brand already exists. Only one brand configuration is allowed.",
          path: ["branding"],
          fatal: true,
        },
      ]);
    }

    const settings =
      existingSettings ?? (await tx.settings.create({ data: {} }));

    return tx.branding.create({
      data: {
        ...data,
        settingsId: settings.id,
      },
    });
  });
}

export async function updateBrandDB(id: number, data: Brand) {
  return prisma.$transaction(async (tx) => {
    const isSettingsAvailable = await tx.settings.findFirst();
    const isBrandAvailable = await tx.branding.findFirst();
    if (!isSettingsAvailable) {
      const newSettings = await tx.settings.create({
        data: {},
      });
      if (!isBrandAvailable) {
        return tx.branding.create({
          data: {
            ...data,
            settingsId: newSettings.id,
          },
        });
      } else {
        return tx.branding.update({
          where: {
            id,
          },
          data: {
            ...data,
            settingsId: newSettings.id,
          },
        });
      }
    }
    if (!isBrandAvailable) {
      return tx.branding.create({
        data: {
          settingsId: isSettingsAvailable.id,
        },
      });
    } else {
      return tx.branding.update({
        where: {
          id,
        },
        data: {
          ...data,
          settingsId: isSettingsAvailable.id,
        },
      });
    }
  });
}

export async function deleteBrandDB(id: number) {
  return prisma.branding.delete({
    where: {
      id,
    },
  });
}
