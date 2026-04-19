import { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Cell,
} from 'recharts';
import { runBenchmark } from '../api';
import { PROTOCOL_COLORS, getProtocolColor } from '../protocolData';
import type { BenchmarkResultDto } from '../types';

// ---------- Custom tooltip shared by all bar charts ----------
interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: Record<string, number | string>;
}

function ChartTooltip({
  active,
  payload,
  label,
  extra,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  extra?: (payload: Record<string, number | string>) => React.ReactNode;
}) {
  if (!active || !payload?.length) return null;
  const color = PROTOCOL_COLORS[label as string] ?? '#6b7280';
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm shadow-lg min-w-36">
      <p className="font-bold mb-2" style={{ color }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex justify-between gap-4">
          <span className="text-slate-500">{p.name}</span>
          <span className="font-mono font-medium">{p.value}</span>
        </p>
      ))}
      {extra?.(payload[0]?.payload)}
    </div>
  );
}

// ---------- Protocol legend strip ----------
function ProtocolLegend() {
  return (
    <div className="flex flex-wrap gap-3">
      {Object.entries(PROTOCOL_COLORS).map(([name, color]) => (
        <span key={name} className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
          {name}
        </span>
      ))}
    </div>
  );
}

const BENCHMARK_STEPS = [
  { label: 'REST', color: '#3b82f6' },
  { label: 'gRPC', color: '#10b981' },
  { label: 'GraphQL', color: '#e11d48' },
  { label: 'SignalR', color: '#f59e0b' },
];

function ComparePage() {
  const [results, setResults] = useState<BenchmarkResultDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [iterations, setIterations] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cycle through protocol steps while loading
  useEffect(() => {
    if (loading) {
      setActiveStep(0);
      stepTimerRef.current = setInterval(() => {
        setActiveStep((s) => (s + 1) % BENCHMARK_STEPS.length);
      }, 600);
    } else {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    }
    return () => { if (stepTimerRef.current) clearInterval(stepTimerRef.current); };
  }, [loading]);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await runBenchmark(iterations);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Benchmark failed');
    } finally {
      setLoading(false);
    }
  };

  // All chart data uses protocol color via `fill` on each row, rendered with <Cell>
  const latencyData = results?.results.map((r) => ({
    name: r.protocol,
    avg: r.averageLatencyMs,
    min: r.minLatencyMs,
    max: r.maxLatencyMs,
    fill: getProtocolColor(r.protocol),
  }));

  const payloadData = results?.results.map((r) => ({
    name: r.protocol,
    'Payload (bytes)': r.payloadSizeBytes,
    fill: getProtocolColor(r.protocol),
  }));

  const throughputData = results?.results.map((r) => ({
    name: r.protocol,
    'Req / s': r.estimatedThroughputPerSecond,
    fill: getProtocolColor(r.protocol),
  }));

  // Normalize a set of values to 0–100. For "lower is better" metrics, invert the score.
  const normalize = (values: number[], lowerIsBetter: boolean): number[] => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (max === min) return values.map(() => 100);
    return values.map((v) => {
      const ratio = (v - min) / (max - min);
      return Math.round(lowerIsBetter ? (1 - ratio) * 100 : ratio * 100);
    });
  };

  const radarData = results
    ? (() => {
        const latencyScores = normalize(results.results.map((r) => r.averageLatencyMs), true);
        const payloadScores = normalize(results.results.map((r) => r.payloadSizeBytes), true);
        const throughputScores = normalize(results.results.map((r) => r.estimatedThroughputPerSecond), false);
        return [
          {
            metric: 'Latency',
            ...Object.fromEntries(results.results.map((r, i) => [r.protocol, latencyScores[i]])),
          },
          {
            metric: 'Payload',
            ...Object.fromEntries(results.results.map((r, i) => [r.protocol, payloadScores[i]])),
          },
          {
            metric: 'Throughput',
            ...Object.fromEntries(results.results.map((r, i) => [r.protocol, throughputScores[i]])),
          },
        ];
      })()
    : [];

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Benchmarks</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Latency, payload size, and throughput — measured server-side across all protocols.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            Iterations
            <input
              type="number"
              min={1}
              max={100}
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="w-20 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Running…
              </span>
            ) : 'Run Benchmark'}
          </button>
        </div>
      </div>

      {/* ── Benchmark progress loader ───────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <svg className="animate-spin w-5 h-5 text-primary shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Running <span className="font-bold text-slate-900 dark:text-slate-50">{iterations}</span> iterations per protocol…
            </p>
          </div>

          {/* Per-protocol step rows */}
          <div className="space-y-3">
            {BENCHMARK_STEPS.map((step, i) => {
              const isActive = i === activeStep;
              const isDone = false; // we don't know completion per-step from the API
              return (
                <div key={step.label} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor: isActive ? step.color : '#cbd5e1',
                      transform: isActive ? 'scale(1.4)' : 'scale(1)',
                      boxShadow: isActive ? `0 0 8px ${step.color}99` : 'none',
                    }}
                  />
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: step.color,
                        width: isActive ? '100%' : isDone ? '100%' : '0%',
                        opacity: isActive ? 1 : 0.25,
                        animation: isActive ? 'shimmer 1.4s linear infinite' : 'none',
                        background: isActive
                          ? `linear-gradient(90deg, ${step.color}aa, ${step.color}, ${step.color}aa)`
                          : step.color,
                        backgroundSize: '200% auto',
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-bold w-16 shrink-0 transition-colors duration-200"
                    style={{ color: isActive ? step.color : '#94a3b8' }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────── */}
      {!results && !loading && (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 py-20 text-center">
          <svg className="mx-auto mb-4 w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <p className="text-slate-500 dark:text-slate-400 font-medium">No data yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Press <strong className="text-slate-600 dark:text-slate-300">Run Benchmark</strong> to measure {iterations} iterations per protocol.
          </p>
          <div className="mt-6 flex justify-center">
            <ProtocolLegend />
          </div>
        </div>
      )}

      {/* ── Results ────────────────────────────────────────────── */}
      {results && (
        <div className="animate-reveal space-y-8">
          {/* Protocol legend */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Color key:</span>
            <ProtocolLegend />
          </div>

          {/* Summary Cards — colored left border, all key metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.results.map((r) => {
              const color = getProtocolColor(r.protocol);
              return (
                <div
                  key={r.protocol}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
                >
                  {/* Colored top stripe */}
                  <div className="h-1.5" style={{ backgroundColor: color }} />
                  <div className="p-5">
                    <h3 className="font-bold text-base mb-4" style={{ color }}>{r.protocol}</h3>
                    <dl className="space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Avg latency</dt>
                        <dd className="font-mono font-semibold">{r.averageLatencyMs} ms</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Min / Max</dt>
                        <dd className="font-mono text-slate-500 text-xs">{r.minLatencyMs} / {r.maxLatencyMs} ms</dd>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-700 pt-2 flex justify-between">
                        <dt className="text-slate-500">Payload</dt>
                        <dd className="font-mono font-semibold">{(r.payloadSizeBytes / 1024).toFixed(1)} KB</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Throughput</dt>
                        <dd className="font-mono font-semibold">{r.estimatedThroughputPerSecond} req/s</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts — all use protocol colors consistently */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Latency — avg bar per protocol, colored by protocol */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h3 className="text-base font-bold mb-1">Average Latency</h3>
              <p className="text-xs text-slate-400 mb-4">Hover a bar to see min / max range</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={latencyData} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v: number) => `${v}ms`} tick={{ fontSize: 11 }} width={52} />
                  <Tooltip
                    content={({ active, payload, label }) => (
                      <ChartTooltip
                        active={active}
                        payload={payload as unknown as TooltipPayloadItem[]}
                        label={label as string}
                        extra={(d) => (
                          <p className="text-xs text-slate-400 mt-1">
                            Range: {d.min}–{d.max} ms
                          </p>
                        )}
                      />
                    )}
                  />
                  <Bar dataKey="avg" name="Avg (ms)" radius={[4, 4, 0, 0]}>
                    {latencyData?.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Payload */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h3 className="text-base font-bold mb-1">Payload Size</h3>
              <p className="text-xs text-slate-400 mb-4">Response body bytes per request</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={payloadData} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v: number) => v >= 1024 ? `${(v / 1024).toFixed(0)}KB` : `${v}B`} tick={{ fontSize: 11 }} width={52} />
                  <Tooltip content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload as unknown as TooltipPayloadItem[]} label={label as string} />} />
                  <Bar dataKey="Payload (bytes)" radius={[4, 4, 0, 0]}>
                    {payloadData?.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Throughput */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h3 className="text-base font-bold mb-1">Estimated Throughput</h3>
              <p className="text-xs text-slate-400 mb-4">Requests per second (calculated from avg latency)</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={throughputData} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v: number) => `${v}`} tick={{ fontSize: 11 }} width={52} />
                  <Tooltip content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload as unknown as TooltipPayloadItem[]} label={label as string} />} />
                  <Bar dataKey="Req / s" radius={[4, 4, 0, 0]}>
                    {throughputData?.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h3 className="text-base font-bold mb-1">Overall Score</h3>
              <p className="text-xs text-slate-400 mb-4">Normalised 0–100, higher = better in each dimension</p>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  {results.results.map((r) => (
                    <Radar
                      key={r.protocol}
                      name={r.protocol}
                      dataKey={r.protocol}
                      stroke={PROTOCOL_COLORS[r.protocol]}
                      fill={PROTOCOL_COLORS[r.protocol]}
                      fillOpacity={0.15}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComparePage;
