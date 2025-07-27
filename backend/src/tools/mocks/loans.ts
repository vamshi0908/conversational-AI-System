import { LoanCheckRequest, LoanCheckResponse } from "../schemas.js";

export async function checkLoanPreEligibility(req: LoanCheckRequest): Promise<LoanCheckResponse> {
  const disposable = req.monthlyIncome - req.existingEmi;
  if (disposable < 10000) return { eligible: false, maxAmount: 0, reason: "Low disposable income" };
  return { eligible: true, maxAmount: disposable * 50 };
}
