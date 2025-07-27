export type ToolName = "blockCard" | "getTransactions" | "loanCheck";
export type Role = "customer" | "agent" | "admin";

const ALLOW: Record<Role, ToolName[]> = {
  customer: ["getTransactions", "loanCheck", "blockCard"],
  agent: ["getTransactions", "loanCheck", "blockCard"],
  admin: ["getTransactions", "loanCheck", "blockCard"]
};

export const canCallTool = (role: Role, tool: ToolName) => ALLOW[role].includes(tool);
export const requiresConfirmation = (tool: ToolName) => tool === "blockCard";
