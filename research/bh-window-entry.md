# Bounty-hunter window: where it can live in the X4 8.00 + SWI UI (#79)

Question ([#79](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/79), from #59): which UI entry points can `swibh` use for its bounty-hunter (contacts) window on X4 8.00 with SWI 0.90/0.91, requiring only SWI (no standalone UI Extensions, no SirNukes)? For each: the hooks it needs, whether SWI's bundled UIX copy has them on 8.00, how SWI adds its own tabs, reach mid-combat, and save/uninstall safety.

Tags: **[read]** = seen in the file cited; **[inferred]** = follows from what was read but not run; **[test]** = needs an in-game check.

Sources (all unpacked, read 2026-11-09):

- `SWI91` = SWI 0.91 HF1, `E:\x4-dev\reference\mods\swi-0.91hf1`; `SWI90` = SWI 0.90, `...\mods\swi-0.90`. Menus in `subst02/ui/addons/`, SWI's own Lua in `starwarsmod_m1/ui/`, MD in `ext02/md/` (0.91) or `ext/md/` (0.90).
- `V8` = vanilla 8.00, `E:\x4-dev\reference\x4-8.00\base`.
- Earlier work: [headhunter.md](headhunter.md) dependency table (9.00-only APIs), [swi-0.91-diff.md](swi-0.91-diff.md) section 4 (SWI's UIX menus), [swi-bounty.md](swi-bounty.md) section 9 (SWI's UI surfaces), [mods.md](../mods.md) (standalone UIX not at launch).

## Answer

| Rank | Entry point | Opens with | Hooks (all in SWI's menus) | 0.90 | 0.91 | Precedent in SWI |
|---|---|---|---|---|---|---|
| 1 | **Tab in the Diplomacy menu's left bar** (beside Factions, Agents, Embassy, Events) | `N` from anywhere, or top-level tab | DiplomacyMenu `buttonTogglePlayerInfo_on_start`, `createPlayerInfo_on_start`, `createInfoFrame_on_info_frame_mode` (+ `cleanup`) | yes | yes | kuertee RAP's "Reputations" tab |
| 2 | Tab in the Player Info menu's left bar | `Shift+I`, or top-level tab | PlayerInfoMenu, same four callbacks | yes | yes | SWI's "Maintenance" tab; RAP's "Professions" tab |
| 3 | Tab in the map's right sidebar | `M`, then the tab | MapMenu `createRightBar_on_start`, `createInfoFrame2_on_menu_infoModeRight` (+ `refreshInfoFrame2_on_start`, `ic_onSelectElement`, `ic_onRowChanged`) | yes | yes | none in SWI; Head Hunter's Wanted Board (9.00) |
| 4 | Own menu as a new top-level tab | top-level tab strip; MD `open_menu` | Vanilla `Helper.registerMenu`, `Helper.topLevelMenus`; Helper callback `checkTopLevelConditions_get_is_entry_available` | yes | yes | none |
| 5 | Conversation entry | comm/talk to an NPC | MD `event_conversation_started` + SWI's `ExtendedConversationMenu` | yes | yes | SWI's own hunt offers (`Bounties_Convo`) |
| 6 | Interact-menu (right-click) action | right-click an object | InteractMenu `prepareActions_prepare_custom_action`, `insertLuaAction_insert_custom_action` | yes | yes | none |
| 7 | In-flight HUD panel (display only) | always shown | TopLevelMenu `kHUD_get_is_show_custom_hud`, `kHUD_add_tables` | yes | yes | none |
| - | **A new hotkey** | - | none available to an extension | **no** | **no** | - |

**Recommendation:** put the contacts window in the **Diplomacy menu as a new left-bar tab** [inferred from the findings below]. It's the natural home for "who will deal with me" (it already lists factions and relations), it opens with one key (`N`) from anywhere, it has only 1-4 tabs so there's room, and SWI already ships an exact precedent (RAP's Reputations tab) that uses only callbacks present in both 0.90 and 0.91 and no 9.00-only API. The map right-bar is the second home for anything spatial (a wanted list that focuses the map on a ship), as Head Hunter did. MD can also open the Diplomacy menu straight on our tab (param 3 = mode).

**Main caveat:** every option except the conversation entry rests on the kuertee UIX hooks that SWI bakes into its replaced menus. They're not vanilla, and not versioned as an API: a future SWI release (or a standalone UIX installed over SWI, still open in mods.md) could rename or drop them. A mod also can't add a hotkey. All of it is untested in game.

## 1. How SWI hooks its menus [read]

- SWI replaces vanilla's menus wholesale with copies carrying kuertee's UIX callbacks: `subst02/ui/addons/ego_detailmonitor/*.xpl`, `ego_detailmonitorhelper/helper.xpl`, `ego_interactmenu/menu_interactmenu.xpl`, `ego_gameoptions/*.xpl` (`SWI91` file list; same set in `SWI90`). The callback sites look like `if menu.uix_callbacks ["name"] then for uix_id, uix_callback in pairs(...) do uix_callback(...)` (e.g. `SWI91` menu_playerinfo.xpl 598-603).
- Each menu has `menu.registerCallback(name, fn, id)` (`SWI91` menu_playerinfo.xpl 7644, menu_diplomacy.xpl 4437, menu_map.xpl 31676, menu_toplevel.xpl 517, menu_interactmenu.xpl 7867; `SWI90` menu_playerinfo.xpl 7599, menu_diplomacy.xpl 4390, menu_map.xpl 31575). A second registration under the same `id` is ignored with a debug line (`SWI91` menu_playerinfo.xpl 7652-7666), so passing an id makes re-running init safe. `deregisterCallback`/`updateCallback` exist and are applied one second later (7669-7740). `Helper.registerCallback` exists too (`SWI91` helper.xpl 13003).
- SWI's own UI Lua is one addon, `StarWarsMod_M1`, whose `ui.xml` lists its Lua files and depends only on `ego_detailmonitorhelper`, `ego_gameoptions`, `ego_detailmonitor` and `ego_interactmenu` (`SWI91` starwarsmod_m1/ui.xml; identical in 0.90). **No `kuertee_ui_extensions` addon** and no `Register_OnLoad_Init`: each file just ends with `ModLua.init()` (sw_maintenance.lua last line; kuertee_reputations_and_professions_playerinfo.lua last line), and `init` gets the menu with `Helper.getMenu("PlayerInfoMenu")` and registers callbacks (sw_maintenance.lua 14-26).
- So a `swibh` addon can copy this: a `ui.xml` with `<dependency name="ego_detailmonitor"/>` (and the others it touches), Lua files that call `Helper.getMenu(...)` and `registerCallback(..., "swibh_...")` at load [inferred: the same pattern as SWI's]. Because SWI's replaced menus are *the* `ego_detailmonitor` addon, depending on it is enough to see the hooks [inferred]. Our `content.xml` already depends on `SW Interworlds` (extension/swibh/content.xml) [read].
- 0.91 added `menu.uix_getConfig()` to every menu and context-frame callbacks to map, player info and diplomacy ([swi-0.91-diff.md](swi-0.91-diff.md) section 4) [read]. **`uix_getConfig` is not in 0.90** (`grep` in `SWI90` menu_playerinfo/menu_diplomacy finds none) [read], so code that must run on both should take `config` from the callback arguments, as SWI's own files do.
- The callback name sets of `menu_playerinfo`, `menu_diplomacy`, `menu_map`, `menu_toplevel` and `menu_interactmenu` differ between 0.90 and 0.91 HF1 only by the four `create/refreshContextFrame_on_start/_on_end` additions (set diff of `uix_callbacks["..."]` names) [read].

## 2. Diplomacy menu left-bar tab (rank 1)

What the Diplomacy menu is on 8.00:

- It's its own menu, `DiplomacyMenu` (`SWI91` menu_diplomacy.xpl 187), with a left bar of `factions`, `agents`, `embassy`, `event`; the last three only after story unlocks `x4ep1_diplomacy_agent` / `_interference` (205-210) [read]. In the Player Info menu the old `factions` entry is commented out (`SWI91` menu_playerinfo.xpl 357) [read]: Diplomacy moved out of Player Info, so "a tab beside Diplomacy in the empire menu" really means a tab in this menu.
- Hotkey `INPUT_ACTION_OPEN_DIPLOMACY_MENU` = `N` (`V8` libraries/inputmap.xml 282) [read]; it's also a top-level tab (`SWI91` helper.xpl 9345) with no availability condition [read].
- MD can open it on a given tab: `onShowMenu` sets `menu.mode = menu.param[3] or menu.mode or config.mode` (`SWI91` menu_diplomacy.xpl 712; `SWI90` 711) [read], and vanilla does exactly that with `<open_menu menu="DiplomacyMenu" param="[0, 0, 'agents', [ $AgentActor ]]"/>` (`V8` md/npc_agent.xml 436) [read]. So `param="[0, 0, 'swibh_contacts']"` should open our tab [inferred, test].

Hooks it needs (all present in 0.90 and 0.91) [read]:

| Callback | Site (`SWI91` menu_diplomacy.xpl) | Use |
|---|---|---|
| `buttonTogglePlayerInfo_on_start(mode, config)` | 383 | insert our entry into `config.leftBar` before the menu looks for the clicked mode |
| `createPlayerInfo_on_start(config)` | 1114 | same, when the sidebar is first built |
| `createInfoFrame_on_start(frame, tableProperties, config)` | 1173 | load data (e.g. from the blackboard) |
| `createInfoFrame_on_info_frame_mode(infoFrame, tableProperties)` | 1222 | draw our table when `menu.mode == "swibh_contacts"`; the vanilla mode branches (1210-1219) simply skip unknown modes |
| `cleanup` | 348 | drop references |
| `onRowChanged` | 4307 | row selection, if needed |

Precedent: kuertee RAP (bundled in SWI) adds a **"Reputations"** tab here, inserted after `factions`/`embassy`/`event` depending on unlocks (`SWI91` starwarsmod_m1/ui/kuertee_reputations_and_professions_playerinfo.lua 23-32, 74-100) [read]. The Social Standings Lua also hooks this menu (`kuertee_social_standings_and_citizenships.lua` 15-18) [read].

API risk: none of the 9.00-only calls from headhunter.md's table (`addFrameBorder`, `Helper.sortButtonHeight`, `mapMenu.updateInputBar`, `panelState`) are needed; a plain `infoFrame:addTable` is what SWI's tabs use (sw_maintenance.lua 100-104) [read]. `Helper.color.*` and `Helper.defaultTitleBackgroundColor` exist in SWI's helper (headhunter.md table row "Helper.color") [read there].

Sizing nit: `onShowMenu` sizes the left bar from `config.leftBar` (`SWI91` menu_diplomacy.xpl 683-697) *before* `createPlayerInfo_on_start` runs, so on the very first open our new entry isn't counted [inferred]; with 1-5 entries this can't overflow. Player Info (section 3) has the same order and far more entries.

## 3. Player Info menu left-bar tab (rank 2)

- `PlayerInfoMenu`, `Shift+I` (`V8` inputmap.xml 221) [read], top-level tab (`SWI91` helper.xpl 9344) [read]. Its left bar already has 15 entries plus spacers (`SWI91` menu_playerinfo.xpl 355-377) [read]; the bar shrinks icons when they don't fit (1337-1352) [read], so a crowded bar is the cost.
- Same callbacks as Diplomacy, at `SWI91` menu_playerinfo.xpl: `buttonTogglePlayerInfo_on_start` 599, `createPlayerInfo_on_start` 1516, `createInfoFrame_on_start` 1586, `createInfoFrame_on_info_frame_mode` 1666, `cleanup` 547, `onRowChanged` 7347 [read]. Unknown modes fall through the dispatch (1625-1662) [read]. `param[3]` opens on a mode (1356; `SWI90` 1355) [read].
- **Precedent, the cleanest template:** SWI's own **Maintenance** tab, `starwarsmod_m1/ui/sw_maintenance.lua` (identical in 0.90 and 0.91) [read]:
  - inserts `{ name, icon = "shipbuildst_repair", mode = "swiMaintenance", ... }` after `accounts` if missing (28-50), from both `buttonTogglePlayerInfo_on_start` and `createPlayerInfo_on_start` (51-56);
  - reads its data in `createInfoFrame_on_start` from the player's blackboard: `GetNPCBlackboard(playerId, "$swiMaintenanceData")` (58-60);
  - draws in `createInfoFrame_on_info_frame_mode` only when `menu.mode == "swiMaintenance"` (95-104);
  - live refresh: MD sets `player.entity.$swiMaintenanceData` and raises `swi.togglePlayerInfoMenuRefresh` (`ext02/md/sw_maintenance.xml` 366-367, 597-603); Lua `RegisterEvent` (21) re-reads and updates cells (290-302);
  - MD notices the menu with `<event_ui_triggered screen="'PlayerInfoMenu'"/>` (sw_maintenance.xml 591) and clears the data on `control="'menu_close'"` (609-616).
  This MD-blackboard-Lua loop is the data path any of these tabs would use [inferred].
- RAP also adds a "Professions" tab after `empire` (kuertee_reputations_and_professions_playerinfo.lua 101-113) [read].

## 4. Map right-sidebar tab (rank 3)

- Map: `M` (`V8` inputmap.xml 166) [read]; needs the `x4ep1_map` story feature (`SWI91` helper.xpl 9394) [read].
- Right bar is `config.rightBar` = filter, legend, spacer, info (`SWI91` menu_map.xpl 1124-1129) [read]. `createRightBar_on_start(config)` runs before the bar is built (20182-20188) [read]; the panel body is drawn by `createInfoFrame2_on_menu_infoModeRight(infoFrame2)` when no vanilla mode matched, returning true if it drew (19985-19998) [read]. Head Hunter's board also used `refreshInfoFrame2_on_start` 7238, `ic_onSelectElement` 27590, `ic_onRowChanged` 27375 (lines from [swi-0.91-diff.md](swi-0.91-diff.md); 0.90 lines in [headhunter.md](headhunter.md) row 322) [read].
- A left-bar map tab is also possible: `createSideBar_on_start` (20024), `buttonToggleObjectList_on_start` (2337) and `createInfoFrame_on_menu_infoTableMode` (6807, called for any infoTableMode vanilla doesn't know) [read].
- SWI itself adds **no** map sidebar tab: none of its Lua registers `createRightBar_on_start` or `createSideBar_on_start` (grep of `starwarsmod_m1/ui/*.lua`) [read]. SWI uses the map only for mission-offer/briefing hooks (kuertee_emergent_missions.lua 16-23) [read].
- Pros: spatial; rows can focus/select ships on the holomap (`C.SetFocusMapComponent`, as Head Hunter did) [read in headhunter.md]. Cons: the right panel is the narrow one; and Head Hunter's code can't be lifted as is because of its 9.00-only calls (headhunter.md rows 326-328) [read].

## 5. Own menu as a top-level tab (rank 4)

- The tab strip at the top of Map/Player Info/Diplomacy etc. is built from the global table `Helper.topLevelMenus` (`SWI91` helper.xpl 9340-9352; same in `SWI90` 9340 and `V8` helper.lua 9204) [read]. Entries carry `menu = "<MenuName>"` and `param`; switching tabs calls `Helper.closeMenuAndOpenNewMenu(menu, entry.menu, param)` (helper.xpl 9630-9643) [read]. SWI adds a Helper callback `checkTopLevelConditions_get_is_entry_available` to hide entries (helper.xpl 9417) [read].
- A menu is any Lua table registered with `Helper.registerMenu(menu)` (`V8` helper.lua 1227); its show-callback checks that the opened name matches `menu.name` (1241-1245) [read]. MD's `<open_menu menu="...">` takes a free `namestring` (`V8` libraries/common.xsd 30342-30350) [read]. So `table.insert(Helper.topLevelMenus, {id="swibh", menu="SwibhContactsMenu", ...})` plus our own menu Lua would give a full-screen window of our own [inferred, test]. It's the most work (a whole menu: frames, top-level strip, close/back handling) and nothing in SWI does it.
- `shortcut` in those entries is only a tooltip label naming an existing input action [read: values are `INPUT_ACTION_*` ids].

## 6. Hotkeys: not possible for an extension [read]

- Key bindings come from `libraries/inputmap.xml` action ids (`INPUT_ACTION_*`) and the addon `bindinggroup`s that enable them (`V8` ui/addons/ego_detailmonitor/ui.xml 37-76).
- `bindinggroup` is defined only in `ui/core/coreaddon.xsd` (82-120), the schema for Egosoft's own addons. The schema for mod addons, `ui/core/addon.xsd`, allows only `environment` > `file`, `dependency`, `savedvariable` (29-100) [read]. So an extension's addon can't declare key bindings, and the action ids are engine-defined [inferred]. A dedicated hotkey would need an outside tool (SirNukes' APIs), which #79 rules out [inferred].
- Workable instead: `N` (Diplomacy) or `Shift+I` (Player Info) and then our tab, which the menu remembers as `menu.mode` for the rest of the session [inferred from `menu.mode = menu.param[3] or menu.mode`].

## 7. Conversation entry (rank 5)

- SWI's own bounty UI is conversational: `Bounties_Convo` fires on `event_conversation_started` with a Bounty Hunters station trade NPC, adds player choices per faction, then opens `MapMenu` in `missionoffer` mode (`SWI91` ext02/md/kuertee_emergent_missions.xml 12034-12192; detail in [swi-bounty.md](swi-bounty.md) 4.1) [read].
- SWI bundles `ExtendedConversationMenu` (`ext02/md/extendedconversationmenu.xml`): mods register in `$convOptions`; with one mod it's called directly, with several they go under "... more. (Mods)" (11-40) [read]. A `swibh` "Talk business" choice on a contact NPC would use this [inferred].
- A conversation can open a menu and resume after: `<open_conversation_menu menu="..."/>` (`V8` common.xsd 30310) [read], so a contact conversation could open our Diplomacy tab [inferred].
- Reach: only NPCs you can talk or comm to; whether a contact can be commed from anywhere mid-combat is [test]. Good for contact-driven actions (accept, buy-out), not as the main window [inferred].

## 8. Interact-menu action (rank 6)

- `prepareActions_prepare_custom_action(actions, definedactions)` runs after the engine's player actions are listed (`SWI91` menu_interactmenu.xpl 6852-6857); `insertLuaAction_insert_custom_action(actiontype, istobedisplayed)` handles any `lua;`-type action vanilla doesn't know (6739-6743); `createContentTable_getIsActionValid` (4147) and `interactMenu_clickAction` (4216) filter and intercept clicks [read].
- The list starts from `C.GetCompSlotPlayerActions` and returns early when it's empty (6824-6829) [read], so it's per-object and contextual: right-click a ship → "swibh: hunt details" [inferred]. Fine for target-specific shortcuts, wrong for a contacts window. SWI's Lua doesn't use these hooks [read: grep].

## 9. In-flight HUD panel (rank 7, display only)

- SWI's TopLevelMenu carries kuertee's kHUD: callbacks `kHUD_get_is_show_custom_hud` and `kHUD_add_tables(frame)` add tables to the in-flight top-level frame (`SWI91` menu_toplevel.xpl 365-445) [read]. SWI itself doesn't use it [read: grep]. Usable for a small "active hunt" readout; not interactive without opening a menu [inferred, test].

## 10. Mid-combat reach [inferred unless noted]

- `M`, `Shift+I` and `N` are global keyboard actions (`V8` inputmap.xml 166, 221, 282) [read], so map, Player Info and Diplomacy tabs are reachable from any cockpit, in combat. These menus don't pause the game; the fight goes on behind them [test].
- Conversation entries need a reachable NPC; interact actions need a target object; the HUD panel is always visible.
- If the map isn't unlocked (`x4ep1_map`), the map tab isn't reachable; SWI starts presumably unlock it [test].

## 11. Save and uninstall safety

- **Lua tabs leave nothing in the save.** Our tab exists only because our Lua inserts it into `config.leftBar`/`rightBar` at run time [read: sw_maintenance.lua 28-50]. The menus' `onSaveState` keeps only top/selected row (`SWI91` menu_playerinfo.xpl 1479-1491) [read], and `menu.mode` is session Lua state [inferred]. Remove `swibh` and the tab disappears on next load [inferred].
- **MD data:** the window's data would live on `player.entity.$swibh...` blackboard values like SWI's `$swiMaintenanceData` [inferred]. Those are saved; after uninstall they're orphan values nothing reads [inferred]. SWI clears its value on menu close (sw_maintenance.xml 615) [read]; we can do the same, or keep the source of truth in our MD cues and only publish to the blackboard while the menu is open [inferred].
- `swibh` is `save="false"` (extension/swibh/content.xml) [read], so saves load without it.
- Addons can also declare `savedvariable` with storage in savegame or userdata (`V8` ui/core/addon.xsd 77-98) [read]; for UI preferences (sort, filter) userdata keeps them out of the save [inferred].
- **If SWI is missing:** `content.xml` depends on SWI, so the extension doesn't load at all [inferred]. If a future SWI drops a callback, `registerCallback` just adds an unused entry; nothing calls it and nothing errors, but the tab is gone [inferred from 7644-7667].
- **If standalone UIX is installed over SWI:** whether its menus replace SWI's, and with which callbacks, is still open (mods.md, swi-0.91-diff.md) [test]. UIX upstream defines the same callback names, so the tab would likely survive [inferred].
- `/reloadui`: addons reload; registering with a fixed id avoids duplicates, and the "insert if missing" check avoids a duplicate tab [read: sw_maintenance.lua 30-35; inferred for reload].

## Open questions for the build

1. In game: does `open_menu menu="DiplomacyMenu" param="[0, 0, 'swibh_contacts']"` land on our tab, and does the tab show on first open (sizing order, section 2)? [test]
2. Does the Diplomacy menu open with `N` before the diplomacy story unlocks in an SWI start? (The top-level entry has no condition; the `N` action may be gated by the engine.) [test]
3. Does a standalone UIX (if ever added) keep SWI's diplomacy callbacks? [test]
