import { GetTransactionsRequest, GetTransactionsResponse } from "../schemas.js";

export async function getTransactions(req: GetTransactionsRequest): Promise<GetTransactionsResponse> {
  const kinds = ["POS", "ATM", "NEFT", "UPI", "IMPS"];
  const txns = Array.from({ length: req.limit }, (_, i) => ({
    id: `TX-${i + 1}`,
    date: new Date().toISOString().slice(0, 10),
    desc: kinds[i % kinds.length],
    amount: Number((Math.random() * 2000 - 1000).toFixed(2))
  }));
  return { accountId: req.accountId, transactions: txns };
}
