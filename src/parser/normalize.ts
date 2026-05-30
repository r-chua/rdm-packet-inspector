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
    .toLowerCase() // Normalize to lowercase
    .replace(/0x/g, '') // Remove '0x' prefixes
    .replace(/[\s,]+/g, ''); // Remove all whitespace and commas

  if (cleaned.length % 2 !== 0) {
    throw new Error(
      `Invalid hex: odd length after cleaning. Incomplete byte detected in ` +
        `input '${input}'`
    );
  }

  return new Uint8Array(
    cleaned.match(/.{1,2}/g)?.map((byteStr) => {
      if (!/^[0-9a-f]{2}$/.test(byteStr)) {
        throw new Error(`Invalid hex byte: '${byteStr}' in input '${input}'`);
      }
      return parseInt(byteStr, 16);
    }) || []
  );
};
