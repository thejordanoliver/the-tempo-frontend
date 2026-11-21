import type { GameOdds, OddsValue, ScoreboardOdds, TeamOdds } from "types/odds";

export type OddsCell = {
  value: string;
  price: string | null;
  opening: string | null;
  isOpening: boolean;
};

type Quote = { line?: OddsValue; odds?: OddsValue };
type Market = "moneyline" | "spread" | "over" | "under";

function text(value: OddsValue | undefined): string | null {
  if (value == null || (typeof value === "number" && !Number.isFinite(value)))
    return null;
  return String(value).trim() || null;
}

function signed(value: OddsValue | undefined): string | null {
  const label = text(value);
  if (label === null) return null;
  const number = Number(label);
  return Number.isFinite(number) ? `${number > 0 ? "+" : ""}${number}` : label;
}

function formatQuote(quote: Quote, market: Market) {
  const line = text(quote.line);
  const price = signed(quote.odds);
  if (market === "moneyline")
    return price ? { value: price, price: null } : null;
  if (line === null && price === null) return null;
  const value =
    line === null
      ? "—"
      : market === "spread"
        ? Number(line) === 0
          ? "PK"
          : signed(line)!
        : `${market === "over" ? "O" : "U"} ${line.replace(/^[ou]\s*/i, "")}`;
  return { value, price };
}

function cell(
  close: Quote,
  open: Quote,
  fallback: Quote,
  market: Market,
): OddsCell | null {
  const current = formatQuote(close, market);
  const opening = formatQuote(open, market);
  const selected = current ?? opening ?? formatQuote(fallback, market);
  if (!selected) return null;
  const changed =
    current &&
    opening &&
    (current.value !== opening.value || current.price !== opening.price);
  return {
    ...selected,
    isOpening: !current && Boolean(opening),
    opening: changed
      ? `Open ${opening.value}${opening.price ? ` (${opening.price})` : ""}`
      : null,
  };
}

function spreadLine(
  spread: number | null,
  participant: TeamOdds | undefined,
): number | null {
  if (spread == null || !Number.isFinite(spread)) return null;
  if (spread === 0) return 0;
  if (participant?.favorite === true) return -Math.abs(spread);
  if (participant?.underdog === true) return Math.abs(spread);
  return null;
}

/** Presentation mapping for normalized backend odds; prices are never calculated. */
export function getOddsDisplay(odds: GameOdds | ScoreboardOdds) {
  const moneyline = (side: "home" | "away" | "draw") =>
    cell(
      { odds: odds.moneyLine?.[side]?.close },
      { odds: odds.moneyLine?.[side]?.open },
      {
        odds:
          side === "draw"
            ? odds.drawMoneyline
            : (odds[`${side}Odds`]?.moneyLine ?? odds[`${side}Moneyline`]),
      },
      "moneyline",
    );
  const spread = (side: "home" | "away") => {
    const market = odds.pointSpread?.[side];
    const fallbackLine = spreadLine(odds.spread, odds[`${side}Odds`]);
    return cell(
      {
        line:
          market?.line ?? (text(market?.close) !== null ? fallbackLine : null),
        odds: market?.close,
      },
      { line: market?.openLine, odds: market?.open },
      { line: fallbackLine, odds: odds[`${side}Odds`]?.spreadOdds },
      "spread",
    );
  };
  const total = (side: "over" | "under") =>
    cell(
      {
        line:
          odds.total?.[side]?.close?.line ??
          (text(odds.total?.[side]?.close?.odds) !== null
            ? odds.overUnder
            : null),
        odds: odds.total?.[side]?.close?.odds,
      },
      odds.total?.[side]?.open ?? {},
      { line: odds.overUnder },
      side,
    );
  const rows = [
    {
      key: "moneyline",
      label: "Moneyline",
      away: moneyline("away"),
      home: moneyline("home"),
    },
    {
      key: "spread",
      label: "Spread",
      away: spread("away"),
      home: spread("home"),
    },
    { key: "total", label: "Total", away: total("over"), home: total("under") },
  ].filter((row) => row.away || row.home);
  return { rows, draw: moneyline("draw") };
}
