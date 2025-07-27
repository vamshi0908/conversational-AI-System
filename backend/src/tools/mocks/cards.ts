import { BlockCardRequest, BlockCardResponse } from "../schemas.js";

const blocked = new Set<string>();

export async function blockCard(req: BlockCardRequest): Promise<BlockCardResponse> {
  const key = `${req.customerId}:${req.cardLast4}`;
  if (blocked.has(key)) return { status: "already_blocked", referenceId: "REF-ALREADY" };
  blocked.add(key);
  return { status: "blocked", referenceId: "REF-" + req.idempotencyKey.slice(0, 8) };
}
