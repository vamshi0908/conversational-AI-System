export type Intent = "block_card" | "mini_statement" | "loan_precheck" | "unknown";

export function heuristicIntent(t: string): Intent {
  const s = t.toLowerCase();
  if (s.includes("block") && s.includes("card")) return "block_card";
  if (s.includes("statement") || s.includes("transactions")) return "mini_statement";
  if (s.includes("loan") && (s.includes("elig") || s.includes("pre"))) return "loan_precheck";
  return "unknown";
}
