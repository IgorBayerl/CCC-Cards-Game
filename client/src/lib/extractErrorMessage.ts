import {ZodError} from "zod";

type ZodUnionIssue = {
  received: any;
  code: string;
  expected: any;
  path: (string | number)[];
  message: string;
};

type ZodUnionError = {
  issues: ZodUnionIssue[];
  name: string;
};

type ZodIssue = {
  code: string;
  path: (string | number)[];
  message: string;
  unionErrors?: ZodUnionError[];
};

/**
 * Extract detailed error messages from union type issues in Zod validation.
 *
 * @param  unionErrors - The list of Zod union errors.
 * @returns - An array of error messages detailing the path and message of each issue.
 */
function extractUnionErrors(unionErrors: ZodUnionError[]): string[] {
  let messages: string[] = [];
  for (const error of unionErrors) {
    if (error.issues) {
      messages = messages.concat(
        error.issues.map(
          issue => `Path: ${issue.path.join(".")}, ${issue.message}`,
        ),
      );
    }
  }
  return messages;
}

/**
 * Extract and format error messages from Zod validation or general Error objects.
 *
 * @param {unknown} error - The error object, which can be a ZodError, Error, or other types.
 * @returns {string} - A formatted error message suitable for user display.
 */
export default function extractErrorMessage(error: unknown): string {

  if (error instanceof ZodError) {
    let errors: string[] = [];

    for (const issue of error.issues as ZodIssue[]) {
      if (issue.code === "invalid_union") {
        if (issue.unionErrors) {
          errors = errors.concat(extractUnionErrors(issue.unionErrors));
        }
      } else {
        errors.push(`Path: ${issue.path.join(".")}, ${issue.message}`);
      }
    }
    return `Invalid input. ${errors.join(". ")}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as {message: string}).message;
  }

  return "An unknown error occurred";
}
