export function sanitizeRequestBody(body: Record<string, any>) {
  const hiddenFields = ["password", "token", "authorization"];
  return Object.fromEntries(
    Object.entries(body).map(([key, value]) =>
      hiddenFields.includes(key) ? [key, "***REDACTED***"] : [key, value],
    ),
  );
}
