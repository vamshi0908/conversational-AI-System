export function maskPII(input: string): string {
  if (!input) return input;
  const maskedNumbers = input.replace(/\b\d{13,19}\b/g, (m) => "****" + m.slice(-4));
  const maskedEmail = maskedNumbers.replace(
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    "[redacted-email]"
  );
  return maskedEmail;
}

export function truncate(input: string, max = 1200): string {
  if (!input) return input;
  return input.length <= max ? input : input.slice(0, max) + " …[truncated]";
}
