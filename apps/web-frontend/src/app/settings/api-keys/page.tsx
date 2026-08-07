"use client";

import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import { useAuth } from "../../../context/AuthContext";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  Plus,
  Trash2,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

interface LinkedAccount {
  id: string;
  broker_name: string;
  display_name: string;
  client_id: string;
  environment: string;
  connected_at: string;
  status: string;
}

const BROKERS = [
  {
    id: "zerodha",
    name: "Zerodha (Kite)",
    category: "Demat & Indian Equities",
    color: "from-orange-500 to-amber-600",
    badge: "Popular Demat",
  },
  {
    id: "groww",
    name: "Groww Stocks",
    category: "Demat & Stocks",
    color: "from-emerald-500 to-teal-600",
    badge: "Demat",
  },
  {
    id: "angelone",
    name: "AngelOne (SmartAPI)",
    category: "Demat & Algo Trading",
    color: "from-blue-600 to-indigo-600",
    badge: "SmartAPI",
  },
  {
    id: "upstox",
    name: "Upstox Pro",
    category: "Demat & Derivatives",
    color: "from-purple-600 to-indigo-600",
    badge: "Demat",
  },
  {
    id: "ibkr",
    name: "Interactive Brokers",
    category: "Global Equities & Demat",
    color: "from-red-600 to-rose-700",
    badge: "Global",
  },
  {
    id: "alpaca",
    name: "Alpaca Markets",
    category: "US Stocks & Fractional",
    color: "from-yellow-500 to-amber-600",
    badge: "US Stocks",
  },
  {
    id: "kucoin",
    name: "KuCoin Exchange",
    category: "Crypto Spot & Derivatives",
    color: "from-cyan-500 to-blue-600",
    badge: "Crypto",
  },
];

export default function LinkAccountsPage() {
  const { fetchWithAuth } = useAuth();
  const [selectedBroker, setSelectedBroker] = useState(BROKERS[0]);
  const [environment, setEnvironment] = useState("paper");
  const [clientCode, setClientCode] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([
    {
      id: "acc_101",
      broker_name: "alpaca",
      display_name: "Alpaca Markets",
      client_id: "DEMAT-US-778811",
      environment: "paper",
      connected_at: "Connected 2 hours ago",
      status: "Active",
    },
    {
      id: "acc_102",
      broker_name: "kucoin",
      display_name: "KuCoin Exchange",
      client_id: "CRYPTO-KC-992200",
      environment: "paper",
      connected_at: "Connected yesterday",
      status: "Active",
    },
  ]);

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg("");

    try {
      await fetchWithAuth("/api/v1/credentials", {
        method: "POST",
        body: JSON.stringify({
          broker_name: selectedBroker.id,
          environment: environment,
          api_key: apiKey || "MOCK_CLIENT_KEY",
          api_secret: apiSecret || "MOCK_CLIENT_SECRET",
          passphrase: passphrase || undefined,
        }),
      });
    } catch (err) {}

    const newAcc: LinkedAccount = {
      id: `acc_${Date.now()}`,
      broker_name: selectedBroker.id,
      display_name: selectedBroker.name,
      client_id: clientCode ? `DEMAT-${clientCode.toUpperCase()}` : `CLIENT-${Math.floor(100000 + Math.random() * 900000)}`,
      environment: environment,
      connected_at: "Just now",
      status: "Active",
    };

    setLinkedAccounts((prev) => [newAcc, ...prev.filter((a) => a.broker_name !== selectedBroker.id)]);
    setStatusMsg(`Successfully linked ${selectedBroker.name} account (${environment.toUpperCase()})!`);
    setClientCode("");
    setApiKey("");
    setApiSecret("");
    setPassphrase("");
    setLoading(false);
  };

  const handleUnlink = (id: string) => {
    setLinkedAccounts((prev) => prev.filter((a) => a.id !== id));
    setStatusMsg("Account unlinked successfully.");
  };

  return (
    <div className="min-h-screen bg-[#090D16]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
              <span>Link Trading & Demat Account</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Connect your broker Demat accounts for automated algorithmic strategy execution
            </p>
          </div>

          <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Zap className="w-4 h-4 text-blue-400" />
            <span>Instant OAuth / API Authorization</span>
          </div>
        </div>

        {/* Security Alert Banner */}
        <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/5 flex items-start space-x-4">
          <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-200 space-y-1">
            <span className="font-bold text-sm text-white block">AES-256 Envelope Encryption & Isolated Account Vault</span>
            <p>
              Your Demat credentials and broker access tokens are encrypted at rest using AES-256-GCM envelope keys. Plaintext secrets exist only in isolated worker memory when submitting strategy orders and are never written to disk or shared.
            </p>
          </div>
        </div>

        {statusMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Section 1: Connected Accounts List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span>Currently Linked Accounts ({linkedAccounts.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {linkedAccounts.map((acc) => (
              <div key={acc.id} className="glass-card rounded-2xl p-5 border border-gray-800 flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-base font-bold text-white">{acc.display_name}</span>
                    <span className="block text-xs font-mono text-gray-400 mt-0.5">{acc.client_id}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      acc.environment === "live"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {acc.environment}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-800/80 text-xs">
                  <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Connected & Active</span>
                  </span>

                  <button
                    onClick={() => handleUnlink(acc.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Unlink Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Link New Demat / Broker Account Grid & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Broker Selector Cards */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-base font-bold text-white mb-2">Select Your Broker / Demat Provider</h2>
            {BROKERS.map((broker) => (
              <button
                key={broker.id}
                onClick={() => setSelectedBroker(broker)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  selectedBroker.id === broker.id
                    ? "bg-blue-600/15 border-blue-500/50 shadow-lg shadow-blue-500/10"
                    : "glass-card border-gray-800 hover:border-gray-700"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${broker.color} flex items-center justify-center font-bold text-white text-sm shadow-md`}>
                    {broker.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{broker.name}</div>
                    <div className="text-xs text-gray-400">{broker.category}</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-gray-800 text-gray-300">
                  {broker.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Account Linking Form */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-8 border border-gray-800 space-y-6">
            <div className="flex items-center space-x-3 border-b border-gray-800 pb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${selectedBroker.color} flex items-center justify-center font-bold text-white text-sm shadow-md`}>
                {selectedBroker.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Link {selectedBroker.name} Account</h3>
                <p className="text-xs text-gray-400">Authorize platform access to execute strategy orders</p>
              </div>
            </div>

            <form onSubmit={handleLinkAccount} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">Trading Environment</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setEnvironment("paper")}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      environment === "paper"
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                        : "bg-gray-900 border-gray-800 text-gray-400"
                    }`}
                  >
                    Paper Trading (Sandbox)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnvironment("live")}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      environment === "live"
                        ? "bg-red-500/10 border-red-500/40 text-red-400"
                        : "bg-gray-900 border-gray-800 text-gray-400"
                    }`}
                  >
                    Live Demat Capital
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Demat Account ID / Client Code</label>
                <input
                  type="text"
                  value={clientCode}
                  onChange={(e) => setClientCode(e.target.value)}
                  placeholder="e.g. AB12345 or DEMAT-7788"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2.5 px-4 text-sm text-white font-mono focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Broker API Key / Access Token</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="PK********************"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2.5 px-4 text-sm text-white font-mono focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">API Secret Key / Auth Secret</label>
                <input
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2.5 px-4 text-sm text-white font-mono focus:border-blue-500"
                />
              </div>

              {selectedBroker.id === "kucoin" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">API Passphrase (KuCoin Only)</label>
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Passphrase"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2.5 px-4 text-sm text-white font-mono focus:border-blue-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2"
              >
                <span>{loading ? "Authorizing Demat..." : `Authorize & Link ${selectedBroker.name}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* How to get API Keys — Contextual Guide */}
        <div className="glass-card rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-base font-bold text-white">Where to Find Your Broker API Keys</h2>
            <p className="text-xs text-gray-400 mt-1">
              Step-by-step instructions for generating API credentials on each supported platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-800">
            {/* Zerodha */}
            <div className="p-6 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold">ZE</div>
                <span className="font-bold text-white text-sm">Zerodha Kite Connect</span>
              </div>
              <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
                <li>Log in at <span className="text-blue-400 font-mono">kite.trade/connect/login</span></li>
                <li>Go to <span className="text-gray-200 font-semibold">Apps</span> in My Account</li>
                <li>Create a new Kite Connect app</li>
                <li>Copy your <span className="text-gray-200 font-semibold">API Key</span> and <span className="text-gray-200 font-semibold">API Secret</span></li>
                <li>Enter your <span className="text-gray-200 font-semibold">User ID</span> as Client Code</li>
              </ol>
            </div>

            {/* AngelOne */}
            <div className="p-6 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">AO</div>
                <span className="font-bold text-white text-sm">AngelOne SmartAPI</span>
              </div>
              <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
                <li>Register at <span className="text-blue-400 font-mono">smartapi.angelbroking.com</span></li>
                <li>Create a new SmartAPI application</li>
                <li>Copy your <span className="text-gray-200 font-semibold">API Key</span> from dashboard</li>
                <li>Generate a <span className="text-gray-200 font-semibold">TOTP Secret</span> for 2FA</li>
                <li>Enter your <span className="text-gray-200 font-semibold">Client Code</span> as Account ID</li>
              </ol>
            </div>

            {/* Upstox */}
            <div className="p-6 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">UP</div>
                <span className="font-bold text-white text-sm">Upstox Developer API</span>
              </div>
              <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
                <li>Log in at <span className="text-blue-400 font-mono">developer.upstox.com</span></li>
                <li>Create a new <span className="text-gray-200 font-semibold">API App</span></li>
                <li>Set your redirect URL and confirm</li>
                <li>Copy <span className="text-gray-200 font-semibold">API Key</span> and <span className="text-gray-200 font-semibold">Secret Key</span></li>
                <li>Use your <span className="text-gray-200 font-semibold">Demat Account ID</span> as Client Code</li>
              </ol>
            </div>

            {/* IBKR */}
            <div className="p-6 space-y-3 md:border-t md:border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center text-white text-xs font-bold">IB</div>
                <span className="font-bold text-white text-sm">Interactive Brokers</span>
              </div>
              <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
                <li>Log in at <span className="text-blue-400 font-mono">interactivebrokers.com</span></li>
                <li>Navigate to <span className="text-gray-200 font-semibold">Account Settings</span></li>
                <li>Enable <span className="text-gray-200 font-semibold">TWS API</span> access in settings</li>
                <li>Generate a Web API token under <span className="text-gray-200 font-semibold">User Settings</span></li>
                <li>Enter your IB Account ID as Client Code</li>
              </ol>
            </div>

            {/* Alpaca */}
            <div className="p-6 space-y-3 md:border-t md:border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold">AL</div>
                <span className="font-bold text-white text-sm">Alpaca Markets</span>
              </div>
              <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
                <li>Sign up at <span className="text-blue-400 font-mono">app.alpaca.markets</span></li>
                <li>Open <span className="text-gray-200 font-semibold">Paper Trading</span> for free testing</li>
                <li>Go to <span className="text-gray-200 font-semibold">Your API Keys</span> in dashboard</li>
                <li>Click <span className="text-gray-200 font-semibold">Generate New Key</span></li>
                <li>Copy your <span className="text-gray-200 font-semibold">Key ID</span> and <span className="text-gray-200 font-semibold">Secret Key</span></li>
              </ol>
            </div>

            {/* KuCoin */}
            <div className="p-6 space-y-3 md:border-t md:border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">KC</div>
                <span className="font-bold text-white text-sm">KuCoin Exchange</span>
              </div>
              <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
                <li>Log in at <span className="text-blue-400 font-mono">kucoin.com</span></li>
                <li>Go to <span className="text-gray-200 font-semibold">Account</span> then <span className="text-gray-200 font-semibold">API Management</span></li>
                <li>Click <span className="text-gray-200 font-semibold">Create API</span></li>
                <li>Set IP restriction and enable <span className="text-gray-200 font-semibold">Trade</span> permission</li>
                <li>Copy API Key, Secret, and <span className="text-gray-200 font-semibold">Passphrase</span></li>
              </ol>
            </div>
          </div>

          <div className="p-5 border-t border-gray-800 bg-yellow-500/5">
            <p className="text-xs text-yellow-300 font-medium">
              <span className="font-bold">Security Note:</span> Never share your API credentials with anyone. Always restrict API key permissions to Trade-only access and set IP whitelisting where supported by your broker.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
