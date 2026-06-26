import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes a string input to prevent XSS attacks.
 * Removes malicious script tags, javascript: links, and unsafe HTML.
 * @param input The untrusted user input string
 * @returns A safe, sanitized string
 */
export const sanitizeInput = (input: string | undefined | null): string => {
  if (!input) return "";
  
  // Basic configuration to allow text and standard formatting but strip scripts
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li", "span", "div"],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
    ALLOW_DATA_ATTR: false,
  });
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
