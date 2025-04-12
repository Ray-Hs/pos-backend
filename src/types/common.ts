import { z } from "zod";

export const RoleEnum = z.enum(["ADMIN", "STAFF"]);
type Role = z.infer<typeof RoleEnum>;

export const UserSchema = z.object({
  id: z.number().optional(),
  username: z.string(),
  password: z.string(),
  role: RoleEnum.default("STAFF"),
  createdAt: z.string().date().optional(),
  updatedAt: z.string().date().optional(),
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
  company: z.string().optional(),
  isActive: z.boolean().default(true),
  image: z.string().optional(),

  createdAt: z.string().date().optional(),
  updatedAt: z.string().date().optional(),
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
  image: z.string().optional(),

  categoryId: z.number(),
  items: z.array(MenuItemSchema),

  createdAt: z.string().date().optional(),
  updatedAt: z.string().date().optional(),
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
  image: z.string().optional(),
  subCategory: z.array(SubCategorySchema),

  createdAt: z.string().date().optional(),
  updatedAt: z.string().date().optional(),
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
