"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/panel";
import { useFundamentals } from "@/hooks/useMarketData";
import { useSettingsStore } from "@/stores/settings";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { FundamentalsData, IncomeStatement, BalanceSheet, CashFlowStatement } from "@/types";

type Tab = "overview" | "income" | "balance" | "cashflow";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "income", label: "Income" },
  { id: "balance", label: "Balance" },
  { id: "cashflow", label: "Cash Flow" },
];

export function Fundamentals() {
  const [tab, setTab] = useState<Tab>("overview");
  const selectedTicker = useSettingsStore((s) => s.selectedTicker);
  const { data, isLoading, error, refetch } = useFundamentals(selectedTicker);

  return (
    <Panel
      title={`Fundamentals — ${selectedTicker}`}
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
    >
      {data && (
        <div className="flex flex-col h-full">
          {/* Tab bar */}
          <div className="flex border-b border-terminal-border shrink-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  tab === t.id
                    ? "text-terminal-accent border-b-2 border-terminal-accent -mb-px"
                    : "text-terminal-muted hover:text-terminal-text"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto min-h-0">
            {tab === "overview" && <OverviewTab data={data} />}
            {tab === "income" && <IncomeTab rows={data.incomeStatements} />}
            {tab === "balance" && <BalanceTab rows={data.balanceSheets} />}
            {tab === "cashflow" && <CashFlowTab rows={data.cashFlows} />}
          </div>
        </div>
      )}
    </Panel>
  );
}

// ─── Overview tab ──────────────────────────────────────────────────────────

function OverviewTab({ data }: { data: FundamentalsData }) {
  const pct = (v?: number) => (v !== undefined ? formatPercent(v * 100) : "—");
  const num = (v?: number, decimals = 2) =>
    v !== undefined ? v.toFixed(decimals) : "—";
  const big = (v?: number) => (v !== undefined ? formatNumber(v) : "—");

  const rows: { label: string; value: string; section?: string }[] = [
    { label: "Revenue (TTM)", value: big(data.totalRevenue), section: "FINANCIALS" },
    { label: "Net Income (TTM)", value: big(data.netIncome) },
    { label: "EBITDA", value: big(data.ebitda) },
    { label: "Free Cash Flow", value: big(data.freeCashflow) },
    { label: "Rev Growth (YoY)", value: pct(data.revenueGrowth) },
    { label: "Gross Margin", value: pct(data.grossMargins) },
    { label: "Operating Margin", value: pct(data.operatingMargins) },
    { label: "Profit Margin", value: pct(data.profitMargins) },
    { label: "Return on Equity", value: pct(data.returnOnEquity), section: "RETURNS" },
    { label: "Return on Assets", value: pct(data.returnOnAssets) },
    { label: "Debt / Equity", value: num(data.debtToEquity) },
    { label: "Current Ratio", value: num(data.currentRatio) },
    { label: "Quick Ratio", value: num(data.quickRatio) },
    { label: "Enterprise Value", value: big(data.enterpriseValue), section: "VALUATION" },
    { label: "EV / Revenue", value: num(data.enterpriseToRevenue) },
    { label: "EV / EBITDA", value: num(data.enterpriseToEbitda) },
    { label: "P / Book", value: num(data.priceToBook) },
    { label: "Trailing EPS", value: num(data.trailingEps) },
    { label: "Forward EPS", value: num(data.forwardEps) },
    { label: "PEG Ratio", value: num(data.pegRatio) },
    { label: "Beta", value: num(data.beta) },
  ];

  return (
    <div className="divide-y divide-terminal-border">
      {rows.map((row) => (
        <div key={row.label}>
          {row.section && (
            <div className="px-3 pt-2 pb-0.5 text-[9px] font-semibold uppercase tracking-widest text-terminal-accent opacity-70">
              {row.section}
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-[11px] text-terminal-muted">{row.label}</span>
            <span className="text-[11px] font-mono text-terminal-text">{row.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Income tab ────────────────────────────────────────────────────────────

function IncomeTab({ rows }: { rows: IncomeStatement[] }) {
  if (!rows.length) return <Empty />;
  const cols = rows.slice(0, 4);

  return (
    <StatementTable
      colHeaders={cols.map((r) => r.date)}
      rows={[
        { label: "Revenue", values: cols.map((r) => r.totalRevenue) },
        { label: "Gross Profit", values: cols.map((r) => r.grossProfit) },
        { label: "Operating Income", values: cols.map((r) => r.operatingIncome) },
        { label: "Net Income", values: cols.map((r) => r.netIncome) },
      ]}
    />
  );
}

// ─── Balance sheet tab ─────────────────────────────────────────────────────

function BalanceTab({ rows }: { rows: BalanceSheet[] }) {
  if (!rows.length) return <Empty />;
  const cols = rows.slice(0, 4);

  return (
    <StatementTable
      colHeaders={cols.map((r) => r.date)}
      rows={[
        { label: "Total Assets", values: cols.map((r) => r.totalAssets) },
        { label: "Total Liabilities", values: cols.map((r) => r.totalLiabilities) },
        { label: "Equity", values: cols.map((r) => r.stockholderEquity) },
        { label: "Cash", values: cols.map((r) => r.cash) },
        { label: "Total Debt", values: cols.map((r) => r.totalDebt) },
      ]}
    />
  );
}

// ─── Cash flow tab ─────────────────────────────────────────────────────────

function CashFlowTab({ rows }: { rows: CashFlowStatement[] }) {
  if (!rows.length) return <Empty />;
  const cols = rows.slice(0, 4);

  return (
    <StatementTable
      colHeaders={cols.map((r) => r.date)}
      rows={[
        { label: "Operating CF", values: cols.map((r) => r.operatingCashFlow) },
        { label: "Investing CF", values: cols.map((r) => r.investingCashFlow) },
        { label: "Financing CF", values: cols.map((r) => r.financingCashFlow) },
        { label: "CapEx", values: cols.map((r) => r.capitalExpenditures) },
        { label: "Free Cash Flow", values: cols.map((r) => r.freeCashFlow) },
      ]}
    />
  );
}

// ─── Shared statement table ────────────────────────────────────────────────

function StatementTable({
  colHeaders,
  rows,
}: {
  colHeaders: string[];
  rows: { label: string; values: (number | undefined)[] }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] font-mono">
        <thead>
          <tr className="border-b border-terminal-border">
            <th className="text-left px-3 py-1.5 text-terminal-muted font-normal w-28">
              (USD)
            </th>
            {colHeaders.map((h) => (
              <th key={h} className="text-right px-3 py-1.5 text-terminal-accent font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-terminal-border">
          {rows.map((row) => (
            <tr key={row.label} className="hover:bg-terminal-hover transition-colors">
              <td className="px-3 py-1.5 text-terminal-muted">{row.label}</td>
              {row.values.map((v, i) => (
                <td key={i} className="text-right px-3 py-1.5 text-terminal-text">
                  {v !== undefined ? formatNumber(v) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty() {
  return (
    <div className="flex items-center justify-center h-24 text-xs text-terminal-muted">
      No data available
    </div>
  );
}
