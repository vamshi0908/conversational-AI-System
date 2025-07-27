import { v4 as uuidv4 } from "uuid";
import { extractIntentAndSlots, composeReply } from "./llm/gemini.js";
import { ExtractSchema, type ExtractResult } from "./llm/schemas.js";
import { heuristicIntent } from "./nlp.js";
import { getSlots, setSlot } from "./memory.js";
import { canCallTool, requiresConfirmation, type Role } from "./agent/toolRouter.js";
import { blockCard, getTransactions, checkLoanPreEligibility } from "./tools/bankClient.js";
import { BlockCardRequest, GetTransactionsRequest, LoanCheckRequest } from "./tools/schemas.js";

export async function handleTurn(
  convId: string,
  role: Role,
  userText: string
): Promise<{ text: string; memory: any }> {
  const slots = getSlots(convId);

  // Quick slot capture for numeric answers / yes-no etc.
  if (/^(yes|y)$/i.test(userText)) slots.confirmed = true;
  if (/^(no|n|cancel)$/i.test(userText)) return { text: "Okay, cancelled.", memory: slots };
  if (/^default$/i.test(userText)) setSlot(convId, "limit", 5);
  if (/^\d{1,2}$/.test(userText) && !slots.limit) setSlot(convId, "limit", Math.min(10, Math.max(1, Number(userText))));
  if (/^[A-Za-z]{2}-\d{3}$/i.test(userText)) setSlot(convId, "accountId", userText);
  if (/^\d{4,}$/i.test(userText) && !slots.monthlyIncome) setSlot(convId, "monthlyIncome", Number(userText));
  else if (/^\d+$/i.test(userText) && slots.monthlyIncome && slots.existingEmi == null) setSlot(convId, "existingEmi", Number(userText));
  else if (/^\d+$/i.test(userText) && slots.existingEmi != null && !slots.tenureMonths) setSlot(convId, "tenureMonths", Number(userText));

  // 1) LLM extraction
  let extracted: ExtractResult | null = await extractIntentAndSlots(userText);
  let intent = extracted?.intent ?? "unknown";

  // 2) Fallback if low confidence
  if ((extracted?.confidence ?? 0) < 0.5) {
    intent = heuristicIntent(userText);
  }

  // 3) Merge validated LLM slots
  if (extracted?.slots) {
    const safeSlots = ExtractSchema.shape.slots.parse(extracted.slots);
    for (const [k, v] of Object.entries(safeSlots)) {
      if (typeof v !== "undefined") setSlot(convId, k, v);
    }
  }

  // 4) Policy + tools
  if (intent === "block_card") {
    const last4 = slots.cardLast4 ?? userText.match(/\b\d{4}\b/)?.[1];
    if (!last4) return { text: "Please share last 4 digits of the card to block.", memory: slots };
    setSlot(convId, "cardLast4", last4);

    if (requiresConfirmation("blockCard") && slots.confirmed !== true) {
      return { text: `You’re about to block the card ending ****${last4}. Proceed? (yes/no)`, memory: slots };
    }
    if (!canCallTool(role, "blockCard")) return { text: "You are not allowed to block cards.", memory: slots };

    const req: BlockCardRequest = {
      customerId: slots.customerId ?? "CUST-001",
      cardLast4: last4,
      reason: "lost",
      idempotencyKey: slots.idemKey ?? (slots.idemKey = uuidv4())
    };
    const res = await blockCard(req);
    const reply = await composeReply({ intent, slots: getSlots(convId), toolResult: res });
    const text =
      reply?.text ??
      (res.status === "blocked"
        ? `✅ Card ****${last4} blocked. Ref: ${res.referenceId}.`
        : `ℹ️ Card ****${last4} was already blocked. Ref: ${res.referenceId}.`);
    return { text, memory: getSlots(convId) };
  }

  if (intent === "mini_statement") {
    if (!slots.accountId) return { text: "Which account ID? (e.g., SB-001)", memory: slots };
    if (!slots.limit) return { text: "How many transactions? (1-10). You can also type 'default'.", memory: slots };
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const req: GetTransactionsRequest = {
      customerId: "CUST-001",
      accountId: slots.accountId,
      fromDate: weekAgo.toISOString().slice(0, 10),
      toDate: now.toISOString().slice(0, 10),
      limit: slots.limit
    };
    const res = await getTransactions(req);
    const lines = res.transactions.map(
      (t) => `${t.date} ${t.desc} ${t.amount >= 0 ? "CR" : "DR"} ₹${Math.abs(t.amount)}`
    );
    const reply = await composeReply({
      intent,
      slots: getSlots(convId),
      toolResult: { accountId: res.accountId, preview: lines.slice(0, 5) }
    });
    const fallback = `Mini statement for ${res.accountId} (last ${lines.length}):\n- ` + lines.join("\n- ");
    return { text: reply?.text ?? fallback, memory: getSlots(convId) };
  }

  if (intent === "loan_precheck") {
    if (!slots.monthlyIncome) return { text: "What is your monthly income (₹)?", memory: slots };
    if (slots.existingEmi == null) return { text: "Total existing EMIs per month (₹)? If none, say 0.", memory: slots };
    if (!slots.tenureMonths) return { text: "Preferred tenure in months (e.g., 60)?", memory: slots };
    const req: LoanCheckRequest = {
      customerId: "CUST-001",
      monthlyIncome: Number(slots.monthlyIncome),
      existingEmi: Number(slots.existingEmi),
      tenureMonths: Number(slots.tenureMonths)
    };
    const res = await checkLoanPreEligibility(req);
    const reply = await composeReply({ intent, slots: getSlots(convId), toolResult: res });
    const text =
      reply?.text ??
      (res.eligible
        ? `✅ Eligible. Estimated max amount ~ ₹${Math.round(res.maxAmount)}.`
        : `❌ Not eligible: ${res.reason ?? "criteria not met"}.`);
    return { text, memory: getSlots(convId) };
  }

  return {
    text: "I can help with blocking a card, mini statement, or loan pre‑eligibility. Try: “Block my card ending 1234”.",
    memory: slots
  };
}
