import { ZodError, ZodObject, ZodRawShape, z } from "zod";
import logger from "./logger";

export default async function validateType<T extends ZodRawShape>(
  validate: unknown,
  schema: ZodObject<T>
): Promise<z.infer<typeof schema> | ZodError> {
  try {
    const parsed = await schema.parseAsync(validate);
    return parsed as T;
  } catch (error) {
    logger.error("Validation failed:", error);
    return error as ZodError;
  }
}
