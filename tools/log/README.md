# Log events

The `swibh` extension writes one `[swibh] {json}` line to `debuglog.txt` per **log event** ([ADR 0001](../../docs/adr/0001-one-schema-for-log-events.md)):

```
[swibh] {"v":1,"type":"hunt.kill","t":19480.25,"hunt":"kEM_Hunt_133-AEL-112-19000.5","data":{...}}
```

| File | What it is |
| --- | --- |
| [schema.ts](schema.ts) | The log schema: every event, its fields, and the named shapes (`Ship`, `FactionRef`, `Ref`, `Payout`, ...). The single source of truth |
| [md.ts](md.ts) | Builds the MD library [extension/swibh/md/swibh_log.xml](../../extension/swibh/md/swibh_log.xml) from the schema |
| [generate.ts](generate.ts) | Writes that file (`make log-xml`) or checks it's current (`--check`) |
| [parse.ts](parse.ts) | The parser extractors import: `readLog(lines)` gives typed events, errors by line number, events by **hunt key**, and **open hunts**. `parseLine(text)` checks one line, for an extractor that judges replays itself (`tools/hunt-log` undoes reloaded branches before it drops repeated lines, so it can't use `readLog`'s early drop) |
| [game-check.ts](game-check.ts) | Reads the engagement game test's events from a `debuglog.txt` (run by `make game-test`), and runs the `hunt_log` check |
| [game-check-hunt.ts](game-check-hunt.ts) | Checks the `hunt_log` game test's events against what it sets up |

The MD that writes the hunt and loss events is [extension/swibh/md/swibh_hunt.xml](../../extension/swibh/md/swibh_hunt.xml), called from the diff on SWI's Emergent Missions script.

## Writing an event from MD

Call the generated library; never write a `[swibh]` line by hand:

```xml
<run_actions ref="md.SWIBH_Log.Log_HuntKill">
  <param name="hunt" value="$HuntKey"/>
  <param name="victim" value="$Ship"/>
  <param name="role" value="'target'"/>
  <param name="byPlayer" value="true"/>
</run_actions>
```

- Each data field is a param of the same name; events that carry the hunt key also take `hunt`. Where the key is optional (`engagement.start`/`.end`: only a hunt engagement has one), `hunt` defaults to `null` and the line leaves `"hunt"` out. The library adds `v`, `type` and `t` (`player.age`) itself.
- A field typed as a shape takes that shape's input: a component for `Ship`, `Ref` and `FactionRef` (the helper reads `.idcode`, `.macro.id` and so on), and a table for the others, keyed by field name, such as `table[$kill = $Kill, $upTo = $UpTo]` for `Offer`.
- A list field takes a list of those inputs. A nullable field's param defaults to `null`, so it can be left out.
- Money must be an MD money value (`1Cr`, `$x * 1ct`): it prints as integer ct.

## Adding an event or a field

1. Change [schema.ts](schema.ts). Use ids rather than display text; a field EM can't supply at its hook is left out, with a comment saying why, never guessed. Field names are camelCase.
2. A change that breaks old lines (a field removed, renamed or retyped) needs a new `v`. Today the parser reads `v` 1 only.
3. Run `make log-xml` and commit the regenerated `swibh_log.xml` with the schema.
4. Add a parser test in [parse.test.ts](parse.test.ts) with a fixture line for the new event.
5. `make check`: the TypeScript type check, the tests (one fails while `swibh_log.xml` is out of date) and the XSD check of `extension/swibh`.

## How the parser reads a log

- It finds `[swibh] ` anywhere in a line, so X4's own prefix doesn't matter, and ignores other lines (the harness's `[swibh-test]` too).
- A line that isn't valid JSON (truncated), or doesn't match the schema for its `v` and `type`, is an error with its line number; reading goes on.
- A line whose JSON is the same as an earlier one is a replay from a reload and is dropped, except `session.start`, which marks every load.
- Steps played again after a reload get a new `t`, so they aren't dropped: a hunt can then show two `hunt.end`, or stay open. Telling those apart (by the `session.start` lines between them) is the extractor's job.
- Open hunts are hunt keys with a `hunt.accept` and no `hunt.end`. Which hunt a `player.loss` counts against is left to the extractor (the event lists `activeHunts`).

## Seen in game

The `hunt_log` game test (2026-11-03) reads a real `debuglog.txt` with the parser: `'%s'.[(player.age)f]` prints a plain decimal, `{` and `"` survive `debug_text` unchanged, and a 789-character line isn't cut ([research/hunt-logging-hooks.md](../../research/hunt-logging-hooks.md#19-implementation-status)). A string table key needs a leading `$` (`{'$' + $Key}`). Still **unverified**:

- That `'\''` is a single quote, `'\\'` a backslash and `'\n'` a newline in MD strings, as `Json_Name`'s cleanup assumes.
- How long a line can be before it's cut, past 789 characters; a big wing makes `hunt.accept` long.
