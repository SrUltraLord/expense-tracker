export enum AppErrors {
  SERVICE_OVERLOADED = "SERVICE_OVERLOADED",
  NETWORK_ERROR = "NETWORK_ERROR",
  SAVE_ERROR = "SAVE_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export type ExpenseCategory = "needs" | "wants" | "savings";

export type ExpenseData = {
  description: string;
  date: Date;
  amount: number;
  category: ExpenseCategory;
  subCategory?: string;
};

// Sheets
export type SheetTable = {
  name: string;
  range: {
    sheetId: number;
    startRowIndex: number;
    endRowIndex: number;
    startColumnIndex: number;
    endColumnIndex: number;
  };
};

export type SheetsMetadataResponse = {
  sheets: {
    properties: { sheetId: number };
    tables?: SheetTable[];
  }[];
};

// Telegram Types
export type TelegramPhotoSize = {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  width: number;
  height: number;
};

export type TelegramFile = {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
};

export type TelegramMessage = {
  message_id: number;
  chat: {
    id: number;
  };
  text?: string;
  photo?: TelegramPhotoSize[];
  caption?: string;
};
