# Save-read scripts

Throwaway helpers the playtest #4 agents used to read X4 saves (2026-11-03). Run them on a scratch copy of a save, never in the save folder. Rewrite in TypeScript if they become real tools.

- `anc.py` / `anc.awk`: print the `<component>` ancestors (galaxy → sector → station → room) of a given line of an unpacked save.
- `gates.py`: shortest gate route between two sectors, from the save's own gate links.

Used in [save-check-dhc-011.md](../save-check-dhc-011.md) and [save-check-sgp-611.md](../save-check-sgp-611.md).
