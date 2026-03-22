import YahooFinance from "yahoo-finance2";

const _yf = new (YahooFinance as any)({
  suppressNotices: ["yahooSurvey"],
  validation: { logErrors: false },
});

/* -------------------------------------------------------------------------- */
/*  Wrap every module method so `{ validateResult: false }` is always passed.  */
/*  yahoo-finance2 v3.13 has a schema mismatch (Yahoo now returns lowercase   */
/*  typeDisp values like "equity" instead of "Equity") that causes             */
/*  FailedYahooValidationError on search/quote/etc.                           */
/* -------------------------------------------------------------------------- */
const SKIP_VALIDATION = { validateResult: false };

const yahooFinance = new Proxy(_yf, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof value !== "function" || String(prop).startsWith("_")) {
      return value;
    }
    return (...args: unknown[]) => {
      // Module methods: fn(query, queryOptions?, moduleOptions?)
      // Inject validateResult:false into the last (moduleOptions) arg
      if (args.length === 0) return value.apply(target, args);
      if (args.length === 1) return value.call(target, args[0], undefined, SKIP_VALIDATION);
      if (args.length === 2) return value.call(target, args[0], args[1], SKIP_VALIDATION);
      // If already 3+ args, merge into existing moduleOptions
      const moduleOpts =
        args[2] && typeof args[2] === "object"
          ? { ...args[2], ...SKIP_VALIDATION }
          : SKIP_VALIDATION;
      return value.call(target, args[0], args[1], moduleOpts, ...args.slice(3));
    };
  },
});

export default yahooFinance;
