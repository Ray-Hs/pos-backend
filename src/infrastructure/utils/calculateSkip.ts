import { LIMIT_CONSTANT } from "./constants";

export const calculateSkip = (page?: number, limit?: number) => {
  return Math.abs(((page || 1) - 1) * (limit || LIMIT_CONSTANT));
};

export const Take = (take?: number) => {
  return take || LIMIT_CONSTANT;
};

export const calculatePages = (totalItems?: number, limit?: number) => {
  return Math.ceil((totalItems || 1) / (limit || LIMIT_CONSTANT));
};
