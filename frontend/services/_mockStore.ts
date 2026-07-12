// Generic in-memory CRUD store simulating an async API. Backs every mock
// service (vehicles/drivers/trips) so swapping to a real backend later only
// means rewriting the service files, not the pages that call them.

export function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function sortRecords<T extends Record<string, unknown>>(
  records: T[],
  key?: string,
  dir: "asc" | "desc" = "asc",
): T[] {
  if (!key) return records;
  const sorted = [...records].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av == null || bv == null) return 0;
    if (av < bv) return -1;
    if (av > bv) return 1;
    return 0;
  });
  return dir === "desc" ? sorted.reverse() : sorted;
}

export function createMockStore<T extends { id: string }>(seed: T[]) {
  let records = [...seed];

  return {
    async list(): Promise<T[]> {
      return delay([...records]);
    },
    async get(id: string): Promise<T | null> {
      return delay(records.find((r) => r.id === id) ?? null);
    },
    async create(record: T): Promise<T> {
      records = [record, ...records];
      return delay(record);
    },
    async update(id: string, patch: Partial<T>): Promise<T | null> {
      const idx = records.findIndex((r) => r.id === id);
      if (idx === -1) return delay(null);
      records[idx] = { ...records[idx], ...patch };
      return delay(records[idx]);
    },
    async remove(id: string): Promise<void> {
      records = records.filter((r) => r.id !== id);
      return delay(undefined);
    },
  };
}
