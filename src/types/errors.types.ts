export enum AppErrors {
  SERVICE_OVERLOADED = "SERVICE_OVERLOADED",
  NETWORK_ERROR = "NETWORK_ERROR",
  SAVE_ERROR = "SAVE_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class AppError extends Error {
  constructor(public code: string) {
    super();
  }
}
