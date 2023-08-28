import {NextFunction, Response, Request} from "express";
import extractErrorMessage from "./extractErrorMessage";

// Helper function to introduce delay
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(err => {
      const errorMessage = extractErrorMessage(err);
      res.status(400).json({message: errorMessage});
    });
  };
}
