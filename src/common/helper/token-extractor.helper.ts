import { Request } from "express";

/**
 * Extract a token (access or refresh) from the request.
 * Checks in order: Authorization header, cookies, body, query params.
 *
 * @param req - Express request
 * @param tokenType - "accessToken" or "refreshToken"
 */
export const tokenExtractor = (
  req: Request,
  tokenType: "accessToken" | "refreshToken" = "accessToken",
): string | null => {
  if (
    tokenType === "accessToken" &&
    req?.headers?.authorization?.startsWith("Bearer ")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  if (req?.cookies?.[tokenType]) {
    return req.cookies[tokenType];
  }

  if (req?.body?.[tokenType]) {
    return req.body[tokenType];
  }

  if (req?.query?.[tokenType]) {
    return String(req.query[tokenType]);
  }

  return null;
};
