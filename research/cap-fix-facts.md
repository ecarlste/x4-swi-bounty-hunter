# Cap fix: facts (2026-11-01)

Facts for designing the fix to SWI's L/XL hunt pay cap. `EM` = SWI 0.90 `ext/md/kuertee_emergent_missions.xml` (unpacked at `E:\x4-dev\reference\mods\swi-0.90`). Tags: [read] = seen in files, [web] = from a web source, [inferred] = reasoning.

**SWI 0.91 HF1:** everything here still holds. The cap library and the Hunt are identical, 5 lines later (library 7345-7382, Hunt cap call 5689; Mayday, Escort and Sector Raid calls 703, 1364, 3005, still commented out). See [swi-0.91-diff.md](swi-0.91-diff.md).

## 1. `$rewardCap_mult`: a local, not a setting

- It is a **local variable inside the library** `CapRewardBasedOnMissionTarget` (EM 7340–7377). It is not in `UserSettings`. [read]
  - 7352: set to `0`.
  - 7353–7355: `5` if `$MissionTarget.isclass.ship_l`.
  - 7356–7358: `2` if `$MissionTarget.isclass.ship_xl`.
  - 7359: `<do_if value="$rewardCap_mult">`. With 0 (S, M, XS, stations...) the whole cap block is skipped and the rewards come back unchanged. So **0 means no cap**.
  - 7360: `$CapReward = $MissionTarget.size * $rewardCap_mult` (a plain number). 7362–7367: if `$TotalReward ge $CapReward`, both parts are scaled by their share and converted with `(...)ct`, so the cap lands in **ct** (1/100 Cr). That matches the measured 63.28 Cr for size 1,265.75 × 5.
- `grep rewardCap` over all of SWI 0.90 finds only these lines. [read]
- **No in-game way to turn it off.** EM's `UserSettings` cue (EM 135–213) holds only debug chances, requirement constants, `$rewardMult` (50), `$gateDistance_missionOffers`, `$missionHandlerNPC_alwaysSpawnAtStation` and `$isUseFullMod`. None of them reaches the cap. There's no options-menu page: EM only listens to `OptionsMenu` `menu_close` to re-run init (43, 339–345). The one chat command, `reset emissions` (EM 106–133), just resets `UserSettings` and `kEMissions` to the defaults. [read]
- The hunt's cap is gated only on `kEMissions.$IsSWIExists` (EM 5683), set to `@ware.tie_fighter != null` (228, 305). It is **not** gated on `$isUseFullMod`, which SWI also forces to false on every load (229–231). So a player can't turn it off without a mod or a script edit. [read]

## 2. Callers: only the Hunt is live

Four `run_actions ref="CapRewardBasedOnMissionTarget"` calls, all in EM. No other file in SWI calls it. [read]

| Line | Mission (cue) | Target passed | Parts passed | Live? |
|---|---|---|---|---|
| 701 | Mission_Mayday (491) | `$Ship` (the ship in distress) | `$reward_forSafeEscape`, `$reward_forKills` | **Commented out** (`<!--` at 700) |
| 1362 | Mission_Escort (1114) | `$Ship` (the escorted ship) | `$reward_forCompletedTrades`, `$reward_forKills` | **Commented out** (`<!--` at 1361) |
| 3000 | Mission_SectorRaid (2369) | `$Ship` | `$reward_forEscort`, `$reward_forKills` | **Commented out** (`<!--` at 2999) |
| 5684 | Mission_Hunt → Mission_Hunt_Resolve (5251, 5630) | `$MissionTarget` (the hunted ship, set at 5267 from `event.param.$target`) | `$BaseRewardData.$reward_forTargetKills`, `$PlayerDamageAndKillsData.$reward` | **Live**, inside `<do_if value="kEMissions.$IsSWIExists">` (5683) |

- All four sit in SWI-only blocks (`kEMissions.$IsSWIExists`). This corrects HANDOFF.md: Mayday, Escort and Sector Raid **don't** apply the cap in 0.90. A change to the library affects only Hunt payouts. [read]
- SWI 0.86 had the same library (7621) and the same four calls (696, 1356, 2986, 5969). So the cap isn't new in 0.90. [read]
- The library's XPath, for a diff: `/mdscript/cues/cue[@name='kEMissions']/cues/library[@name='CapRewardBasedOnMissionTarget']`. [read, parsed]

## 3. Intent: not documented

- The only comment in the code is on 7362: "get relative amounts of the 2 reward components and adjust them relatively so that they add up to the cap". There's no comment on the units or the purpose. [read]
- [inferred] The multipliers point to a size-scaled ceiling meant to stop huge payouts for capital ships: XL gets a smaller multiplier (2) than L (5), and S/M get none. Because SWI's XL hulls are about 2× the length of its L hulls (ISD-II size about 2,911 vs Nova 1,265.75), the cap comes out at about the same figure for both, about 5,800–6,500. Read as Cr, that would still be a 99% cut of a ~1M Cr base. Read as ct (how it actually runs), it's 58–65 Cr. Neither reading gives a sensible bounty, so the cap was probably never tuned or tested at payout. Offers show the uncapped value.
- **Upstream (non-SWI) EM source: not found.** kuertee's GitHub has no EM repo (only UI Extensions, HotKey API, AI tweaks, renaming). Nexus returned 403 to automated fetches, and searches found no Steam or ModDB changelog that mentions the cap. kuertee is listed as an SWI author (`starwarsmod_m1/content.xml`). The cap is SWI-gated, so it's probably SWI-specific even upstream. Still open: ask on SWI's Discord, or download standalone EM from Nexus by hand and grep for `CapRewardBasedOnMissionTarget`. [web, read]

## 4. Does an MD diff on a library's actions apply to an existing save? Yes (high confidence)

- Egosoft's Mission Director Guide ("MD refreshing and patching"): "When a saved game is loaded, the saved MD state is restored, but also all MD files are reloaded." Also: "You CAN change a library and change/add/remove its sub-cues. This automatically updates all cues that use the library." The save holds cue states and variables, not action code. `<patch sinceversion>` exists only to migrate state such as variables. [web: https://wiki.egosoft.com/X%20Rebirth%20Wiki/Modding%20support/Mission%20Director%20Guide/; the guide says the MD is shared by XR and X4]
- Extension diffs are applied when the files are loaded, so the patched library is what runs. `run_actions` runs the library's current actions each time it is called. That includes a hunt that was accepted before the patch: Resolve calls it only at payout.
- Vanilla and SWI both patch library actions this way: `ego_dlc_boron/md/factionlogic_stations.xml:4` (`library[@name='Manage_Stations']/actions/...`) and `ego_dlc_boron/md/factionlogic_economy.xml:4`; SWI's `ext/md/gm_buildstation.xml:37–44` patches `library[@name='Start']/.../actions`. [read]
- The patch only needs to replace the actions or the `set_value` lines inside the library. It adds no new cue or variable, so it needs no `<patch>` and no version bump. The patch extension must declare `<dependency id="SW Interworlds"/>` (SWI's content id, with a space) so it loads after SWI. SWI declares `<dependency version="800"/>`. [read]
- Confidence: **high**. T12 (2026-11-02) confirmed a diff from our extension reaches SWI's EM script on a new game, but only by path: `extensions/starwarsmod_m1/md/kuertee_emergent_missions.xml` inside our extension (a same-named file in our own `md/` is ignored). It also applies to an existing save: save_007, made without the extension, ran the patched library after loading.

## 5. A Pirate's Life

- **Targets X4 9.x, vanilla first** (docs/PROJECT.md:14, README.md:3/9, docs/DESIGN.md:9). Requires Tides of Avarice; kuertee's UI Extensions is optional (content.xml). [read]
- **There's no SWI profile today.** `profiles/` holds only `vanilla/`. DESIGN.md:16/25–27 describes a future data-profile contract (SWI tiers incl. XXL, Sith grouping). IMPLEMENTATION_PLAN.md:136–137 lists "SWI profile, once SWI supports 9.x" as unchecked, behind asking the SWI team first. The profile is about piracy data (factions, tiers), not mission fixes. [read]
- **On 8.00:** content.xml has no game-version dependency, so X4 8.00 would load it. But its diffs target 9.00 vanilla files (`aiscripts/fight.attack.object.fighter.xml`, `orders.base.xml`, `move.claim.xml`, `md/notifications.xml`, `md/conversations.xml`, `libraries/wares.xml`, `icons.xml`, `influenceconfigurations.xml`), and most of those differ between 8.00 and 9.00 (e.g. fighter attack script: 228 diff lines). Some selectors may miss on 8.00. It has never been tested there. [read, inferred] So putting the cap fix in a small standalone extension is the lower-risk option.
