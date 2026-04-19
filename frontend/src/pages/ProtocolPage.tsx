import { useState } from 'react';
import { protocols } from '../protocolData';
import type { ProtocolInfo } from '../types';

function ProtocolPage() {
  const [selected, setSelected] = useState<ProtocolInfo>(protocols[0]);

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
          Protocol Deep Dive
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Select a protocol to explore its philosophy, strengths, and ideal use cases.
        </p>
      </div>

      {/* Protocol Selector — card-style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {protocols.map((proto) => (
          <button
            key={proto.name}
            onClick={() => setSelected(proto)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selected.name === proto.name
                ? ''
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
            style={
              selected.name === proto.name
                ? {
                    color: proto.color,
                    borderColor: proto.color,
                    backgroundColor: proto.color + '14',
                  }
                : undefined
            }
          >
            <div
              className="w-2.5 h-2.5 rounded-full mb-3"
              style={{ backgroundColor: proto.color }}
            />
            <p
              className={`font-black text-sm ${
                selected.name === proto.name ? '' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              {proto.name}
            </p>
            <p
              className={`text-xs mt-0.5 font-mono truncate ${
                selected.name === proto.name
                  ? 'opacity-60'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {proto.dataFormat}
            </p>
          </button>
        ))}
      </div>

      {/* Selected Protocol Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Overview */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-9 rounded-full shrink-0" style={{ backgroundColor: selected.color }} />
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">
                  {selected.name}
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{selected.transport}</p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {selected.description}
            </p>
          </div>

          {/* Philosophy */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <CardHeading color={selected.color}>Philosophy</CardHeading>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
              {selected.philosophy}
            </p>
          </div>

          {/* How It Works */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <CardHeading color={selected.color}>How It Works</CardHeading>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
              {selected.howItWorks}
            </p>
          </div>

          {/* Communication Pattern */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <CardHeading color={selected.color}>Communication Pattern</CardHeading>
            <div className="mt-5">
              <ProtocolDiagram protocol={selected} />
            </div>
          </div>

          {/* Code Example */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <CardHeading color={selected.color}>Code Example</CardHeading>
            <pre className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 overflow-x-auto text-xs leading-relaxed font-mono text-slate-700 dark:text-slate-300">
              <code>{selected.codeExample}</code>
            </pre>
          </div>

          {/* Real-World Adoption */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <CardHeading color={selected.color}>Real-World Adoption</CardHeading>
            <ul className="mt-4 space-y-2.5">
              {selected.realWorldAdoption.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 shrink-0" style={{ color: selected.color }}>●</span>
                  <span className="text-slate-600 dark:text-slate-400">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-6">

          {/* Technical Details */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <CardHeading color={selected.color}>Technical Details</CardHeading>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Data Format
                </dt>
                <dd className="text-sm font-mono font-medium text-slate-700 dark:text-slate-200">
                  {selected.dataFormat}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Transport
                </dt>
                <dd className="text-sm font-mono font-medium text-slate-700 dark:text-slate-200">
                  {selected.transport}
                </dd>
              </div>
            </dl>
          </div>

          {/* Best For */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <CardHeading color="#10b981">Best For</CardHeading>
            <ul className="mt-4 space-y-2.5">
              {selected.bestFor.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <span className="text-emerald-500 mt-0.5 shrink-0 font-bold">✓</span>
                  <span className="text-slate-600 dark:text-slate-400">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Limitations */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <CardHeading color="#ef4444">Limitations</CardHeading>
            <ul className="mt-4 space-y-2.5">
              {selected.limitations.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <span className="text-red-400 mt-0.5 shrink-0 font-bold">✗</span>
                  <span className="text-slate-600 dark:text-slate-400">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Security */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <CardHeading color="#8b5cf6">Security Notes</CardHeading>
            <ul className="mt-4 space-y-2.5">
              {selected.securityNotes.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <span className="text-violet-500 mt-0.5 shrink-0">🛡</span>
                  <span className="text-slate-600 dark:text-slate-400">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Thin left-bar + uppercase heading inside a card */
function CardHeading({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-0.5 h-5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
        {children}
      </h3>
    </div>
  );
}

/** Visual diagram for each protocol's communication flow */
function ProtocolDiagram({ protocol }: { protocol: ProtocolInfo }) {
  const diagrams: Record<string, React.ReactElement> = {
    REST: (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4 w-full max-w-lg">
          <div className="flex-1 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-center text-sm font-medium text-blue-700 dark:text-blue-400">Client</div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-xs text-slate-500 font-mono">GET /api/products</span>
            <div className="w-28 h-px bg-blue-400" />
            <span className="text-xs text-slate-500">→ HTTP Request</span>
          </div>
          <div className="flex-1 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-center text-sm font-medium text-blue-700 dark:text-blue-400">Server</div>
        </div>
        <div className="flex items-center gap-4 w-full max-w-lg">
          <div className="flex-1 p-3 rounded-lg bg-blue-50/40 dark:bg-blue-950/15 text-center text-sm text-blue-600/60 dark:text-blue-400/60">Client</div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-xs text-slate-500 font-mono">200 OK + JSON</span>
            <div className="w-28 h-px bg-blue-300" />
            <span className="text-xs text-slate-500">← HTTP Response</span>
          </div>
          <div className="flex-1 p-3 rounded-lg bg-blue-50/40 dark:bg-blue-950/15 text-center text-sm text-blue-600/60 dark:text-blue-400/60">Server</div>
        </div>
      </div>
    ),
    gRPC: (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4 w-full max-w-lg">
          <div className="flex-1 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-center text-sm font-medium text-emerald-700 dark:text-emerald-400">Client</div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-xs text-slate-500 font-mono">Protobuf binary</span>
            <div className="w-28 h-px bg-emerald-400" />
            <span className="text-xs text-slate-500">→ HTTP/2 stream</span>
          </div>
          <div className="flex-1 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-center text-sm font-medium text-emerald-700 dark:text-emerald-400">Server</div>
        </div>
        <div className="flex items-center gap-4 w-full max-w-lg">
          <div className="flex-1 p-3 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/15 text-center text-sm text-emerald-600/60 dark:text-emerald-400/60">Client</div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-xs text-slate-500 font-mono">product₁, product₂…</span>
            <div className="w-28 h-px bg-emerald-300" style={{ borderTop: '1px dashed #6ee7b7' }} />
            <span className="text-xs text-slate-500">← Server streaming</span>
          </div>
          <div className="flex-1 p-3 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/15 text-center text-sm text-emerald-600/60 dark:text-emerald-400/60">Server</div>
        </div>
      </div>
    ),
    GraphQL: (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4 w-full max-w-lg">
          <div className="flex-1 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-center text-sm font-medium text-rose-700 dark:text-rose-400">Client</div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-xs text-slate-500 font-mono">{'{ products { name } }'}</span>
            <div className="w-28 h-px bg-rose-400" />
            <span className="text-xs text-slate-500">→ POST /graphql</span>
          </div>
          <div className="flex-1 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-center text-sm font-medium text-rose-700 dark:text-rose-400">Server</div>
        </div>
        <div className="flex items-center gap-4 w-full max-w-lg">
          <div className="flex-1 p-3 rounded-lg bg-rose-50/40 dark:bg-rose-950/15 text-center text-sm text-rose-600/60 dark:text-rose-400/60">Client</div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-xs text-slate-500">Only requested fields</span>
            <div className="w-28 h-px bg-rose-300" />
            <span className="text-xs text-slate-500">← Exact shape</span>
          </div>
          <div className="flex-1 p-3 rounded-lg bg-rose-50/40 dark:bg-rose-950/15 text-center text-sm text-rose-600/60 dark:text-rose-400/60">Server</div>
        </div>
      </div>
    ),
    SignalR: (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4 w-full max-w-lg">
          <div className="flex-1 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-center text-sm font-medium text-amber-700 dark:text-amber-400">Client</div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-xs text-slate-500">WebSocket handshake</span>
            <div className="w-28 h-px bg-amber-400" />
            <span className="text-xs text-slate-500">↔ Persistent WS</span>
          </div>
          <div className="flex-1 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-center text-sm font-medium text-amber-700 dark:text-amber-400">Server</div>
        </div>
        <div className="flex items-center gap-4 w-full max-w-lg">
          <div className="flex-1 p-3 rounded-lg bg-amber-50/40 dark:bg-amber-950/15 text-center text-sm text-amber-600/60 dark:text-amber-400/60">Client</div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-xs text-slate-500">Server pushes events</span>
            <div className="w-28 h-px bg-amber-300" style={{ borderTop: '1px dashed #fcd34d' }} />
            <span className="text-xs text-slate-500">← PriceUpdate, etc.</span>
          </div>
          <div className="flex-1 p-3 rounded-lg bg-amber-50/40 dark:bg-amber-950/15 text-center text-sm text-amber-600/60 dark:text-amber-400/60">Server</div>
        </div>
      </div>
    ),
  };

  return diagrams[protocol.name] ?? <p className="text-sm text-slate-400">No diagram available.</p>;
}

export default ProtocolPage;
