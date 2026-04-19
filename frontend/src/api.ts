import type { BenchmarkResultDto, ProductDto, CategoryDto, OrderDto } from './types';

const BASE = '';

/** Fetches products via REST. Pass limit to cap results. */
export async function fetchProductsRest(limit?: number): Promise<ProductDto[]> {
  const url = limit ? `${BASE}/api/rest/products?limit=${limit}` : `${BASE}/api/rest/products`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`REST /products failed: ${res.status}`);
  return res.json();
}

/** Fetches all categories via REST */
export async function fetchCategoriesRest(): Promise<CategoryDto[]> {
  const res = await fetch(`${BASE}/api/rest/categories`);
  if (!res.ok) throw new Error(`REST /categories failed: ${res.status}`);
  return res.json();
}

/** Fetches all orders via REST */
export async function fetchOrdersRest(): Promise<OrderDto[]> {
  const res = await fetch(`${BASE}/api/rest/orders`);
  if (!res.ok) throw new Error(`REST /orders failed: ${res.status}`);
  return res.json();
}

/** Fetches products via GraphQL (all fields). Pass limit to cap results. */
export async function fetchProductsGraphQL(limit?: number): Promise<ProductDto[]> {
  const query = `query GetProducts($limit: Int) {
    products(limit: $limit) {
      id
      name
      description
      price
      currency
      stockQuantity
      categoryId
    }
  }`;
  const res = await fetch(`${BASE}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { limit: limit ?? null } }),
  });
  if (!res.ok) throw new Error(`GraphQL failed: ${res.status}`);
  const json = await res.json();
  return json.data.products;
}

/** Fetches products via GraphQL with minimal fields (demonstrates field selection). Pass limit to cap results. */
export async function fetchProductsGraphQLMinimal(limit?: number): Promise<Pick<ProductDto, 'id' | 'name' | 'price'>[]> {
  const query = `query GetProductsMinimal($limit: Int) {
    products(limit: $limit) {
      id
      name
      price
    }
  }`;
  const res = await fetch(`${BASE}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { limit: limit ?? null } }),
  });
  if (!res.ok) throw new Error(`GraphQL minimal failed: ${res.status}`);
  const json = await res.json();
  return json.data.products;
}

/** Fetches orders via GraphQL with nested items */
export async function fetchOrdersGraphQL(): Promise<OrderDto[]> {
  const query = `{
    orders {
      id
      customerName
      createdAt
      totalAmount
      items {
        id
        productName
        quantity
        unitPrice
        totalPrice
      }
    }
  }`;
  const res = await fetch(`${BASE}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`GraphQL orders failed: ${res.status}`);
  const json = await res.json();
  return json.data.orders;
}

/** Runs the benchmark comparison endpoint */
export async function runBenchmark(iterations: number = 10, limit: number = 100): Promise<BenchmarkResultDto> {
  const res = await fetch(`${BASE}/api/benchmark/compare?iterations=${iterations}&limit=${limit}`);
  if (!res.ok) throw new Error(`Benchmark failed: ${res.status}`);
  return res.json();
}

/** Measures the time and payload size for a fetch call, returning both metrics and the fetched data. */
export async function measureFetch<T>(fetchFn: () => Promise<T>): Promise<{ latencyMs: number; payloadSize: number; data: T }> {
  const start = performance.now();
  const data = await fetchFn();
  const latencyMs = performance.now() - start;
  const payloadSize = new Blob([JSON.stringify(data)]).size;
  return { latencyMs: Math.round(latencyMs * 100) / 100, payloadSize, data };
}

/**
 * Runs a fetch function `iterations` times and returns average/min/max latency
 * and the payload size from the last run.
 */
export async function measureFetchMultiple<T>(
  fetchFn: () => Promise<T>,
  iterations: number,
): Promise<{ avgLatencyMs: number; minLatencyMs: number; maxLatencyMs: number; payloadSize: number; data: T }> {
  const latencies: number[] = [];
  let payloadSize = 0;
  let data!: T;

  for (let i = 0; i < iterations; i++) {
    const result = await measureFetch(fetchFn);
    latencies.push(result.latencyMs);
    payloadSize = result.payloadSize;
    data = result.data;
  }

  const avgLatencyMs = Math.round((latencies.reduce((a, b) => a + b, 0) / latencies.length) * 100) / 100;
  const minLatencyMs = Math.round(Math.min(...latencies) * 100) / 100;
  const maxLatencyMs = Math.round(Math.max(...latencies) * 100) / 100;

  return { avgLatencyMs, minLatencyMs, maxLatencyMs, payloadSize, data };
}
