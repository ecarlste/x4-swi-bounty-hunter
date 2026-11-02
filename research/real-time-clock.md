# A real-time clock for log events

Question: how can each `[swibh] {json}` log event carry a wall-clock stamp, so it can be matched to a position in an OBS recording of the play session? Right now the `t` field is `player.age` (game time), set in `extension/swibh/md/swibh_log.xml:204` and the other event builders.

Sources: vanilla 8.00 at `/mnt/e/x4-dev/reference/x4-8.00/base` (paths below are relative to it unless prefixed `9.00:` or `SWI:`). 9.00 means `/mnt/e/x4-dev/reference/x4-9.00/base`. SWI means `/mnt/e/x4-dev/reference/mods/swi-0.90`. The real logs are under `C:\Users\ecarl\OneDrive\Documents\Egosoft\X4\` (OneDrive, not `Documents\Egosoft`). **Unverified** marks claims that no script or log confirms.

## 1. `player.systemtime`

- **It exists in 8.00:** `libraries/scriptproperties.xml:2348` (9.00: `:2410`), on the `player` keyword (`:2343`):
  `systemtime.{$string}`: "Current local system time formatted according to formatstring rules (%Y = 4-digit year, %m = 2-digit month, %d = 2-digit day of month... for more see C++ documentation of strftime)", `type="string"`.
- **What it returns:** a **string** built with C `strftime`, in **local** time, not UTC. It needs a format argument. There is no raw numeric form and no epoch value.
- **Sibling properties:** the only other `player` clock is `player.age` ("Current game time", `:2347`). There is no `player.realtime`, no UTC variant and no time-zone property (searched for `realtime|utc|timezone|systemtime`). Related: `player.timewarp.factor` ("game time that passes during a real-time second", `:2486`) and `timewarp.active` (`:2484`).
- **How vanilla and mods use it:**
  - `md/finalisestations.xml:16`: `'Universe generation begins at ' + player.systemtime.{'%Y-%m-%d %H:%M:%S'}`
  - `md/finalisestations.xml:152`: `'... complete at %1 ...'.[player.systemtime.{'%Y-%m-%d %H:%M:%S'}]`
  - `md/setup.xml:86`: `md.$SystemTimeAtGamestart = player.systemtime.{'%Y-%m-%d_%H-%M-%S'}`
  - SWI's `ext/md/sw_planetaryaid.xml:66` uses the same `'%Y-%m-%d %H:%M:%S'` format with `debug_to_file`. HeadHunter logs with it too (`research/headhunter.md:259`).
  - Nobody uses `%z`/`%Z`, `%s` or `.formatted` on it. `.formatted` belongs to the `time` datatype (`scriptproperties.xml:2335`), which is for game time.
- **Resolution: 1 second.** `strftime` has no sub-second field.
- **Caution (unverified):** X4 is an MSVC build, and MSVC `strftime` rejects specifiers it doesn't know (`%s` epoch, `%N` and so on) through the invalid-parameter handler, which can abort the process. Use only the specifiers vanilla uses (`%Y %m %d %H %M %S`). `%z` (UTC offset, `-0500`) is in the C99 set MSVC supports, but nobody has tested it in X4. Check it in the game test before relying on it.

## 2. Pause, menus, save and load

- **`player.age` is game time.** It stops whenever the simulation is paused. With SETA it runs faster than real time: `timewarp.factor` (`scriptproperties.xml:2486`; `set_timewarp_factor`, `libraries/common.xsd:38265`). So no linear map from `player.age` to wall time exists.
- **Evidence that game time stops on pause:** `fade_to_black`/`fade_from_black` has a `realtime` attribute, "Perform fade in realtime (ignore game paused state)" (`common.xsd:38688-38691`). That attribute only makes sense if the default timing freezes during a pause.
- **Which screens pause (unverified):** by common knowledge, the Esc/options menu pauses, while the map and most info menus don't (unless the player turns on the game option that pauses in menus). Loading and saving also halt the simulation. No script states any of this.
- **Load seen in a real log:** in the profile root `debuglog.txt`, `Loading saved game 'save_007', first pass` is stamped `0.00` and `second pass` is stamped `22306.17`. Game time jumps to the save's age, so `t` isn't monotonic across loads.
- **Main menu seen in a real log:** in `90000201/debuglog.previous.txt`, the main menu's background universe ticks (`5.73` when autostart fires), then drops to `0.00` at the new gamestart.
- **MD events** (8.00 `common.xsd`; 9.00 has the same three at `:16506/16555/16573`):
  - `event_game_loaded` (`:16367`): params are game version, build and original version. Warning: a newly added non-root cue misses it the first time; `event_universe_generated` is the reliable alternative.
  - `event_game_saved` (`:16416`): param is `success`.
  - `event_game_started` (`:16434`).
  - **There is no MD pause or unpause event** in 8.00 or 9.00. Searched `name="event_…paus…"` in `common.xsd` and `md.xsd`; the only pause hits are mission/objective timers and production modules.
- **Lua does have pause events:** `ui/core/lua/monitors.lua:764-766` registers `"gamePaused"` and `"gameUnpaused"`, with handlers at `:1034` and `:1048`. `C.IsGamePaused()` is declared in `ui/addons/ego_helptext/helptext.lua:9`. A UI addon could forward these to MD with `AddUITriggeredEvent` → `event_ui_triggered` (`common.xsd:11927`), which would log `session.pause` and `session.resume`. This is optional.

## 3. Lua real-time functions

- **`C.GetCurrentUTCDataTime()`** returns `int64_t`, UTC epoch seconds. Declared at `ui/addons/ego_chatwindow/chatwindow.lua:9` and used at `:128` and `:275` (`* 1000` gives ms, but the resolution is still 1 s). 9.00 also declares it in `menu_map.lua:606`.
- **`GetDate(fmt, t)`** is a global wrapper over strftime. `"!%c"` means UTC, as in `os.date`. Used at `ui/addons/ego_debuglog/debuglog.lua:1035` and `:1480` on error timestamps from `GetErrorTimestamp(i)` (`:908`). That error log only keeps severity > 0 entries (`:934`), so it's no use for our lines.
- **`getElapsedTime()`** is the UI's real-time clock: seconds as a float, with sub-second resolution. It is used widely (for example `monitors.lua:1035`). It **keeps running while paused**: `onGamePaused` saves `getElapsedTime()` and `onGameUnpaused` shifts ticker start times by the paused duration (`monitors.lua:1034-1061`, `:2879-2883`). Its epoch is arbitrary (process or UI start; unverified).
- **`C.GetCurrentGameTime()`** returns game time as a double, the same as `player.age` (for example `menu_diplomacy.lua:137`).
- **`os.time`, `os.date` and `os.clock` are not used anywhere in vanilla `ui/`.** The only hits are LuaJIT's own `core/lua/jit/vmdef.lua`. Whether `os` exists in X4's Lua sandbox is **unverified**; assume it doesn't and use `GetDate`/`GetCurrentUTCDataTime`. SWI's Lua uses only `getElapsedTime()`.

## 4. `debuglog.txt` line format

- **Header line, wall-clock and local:** `Logfile started, time Mon Nov 02 10:51:45 2026`. This is the first line of every log, from the exe string `Logfile started, time %s`. It is the one wall-clock anchor in the file.
- **Every other line** is `[<Category>] <game time, 2 decimals> <message>`. For example, from `90000201/debuglog.previous.txt`:
  `[General] 0.00 *** Context:md.SWIBH_Hooks.UniverseGenerated: [swibh-test] HOOK H13 event_universe_generated: gamestart swibh_test, player.age 0`
  `[General] 32.11 *** Context:md.SWIBH_Tests.Begin: [swibh-test] RUN START 3 tests`
  The number matches `player.age`: it is 0 at universe generation, then 32.11, 34.11 and 36.11 two seconds apart as the tests' delays elapse. So **lines carry game time, not real time.** Our own `t` field only repeats it with more precision.
- **Launch args** come from `tools/run-game-tests.ps1:441`: `-skipintro -debug all -logfile debuglog.txt -scriptlogfiles -personalfolderid <id>`. The same args are in `tests/game/README.md:11`.
- **No timestamp option:** the 8.00 exe's command-line option strings (`strings X4.exe`, around the `logfile`/`scriptlogfiles`/`personalfolderid` cluster) have no timestamp option. Nearby options include `nodefaultlog`, `prefersinglefiles` and `nosaveindentation`. This comes from string inspection, not documentation, so it is **unverified**.
- `debug_to_file` (`common.xsd:25597`) writes to `Documents\Egosoft\X4\<id>\logs\<dir>\<name>` and needs `-scriptlogfiles`. It adds no timestamp either; HeadHunter and SWI put `player.systemtime` in the text themselves.

## 5. Other options

- **OBS gives the recording's start time.** OBS names recordings after their local start time by default (`%CCYY-%MM-%DD %hh-%mm-%ss`; OBS setting, unverified for this machine). Video offset = event wall time − recording start.
- **Anchor events:** log one line with both clocks at session start, on `event_game_loaded`, on `event_game_saved` and after an unpause. Any game-time-only line between two anchors can then be placed by interpolation. This breaks under pause or SETA, which is why a per-event wall stamp is better.
- **Lua sidecar for sub-second precision:** a UI addon can stamp `C.GetCurrentUTCDataTime()` plus a `getElapsedTime()` fraction. It's more work, and 1 s is enough for seeking in a video.

## Recommendation

1. **Add a `wall` field to every log event:** `player.systemtime.{'%Y-%m-%dT%H:%M:%S'}`, which gives local time at 1 s resolution. It works in MD, needs no Lua, and vanilla uses this property and format family (`md/finalisestations.xml:16`, `md/setup.xml:86`). It survives pauses, menus, SETA and loads, which `t` does not. Keep `t` for game logic.
2. *(Superseded by ADR 0002: no time zone is recorded.)* **Record the time zone once** in `session.start`. Use `player.systemtime.{'%z'}` only after a game test confirms X4 accepts `%z`; otherwise record the offset by hand. The OBS filename is local time too, so with both on the same machine the offset can be ignored.
3. **Add an assertion to the game test:** check that the `wall` value matches `^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d$` and that it advances by about the real delay between two test events. This also confirms that the format string doesn't crash the game.
4. **In the extractor:** recording offset = `wall` − OBS start (from the filename), and the debuglog header line serves as a cross-check. Optional: add `session.pause`/`session.resume` from the Lua `gamePaused`/`gameUnpaused` events if pause gaps ever matter to the analysis.
