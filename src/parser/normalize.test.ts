import { expect, test } from 'vitest';
import { normalizeHex } from './normalize';

const HEX_ERROR_REGEX = /invalid hex/i;
const EXPECTED_CC_01_18 = new Uint8Array([0xcc, 0x01, 0x18]);

test('normalizeHex returns an empty array for an empty input', () => {
  const expected = new Uint8Array([]);
  expect(normalizeHex('')).toEqual(expected);
  expect(normalizeHex(' ')).toEqual(expected);
});

test('normalizeHex handles a single byte', () => {
  const input = 'CC';
  const expected = new Uint8Array([0xcc]);
  expect(normalizeHex(input)).toEqual(expected);
});

test('normalizeHex strips lone prefix', () => {
  const input = '0x';
  const expected = new Uint8Array([]);
  expect(normalizeHex(input)).toEqual(expected);
});

test('normalizeHex parses hex string with spaces', () => {
  const input = 'CC 01 18';
  expect(normalizeHex(input)).toEqual(EXPECTED_CC_01_18);
});

test('normalizeHex parses hex string without spaces', () => {
  const input = 'CC0118';
  expect(normalizeHex(input)).toEqual(EXPECTED_CC_01_18);
});

test('normalizeHex parses hex string with 0x prefixes', () => {
  const input = '0xCC 0x01 0x18';
  expect(normalizeHex(input)).toEqual(EXPECTED_CC_01_18);
});

test('normalizeHex parses 0x prefixes without spaces', () => {
  const input = '0xCC0x010x18';
  expect(normalizeHex(input)).toEqual(EXPECTED_CC_01_18);
});

test('normalizeHex is case-insensitive', () => {
  const lowerInput = 'cc 01 18';
  expect(normalizeHex(lowerInput)).toEqual(EXPECTED_CC_01_18);
  const upperInput = 'CC 01 18';
  expect(normalizeHex(upperInput)).toEqual(EXPECTED_CC_01_18);
  const mixedInput = 'cC 01 18';
  expect(normalizeHex(mixedInput)).toEqual(EXPECTED_CC_01_18);
});

test('normalizeHex trims leading and trailing whitespace', () => {
  const leadingInput = '   CC 01 18';
  const trailingInput = 'CC 01 18   ';
  const bothInput = '  CC 01 18  ';
  expect(normalizeHex(leadingInput)).toEqual(EXPECTED_CC_01_18);
  expect(normalizeHex(trailingInput)).toEqual(EXPECTED_CC_01_18);
  expect(normalizeHex(bothInput)).toEqual(EXPECTED_CC_01_18);
});

test('normalizeHex handles comma-separated values', () => {
  const input = 'CC,01,18';
  expect(normalizeHex(input)).toEqual(EXPECTED_CC_01_18);
});

test('normalizeHex handles comma-separated values with spaces', () => {
  const input = 'CC, 01, 18';
  expect(normalizeHex(input)).toEqual(EXPECTED_CC_01_18);
});

test('normalizeHex handles tab-separated values', () => {
  const input = 'CC\t01\t18';
  expect(normalizeHex(input)).toEqual(EXPECTED_CC_01_18);
});

test('normalizeHex handles mixed separators', () => {
  const input = 'CC, 01\t18';
  expect(normalizeHex(input)).toEqual(EXPECTED_CC_01_18);
});

test('normalizeHex handles mixed separators with 0x prefixes', () => {
  const input = '0xCC, 0x01\t0x18';
  expect(normalizeHex(input)).toEqual(EXPECTED_CC_01_18);
});

test('normalizeHex throws an error for non-hex characters', () => {
  expect(() => normalizeHex('GG 01 18')).toThrow(HEX_ERROR_REGEX);
  expect(() => normalizeHex('CC 0G 18')).toThrow(HEX_ERROR_REGEX);
  expect(() => normalizeHex('CC 01 1H')).toThrow(HEX_ERROR_REGEX);
});

test('normalizeHex throws an error for odd number of hex characters', () => {
  expect(() => normalizeHex('C 01 18')).toThrow(HEX_ERROR_REGEX);
  expect(() => normalizeHex('CC118')).toThrow(HEX_ERROR_REGEX);
  expect(() => normalizeHex('0xCC 0x01 0x1')).toThrow(HEX_ERROR_REGEX);
});
