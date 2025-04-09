import { z } from "zod";

export const RoleEnum = z.enum(["ADMIN", "USER"]);
type Role = z.infer<typeof RoleEnum>;

export const UserSchema = z.object({
  id: z.number().optional(),
  username: z.string(),
  password: z.string(),
  role: RoleEnum,
  createdAt: z.string().date().optional(),
  updatedAt: z.string().date().optional(),
});
type User = z.infer<typeof UserSchema>;

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
