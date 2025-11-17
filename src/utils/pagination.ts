import { type PaginatedResponse, type QueryParams } from '../types';

/**
 * Normalizes paginated API responses to a consistent format
 * Handles different backend response structures
 */
export function normalizePaginatedResponse<T>(
  response: any,
  params?: QueryParams,
  mapper?: (item: any) => T
): PaginatedResponse<T> {
  const root = response?.data ?? response;
  
  // Check if response has pagination metadata at root level
  const hasPaginationAtRoot = (
    typeof root?.total !== 'undefined' ||
    typeof root?.last_page !== 'undefined' ||
    typeof root?.per_page !== 'undefined' ||
    typeof root?.meta?.total !== 'undefined' ||
    typeof root?.pagination?.total !== 'undefined'
  );

  // Case 1: Backend returns object with pagination + data array
  if (hasPaginationAtRoot && Array.isArray(root?.data)) {
    const mappedData = mapper ? root.data.map(mapper) : root.data;
    
    const explicitTotal = extractTotal(root);
    const perPage = Number(root?.per_page ?? params?.per_page ?? (mappedData.length || 10));
    const lastPage = Number(
      root?.last_page ?? 
      (explicitTotal ? Math.max(1, Math.ceil(explicitTotal / perPage)) : 1)
    );
    const total = explicitTotal ?? (lastPage * perPage);
    
    return {
      data: mappedData,
      current_page: Number(root?.current_page ?? params?.page ?? 1),
      last_page: lastPage,
      per_page: perPage,
      total,
      from: Number(root?.from ?? 0),
      to: Number(root?.to ?? 0),
    } as PaginatedResponse<T>;
  }

  // Case 2: Backend returns plain array (no pagination info)
  const rawData = root?.data ?? root;
  if (Array.isArray(rawData)) {
    const mapped = mapper ? rawData.map(mapper) : rawData;
    const total = mapped.length;
    const currentPage = Math.max(1, Number(params?.page) || 1);
    const perPage = Math.max(1, Number(params?.per_page) || total || 1);
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const sliced = mapped.slice(startIndex, endIndex);
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    
    return {
      data: sliced,
      current_page: currentPage,
      last_page: lastPage,
      per_page: perPage,
      total,
      from: total > 0 ? Math.min(total, startIndex + 1) : 0,
      to: total > 0 ? Math.min(total, endIndex) : 0,
    } as PaginatedResponse<T>;
  }

  // Case 3: Fallback - try to extract data from any structure
  const mappedData = Array.isArray(root?.data) 
    ? (mapper ? root.data.map(mapper) : root.data)
    : [];
  
  const explicitTotal = extractTotal(root);
  const totalFallback = explicitTotal !== undefined
    ? explicitTotal
    : (root?.last_page && root?.per_page 
      ? Number(root.last_page) * Number(root.per_page) 
      : mappedData.length);
  
  return {
    ...root,
    data: mappedData,
    total: totalFallback,
    current_page: Number(root?.current_page ?? params?.page ?? 1),
    last_page: Number(root?.last_page ?? 1),
    per_page: Number(root?.per_page ?? params?.per_page ?? 10),
    from: Number(root?.from ?? 0),
    to: Number(root?.to ?? 0),
  } as PaginatedResponse<T>;
}

/**
 * Extracts total count from various response formats
 */
function extractTotal(root: any): number | undefined {
  // Try numeric total
  if (typeof root?.total === 'number') {
    return root.total;
  }
  
  // Try string total (convert to number)
  if (typeof root?.total === 'string' && root.total.trim() !== '' && !Number.isNaN(Number(root.total))) {
    return Number(root.total);
  }
  
  // Try meta.total or pagination.total
  const metaTotal = root?.meta?.total ?? root?.pagination?.total;
  if (typeof metaTotal === 'number') {
    return metaTotal;
  }
  
  if (typeof metaTotal === 'string' && metaTotal.trim() !== '' && !Number.isNaN(Number(metaTotal))) {
    return Number(metaTotal);
  }
  
  return undefined;
}

/**
 * Normalizes a single item response (with optional data wrapper)
 */
export function normalizeItemResponse<T>(
  response: any,
  mapper?: (item: any) => T
): T {
  const raw = response?.data ?? response;
  return mapper ? mapper(raw) : raw;
}

