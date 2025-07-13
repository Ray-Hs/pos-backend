import jwt from "jsonwebtoken";

// Extend the Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: jwt.JwtPayload;
    }
  }
}

// src/types/global.d.ts

declare module "arabic-persian-reshaper" {
  /** reshape Arabic letters so they join correctly */
  export function convertArabicUnicode(text: string): string;

  /** default export is an object with the same function */
  const arabicShaper: {
    convertArabicUnicode(text: string): string;
  };
  export default arabicShaper;
}

declare module "bidi-js" {
  /** reorder a Unicode string for correct RTL printing */
  export function getVisualString(text: string): string;
}

export {};
