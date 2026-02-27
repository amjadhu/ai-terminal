import YahooFinance from "yahoo-finance2";

const yahooFinance = new (YahooFinance as any)({
  suppressNotices: ["yahooSurvey"],
});

export default yahooFinance;
