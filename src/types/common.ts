import { z } from "zod";
import { BrandObject } from "../domain/settings/branding/brand.types";
import { PrinterObjectSchema } from "../domain/settings/printers/printer.types";
import {
  CompanyInfoSchema,
  CustomerDiscountSchema,
} from "../domain/settings/crm/crm.types";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

export const PermissionSchema = z.object({
  id: z.number().optional(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const UserRoleSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string().nullable(),
  permIds: z.array(z.number()).optional(),
  permissions: z.array(PermissionSchema).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Permission = z.infer<typeof PermissionSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.number().optional(),
  username: z.string(),
  password: z.string(),
  roleId: z.number().nullable().optional(),
  role: UserRoleSchema.optional(),
  image: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
type User = z.infer<typeof UserSchema>;
export type UserWithoutPassword = Omit<User, "password">;

export const MenuItemSchema = z.object({
  id: z.number().optional(),
  title_en: z.string(),
  title_ku: z.string(),
  title_ar: z.string(),
  description_en: z.string().default(""),
  description_ku: z.string().default(""),
  description_ar: z.string().default(""),
  subCategoryId: z.number().nullable(),
  categoryId: z.number().nullable().optional(),

  sortOrder: z.number().default(0).optional(),
  code: z.string().nullable().optional(),

  price: z.number(),
  discount: z.number().default(0),
  company: CompanyInfoSchema.nullable().optional(),
  companyId: z.number().nullable().optional(),
  isActive: z.boolean().default(true),
  image: z.string().nullable().optional(),

  category: z
    .object({
      title_en: z.string(),
      title_ar: z.string(),
      title_ku: z.string(),
    })
    .nullable()
    .optional(),
  subcategory: z
    .object({
      title_en: z.string(),
      title_ar: z.string(),
      title_ku: z.string(),
    })
    .nullable()
    .optional(),

  printersId: z.number().nullable(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type MenuItem = z.infer<typeof MenuItemSchema>;

export const SubCategorySchema = z.object({
  id: z.number().optional(),
  title_en: z.string(),
  title_ku: z.string(),
  title_ar: z.string(),
  description_en: z.string().default(""),
  description_ku: z.string().default(""),
  description_ar: z.string().default(""),

  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  image: z.string().nullable().optional(),

  categoryId: z.number(),
  items: z.array(MenuItemSchema).optional(),
  itemsCount: z.number().optional(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type SubCategory = z.infer<typeof SubCategorySchema> & {
  category?: Category;
};

export const CategorySchema = z.object({
  id: z.number().optional(),
  title_en: z.string(),
  title_ku: z.string(),
  title_ar: z.string(),
  description_en: z.string().default(""),
  description_ku: z.string().default(""),
  description_ar: z.string().default(""),

  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  image: z.string().nullable().optional(),
  subCategory: z.array(SubCategorySchema).optional(),

  subcategoryCount: z.number().optional(),
  itemsCount: z.number().optional(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Category = z.infer<typeof CategorySchema>;
export const PaymentMethodEnum = z.enum(["CASH", "CARD", "DEBT"]);

export const TaxSchema = z.object({
  id: z.number(),
  rate: z.number().default(0),
});
export type Tax = z.infer<typeof TaxSchema>;

export const ServiceSchema = z.object({
  id: z.number(),
  amount: z.number().default(0),
});
export type Service = z.infer<typeof ServiceSchema>;

export const InvoiceSchema = z.object({
  id: z.number().optional(),
  discount: CustomerDiscountSchema.nullable().optional(),
  total: z.number().optional(),
  subtotal: z.number().optional(),
  paymentMethod: PaymentMethodEnum.nullable().optional(),
  paid: z.boolean().optional(),
  userId: z.number().int().optional(),
  tableId: z.number().int().nullable().optional(),
  taxId: z.number().int().nullable().optional(),
  serviceId: z.number().int().nullable().optional(),
  invoiceRefId: z.number().optional(),
  version: z.number(),
  customerDiscountId: z.number().nullable().optional(),
  isLatestVersion: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const InvoiceRef = z.object({
  id: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  orderId: z.number().int(),
  invoices: z.array(InvoiceSchema).optional(),
});

export type InvoiceRef = z.infer<typeof InvoiceRef>;
export type Invoice = z.infer<typeof InvoiceSchema>;

const OrderStatusEnum = z.enum([
  "PENDING",
  "PREPARING",
  "SERVED",
  "COMPLETED",
  "CANCELED",
]);

export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

export const OrderItemSchema = z.object({
  id: z.number().optional(),
  orderId: z.number(),
  menuItemId: z.number(),
  quantity: z.number().default(1),
  price: z.number(),
  sortOrder: z.number().default(0),
  notes: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const OrderSchema = z.object({
  id: z.number().optional(),
  tableId: z.number().nullable().optional(),
  userId: z.number(),
  status: OrderStatusEnum.optional(),
  reason: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  items: z.array(OrderItemSchema.extend({ orderId: z.number().optional() })),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderRequest = Omit<Order, "items"> & { items: number[] };

const TableStatusEnum = z.enum(["AVAILABLE", "OCCUPIED", "RECEIPT"]);
export const TableSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  capacity: z.number().default(4),
  available: z.boolean().default(true),
  status: TableStatusEnum.nullable().optional(),
  sortOrder: z.number().default(0),
  orders: z.array(OrderSchema).optional(),
  sectionId: z.number().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const SectionSchema = z.object({
  id: z.number().optional(),
  name: z.string().default("New Section"),
  sortOrder: z.number().default(0),
  tables: z.array(TableSchema).optional(),
  tableCount: z.number().optional(),
  available: z.number().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type TableStatus = z.infer<typeof TableStatusEnum>;
export type Table = z.infer<typeof TableSchema>;
export type Section = z.infer<typeof SectionSchema>;

type TError = {
  code: number;
  message: string;
  details?: unknown;
};

type TResult<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: TError;
};

export type Filter = "asc" | "desc";

export type FilterBy = "name" | "date" | "price";

export type Language = "en" | "ar" | "ku";

export type { TError, TResult, User };

export const SettingsSchema = z.object({
  id: z.number().optional(),

  brand: BrandObject,
  printers: z.array(PrinterObjectSchema),
  users: z.array(UserSchema),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type TxClientType = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
