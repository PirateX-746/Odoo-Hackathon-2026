import { Prisma } from '@/generated/prisma/client';

export function decimalToNumber(
  value: Prisma.Decimal | number | null | undefined,
): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'number' ? value : value.toNumber();
}

/**
 * Shallow-converts every Prisma.Decimal value on an object to a plain number,
 * so API responses serialize as numeric JSON instead of Decimal.js string form.
 */
export function serializeDecimals<T extends Record<string, unknown>>(
  entity: T,
): T {
  const result: Record<string, unknown> = { ...entity };
  for (const key of Object.keys(result)) {
    const value = result[key];
    if (value instanceof Prisma.Decimal) {
      result[key] = value.toNumber();
    }
  }
  return result as T;
}
