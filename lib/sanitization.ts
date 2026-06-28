/**
 * Sanitizes a string input to prevent XSS attacks.
 * Since this is primarily used for plain text from PDFs and React escapes by default,
 * a lightweight HTML escape is sufficient and avoids heavy jsdom dependencies on Vercel.
 * @param input The untrusted user input string
 * @returns A safe, sanitized string
 */
export const sanitizeInput = (input: string | undefined | null): string => {
  if (!input) return "";
  
  // Basic string escaping for < and > to prevent script injection if ever rendered raw
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

/**
 * Recursively sanitizes an entire object or array.
 * Useful for sanitizing complex resume data structures before saving.
 */
export const sanitizeObject = <T>(obj: T): T => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === "string") {
    return sanitizeInput(obj) as any;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as any;
  }
  
  if (typeof obj === "object") {
    const sanitizedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitizedObj[key] = sanitizeObject(value);
    }
    return sanitizedObj as T;
  }
  
  return obj;
};
