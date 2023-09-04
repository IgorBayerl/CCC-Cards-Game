/**
 * This file contains all the generic types used in the application.
 */

export type ServerResponse<TData, TFilters = any> = {
  message: string;
  filters: TFilters;
  data: TData;
};
