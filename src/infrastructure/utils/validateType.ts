import { ZodObject, ZodRawShape } from "zod";
import logger from "./logger";

export default async function validateType<T extends ZodRawShape>(
  validate: Partial<T>,
  schema: ZodObject<T>
) {
  try {
    const keysToValidate = Object.keys(validate) as Array<keyof T>;

    // Use type assertion to satisfy Zod's exact type requirements
    const pickObj = keysToValidate.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<keyof T, true>);

    // Use type assertion to work around the Exactly type constraint
    const pickedSchema = schema.pick(pickObj as any);
    const parsed = await pickedSchema.parseAsync(validate);
    return parsed;
  } catch (error) {
    logger.error("Validation failed:", error);
    return null;
  }
}
