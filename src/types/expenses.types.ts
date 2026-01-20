export type ExpenseCategory = "needs" | "wants" | "savings";

export type ExpenseData = {
  description: string;
  date: Date;
  amount: number;
  category: ExpenseCategory;
  subCategory?: string;
};
