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

export const MenuItemSchema = z.object({
  id: z.number().optional(),
  title_en: z.string(),
  title_ku: z.string(),
  title_ar: z.string(),
  description_en: z.string().default(""),
  description_ku: z.string().default(""),
  description_ar: z.string().default(""),

  price: z.number(),
  discount: z.number().default(0),
  company: z.string().nullable(),
  isActive: z.boolean().default(true),
  image: z.string().nullable().optional(),

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
  items: z.array(MenuItemSchema),

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
  subCategory: z.array(SubCategorySchema),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Category = z.infer<typeof CategorySchema>;

type TError = {
  code: number;
  message: string;
  details?: unknown;
};

type TResult<T> = {
  success: boolean;
  data?: T;
  error?: TError;
};

export type { Role, User, TResult, TError };
