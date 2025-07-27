import { z } from "zod";

export const ExtractSchema = z.object({
  intent: z.enum(["block_card", "mini_statement", "loan_precheck", "unknown"]),
  slots: z.object({
    cardLast4: z.string().regex(/^\d{4}$/).optional(),
    accountId: z.string().regex(/^[A-Za-z]{2}-\d{3}$/).optional(),
    limit: z.number().int().min(1).max(10).optional(),
    monthlyIncome: z.number().positive().optional(),
    existingEmi: z.number().min(0).optional(),
    tenureMonths: z.number().int().min(6).max(360).optional()
  }),
  confidence: z.number().min(0).max(1)
});
export type ExtractResult = z.infer<typeof ExtractSchema>;

export const ReplySchema = z.object({ text: z.string().min(1).max(400) });
export type ReplyResult = z.infer<typeof ReplySchema>;
