import { Link } from 'react-router-dom';
import { protocols } from '../protocolData';

function HomePage() {
  return (
    <div className="space-y-20">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-950 pointer-events-none" />

        <div className="relative text-center max-w-4xl mx-auto animate-fade-up">
          {/* Protocol pills */}
          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {protocols.map((p) => (
              <span
                key={p.name}
                className="px-3 py-1 rounded-full text-xs font-semibold border tracking-wide"
                style={{
                  color: p.color,
                  borderColor: p.color + '55',
                  backgroundColor: p.color + '18',
                }}
              >
                {p.name}
              </span>
            ))}
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.06] text-slate-900 dark:text-slate-50">
            API Communication
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #3b82f6 0%, #10b981 35%, #e11d48 68%, #f59e0b 100%)',
              }}
            >
              Patterns Compared
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Explore the real differences between REST, gRPC, GraphQL, and SignalR —
            their philosophies, performance characteristics, and ideal use cases.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/protocols"
              className="px-7 py-3 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white font-semibold hover:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors text-sm shadow-lg shadow-indigo-500/20"
            >
              Explore Protocols →
            </Link>
            <Link
              to="/compare"
              className="px-7 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
            >
              Run Benchmarks
            </Link>
          </div>
        </div>
      </section>

      {/* ── Protocol Cards ───────────────────────────────────────── */}
      <section className="space-y-5">
        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.16em]">
          The Four Protocols
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {protocols.map((proto, i) => (
            <div
              key={proto.name}
              className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 animate-fade-up"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="h-[3px]" style={{ backgroundColor: proto.color }} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-black" style={{ color: proto.color }}>
                    {proto.name}
                  </h2>
                  <span className="font-mono text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {proto.dataFormat}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {proto.description}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {proto.transport}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Architecture Overview ─────────────────────────────────── */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-10 text-center">
          Architecture Overview
        </h2>
        <div className="flex flex-col items-center">
          {/* Client */}
          <div className="px-10 py-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
            <p className="font-bold text-indigo-700 dark:text-indigo-300 text-sm text-center">React Frontend</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-center">
              Vite · TypeScript · Tailwind v4
            </p>
          </div>

          {/* Protocol connectors */}
          <div className="flex gap-6 sm:gap-10 items-start py-4">
            {protocols.map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-1">
                <div className="w-px h-7" style={{ backgroundColor: p.color + '60' }} />
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{ color: p.color, backgroundColor: p.color + '18' }}
                >
                  {p.name}
                </span>
                <div className="w-px h-7" style={{ backgroundColor: p.color + '60' }} />
              </div>
            ))}
          </div>

          {/* Server */}
          <div className="px-10 py-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
            <p className="font-bold text-emerald-700 dark:text-emerald-300 text-sm text-center">
              ASP.NET 10 API
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-center">
              Clean Architecture · EF Core InMemory
            </p>
          </div>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

          {/* Layers */}
          <div className="flex flex-wrap justify-center gap-3">
            <div className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400">
              Domain
            </div>
            <div className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-400">
              Application
            </div>
            <div className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-400">
              Infrastructure
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Comparison Table ────────────────────────────────── */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Quick Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40">
                <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider w-44">
                  Feature
                </th>
                {protocols.map((p) => (
                  <th key={p.name} className="px-6 py-3 text-sm font-bold" style={{ color: p.color }}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(
                [
                  ['Data Format', protocols.map((p) => p.dataFormat)],
                  ['Transport', protocols.map((p) => p.transport)],
                  ['Direction', ['Unidirectional', 'Bi-directional streaming', 'Unidirectional', 'Bi-directional real-time']],
                  ['Browser Support', ['✅ Native', '⚠️ Needs gRPC-Web', '✅ Native', '✅ Native']],
                  ['Payload Efficiency', ['Medium', 'High (binary)', 'High (field selection)', 'Medium']],
                ] as [string, string[]][]
              ).map(([feature, cells]) => (
                <tr
                  key={feature}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {feature}
                  </td>
                  {cells.map((cell, i) => (
                    <td key={i} className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}

export default HomePage;
