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
