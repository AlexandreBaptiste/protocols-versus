import { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { fetchProductsRest, fetchProductsGraphQL, fetchProductsGraphQLMinimal, measureFetchMultiple } from '../api';
import { fetchProductsGrpcWebMultiple } from '../grpc/catalog-grpc-web';
import { getProtocolColor } from '../protocolData';
import type { ProductDto } from '../types';
import type { GrpcProduct } from '../grpc/catalog-grpc-web';

interface FetchResult {
  protocol: string;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  payloadSize: number;
  itemCount: number;
  color: string;
}

interface GrpcState {
  products: GrpcProduct[];
  loading: boolean;
  avgLatencyMs: number | null;
  minLatencyMs: number | null;
  maxLatencyMs: number | null;
  payloadBytes: number | null;
  error: string | null;
}

const INITIAL_GRPC_STATE: GrpcState = {
  products: [],
  loading: false,
  avgLatencyMs: null,
  minLatencyMs: null,
  maxLatencyMs: null,
  payloadBytes: null,
  error: null,
};

const FIELD_SELECTION_LIMIT = 100;
const FIELD_SELECTION_ITERATIONS = 5;

function LiveDemoPage() {
  const [results, setResults] = useState<FetchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamedProducts, setStreamedProducts] = useState<ProductDto[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [grpc, setGrpc] = useState<GrpcState>(INITIAL_GRPC_STATE);

  // Clean up SignalR connection on unmount
  useEffect(() => {
    return () => {
      connectionRef.current?.stop();
    };
  }, []);

  const handleFetchAll = async () => {
    setLoading(true);
    setResults([]);

    const fetchers = [
      { name: 'REST (all fields)', color: getProtocolColor('REST'), fn: () => fetchProductsRest(FIELD_SELECTION_LIMIT) },
      { name: 'GraphQL (all fields)', color: getProtocolColor('GraphQL'), fn: () => fetchProductsGraphQL(FIELD_SELECTION_LIMIT) },
      { name: 'GraphQL (id+name+price only)', color: '#be123c', fn: () => fetchProductsGraphQLMinimal(FIELD_SELECTION_LIMIT) },
    ];

    const newResults: FetchResult[] = [];

    for (const fetcher of fetchers) {
      try {
        const { avgLatencyMs, minLatencyMs, maxLatencyMs, payloadSize, data } =
          await measureFetchMultiple(fetcher.fn, FIELD_SELECTION_ITERATIONS);
        newResults.push({
          protocol: fetcher.name,
          avgLatencyMs,
          minLatencyMs,
          maxLatencyMs,
          payloadSize,
          itemCount: Array.isArray(data) ? data.length : 0,
          color: fetcher.color,
        });
      } catch {
        newResults.push({
          protocol: fetcher.name,
          avgLatencyMs: -1,
          minLatencyMs: -1,
          maxLatencyMs: -1,
          payloadSize: 0,
          itemCount: 0,
          color: fetcher.color,
        });
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  const handleGrpcFetch = async () => {
    setGrpc({ ...INITIAL_GRPC_STATE, loading: true });
    try {
      const result = await fetchProductsGrpcWebMultiple(FIELD_SELECTION_LIMIT, FIELD_SELECTION_ITERATIONS);
      setGrpc({
        products: result.products,
        loading: false,
        avgLatencyMs: result.avgLatencyMs,
        minLatencyMs: result.minLatencyMs,
        maxLatencyMs: result.maxLatencyMs,
        payloadBytes: result.payloadBytes,
        error: null,
      });
    } catch (err) {
      setGrpc((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  };

  const handleSignalRStream = async () => {
    // Stop previous connection to prevent WebSocket leak
    if (connectionRef.current) {
      await connectionRef.current.stop();
      connectionRef.current = null;
    }

    setStreamedProducts([]);
    setIsStreaming(true);

    try {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl('/hub/catalog')
        .withAutomaticReconnect()
        .build();

      connectionRef.current = connection;
      await connection.start();

      const stream = connection.stream<ProductDto>('StreamProducts');
      stream.subscribe({
        next: (product) => {
          setStreamedProducts((prev) => [...prev, product]);
        },
        complete: () => {
          setIsStreaming(false);
        },
        error: (err) => {
          console.error('Stream error:', err);
          setIsStreaming(false);
        },
      });
    } catch (err) {
      console.error('SignalR connection failed:', err);
      setIsStreaming(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Live Demo</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          See each protocol in action. Fetch real data and compare the experience side by side.
        </p>
      </div>

      {/* REST vs GraphQL comparison */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <DemoSectionHeader
            color="#3b82f6"
            title="REST vs GraphQL: Field Selection"
            description="Compare payload sizes when fetching all fields vs. only needed fields."
          />
          <button
            onClick={handleFetchAll}
            disabled={loading}
            className="shrink-0 px-5 py-2 rounded-lg bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {`Running ×${FIELD_SELECTION_ITERATIONS}…`}
              </span>
            ) : `Fetch ${FIELD_SELECTION_LIMIT} Products (×${FIELD_SELECTION_ITERATIONS})`}
          </button>
        </div>

        {/* Skeleton while loading */}
        {loading && results.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="h-[3px] skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-3 rounded skeleton w-2/3" />
                  <div className="h-3 rounded skeleton w-full" />
                  <div className="h-3 rounded skeleton w-4/5" />
                  <div className="h-3 rounded skeleton w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {results.map((r) => (
              <div
                key={r.protocol}
                className="rounded-xl overflow-hidden border animate-reveal"
                style={{ borderColor: r.color + '35' }}
              >
                <div className="h-[3px]" style={{ backgroundColor: r.color }} />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                  <h3 className="font-bold text-sm">{r.protocol}</h3>
                </div>
                {r.avgLatencyMs >= 0 ? (
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Avg latency</dt>
                      <dd className="font-mono font-medium">{r.avgLatencyMs} ms</dd>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <dt>min / max</dt>
                      <dd className="font-mono">{r.minLatencyMs} / {r.maxLatencyMs} ms</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Payload</dt>
                      <dd className="font-mono font-medium">{(r.payloadSize / 1024).toFixed(2)} KB</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Items</dt>
                      <dd className="font-mono font-medium">{r.itemCount}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-red-500">Request failed — is the API running?</p>
                )}
              </div>
              </div>
            ))}
          </div>
        )}

        {results.length >= 2 && results[0].avgLatencyMs >= 0 && results[2]?.avgLatencyMs >= 0 && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <strong>Insight:</strong> GraphQL with only 3 fields returned{' '}
              <strong>
                {Math.round(((results[0].payloadSize - results[2].payloadSize) / results[0].payloadSize) * 100)}%
              </strong>{' '}
              less data than REST (which returns all fields). This demonstrates GraphQL's advantage in mobile/low-bandwidth scenarios.
            </p>
          </div>
        )}
      </section>

      {/* gRPC-Web Demo */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <DemoSectionHeader
            color="#10b981"
            title="gRPC-Web: Binary Protocol"
            description={`Real gRPC call from the browser — ${FIELD_SELECTION_LIMIT} items, ${FIELD_SELECTION_ITERATIONS} iterations averaged.`}
          />
          <button
            onClick={handleGrpcFetch}
            disabled={grpc.loading}
            className="shrink-0 px-5 py-2 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            {grpc.loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {`Running ×${FIELD_SELECTION_ITERATIONS}…`}
              </span>
            ) : `Fetch via gRPC-Web (×${FIELD_SELECTION_ITERATIONS})`}
          </button>
        </div>

        {grpc.error && (
          <p className="text-sm text-red-500 mb-4">Error: {grpc.error} — is the API running?</p>
        )}

        {/* gRPC skeleton */}
        {grpc.loading && grpc.avgLatencyMs === null && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-emerald-100 dark:border-emerald-900/40 p-4 space-y-2">
                <div className="h-2.5 rounded skeleton w-3/4" />
                <div className="h-5 rounded skeleton w-full" />
              </div>
            ))}
          </div>
        )}

        {grpc.avgLatencyMs !== null && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 animate-reveal">
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 p-4">
              <p className="text-xs text-slate-500 mb-1">Avg latency</p>
              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{grpc.avgLatencyMs} ms</p>
            </div>
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 p-4">
              <p className="text-xs text-slate-500 mb-1">min / max</p>
              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{grpc.minLatencyMs} / {grpc.maxLatencyMs} ms</p>
            </div>
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 p-4">
              <p className="text-xs text-slate-500 mb-1">Payload (binary)</p>
              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{grpc.payloadBytes ? (grpc.payloadBytes / 1024).toFixed(2) + ' KB' : '—'}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 p-4">
              <p className="text-xs text-slate-500 mb-1">Items</p>
              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{grpc.products.length}</p>
            </div>
          </div>
        )}

        {grpc.products.length > 0 && (
          <div className="max-h-64 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {grpc.products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">${p.price.toFixed(2)} · stock: {p.stockQuantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 text-sm text-emerald-800 dark:text-emerald-300 space-y-1.5">
          <p><strong>How it works:</strong> HTTP POST to <code className="font-mono text-xs">/catalog.CatalogGrpcService/GetProducts</code> with <code className="font-mono text-xs">Content-Type: application/grpc-web+proto</code>. Request and response are protobuf-encoded binary.</p>
          <p className="text-emerald-700 dark:text-emerald-400"><strong>⚠️ Browser limitation:</strong> gRPC-Web latency in a browser includes JS-side protobuf decode overhead (protobufjs), which doesn’t exist in native gRPC. Real gRPC speed advantage appears in service‑to‑service calls where both ends use native .NET/Go/Java clients with zero-copy binary deserialization.</p>
        </div>
      </section>

      {/* SignalR Streaming Demo */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <DemoSectionHeader
            color="#f59e0b"
            title="SignalR: Real-time Streaming"
            description="Products arrive one by one via WebSocket — no polling needed."
          />
          <button
            onClick={handleSignalRStream}
            disabled={isStreaming}
            className="shrink-0 px-5 py-2 rounded-lg bg-amber-500 dark:bg-amber-500 text-white text-sm font-medium hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            {isStreaming ? 'Streaming...' : 'Start Stream'}
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-500 mb-2">
            <span>Products received: {streamedProducts.length}</span>
            {isStreaming && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-signalr rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (streamedProducts.length / 50) * 100)}%` }}
            />
          </div>

          {/* Products list */}
          {streamedProducts.length > 0 && (
            <div className="mt-4 max-h-80 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {streamedProducts.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <span className="text-xs font-mono text-slate-400">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-slate-500">${p.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Use case summary */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-5">When to Use What?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UseCaseCard
            title="Public API for many clients"
            winner="REST"
            color={getProtocolColor('REST')}
            reason="Universal support, cacheability, well-defined conventions."
          />
          <UseCaseCard
            title="Microservice-to-microservice"
            winner="gRPC"
            color={getProtocolColor('gRPC')}
            reason="Binary protocol, strongly typed, streaming, low latency."
          />
          <UseCaseCard
            title="Mobile app with complex data needs"
            winner="GraphQL"
            color={getProtocolColor('GraphQL')}
            reason="Fetch exactly what you need in a single request."
          />
          <UseCaseCard
            title="Live dashboards & notifications"
            winner="SignalR"
            color={getProtocolColor('SignalR')}
            reason="Server-initiated push, real-time events, automatic reconnect."
          />
        </div>
      </section>
    </div>
  );
}

function DemoSectionHeader({ color, title, description }: { color: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-1 h-10 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: color }} />
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function UseCaseCard({ title, winner, color, reason }: { title: string; winner: string; color: string; reason: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 overflow-hidden">
      <div className="h-[3px]" style={{ backgroundColor: color }} />
      <div className="p-4">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1.5">{title}</p>
        <p className="text-xl font-black" style={{ color }}>{winner}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{reason}</p>
      </div>
    </div>
  );
}

export default LiveDemoPage;
