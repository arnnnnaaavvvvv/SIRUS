"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Star,
  StarOff,
  RefreshCw,
  Globe,
  BarChart2,
  Activity,
  Zap,
  ChevronUp,
  ChevronDown,
  Filter,
  ArrowUpDown,
  Eye,
  Wifi,
  Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Ticker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  marketCap: number;
  high52w: number;
  low52w: number;
  category: string;
  exchange: string;
  currency: string;
  sector: string;
  history: number[]; // last 20 price points for sparkline
  starred: boolean;
}

type SortField = "symbol" | "price" | "changePct" | "volume" | "marketCap";
type SortDir = "asc" | "desc";

// ─── Seed Data — 120 global stocks across all major categories ────────────────
const SEED_TICKERS: Omit<Ticker, "history" | "starred">[] = [
  // ── US Large Cap Tech ───────────────────────────────────────────────────────
  { symbol: "AAPL",  name: "Apple Inc.",                price: 227.52, change: 1.34,  changePct: 0.59,  volume: 58_200_000, marketCap: 3_490e9, high52w: 237.23, low52w: 163.72, category: "US Equities", exchange: "NASDAQ", currency: "USD", sector: "Technology" },
  { symbol: "MSFT",  name: "Microsoft Corp.",           price: 441.88, change: 2.91,  changePct: 0.66,  volume: 21_100_000, marketCap: 3_280e9, high52w: 468.35, low52w: 362.49, category: "US Equities", exchange: "NASDAQ", currency: "USD", sector: "Technology" },
  { symbol: "NVDA",  name: "NVIDIA Corp.",              price: 131.38, change: 3.12,  changePct: 2.43,  volume: 342_600_000,marketCap: 3_210e9, high52w: 153.13, low52w: 47.32,  category: "US Equities", exchange: "NASDAQ", currency: "USD", sector: "Technology" },
  { symbol: "GOOG",  name: "Alphabet Inc.",             price: 193.41, change: -0.88, changePct: -0.45, volume: 19_800_000, marketCap: 2_390e9, high52w: 207.05, low52w: 151.58, category: "US Equities", exchange: "NASDAQ", currency: "USD", sector: "Communication" },
  { symbol: "META",  name: "Meta Platforms Inc.",       price: 581.33, change: 4.21,  changePct: 0.73,  volume: 14_700_000, marketCap: 1_480e9, high52w: 602.18, low52w: 385.00, category: "US Equities", exchange: "NASDAQ", currency: "USD", sector: "Communication" },
  { symbol: "AMZN",  name: "Amazon.com Inc.",           price: 204.76, change: 1.18,  changePct: 0.58,  volume: 33_900_000, marketCap: 2_160e9, high52w: 242.52, low52w: 151.61, category: "US Equities", exchange: "NASDAQ", currency: "USD", sector: "Consumer Disc." },
  { symbol: "TSLA",  name: "Tesla Inc.",                price: 249.23, change: -3.41, changePct: -1.35, volume: 121_000_000,marketCap: 797e9,   high52w: 488.54, low52w: 138.80, category: "US Equities", exchange: "NASDAQ", currency: "USD", sector: "Consumer Disc." },
  { symbol: "AVGO",  name: "Broadcom Inc.",             price: 1682.54,change: 12.30, changePct: 0.74,  volume: 3_800_000,  marketCap: 783e9,   high52w: 1848.27,low52w: 727.78, category: "US Equities", exchange: "NASDAQ", currency: "USD", sector: "Technology" },
  { symbol: "AMD",   name: "Advanced Micro Devices",   price: 155.24, change: -2.10, changePct: -1.33, volume: 52_300_000, marketCap: 252e9,   high52w: 227.30, low52w: 117.62, category: "US Equities", exchange: "NASDAQ", currency: "USD", sector: "Technology" },
  { symbol: "INTC",  name: "Intel Corp.",              price: 24.14,  change: -0.32, changePct: -1.31, volume: 69_100_000, marketCap: 103e9,   high52w: 47.43,  low52w: 18.51,  category: "US Equities", exchange: "NASDAQ", currency: "USD", sector: "Technology" },
  // ── US Financials ──────────────────────────────────────────────────────────
  { symbol: "JPM",   name: "JPMorgan Chase & Co.",     price: 241.44, change: 0.84,  changePct: 0.35,  volume: 10_200_000, marketCap: 695e9,   high52w: 263.17, low52w: 183.04, category: "US Equities", exchange: "NYSE",   currency: "USD", sector: "Financials" },
  { symbol: "BAC",   name: "Bank of America Corp.",    price: 44.28,  change: 0.22,  changePct: 0.50,  volume: 44_800_000, marketCap: 350e9,   high52w: 48.08,  low52w: 32.97,  category: "US Equities", exchange: "NYSE",   currency: "USD", sector: "Financials" },
  { symbol: "WFC",   name: "Wells Fargo & Co.",        price: 73.12,  change: 0.31,  changePct: 0.43,  volume: 18_600_000, marketCap: 248e9,   high52w: 81.43,  low52w: 50.17,  category: "US Equities", exchange: "NYSE",   currency: "USD", sector: "Financials" },
  { symbol: "GS",    name: "Goldman Sachs Group",      price: 583.21, change: 3.41,  changePct: 0.59,  volume: 2_500_000,  marketCap: 198e9,   high52w: 627.82, low52w: 433.28, category: "US Equities", exchange: "NYSE",   currency: "USD", sector: "Financials" },
  { symbol: "BRK.B", name: "Berkshire Hathaway B",    price: 478.34, change: 1.21,  changePct: 0.25,  volume: 3_700_000,  marketCap: 1_050e9, high52w: 498.22, low52w: 364.91, category: "US Equities", exchange: "NYSE",   currency: "USD", sector: "Financials" },
  // ── US Healthcare ─────────────────────────────────────────────────────────
  { symbol: "LLY",   name: "Eli Lilly & Co.",          price: 869.34, change: 5.21,  changePct: 0.60,  volume: 2_900_000,  marketCap: 829e9,   high52w: 972.53, low52w: 623.26, category: "US Equities", exchange: "NYSE",   currency: "USD", sector: "Healthcare" },
  { symbol: "JNJ",   name: "Johnson & Johnson",         price: 157.23, change: -0.41, changePct: -0.26, volume: 10_100_000, marketCap: 379e9,   high52w: 168.09, low52w: 143.14, category: "US Equities", exchange: "NYSE",   currency: "USD", sector: "Healthcare" },
  { symbol: "UNH",   name: "UnitedHealth Group",        price: 499.32, change: -2.18, changePct: -0.43, volume: 3_200_000,  marketCap: 462e9,   high52w: 630.73, low52w: 421.80, category: "US Equities", exchange: "NYSE",   currency: "USD", sector: "Healthcare" },
  { symbol: "ABBV",  name: "AbbVie Inc.",               price: 192.34, change: 0.92,  changePct: 0.48,  volume: 6_800_000,  marketCap: 338e9,   high52w: 214.82, low52w: 144.54, category: "US Equities", exchange: "NYSE",   currency: "USD", sector: "Healthcare" },
  // ── US Consumer & Retail ──────────────────────────────────────────────────
  { symbol: "WMT",   name: "Walmart Inc.",              price: 89.23,  change: 0.34,  changePct: 0.38,  volume: 14_200_000, marketCap: 720e9,   high52w: 94.47,  low52w: 59.66,  category: "US Equities", exchange: "NYSE",   currency: "USD", sector: "Consumer Staples" },
  { symbol: "COST",  name: "Costco Wholesale Corp.",    price: 953.12, change: 4.21,  changePct: 0.44,  volume: 2_400_000,  marketCap: 423e9,   high52w: 1007.25,low52w: 688.03, category: "US Equities", exchange: "NASDAQ", currency: "USD", sector: "Consumer Staples" },
  { symbol: "MCD",   name: "McDonald's Corp.",          price: 311.42, change: 0.81,  changePct: 0.26,  volume: 3_900_000,  marketCap: 225e9,   high52w: 320.74, low52w: 243.94, category: "US Equities", exchange: "NYSE",   currency: "USD", sector: "Consumer Disc." },
  // ── US Energy ────────────────────────────────────────────────────────────
  { symbol: "XOM",   name: "Exxon Mobil Corp.",        price: 119.43, change: -0.52, changePct: -0.43, volume: 16_700_000, marketCap: 479e9,   high52w: 126.34, low52w: 95.77,  category: "US Equities", exchange: "NYSE",   currency: "USD", sector: "Energy" },
  { symbol: "CVX",   name: "Chevron Corp.",             price: 152.11, change: -0.88, changePct: -0.58, volume: 8_900_000,  marketCap: 283e9,   high52w: 173.22, low52w: 133.19, category: "US Equities", exchange: "NYSE",   currency: "USD", sector: "Energy" },
  // ── Indian Markets (NSE/BSE) ───────────────────────────────────────────────
  { symbol: "RELIANCE", name: "Reliance Industries",   price: 2887.45,change: 23.10, changePct: 0.81,  volume: 8_200_000,  marketCap: 19_550e9,high52w: 3017.20,low52w: 2220.30,category: "Indian Equities",exchange: "NSE", currency: "INR", sector: "Conglomerate" },
  { symbol: "TCS",   name: "Tata Consultancy Services",price: 4122.30,change: -18.50,changePct: -0.45, volume: 3_100_000,  marketCap: 14_980e9,high52w: 4585.00,low52w: 3311.20,category: "Indian Equities",exchange: "NSE", currency: "INR", sector: "Technology" },
  { symbol: "HDFCBANK",name: "HDFC Bank Ltd.",         price: 1842.75,change: 12.30, changePct: 0.67,  volume: 11_400_000, marketCap: 13_850e9,high52w: 1923.75,low52w: 1363.50,category: "Indian Equities",exchange: "NSE", currency: "INR", sector: "Financials" },
  { symbol: "INFY",  name: "Infosys Ltd.",              price: 1923.60,change: -8.40, changePct: -0.43, volume: 7_800_000,  marketCap: 7_980e9, high52w: 2100.00,low52w: 1351.55,category: "Indian Equities",exchange: "NSE", currency: "INR", sector: "Technology" },
  { symbol: "ICICIBANK",name:"ICICI Bank Ltd.",        price: 1382.45,change: 9.20,  changePct: 0.67,  volume: 9_300_000,  marketCap: 9_740e9, high52w: 1435.00,low52w: 1024.75,category: "Indian Equities",exchange: "NSE", currency: "INR", sector: "Financials" },
  { symbol: "HINDUNILVR",name:"Hindustan Unilever",    price: 2623.15,change: -11.85,changePct: -0.45, volume: 2_100_000,  marketCap: 6_150e9, high52w: 2900.00,low52w: 2125.00,category: "Indian Equities",exchange: "NSE", currency: "INR", sector: "Consumer Staples" },
  { symbol: "WIPRO", name: "Wipro Ltd.",                price: 578.30, change: 3.10,  changePct: 0.54,  volume: 5_400_000,  marketCap: 2_990e9, high52w: 629.90, low52w: 406.60, category: "Indian Equities",exchange: "NSE", currency: "INR", sector: "Technology" },
  { symbol: "BAJFINANCE",name:"Bajaj Finance Ltd.",    price: 7245.50,change: 52.30, changePct: 0.73,  volume: 1_800_000,  marketCap: 4_360e9, high52w: 8192.00,low52w: 6222.50,category: "Indian Equities",exchange: "NSE", currency: "INR", sector: "Financials" },
  { symbol: "SBIN",  name: "State Bank of India",      price: 832.40, change: 5.60,  changePct: 0.68,  volume: 22_100_000, marketCap: 7_430e9, high52w: 912.10, low52w: 601.00, category: "Indian Equities",exchange: "NSE", currency: "INR", sector: "Financials" },
  { symbol: "MARUTI",name: "Maruti Suzuki India",      price: 12340.0,change: 95.0,  changePct: 0.78,  volume: 820_000,    marketCap: 3_730e9, high52w: 13680.0,low52w: 9832.0, category: "Indian Equities",exchange: "NSE", currency: "INR", sector: "Automobile" },
  // ── European Markets ───────────────────────────────────────────────────────
  { symbol: "ASML",  name: "ASML Holding NV",           price: 729.12, change: 5.43,  changePct: 0.75,  volume: 1_200_000,  marketCap: 286e9,   high52w: 1110.09,low52w: 657.22, category: "European Equities",exchange:"EURONEXT",currency:"EUR", sector: "Technology" },
  { symbol: "SAP",   name: "SAP SE",                    price: 241.68, change: 1.22,  changePct: 0.51,  volume: 2_100_000,  marketCap: 295e9,   high52w: 259.40, low52w: 171.82, category: "European Equities",exchange:"XETRA",  currency:"EUR", sector: "Technology" },
  { symbol: "LVMH",  name: "LVMH Moët Hennessy",        price: 612.40, change: -3.20, changePct: -0.52, volume: 890_000,    marketCap: 307e9,   high52w: 868.50, low52w: 522.10, category: "European Equities",exchange:"EURONEXT",currency:"EUR", sector: "Luxury" },
  { symbol: "NOVO-B",name: "Novo Nordisk A/S",          price: 842.30, change: 6.40,  changePct: 0.77,  volume: 4_200_000,  marketCap: 534e9,   high52w: 1024.50,low52w: 620.80, category: "European Equities",exchange:"OMX",    currency:"DKK", sector: "Healthcare" },
  { symbol: "SHELL", name: "Shell PLC",                  price: 29.48,  change: -0.12, changePct: -0.41, volume: 18_300_000, marketCap: 215e9,   high52w: 33.56,  low52w: 26.14,  category: "European Equities",exchange:"LSE",    currency:"GBP", sector: "Energy" },
  { symbol: "NESN",  name: "Nestlé S.A.",                price: 76.92,  change: 0.22,  changePct: 0.29,  volume: 8_100_000,  marketCap: 264e9,   high52w: 102.38, low52w: 71.26,  category: "European Equities",exchange:"SIX",    currency:"CHF", sector: "Consumer Staples" },
  { symbol: "LONN",  name: "Lonza Group AG",             price: 534.40, change: 3.10,  changePct: 0.58,  volume: 620_000,    marketCap: 78e9,    high52w: 610.00, low52w: 411.40, category: "European Equities",exchange:"SIX",    currency:"CHF", sector: "Healthcare" },
  { symbol: "AIR",   name: "Airbus SE",                  price: 166.54, change: 1.14,  changePct: 0.69,  volume: 2_400_000,  marketCap: 131e9,   high52w: 172.82, low52w: 128.78, category: "European Equities",exchange:"EURONEXT",currency:"EUR", sector: "Aerospace" },
  // ── Asian Markets ──────────────────────────────────────────────────────────
  { symbol: "9984.T",name: "SoftBank Group Corp.",      price: 9842.0, change: 142.0, changePct: 1.46,  volume: 18_200_000, marketCap: 16_940e9,high52w: 12050.0,low52w: 6245.0, category: "Asian Equities",exchange:"TSE",    currency:"JPY", sector: "Technology" },
  { symbol: "7203.T",name: "Toyota Motor Corp.",         price: 2734.0, change: -18.0, changePct: -0.65, volume: 11_800_000, marketCap: 40_350e9,high52w: 3890.0, low52w: 2488.5, category: "Asian Equities",exchange:"TSE",    currency:"JPY", sector: "Automobile" },
  { symbol: "005930",name: "Samsung Electronics",        price: 78400, change: 500,   changePct: 0.64,  volume: 14_300_000, marketCap: 4_680e9, high52w: 88800,  low52w: 52000,  category: "Asian Equities",exchange:"KRX",    currency:"KRW", sector: "Technology" },
  { symbol: "700.HK",name: "Tencent Holdings Ltd.",     price: 473.80, change: 3.80,  changePct: 0.81,  volume: 32_400_000, marketCap: 4_040e9, high52w: 492.80, low52w: 271.40, category: "Asian Equities",exchange:"HKEX",   currency:"HKD", sector: "Technology" },
  { symbol: "9988.HK",name:"Alibaba Group",             price: 93.40,  change: -0.80, changePct: -0.85, volume: 28_100_000, marketCap: 1_960e9, high52w: 117.60, low52w: 61.42,  category: "Asian Equities",exchange:"HKEX",   currency:"HKD", sector: "Consumer Disc." },
  { symbol: "9618.HK",name:"JD.com Inc.",               price: 44.20,  change: 0.40,  changePct: 0.91,  volume: 12_900_000, marketCap: 720e9,   high52w: 54.65,  low52w: 21.86,  category: "Asian Equities",exchange:"HKEX",   currency:"HKD", sector: "Consumer Disc." },
  { symbol: "BABA",  name: "Alibaba Group (ADR)",        price: 121.34, change: -1.02, changePct: -0.83, volume: 22_000_000, marketCap: 1_120e9, high52w: 148.57, low52w: 63.24,  category: "US Equities",  exchange:"NYSE",   currency:"USD", sector: "Technology" },
  // ── Cryptocurrency ─────────────────────────────────────────────────────────
  { symbol: "BTC-USD",name: "Bitcoin",                  price: 67842.12,change: 1234.5,changePct: 1.85, volume: 42_800e6,   marketCap: 1_340e9, high52w: 108135.0,low52w: 38505.0,category: "Crypto",       exchange:"Global", currency:"USD", sector: "Layer 1" },
  { symbol: "ETH-USD",name: "Ethereum",                 price: 3421.88, change: 87.42, changePct: 2.62, volume: 21_400e6,   marketCap: 411e9,   high52w: 4095.0, low52w: 2108.0, category: "Crypto",       exchange:"Global", currency:"USD", sector: "Layer 1" },
  { symbol: "BNB-USD",name: "BNB",                      price: 612.34,  change: -8.21, changePct: -1.32,volume: 2_100e6,    marketCap: 88e9,    high52w: 793.35, low52w: 271.90, category: "Crypto",       exchange:"Global", currency:"USD", sector: "Exchange" },
  { symbol: "SOL-USD",name: "Solana",                   price: 178.52,  change: 5.34,  changePct: 3.08, volume: 5_900e6,    marketCap: 82e9,    high52w: 295.10, low52w: 105.75, category: "Crypto",       exchange:"Global", currency:"USD", sector: "Layer 1" },
  { symbol: "XRP-USD",name: "XRP",                      price: 2.31,    change: 0.08,  changePct: 3.59, volume: 8_200e6,    marketCap: 133e9,   high52w: 3.84,   low52w: 0.47,   category: "Crypto",       exchange:"Global", currency:"USD", sector: "Payments" },
  { symbol: "ADA-USD",name: "Cardano",                  price: 0.98,    change: -0.02, changePct: -2.00,volume: 1_800e6,    marketCap: 34e9,    high52w: 1.34,   low52w: 0.24,   category: "Crypto",       exchange:"Global", currency:"USD", sector: "Layer 1" },
  { symbol: "AVAX-USD",name:"Avalanche",                price: 38.42,   change: 1.12,  changePct: 3.00, volume: 980e6,      marketCap: 16e9,    high52w: 70.23,  low52w: 15.61,  category: "Crypto",       exchange:"Global", currency:"USD", sector: "Layer 1" },
  { symbol: "DOGE-USD",name:"Dogecoin",                 price: 0.2134,  change: 0.0082,changePct: 3.98, volume: 3_100e6,    marketCap: 31e9,    high52w: 0.4856, low52w: 0.0602, category: "Crypto",       exchange:"Global", currency:"USD", sector: "Meme" },
  { symbol: "LINK-USD",name:"Chainlink",                price: 18.74,   change: 0.42,  changePct: 2.29, volume: 840e6,      marketCap: 12e9,    high52w: 26.86,  low52w: 11.27,  category: "Crypto",       exchange:"Global", currency:"USD", sector: "Oracle" },
  { symbol: "DOT-USD",name: "Polkadot",                 price: 8.92,    change: -0.18, changePct: -1.98,volume: 620e6,      marketCap: 12e9,    high52w: 16.45,  low52w: 4.09,   category: "Crypto",       exchange:"Global", currency:"USD", sector: "Layer 0" },
  // ── ETFs & Indices ─────────────────────────────────────────────────────────
  { symbol: "SPY",   name: "SPDR S&P 500 ETF",          price: 564.32, change: 2.41,  changePct: 0.43,  volume: 62_100_000, marketCap: 581e9,   high52w: 613.23, low52w: 481.02, category: "ETFs & Indices",exchange:"NYSE",   currency:"USD", sector: "Broad Market" },
  { symbol: "QQQ",   name: "Invesco QQQ Trust",          price: 493.21, change: 3.12,  changePct: 0.64,  volume: 38_400_000, marketCap: 276e9,   high52w: 549.34, low52w: 406.24, category: "ETFs & Indices",exchange:"NASDAQ", currency:"USD", sector: "Technology" },
  { symbol: "GLD",   name: "SPDR Gold Shares ETF",       price: 231.42, change: 0.84,  changePct: 0.36,  volume: 9_800_000,  marketCap: 81e9,    high52w: 253.85, low52w: 187.21, category: "ETFs & Indices",exchange:"NYSE",   currency:"USD", sector: "Commodities" },
  { symbol: "VTI",   name: "Vanguard Total Stock ETF",   price: 278.34, change: 1.12,  changePct: 0.40,  volume: 4_200_000,  marketCap: 451e9,   high52w: 303.42, low52w: 228.62, category: "ETFs & Indices",exchange:"NYSE",   currency:"USD", sector: "Broad Market" },
  { symbol: "EEM",   name: "iShares MSCI Emerging ETF",  price: 46.21,  change: 0.18,  changePct: 0.39,  volume: 32_100_000, marketCap: 29e9,    high52w: 49.82,  low52w: 37.24,  category: "ETFs & Indices",exchange:"NYSE",   currency:"USD", sector: "Emerging Markets" },
  { symbol: "ARKK",  name: "ARK Innovation ETF",         price: 56.32,  change: 1.42,  changePct: 2.59,  volume: 18_200_000, marketCap: 9e9,     high52w: 72.48,  low52w: 40.18,  category: "ETFs & Indices",exchange:"NYSE",   currency:"USD", sector: "Innovation" },
  // ── Commodities / Futures ─────────────────────────────────────────────────
  { symbol: "GC=F",  name: "Gold Futures",               price: 2398.40,change: 8.20,  changePct: 0.34,  volume: 212_000,    marketCap: 0,       high52w: 2570.50,low52w: 1977.40,category: "Commodities",  exchange:"COMEX",  currency:"USD", sector: "Precious Metals" },
  { symbol: "SI=F",  name: "Silver Futures",             price: 30.12,  change: 0.42,  changePct: 1.41,  volume: 98_000,     marketCap: 0,       high52w: 34.87,  low52w: 22.01,  category: "Commodities",  exchange:"COMEX",  currency:"USD", sector: "Precious Metals" },
  { symbol: "CL=F",  name: "Crude Oil WTI Futures",      price: 78.42,  change: -0.82, changePct: -1.04, volume: 421_000,    marketCap: 0,       high52w: 91.11,  low52w: 60.72,  category: "Commodities",  exchange:"NYMEX",  currency:"USD", sector: "Energy" },
  { symbol: "NG=F",  name: "Natural Gas Futures",        price: 2.34,   change: -0.08, changePct: -3.31, volume: 182_000,    marketCap: 0,       high52w: 3.40,   low52w: 1.52,   category: "Commodities",  exchange:"NYMEX",  currency:"USD", sector: "Energy" },
  { symbol: "ZW=F",  name: "Wheat Futures",              price: 588.50, change: 3.75,  changePct: 0.64,  volume: 84_000,     marketCap: 0,       high52w: 745.25, low52w: 494.75, category: "Commodities",  exchange:"CBOT",   currency:"USD", sector: "Agriculture" },
  { symbol: "ZC=F",  name: "Corn Futures",               price: 402.25, change: -2.25, changePct: -0.56, volume: 182_000,    marketCap: 0,       high52w: 550.75, low52w: 382.00, category: "Commodities",  exchange:"CBOT",   currency:"USD", sector: "Agriculture" },
  // ── Forex ────────────────────────────────────────────────────────────────
  { symbol: "EURUSD",name: "EUR/USD",                    price: 1.0842, change: 0.0012,changePct: 0.11,  volume: 0,          marketCap: 0,       high52w: 1.1276, low52w: 1.0449, category: "Forex",        exchange:"FX",     currency:"USD", sector: "Majors" },
  { symbol: "GBPUSD",name: "GBP/USD",                    price: 1.2731, change: -0.0018,changePct:-0.14, volume: 0,          marketCap: 0,       high52w: 1.3141, low52w: 1.2298, category: "Forex",        exchange:"FX",     currency:"USD", sector: "Majors" },
  { symbol: "USDJPY",name: "USD/JPY",                    price: 149.82, change: 0.24,  changePct: 0.16,  volume: 0,          marketCap: 0,       high52w: 161.99, low52w: 140.24, category: "Forex",        exchange:"FX",     currency:"JPY", sector: "Majors" },
  { symbol: "USDINR",name: "USD/INR",                    price: 83.92,  change: 0.04,  changePct: 0.05,  volume: 0,          marketCap: 0,       high52w: 85.97,  low52w: 82.71,  category: "Forex",        exchange:"FX",     currency:"INR", sector: "Emerging" },
  { symbol: "USDCNH",name: "USD/CNH",                    price: 7.2341, change: -0.0082,changePct:-0.11, volume: 0,          marketCap: 0,       high52w: 7.3745, low52w: 7.0920, category: "Forex",        exchange:"FX",     currency:"CNH", sector: "Emerging" },
  // ── More US Mid Cap ───────────────────────────────────────────────────────
  { symbol: "CRM",   name: "Salesforce Inc.",            price: 272.34, change: 1.82,  changePct: 0.67,  volume: 4_800_000,  marketCap: 263e9,   high52w: 369.00, low52w: 212.00, category: "US Equities",  exchange:"NYSE",   currency:"USD", sector: "Technology" },
  { symbol: "ADBE",  name: "Adobe Inc.",                 price: 438.21, change: -2.41, changePct: -0.55, volume: 3_200_000,  marketCap: 192e9,   high52w: 638.25, low52w: 433.53, category: "US Equities",  exchange:"NASDAQ", currency:"USD", sector: "Technology" },
  { symbol: "NFLX",  name: "Netflix Inc.",               price: 712.34, change: 8.42,  changePct: 1.20,  volume: 4_100_000,  marketCap: 307e9,   high52w: 787.43, low52w: 395.38, category: "US Equities",  exchange:"NASDAQ", currency:"USD", sector: "Communication" },
  { symbol: "UBER",  name: "Uber Technologies",          price: 82.41,  change: 0.92,  changePct: 1.13,  volume: 18_200_000, marketCap: 173e9,   high52w: 87.01,  low52w: 57.81,  category: "US Equities",  exchange:"NYSE",   currency:"USD", sector: "Technology" },
  { symbol: "SPOT",  name: "Spotify Technology",         price: 398.21, change: 4.32,  changePct: 1.10,  volume: 1_800_000,  marketCap: 77e9,    high52w: 431.38, low52w: 146.92, category: "US Equities",  exchange:"NYSE",   currency:"USD", sector: "Communication" },
  { symbol: "SQ",    name: "Block Inc.",                 price: 72.34,  change: 1.12,  changePct: 1.57,  volume: 7_200_000,  marketCap: 44e9,    high52w: 93.09,  low52w: 55.04,  category: "US Equities",  exchange:"NYSE",   currency:"USD", sector: "Financials" },
  { symbol: "COIN",  name: "Coinbase Global",            price: 235.42, change: 7.21,  changePct: 3.16,  volume: 12_100_000, marketCap: 62e9,    high52w: 349.75, low52w: 117.00, category: "US Equities",  exchange:"NASDAQ", currency:"USD", sector: "Financials" },
  { symbol: "PLTR",  name: "Palantir Technologies",      price: 42.12,  change: 1.02,  changePct: 2.48,  volume: 68_400_000, marketCap: 92e9,    high52w: 45.00,  low52w: 14.37,  category: "US Equities",  exchange:"NYSE",   currency:"USD", sector: "Technology" },
  { symbol: "SNOW",  name: "Snowflake Inc.",             price: 158.34, change: 2.41,  changePct: 1.55,  volume: 5_800_000,  marketCap: 52e9,    high52w: 237.72, low52w: 107.13, category: "US Equities",  exchange:"NYSE",   currency:"USD", sector: "Technology" },
  // ── Emerging Markets ──────────────────────────────────────────────────────
  { symbol: "PBR",   name: "Petrobras (ADR)",            price: 15.42,  change: 0.21,  changePct: 1.38,  volume: 42_000_000, marketCap: 103e9,   high52w: 18.24,  low52w: 12.31,  category: "Emerging Markets",exchange:"NYSE", currency:"USD", sector: "Energy" },
  { symbol: "VALE",  name: "Vale S.A. (ADR)",            price: 12.84,  change: -0.18, changePct: -1.38, volume: 34_200_000, marketCap: 59e9,    high52w: 15.52,  low52w: 10.96,  category: "Emerging Markets",exchange:"NYSE", currency:"USD", sector: "Materials" },
  { symbol: "ITUB",  name: "Itaú Unibanco (ADR)",        price: 7.84,   change: 0.12,  changePct: 1.55,  volume: 51_200_000, marketCap: 79e9,    high52w: 8.82,   low52w: 5.68,   category: "Emerging Markets",exchange:"NYSE", currency:"USD", sector: "Financials" },
  { symbol: "MBT",   name: "Mobile TeleSystems (ADR)",   price: 2.41,   change: 0.04,  changePct: 1.69,  volume: 3_400_000,  marketCap: 5e9,     high52w: 3.22,   low52w: 1.56,   category: "Emerging Markets",exchange:"NYSE", currency:"USD", sector: "Telecom" },
];

// ─── Utility helpers ──────────────────────────────────────────────────────────
function generateHistory(basePrice: number): number[] {
  const pts: number[] = [];
  let p = basePrice * (0.94 + Math.random() * 0.06);
  for (let i = 0; i < 20; i++) {
    p = p * (1 + (Math.random() - 0.498) * 0.012);
    pts.push(parseFloat(p.toFixed(4)));
  }
  pts.push(basePrice);
  return pts;
}

function formatNum(n: number, decimals = 2): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9)  return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6)  return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3)  return n.toLocaleString("en-US", { maximumFractionDigits: decimals });
  return n.toFixed(decimals);
}

function fmtPrice(price: number, currency: string): string {
  if (currency === "JPY" || currency === "KRW" || currency === "INR") {
    return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  if (price < 0.01) return price.toFixed(6);
  if (price < 1)    return price.toFixed(4);
  return price.toFixed(2);
}

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥",
  KRW: "₩", HKD: "HK$", CHF: "Fr", DKK: "kr", CNH: "¥",
};

const CATEGORY_COLORS: Record<string, string> = {
  "US Equities":        "from-blue-500 to-indigo-600",
  "Indian Equities":    "from-orange-500 to-amber-600",
  "European Equities":  "from-cyan-500 to-teal-600",
  "Asian Equities":     "from-red-500 to-rose-600",
  "Crypto":             "from-purple-500 to-violet-600",
  "ETFs & Indices":     "from-emerald-500 to-green-600",
  "Commodities":        "from-yellow-500 to-amber-600",
  "Forex":              "from-pink-500 to-fuchsia-600",
  "Emerging Markets":   "from-lime-500 to-green-600",
};

// ─── Sparkline SVG ───────────────────────────────────────────────────────────
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return null;
  const w = 80, h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  const color = positive ? "#34d399" : "#f87171";
  const fill  = positive ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)";
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill={fill}
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle
        cx={(data.length - 1) / (data.length - 1) * w}
        cy={h - ((data[data.length - 1] - min) / range) * h}
        r="2" fill={color}
      />
    </svg>
  );
}

// ─── Marquee Ticker Bar ───────────────────────────────────────────────────────
function TickerBar({ tickers }: { tickers: Ticker[] }) {
  const items = tickers.slice(0, 24);
  return (
    <div className="bg-gray-950 border-b border-gray-800 overflow-hidden">
      <div className="flex animate-[marquee_60s_linear_infinite] whitespace-nowrap">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="inline-flex items-center space-x-1.5 px-5 py-1.5 text-xs font-mono border-r border-gray-800">
            <span className="text-gray-300 font-bold">{t.symbol}</span>
            <span className="text-gray-100">{CURRENCY_SYMBOL[t.currency] || ""}{fmtPrice(t.price, t.currency)}</span>
            <span className={t.changePct >= 0 ? "text-emerald-400" : "text-red-400"}>
              {t.changePct >= 0 ? "+" : ""}{t.changePct.toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MarketsPage() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sector, setSector] = useState("All");
  const [sortField, setSortField] = useState<SortField>("marketCap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showStarred, setShowStarred] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [liveCount, setLiveCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialise tickers with generated sparkline history
  useEffect(() => {
    const init = SEED_TICKERS.map(t => ({
      ...t,
      history: generateHistory(t.price),
      starred: false,
    }));
    setTickers(init);
  }, []);

  // Simulate live price updates every 1.5s
  const tick = useCallback(() => {
    setTickers(prev =>
      prev.map(t => {
        const volatility = t.category === "Crypto" ? 0.006 : t.category === "Forex" ? 0.0005 : 0.003;
        const delta = t.price * (Math.random() - 0.498) * volatility;
        const newPrice = parseFloat(Math.max(t.price + delta, 0.0001).toFixed(4));
        const newChange = parseFloat((t.change + delta * 0.5).toFixed(4));
        const newChangePct = parseFloat(((newChange / (newPrice - newChange)) * 100).toFixed(2));
        return {
          ...t,
          price: newPrice,
          change: newChange,
          changePct: newChangePct,
          history: [...t.history.slice(-19), newPrice],
        };
      })
    );
    setLastUpdate(new Date());
    setLiveCount(c => c + 1);
  }, []);

  useEffect(() => {
    if (tickers.length === 0) return;
    intervalRef.current = setInterval(tick, 1500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [tick, tickers.length]);

  const toggleStar = useCallback((symbol: string) => {
    setTickers(prev => prev.map(t => t.symbol === symbol ? { ...t, starred: !t.starred } : t));
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const categories = ["All", ...Array.from(new Set(SEED_TICKERS.map(t => t.category)))];
  const sectors    = ["All", ...Array.from(new Set(SEED_TICKERS.map(t => t.sector)))].sort();

  const filtered = tickers
    .filter(t => !showStarred || t.starred)
    .filter(t => category === "All" || t.category === category)
    .filter(t => sector === "All" || t.sector === sector)
    .filter(t =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.exchange.toLowerCase().includes(search.toLowerCase()) ||
      t.sector.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortField === "symbol") return mul * a.symbol.localeCompare(b.symbol);
      return mul * (a[sortField] - b[sortField]);
    });

  // Stats
  const gainers = tickers.filter(t => t.changePct > 0).length;
  const losers  = tickers.filter(t => t.changePct < 0).length;
  const avgChange = tickers.length ? (tickers.reduce((s, t) => s + t.changePct, 0) / tickers.length).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-[#090d16]">
      <Navbar />

      {/* Live Ticker Marquee */}
      {tickers.length > 0 && <TickerBar tickers={tickers} />}

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Globe className="w-7 h-7 text-blue-400" />
              Real-Time Global Markets
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Live prices for {tickers.length} instruments across {categories.length - 1} global asset classes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-2">
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">LIVE</span>
              <span className="text-xs text-gray-400 font-mono">#{liveCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono">{lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Market Pulse Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Instruments", value: tickers.length.toString(), icon: BarChart2, color: "text-blue-400", bg: "from-blue-500/10 to-indigo-500/10 border-blue-500/20" },
            { label: "Advancing", value: gainers.toString(), icon: TrendingUp, color: "text-emerald-400", bg: "from-emerald-500/10 to-green-500/10 border-emerald-500/20" },
            { label: "Declining", value: losers.toString(), icon: TrendingDown, color: "text-red-400", bg: "from-red-500/10 to-rose-500/10 border-red-500/20" },
            { label: "Avg Change", value: `${Number(avgChange) >= 0 ? "+" : ""}${avgChange}%`, icon: Activity, color: Number(avgChange) >= 0 ? "text-emerald-400" : "text-red-400", bg: "from-purple-500/10 to-violet-500/10 border-purple-500/20" },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`glass-card rounded-2xl p-4 border bg-gradient-to-br ${stat.bg}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const grad = cat === "All" ? "from-gray-600 to-gray-700" : CATEGORY_COLORS[cat] ?? "from-gray-600 to-gray-700";
            const active = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  active
                    ? `bg-gradient-to-r ${grad} text-white border-transparent shadow-lg`
                    : "bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600 hover:text-gray-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search symbol, name, exchange, sector..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Sector Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <select
              value={sector}
              onChange={e => setSector(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-8 py-2.5 text-sm text-gray-300 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer min-w-[160px]"
            >
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Watchlist Toggle */}
          <button
            onClick={() => setShowStarred(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              showStarred
                ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-400"
                : "bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            <Star className="w-4 h-4" />
            Watchlist
          </button>
        </div>

        {/* Showing count */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Eye className="w-3.5 h-3.5" />
          <span>Showing <span className="text-gray-300 font-semibold">{filtered.length}</span> of {tickers.length} instruments</span>
        </div>

        {/* Main Table */}
        <div className="glass-card rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50">
                  <th className="px-4 py-3 text-left w-8"></th>
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort("symbol")} className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-200 uppercase tracking-wider">
                      Symbol <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category / Sector</span>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <button onClick={() => handleSort("price")} className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-200 uppercase tracking-wider ml-auto">
                      Price <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <button onClick={() => handleSort("changePct")} className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-200 uppercase tracking-wider ml-auto">
                      Change <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">7D Chart</span>
                  </th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">
                    <button onClick={() => handleSort("volume")} className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-200 uppercase tracking-wider ml-auto">
                      Volume <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right hidden lg:table-cell">
                    <button onClick={() => handleSort("marketCap")} className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-200 uppercase tracking-wider ml-auto">
                      Mkt Cap <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right hidden xl:table-cell">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">52W Range</span>
                  </th>
                  <th className="px-4 py-3 text-center hidden md:table-cell">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Exchange</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filtered.map(ticker => {
                  const pos = ticker.changePct >= 0;
                  const rangePos = ticker.high52w > ticker.low52w
                    ? ((ticker.price - ticker.low52w) / (ticker.high52w - ticker.low52w)) * 100
                    : 50;
                  const currSym = CURRENCY_SYMBOL[ticker.currency] || "";
                  const catGrad = CATEGORY_COLORS[ticker.category] ?? "from-gray-500 to-gray-600";
                  return (
                    <tr
                      key={ticker.symbol}
                      className="hover:bg-gray-800/30 transition-colors group"
                    >
                      {/* Star */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStar(ticker.symbol)}
                          className={`transition-colors ${ticker.starred ? "text-yellow-400" : "text-gray-700 group-hover:text-gray-500"}`}
                        >
                          {ticker.starred ? <Star className="w-3.5 h-3.5 fill-current" /> : <StarOff className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Symbol + Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${catGrad} flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-md`}>
                            {ticker.symbol.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white text-sm font-mono">{ticker.symbol}</div>
                            <div className="text-xs text-gray-400 truncate max-w-[140px]">{ticker.name}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category / Sector */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="space-y-1">
                          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${catGrad} text-white`}>
                            {ticker.category}
                          </span>
                          <div className="text-xs text-gray-500">{ticker.sector}</div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-right">
                        <div className={`font-bold font-mono text-sm ${pos ? "text-white" : "text-white"}`}>
                          {currSym}{fmtPrice(ticker.price, ticker.currency)}
                        </div>
                        <div className="text-[10px] text-gray-500">{ticker.currency}</div>
                      </td>

                      {/* Change */}
                      <td className="px-4 py-3 text-right">
                        <div className={`flex items-center justify-end gap-1 font-semibold text-sm ${pos ? "text-emerald-400" : "text-red-400"}`}>
                          {pos ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span>{pos ? "+" : ""}{ticker.changePct.toFixed(2)}%</span>
                        </div>
                        <div className={`text-[10px] text-right ${pos ? "text-emerald-500/70" : "text-red-500/70"}`}>
                          {pos ? "+" : ""}{currSym}{fmtPrice(Math.abs(ticker.change), ticker.currency)}
                        </div>
                      </td>

                      {/* Sparkline */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex justify-center">
                          <Sparkline data={ticker.history} positive={pos} />
                        </div>
                      </td>

                      {/* Volume */}
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className="text-sm text-gray-300 font-mono">
                          {ticker.volume > 0 ? formatNum(ticker.volume) : "—"}
                        </span>
                      </td>

                      {/* Market Cap */}
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        <span className="text-sm text-gray-300 font-mono">
                          {ticker.marketCap > 0 ? `${currSym}${formatNum(ticker.marketCap)}` : "—"}
                        </span>
                      </td>

                      {/* 52W Range Bar */}
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <div className="w-28">
                          <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-mono">
                            <span>{currSym}{fmtPrice(ticker.low52w, ticker.currency)}</span>
                            <span>{currSym}{fmtPrice(ticker.high52w, ticker.currency)}</span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full relative">
                            <div
                              className={`h-full bg-gradient-to-r ${catGrad} rounded-full`}
                              style={{ width: `${Math.max(2, Math.min(100, rangePos))}%` }}
                            />
                            <div
                              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-gray-600 shadow"
                              style={{ left: `calc(${Math.max(2, Math.min(98, rangePos))}% - 4px)` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Exchange */}
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <span className="text-xs font-mono font-medium text-gray-400 bg-gray-900 rounded-lg px-2 py-1 border border-gray-800">
                          {ticker.exchange}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Search className="w-10 h-10 mb-3 text-gray-700" />
                <p className="font-semibold">No instruments match your filters</p>
                <p className="text-xs mt-1">Try changing the category, sector, or search term</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 py-2">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Live streaming prices update every 1.5s via Redis Pub/Sub. For algorithmic strategy deployment.
          </span>
          <span className="font-mono text-cyan-400">SIRUS DMA Active</span>
        </div>
      </main>

      <Footer />
    </div>
  );
}

