// The log parser every extractor imports (ADR 0001): finds [swibh] lines in a
// debuglog.txt, checks each against the log schema and returns typed log events.
// It records facts only; which hunt a loss counts against is the extractor's call.
import {
  events,
  id,
  int,
  MARKER,
  number,
  shape,
  VERSION,
  type EventType,
  type FieldType,
  type HuntEvent,
  type HuntKey,
  type LogEvent,
} from "./schema.ts";

export type LineError = { line: number; error: string; text: string };

export type Log = {
  // In log order, with replayed lines dropped
  events: LogEvent[];
  // Lines that carry the marker but aren't a valid log event
  errors: LineError[];
  // Every event with a hunt key, by hunt key, in log order
  hunts: Map<HuntKey, HuntEvent[]>;
  // Hunt keys with a hunt.accept and no hunt.end
  openHunts: HuntKey[];
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// Returns why value doesn't match type, or null when it does
function check(type: FieldType, value: unknown, path: string): string | null {
  switch (type.kind) {
    case "int":
    case "money":
      return Number.isInteger(value) ? null : `${path}: expected an integer`;
    case "number":
      return typeof value === "number" && Number.isFinite(value) ? null : `${path}: expected a number`;
    case "bool":
      return typeof value === "boolean" ? null : `${path}: expected true or false`;
    case "id":
    case "name":
      return typeof value === "string" ? null : `${path}: expected a string`;
    case "enum":
      return type.values.includes(value as string) ? null : `${path}: expected one of ${type.values.join(", ")}`;
    case "nullable":
      return value === null ? null : check(type.of, value, path);
    case "list":
      if (!Array.isArray(value)) return `${path}: expected a list`;
      for (const [i, element] of value.entries()) {
        const error = check(type.of, element, `${path}[${i}]`);
        if (error) return error;
      }
      return null;
    case "shape":
      return checkFields(type.shape.fields, value, path);
  }
}

function checkFields(fields: Record<string, FieldType>, value: unknown, path: string): string | null {
  if (!isObject(value)) return `${path}: expected an object`;
  for (const key of Object.keys(value)) {
    if (!(key in fields)) return `${path}.${key}: not in the schema`;
  }
  for (const [key, type] of Object.entries(fields)) {
    if (!(key in value)) return `${path}.${key}: missing`;
    const error = check(type, value[key], `${path}.${key}`);
    if (error) return error;
  }
  return null;
}

// The JSON after the marker, or null for a line without it
function payload(text: string): string | null {
  const at = text.indexOf(MARKER);
  return at < 0 ? null : text.slice(at + MARKER.length).trim();
}

// The event on a [swibh] line, an error string, or null for a line without the marker
export function parseLine(text: string): LogEvent | string | null {
  const body = payload(text);
  if (body === null) return null;
  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return "not valid JSON (truncated?)";
  }
  if (!isObject(json)) return "expected a JSON object";
  if (json.v !== VERSION) return `unknown version v=${JSON.stringify(json.v)}`;
  if (typeof json.type !== "string" || !Object.hasOwn(events, json.type)) {
    return `unknown event type ${JSON.stringify(json.type)}`;
  }
  const def = events[json.type as EventType];
  const envelope: Record<string, FieldType> = {
    v: int(),
    type: id(),
    t: number(),
    ...(def.hunt === true || (def.hunt === "optional" && "hunt" in json) ? { hunt: id() } : {}),
    data: shape({ name: json.type, fields: def.data }),
  };
  const error = checkFields(envelope, json, json.type);
  return error ?? (json as LogEvent);
}

// Hunt events always carry the key; engagements only when the target's wing took part
export const hasHuntKey = (event: LogEvent): event is HuntEvent => "hunt" in event && event.hunt !== undefined;

// Reads a debug log's lines. Lines replayed by a reload are dropped: an event whose
// JSON is the same as an earlier one's, except session.start, which marks each load.
// Steps played again after a reload get a new t, so they aren't replays: a hunt can
// then show two hunt.end, or stay open. Judging that is the extractor's job.
export async function readLog(lines: Iterable<string> | AsyncIterable<string>): Promise<Log> {
  const log: Log = { events: [], errors: [], hunts: new Map(), openHunts: [] };
  const seen = new Set<string>();
  let lineNumber = 0;
  for await (const text of lines) {
    lineNumber++;
    const result = parseLine(text);
    if (result === null) continue;
    if (typeof result === "string") {
      log.errors.push({ line: lineNumber, error: result, text });
      continue;
    }
    const json = payload(text)!;
    if (result.type !== "session.start") {
      if (seen.has(json)) continue;
      seen.add(json);
    }
    log.events.push(result);
    if (hasHuntKey(result)) {
      const hunt = log.hunts.get(result.hunt) ?? [];
      hunt.push(result);
      log.hunts.set(result.hunt, hunt);
    }
  }
  for (const [key, hunt] of log.hunts) {
    const has = (type: EventType) => hunt.some((event) => event.type === type);
    if (has("hunt.accept") && !has("hunt.end")) log.openHunts.push(key);
  }
  return log;
}
