import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const upper = symbol.toUpperCase();

    const summary: any = await yahooFinance.quoteSummary(upper, {
      modules: [
        "financialData",
        "defaultKeyStatistics",
        "incomeStatementHistory",
        "balanceSheetHistory",
        "cashflowStatementHistory",
      ],
    });

    const fd = summary.financialData ?? {};
    const ks = summary.defaultKeyStatistics ?? {};

    // Helper to safely extract a numeric raw value from Yahoo's typed objects
    const num = (v: any): number | undefined => {
      if (v === null || v === undefined) return undefined;
      if (typeof v === "number") return v;
      if (typeof v === "object" && "raw" in v) return v.raw;
      return undefined;
    };

    const fmtDate = (d: unknown): string => {
      if (!d) return "";
      const date = new Date(d as string | number);
      return isNaN(date.getTime()) ? "" : date.getFullYear().toString();
    };

    // Income statements (annual, most recent first)
    const incomeStatements = (
      summary.incomeStatementHistory?.incomeStatementHistory ?? []
    ).map((s: any) => ({
      date: fmtDate(s.endDate),
      totalRevenue: num(s.totalRevenue),
      grossProfit: num(s.grossProfit),
      operatingIncome: num(s.ebit),
      netIncome: num(s.netIncome),
    }));

    // Balance sheets (annual, most recent first)
    const balanceSheets = (
      summary.balanceSheetHistory?.balanceSheetStatements ?? []
    ).map((s: any) => ({
      date: fmtDate(s.endDate),
      totalAssets: num(s.totalAssets),
      totalLiabilities: num(s.totalLiab),
      stockholderEquity: num(s.totalStockholderEquity),
      cash: num(s.cash),
      totalDebt: num(s.shortLongTermDebt) ?? num(s.longTermDebt),
    }));

    // Cash flow statements (annual, most recent first)
    const cashFlows = (
      summary.cashflowStatementHistory?.cashflowStatements ?? []
    ).map((s: any) => {
      const opCF = num(s.totalCashFromOperatingActivities);
      const capex = num(s.capitalExpenditures);
      return {
        date: fmtDate(s.endDate),
        operatingCashFlow: opCF,
        investingCashFlow: num(s.totalCashflowsFromInvestingActivities),
        financingCashFlow: num(s.totalCashFromFinancingActivities),
        capitalExpenditures: capex,
        freeCashFlow:
          opCF !== undefined && capex !== undefined
            ? opCF + capex // capex is typically negative
            : undefined,
      };
    });

    return NextResponse.json({
      // Financial health (TTM)
      totalRevenue: num(fd.totalRevenue),
      revenueGrowth: num(fd.revenueGrowth),
      grossMargins: num(fd.grossMargins),
      operatingMargins: num(fd.operatingMargins),
      profitMargins: num(fd.profitMargins),
      ebitda: num(fd.ebitda),
      netIncome: num(fd.netIncomeToCommon),
      freeCashflow: num(fd.freeCashflow),
      returnOnEquity: num(fd.returnOnEquity),
      returnOnAssets: num(fd.returnOnAssets),
      debtToEquity: num(fd.debtToEquity),
      currentRatio: num(fd.currentRatio),
      quickRatio: num(fd.quickRatio),
      // Valuation
      enterpriseValue: num(ks.enterpriseValue),
      priceToBook: num(ks.priceToBook),
      enterpriseToRevenue: num(ks.enterpriseToRevenue),
      enterpriseToEbitda: num(ks.enterpriseToEbitda),
      beta: num(ks.beta),
      trailingEps: num(ks.trailingEps),
      forwardEps: num(ks.forwardEps),
      pegRatio: num(ks.pegRatio),
      // Historical statements
      incomeStatements,
      balanceSheets,
      cashFlows,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch fundamentals" },
      { status: 500 }
    );
  }
}
