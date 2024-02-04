import {Request} from "express";
import {z} from "zod";

/**
 * Asynchronously validates and parses the request body against a Zod schema.
 *
 * @template T - A Zod schema type.
 * @param {T} schema - The Zod schema to validate against.
 * @param {Request} req - The Express request object containing the body to validate.
 * @returns {Promise<z.infer<T>>} - A Promise resolving to the parsed request body.
 * @throws {ZodError} - Thrown if the request body does not match the Zod schema.
 * @throws {Error} - Thrown for other unknown errors during parsing.
 */
export default async function zParse<T extends z.ZodType<any, any>>(schema: T, req: Request): Promise<z.infer<T>> {
  try {
    return await schema.parseAsync(req);
  } catch (error) {
    console.log("zParse Error: ", error);
    throw error;
  }
}
