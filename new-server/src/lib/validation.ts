// validation.ts
import {ZodSchema} from "zod";

/**
 * Validates the provided data against a given Zod schema.
 *
 * @example
 *
 * const data = validateData(mySchema, inputData);
 * if (data) {
 *   // Process the validated data
 * } else {
 *   console.error("Data is invalid");
 * }
 */
export function validateData<T>(schema: ZodSchema<T>, data: any): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error("Validation Error:", error);
    return null;
  }
}
