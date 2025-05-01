import { z } from "zod";

export const RoleEnum = z.enum(["ADMIN", "STAFF"]);
type Role = z.infer<typeof RoleEnum>;

export const UserSchema = z.object({
  id: z.number().optional(),
  username: z.string(),
  password: z.string(),
  role: RoleEnum.default("STAFF"),
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

  price: z.number(),
  discount: z.number().default(0),
  company: z.string().nullable().optional(),
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

export type SubCategory = z.infer<typeof SubCategorySchema>;

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

export const InvoiceSchema = z.object({
  id: z.number().optional(),
  tax: z.number().default(0),
  discount: z.number().default(0),
  service: z.number().default(0),
  total: z.number(),
  subtotal: z.number(),
  orderId: z.number().int(),
  userId: z.number().int(),
  tableId: z.number().int().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

const OrderStatusEnum = z.enum([
  "PENDING",
  "PREPARING",
  "SERVED",
  "COMPLETED",
  "CANCELED",
]);
const PaymentMethodEnum = z.enum(["CASH", "CARD", "PAY_LATER"]);

export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

export const OrderItemSchema = z.object({
  id: z.number().optional(),
  orderId: z.number(),
  menuItemId: z.number(),
  quantity: z.number().default(1),
  price: z.number(),
});

export const OrderSchema = z.object({
  id: z.number().optional(),
  tableId: z.number().nullable().optional(),
  userId: z.number(),
  status: OrderStatusEnum,
  paymentMethod: PaymentMethodEnum.nullable().optional(),
  paid: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  items: z.array(OrderItemSchema),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;

const TableStatusEnum = z.enum(["AVAILABLE", "OCCUPIED", "RECEIPT"]);
export const TableSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  capacity: z.number().default(4),
  available: z.boolean().default(true),
  status: TableStatusEnum,
  orders: z.array(OrderSchema).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  sectionId: z.number().nullable().optional(),
});

export const SectionSchema = z.object({
  id: z.number().optional(),
  name: z.string().default("New Section"),
  sortOrder: z.number().default(0),
  tables: z.array(TableSchema).optional(),
  available: z.number().nullable().optional(),
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

export type { Role, TError, TResult, User };
