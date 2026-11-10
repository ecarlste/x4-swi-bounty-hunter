// Reads the player logbook out of an X4 8.00 + SWI 0.90 save, line by line, and
// pulls out what the playtest results sheet needs. Amounts are in ct (100 ct = 1 Cr).

export type LogbookEntry = {
  time: number;
  category?: string;
  title: string;
  text: string;
  faction?: string;
  moneyCt?: number;
};

export type Hunt = {
  time: number;
  target: string;
  faction?: string;
  ending: "success" | "failure" | "abort";
  paidCt: number;
  killsCt?: number;
  destructionCt?: number;
  engagements?: string;
  // Why a hunt that paid nothing ended, in the logbook's words
  note?: string;
};

export type Income = {
  time: number;
  source: string;
  faction?: string;
  amountCt: number;
};

export type RelationChange = {
  time: number;
  faction: string;
  // null when the title has no amount, as in a bare "Reputation gained"
  amount: number | null;
  reason: string;
  current: number | null;
};

export type Pacing = {
  huntsEnded: number;
  // Game time from the first hunt that ended to the last
  spanSeconds: number;
  // null when there's no span to divide by (fewer than two hunts)
  huntsPerHour: number | null;
  totalPaidCt: number;
};

export type PlaytestLog = {
  hunts: Hunt[];
  otherIncome: Income[];
  relations: RelationChange[];
  pacing: Pacing;
};

function pacing(hunts: Hunt[]): Pacing {
  const spanSeconds = hunts.length ? hunts[hunts.length - 1].time - hunts[0].time : 0;
  return {
    huntsEnded: hunts.length,
    spanSeconds,
    huntsPerHour: spanSeconds > 0 ? hunts.length / (spanSeconds / 3600) : null,
    totalPaidCt: hunts.reduce((sum, hunt) => sum + hunt.paidCt, 0),
  };
}

// SWI's faction names, page 999840 of t/0001.xml (ext/ in 0.90, ext02/ in 0.91 HF1;
// these ids read the same in both). The logbook names factions by these text ids,
// for example "{999840,504110}".
const SWI_FACTIONS: Record<string, string> = {
  "500110": "Galactic Empire",
  "501110": "Bounty Hunters Guild",
  "502110": "New Republic",
  "503110": "Rebel Alliance",
  "504110": "Imperial Ascendancy",
  "505110": "Corporate Sector Authority",
  "506110": "Independent Commerce Guild",
  "507110": "Hutt Cartel",
  "508110": "Mandalorian Death Watch",
  "509110": "Anoat Federation",
  "510110": "Sith Empire",
  "511110": "Hutt Pirates",
  "512110": "Black Sun",
  "513110": "Pirate Syndicates",
  "514110": "Mandalorian Raiders",
  "515110": "Naboo Royal Authority",
  "516110": "Hapes Consortium",
  "517110": "Kamino",
  "518110": "Kuat Drive Yards",
  "519110": "Corellian Engineering Corporation",
  "520110": "Sienar Fleet Systems",
  "521110": "Hoersch-Kessel Drive, Inc.",
  "522110": "Rendili Drive Yards",
  "523110": "Incom Corporation",
  "524110": "TransGalMeg Industries",
  "525110": "Mon Calamari Shipyards",
  "526110": "Twin Suns Transport Services",
  "527110": "Baobab Merchant Fleet",
  "528110": "Tagge Corporation",
  "529110": "Banking Clan",
  "530110": "Mining Guild",
  "531110": "Trade Federation",
  "532110": "Yuuzhan Vong",
  "533110": "Unknown Threat",
};

export function factionName(raw: string): string {
  const id = /^\{999840,(\d+)\}$/.exec(raw)?.[1];
  return (id && SWI_FACTIONS[id]) || raw;
}

// The logbook is the bare <log> element after the player's <stats>. Every other
// <log ...> line in a save is a trade log with attributes, so the bare tag is unique.
export async function* logbookEntries(
  lines: Iterable<string> | AsyncIterable<string>,
): AsyncGenerator<LogbookEntry> {
  let inLogbook = false;
  for await (const line of lines) {
    const trimmed = line.trim();
    if (!inLogbook) {
      inLogbook = trimmed === "<log>";
      continue;
    }
    if (trimmed === "</log>") return;
    if (trimmed.startsWith("<entry ")) yield toEntry(attributes(trimmed));
  }
}

function attributes(element: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const [, name, value] of element.matchAll(/(\w+)="([^"]*)"/g)) {
    attrs[name] = decode(value);
  }
  return attrs;
}

// XML entities, and X4's own "[\012]" escapes (an octal character code) for newlines.
function decode(value: string): string {
  return value
    .replace(/\[\\(\d{3})\]/g, (_, octal: string) => String.fromCharCode(parseInt(octal, 8)))
    .replace(/&(lt|gt|quot|apos|amp|#\d+|#x[0-9a-f]+);/gi, (_, name: string) => {
      const named: Record<string, string> = { lt: "<", gt: ">", quot: '"', apos: "'", amp: "&" };
      if (name[0] !== "#") return named[name.toLowerCase()];
      return String.fromCodePoint(name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : Number(name.slice(1)));
    });
}

function toEntry(attrs: Record<string, string>): LogbookEntry {
  return {
    time: Number(attrs.time),
    category: attrs.category,
    title: attrs.title ?? "",
    text: attrs.text ?? "",
    faction: attrs.faction,
    moneyCt: attrs.money === undefined ? undefined : Number(attrs.money),
  };
}

const HUNT_TITLE = /^Search and destroy: (.+)$/;
const RELATION_TITLE = /^Reputation (?:gained|lost)(?:: ([+-]\d+))?$/;

// "124,785.00 Cr" -> 12478500 ct
function parseCt(amount: string): number {
  return Math.round(Number(amount.replace(/,/g, "")) * 100);
}

const TOTAL_REWARD = /\s*Total reward: ([\d,.]+) Cr\.$/;
// EM's hunt failure texts ({11513,572}, {11513,575}-{11513,577} in SWI's text)
const HUNT_FAILED = /is still operational\.|^You failed to (find|confirm the identity of|damage) /;

// EM's hunt debrief ({11513,573}, {11513,574}, {11513,496} in SWI's text):
// "Reward for <ship> kills: <cr>. Your Engagements: <...>. Reward for <ship> destruction: <cr>. Total reward: <cr>."
function toHunt(entry: LogbookEntry, target: string, faction: string | undefined): Hunt {
  const kills = /Reward for .+? kills: ([\d,.]+) Cr\./.exec(entry.text)?.[1];
  const destruction = /Reward for .+? destruction: ([\d,.]+) Cr\./.exec(entry.text)?.[1];
  const total = TOTAL_REWARD.exec(entry.text)?.[1];
  const engagements = /Your Engagements: (.+?)\.(?= Reward for| Total reward|$)/.exec(entry.text)?.[1];
  const paidCt = entry.moneyCt ?? (total ? parseCt(total) : 0);
  const ending = /aborted/i.test(entry.text)
    ? "abort"
    : HUNT_FAILED.test(entry.text) || paidCt === 0
      ? "failure"
      : "success";

  const hunt: Hunt = { time: entry.time, target, ending, paidCt };
  if (faction) hunt.faction = faction;
  if (kills) hunt.killsCt = parseCt(kills);
  if (destruction) hunt.destructionCt = parseCt(destruction);
  if (engagements) hunt.engagements = engagements;
  if (ending !== "success") hunt.note = entry.text.replace(TOTAL_REWARD, "");
  return hunt;
}

export async function readPlaytestLog(
  lines: Iterable<string> | AsyncIterable<string>,
  options: { since?: number } = {},
): Promise<PlaytestLog> {
  const entries: LogbookEntry[] = [];
  for await (const entry of logbookEntries(lines)) {
    if (options.since === undefined || entry.time > options.since) entries.push(entry);
  }

  const hunts: Hunt[] = [];
  const otherIncome: Income[] = [];
  const relations: RelationChange[] = [];
  for (const entry of entries) {
    const relationTitle = RELATION_TITLE.exec(entry.title);
    if (relationTitle && entry.faction) {
      // text: "Reason: Mission Completed\nCurrent reputation: -1"
      const current = /Current reputation: (-?\d+)/.exec(entry.text)?.[1];
      relations.push({
        time: entry.time,
        faction: factionName(entry.faction),
        amount: relationTitle[1] === undefined ? null : Number(relationTitle[1]),
        reason: /Reason: (.+)/.exec(entry.text)?.[1].trim() ?? "",
        current: current === undefined ? null : Number(current),
      });
      continue;
    }
    const target = entry.category === "missions" ? HUNT_TITLE.exec(entry.title)?.[1] : undefined;
    if (target) {
      // The hunt entry has no faction. The offering faction's "Mission Completed/Failed" reputation
      // entry is written at the same time; a kill penalty can share that time, so match the reason.
      const relation = entries.find(
        (other) =>
          other.time === entry.time &&
          other.faction &&
          RELATION_TITLE.test(other.title) &&
          /Reason: Mission /.test(other.text),
      );
      hunts.push(toHunt(entry, target, relation?.faction && factionName(relation.faction)));
    } else if (entry.moneyCt) {
      const income: Income = { time: entry.time, source: entry.title, amountCt: entry.moneyCt };
      if (entry.faction) income.faction = factionName(entry.faction);
      otherIncome.push(income);
    }
  }
  return { hunts, otherIncome, relations, pacing: pacing(hunts) };
}
