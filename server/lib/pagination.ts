export interface ListQuery {
  page: number;
  pageSize: number;
  q?: string;
  includeArchived: boolean;
}

export function parseListQuery(query: Record<string, unknown>): ListQuery {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSizeRaw = Number(query.pageSize) || 25;
  const pageSize = Math.min(100, Math.max(1, pageSizeRaw));
  const q = typeof query.q === "string" && query.q.trim() ? query.q.trim() : undefined;
  const includeArchived = query.includeArchived === "true" || query.includeArchived === "1";
  return { page, pageSize, q, includeArchived };
}

export function range(page: number, pageSize: number): [number, number] {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return [from, to];
}

export function buildListResponse<T>(
  data: T[],
  count: number | null,
  page: number,
  pageSize: number
) {
  return {
    items: data,
    page,
    pageSize,
    total: count ?? data.length,
    totalPages: count != null ? Math.ceil(count / pageSize) : 1,
  };
}
