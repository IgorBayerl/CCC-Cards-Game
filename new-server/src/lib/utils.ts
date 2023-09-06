import {Client} from "colyseus";
import {NextFunction, Response, Request} from "express";
import {type MyRoom} from "../rooms/MyRoom";
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

// interface AdminCheckable {
//   isAdmin(client: Client): boolean;
// }

/**
 * AdminOnly Decorator.
 *
 * Wraps a method to ensure that only admin users can execute it. If a non-admin user
 * tries to execute the method, it will log a warning and exit early, not calling
 * the original method. If the user is an admin, the original method will be called
 * with its original parameters.
 *
 * Usage:
 *
 * @AdminOnly
 * methodName(client: ClientType, data: DataType) {
 *   // Original method logic
 * }
 *
 * @param target - The prototype of the class (not instance).
 * @param _propertyKey - The name of the method being decorated.
 * @param descriptor - The PropertyDescriptor for the method.
 *
 * @returns - The modified PropertyDescriptor for the method.
 */
export function AdminOnly<T extends Client>(
  target: any,
  _propertyKey: string,
  descriptor: TypedPropertyDescriptor<(this: MyRoom, client: T, data: any) => void>,
) {
  const originalMethod = descriptor.value!;

  descriptor.value = function (client: T, data: any) {
    if (!this.isAdmin(client)) {
      console.warn("Unauthorized access attempt by:", client.sessionId);
      return;
    }
    return originalMethod.call(this, client, data);
  };

  return descriptor;
}
