# A wall-clock stamp on every log event

Date: 2026-11-02. Status: accepted. Amends the envelope in [ADR 0001](0001-one-schema-for-log-events.md).

Edit markers ([#22](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/22)) place log events in a video recording, but `t` (`player.age`) stops on pause, runs fast under SETA and jumps on load, and `debuglog.txt` lines carry only game time ([research/real-time-clock.md](../../research/real-time-clock.md)). So every log event also carries `"wall"`: local time as `player.systemtime.{'%Y-%m-%dT%H:%M:%S'}`, added by the generated MD library like `t`. An event's place in a recording is `wall` minus the recording's start, read from the OBS file name (also local time).

## Considered options

- Stamp only `session.start` and interpolate from `t`: breaks after any pause or SETA.
- Read real time from `debuglog.txt`: only the header line has it.
- A Lua sidecar with sub-second time: more work, and seeking in a video needs only whole seconds.

## Consequences

- No time zone is recorded. A session that spans a daylight-saving change will have markers off by an hour after it; accepted.
- `v` stays 1: no logs from before this change matter.
- Only the strftime specifiers vanilla uses are safe (MSVC can abort on unknown ones); the game test checks that `wall` prints in the expected shape and advances with real time.
