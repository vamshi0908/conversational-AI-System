import { z } from "zod";

export const BlockCardRequest = z.object({
  customerId: z.string(),
  cardLast4: z.string().length(4),
  reason: z.enum(["lost", "stolen", "fraud", "other"]),
  idempotencyKey: z.string()
});
export type BlockCardRequest = z.infer<typeof BlockCardRequest>;
export type BlockCardResponse = { status: "blocked" | "already_blocked"; referenceId: string };

export const GetTransactionsRequest = z.object({
  customerId: z.string(),
  accountId: z.string(),
  fromDate: z.string(),
  toDate: z.string(),
  limit: z.number().int().min(1).max(50)
});
export type GetTransactionsRequest = z.infer<typeof GetTransactionsRequest>;
export type GetTransactionsResponse = {
  accountId: string;
  transactions: { id: string; date: string; desc: string; amount: number }[];
};

export const LoanCheckRequest = z.object({
  customerId: z.string(),
  monthlyIncome: z.number().positive(),
  existingEmi: z.number().min(0),
  tenureMonths: z.number().int().min(6).max(360)
});
export type LoanCheckRequest = z.infer<typeof LoanCheckRequest>;
export type LoanCheckResponse = { eligible: boolean; maxAmount: number; reason?: string };
