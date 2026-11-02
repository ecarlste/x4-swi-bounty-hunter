# One TypeScript schema for log events; the MD side is generated

Date: 2026-11-02. Status: accepted; the envelope is amended by [ADR 0002](0002-wall-clock-stamp-on-log-events.md) (`wall`).

## Context

The `swibh` extension writes debug-log lines so playtests and tuning can measure what SWI's logbook doesn't record: aborts, offered vs paid pay, sanctions, wings, the player's losses ([research/hunt-logging-hooks.md](../../research/hunt-logging-hooks.md)). More than one **extractor** will read them (`make hunt-log` first, others later), and the writer is MD script in X4, which has no schema or JSON support of its own and can't safely escape free text.

## Decision

- A TypeScript schema in `tools/log/` defines every **log event** and the named shapes events reuse (`Ship`, `FactionRef`, `Payout`). It is the single source of truth.
- From it we generate the MD library `extension/swibh/md/swibh_log.xml` (one library cue per event, named params) and a typed parser that every extractor imports. Extractors never parse `debuglog.txt` lines themselves.
- The generated XML is committed; `make check` fails when it is out of date with the schema.
- Every line is `[swibh] {"v":1,"type":"<event>","t":<player.age>,"hunt":"<hunt key>"?,"data":{...}}`. `type` decides the shape of `data`. The test harness keeps its own `[swibh-test]` prefix.
- Format rules: money as integer ct; game time as raw `player.age` seconds; ids (macro, faction, idcode, mission) instead of free text; a display name only after a lossy cleanup (`"` → `'`, `\` → `/`).
- The logger records facts; judgement (which hunt a loss counts against, what is "open") lives in the extractors, so it can change and be rerun on old logs.

## Consequences

- Adding an event or field is a schema change plus a regenerate, versioned by `v`.
- Escaping and number formatting are handled once, in the generator, and covered by a game test that parses a real `debuglog.txt`.
- MD authors call generated cues rather than hand-writing `debug_text`; hand-written `[swibh]` lines are a bug.
