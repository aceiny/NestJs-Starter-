import { Transform } from "class-transformer";

type NormalizeOptions = {
  trim?: boolean;           // Remove leading/trailing whitespace
  lowerCase?: boolean;      // Convert to lowercase
  upperCase?: boolean;      // Convert to uppercase
  capitalize?: boolean;     // Capitalize first letter of each word
};

/**
 * Decorator that normalizes string values according to provided options.
 * Non-string values are returned unchanged.
 *
 * @example
 * ```typescript
 * class MyDto {
 *   @NormalizeString({ trim: true, lowerCase: true })
 *   @IsEmail()
 *   email: string;
 *
 *   @NormalizeString({ capitalize: true })
 *   firstName: string;
 * }
 * ```
 */
export function NormalizeString(options: NormalizeOptions = { trim: true, lowerCase: true }) {
  return Transform(({ value }) => {
    if (typeof value !== "string") return value;

    let result = value;

    if (options.trim) {
      result = result.trim();
    }

    if (options.lowerCase) {
      result = result.toLowerCase();
    } else if (options.upperCase) {
      result = result.toUpperCase();
    }

    if (options.capitalize) {
      result = result.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    return result;
  });
}
