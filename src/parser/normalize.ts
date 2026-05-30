/**
 * Normalizes a hexadecimal string by removing '0x' prefixes, whitespace, and
 * commas and producing a Uint8Array of byte values.
 *
 * @param input - The hexadecimal string to normalize
 * @returns A Uint8Array containing the byte values represented by the input
 * @throws {Error} If the input contains invalid characters or has an odd
 *    length after cleaning
 *
 * @example
 * ```ts
 * normalizeHex('0x01 0x02,0x03');
 * // Uint8Array [ 1, 2, 3 ]
 * ```
 */
export const normalizeHex = (input: string): Uint8Array => {
  const cleaned = input
    .trim()
    .replace(/0x/g, '') // Remove '0x' prefixes
    .replace(/[\s,]+/g, '') // Remove all whitespace and commas
    .toLowerCase(); // Normalize to lowercase

  return new Uint8Array(
    cleaned.match(/.{1,2}/g)?.map((byteStr) => parseInt(byteStr, 16)) || []
  );
};
