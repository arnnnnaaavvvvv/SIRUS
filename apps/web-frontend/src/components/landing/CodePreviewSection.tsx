"use client";

import React, { useState } from "react";
import { Terminal, Copy, Check, Code2, Sparkles, Zap } from "lucide-react";

export default function CodePreviewSection() {
  const [tab, setTab] = useState<"python" | "curl" | "ws">("python");
  const [copied, setCopied] = useState(false);

  const snippets = {
    python: `# 1. Initialize Sirus Quantitative SDK
from sirus import QuantEngine, Strategy, OrderType

engine = QuantEngine(api_key="<YOUR_API_KEY>", tenant_id="<YOUR_TENANT_ID>")

# 2. Define Moving Average Cross Alpha Model
class TrendAlpha(Strategy):
    def on_tick(self, tick):
        if tick.fast_ema > tick.slow_ema:
            self.buy("BTC-USDT", qty=0.25, type=OrderType.LIMIT)

# 3. Deploy Vectorized Bot to Venue DMA
engine.deploy(TrendAlpha(), venue="kucoin", risk_max_dd=0.035)`,
    curl: `# Direct Market Access REST API Execution
curl -X POST https://api.sirus.io/v1/orders \\
  -H "Authorization: Bearer <YOUR_API_TOKEN>" \\
  -H "X-Tenant-ID: <YOUR_TENANT_ID>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "broker_name": "alpaca",
    "symbol": "AAPL",
    "side": "buy",
    "order_type": "limit",
    "price": 182.30,
    "quantity": 50
  }'`,
    ws: `# Real-Time L2 Orderbook & Execution WebSocket
wscat -c "wss://ws.sirus.io/v1/market-data" \\
  -H "Authorization: Bearer <YOUR_API_TOKEN>"

# Stream Payload:
# {"event": "TICK", "symbol": "BTC-USDT", "price": 64850.00, "latency_ms": 1.4}`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full badge-glow-cyan text-xs font-semibold text-cyan-300">
            <Code2 className="w-3.5 h-3.5" />
            <span>Developer-First Quant API</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Built for <span className="text-gradient-cyan">Programmatic Trading</span>
          </h2>
          <p className="text-sm text-slate-400">
            Deploy strategies via our high-speed Python SDK, REST API, or sub-millisecond WebSocket channels.
          </p>
        </div>

        {/* Code Terminal Mockup Card */}
        <div className="launch-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-950/80 gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">sirus-sdk-v2.py</span>
            </div>

            {/* Tab switchers */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-white/[0.06] text-xs">
              <button
                onClick={() => setTab("python")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  tab === "python" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-white"
                }`}
              >
                Python SDK
              </button>
              <button
                onClick={() => setTab("curl")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  tab === "curl" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-white"
                }`}
              >
                REST cURL
              </button>
              <button
                onClick={() => setTab("ws")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  tab === "ws" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-white"
                }`}
              >
                WebSocket Feed
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 font-mono transition-all self-start sm:self-auto"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? "Copied!" : "Copy Code"}</span>
            </button>
          </div>

          {/* Code block */}
          <div className="p-6 sm:p-8 bg-slate-950/90 overflow-x-auto font-mono text-xs sm:text-sm text-slate-200 leading-relaxed">
            <pre>
              <code>{snippets[tab]}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
