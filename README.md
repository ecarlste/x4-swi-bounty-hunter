# SWI Bounty Hunter playthrough

Planning for a YouTube bounty hunter series in Star Wars Interworlds on X4 8.00. Planning docs, plus a dev-only in-game test harness for the research tests; no playthrough mod is planned yet.

- [HANDOFF.md](HANDOFF.md): where things stand and the open work; start here in a new session.
- [concept.md](concept.md): the concept to agree on, and open questions for grilling sessions.
- [mods.md](mods.md): every extension in the install with its version, and candidate mods with their SWI compatibility.
- [bounty-research.md](bounty-research.md): how bounty hunting works in SWI and vanilla 8.00, and what it would take to add Head Hunter's features; details in [research/](research/).
- [test-plan.md](test-plan.md): how to run the in-game tests from the bounty research, grouped into sessions, with a results table.
- [tests/game/README.md](tests/game/README.md): the automated in-game test harness (`make game-test`): a dev-only test extension and a runner that launches the 8.00 NoSteam copy in a test profile and reports PASS/FAIL. It runs T01 now.

Related: [A Pirate's Life](https://github.com/ecarlste/x4-pirates-life-mod), the piracy mod, whose SWI support and bounty hunter design can use what we learn here.
