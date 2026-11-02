[Back to the handoff](../HANDOFF.md). Research for issue #8, "Publishing an 8.00 + SWI extension on Nexus and Steam Workshop".

# Publishing an X4 8.00 + SWI extension on Nexus and Steam Workshop

Researched 2026-11-01. Current X4 is 9.00 (released June 2026); SWI 0.90 runs on 8.00 HF4. Sources are primary where possible: Egosoft's wiki, the WorkshopTool's own readme and help text, Steamworks docs, SWI's own site and manifests on disk. Claims I worked out without a source saying it outright are marked **(inferred)**. Some pages (Nexus, ModDB, parts of Steam) refused automated fetches; for those I used search-engine snippets and say so.

## Short answer

- **Nexus is the main channel.** SWI itself is only on Nexus (mod 349) and Google Drive, not on the Workshop. SWI add-ons ship on Nexus, list "X4 Star Wars Interworlds" under Requirements, and declare `<dependency id="SW Interworlds" optional="false"/>` in `content.xml`.
- **Workshop is possible but weak.** The WorkshopTool only accepts required dependencies on other Workshop items or on DLCs. Since 1.12 it allows *optional* dependencies on non-Workshop extensions. So a Workshop upload can only declare SWI as `optional="true"`. That sets the load order but doesn't make SWI required, so the mod has to check for SWI itself at runtime. Players still get SWI from Nexus by hand.
- **8.00 on Workshop:** Steam gives every subscriber the latest version of an item, whatever branch they're on. The Steam feature that ties item versions to branches can't be set through the WorkshopTool (1.15). A Steam player on an 8.00 branch does get the item, and it loads if its `content.xml` asks for game version 800 or lower. A NoSteam 8.00 install (like ours) gets no Workshop items.
- **Version pinning:** `<dependency version="800"/>` sets the *minimum* game version. There is no maximum, so nothing stops a 9.x player from enabling it. Pin SWI with `<dependency id="SW Interworlds" version="090" optional="false"/>` (also a minimum).

## 1. Running 8.00 on Steam

- **Public beta branch:** Egosoft's wiki documents one Steam branch, `public_beta`, unlocked with an access code on the game's Properties > Betas tab. "NONE - Opt out of all beta programs" goes back to the release version. It says nothing about keeping old versions as branches. It also warns: "You CANNOT load a savegame done with a beta version in an earlier version of the game." ([Egosoft wiki, Public Beta Access and Information](https://wiki.egosoft.com/X4%20Foundations%20Wiki/Game%20Updates%20and%20Patch%20History/Public%20Beta%20Access%20and%20Information/), last modified 2025-03-02)
- **Version-named branches exist.** On this machine, the Steam install of X4 (`E:\SteamLibrary\steamapps\appmanifest_392160.acf`) has `"BetaKey" "9.00"`. So Steam has a branch literally named `9.00`. Players on the SWI forum thread describe going back to an older version "via Properties > Betas, pick the version from the dropdown", and note that Egosoft provides that option, not Steam by default ([Egosoft forum, "Star Wars Interworld v0.6"](https://forum.egosoft.com/viewtopic.php?t=448394), 2023 posts about switching to 5.10 for SWI). **(Inferred:)** Egosoft keeps one branch per major version, so an `8.00` branch should be in the dropdown. I couldn't confirm the branch list from SteamDB or an Egosoft post. Check the dropdown in the Steam client before telling players to use it.
- **NoSteam:** Egosoft's bonus downloads page offers "X4 8.00 Hotfix 4 NoSteam" (07 Jan 2026) and "X4 9.00 NoSteam" (10 Jun 2026) executables to owners who registered the game on the forum or linked Steam. "These executables allows you to play X4 without having to run the Steam client." ([egosoft.com bonus downloads](https://www.egosoft.com/download/x4/bonus_en.php)). Our 8.00 install is a copy of the game folder (`version.dat` = `800`) with `X4_nonsteam.exe` (see [mods.md](../mods.md)).

## 2. Does Steam Workshop deliver a subscribed mod to an 8.00 install?

- **Steam's default:** "users who subscribe to a Steam Workshop item will download the latest version of that item", whatever branch they're on. Since SDK 1.60, item authors can call `ISteamUGC::SetRequiredGameVersions` with a minimum and maximum branch. The game developer has to turn on "Enable Game Branch Versions". Then "Users who have opted into Steam branch will download the version of the item that is valid for that branch." ([Steamworks, Workshop Item Versioning](https://partner.steamgames.com/doc/features/workshop/itemversioning))
- **Egosoft's tool doesn't use it:** `WorkshopTool help` (1.15, the copy in `E:\SteamLibrary\steamapps\common\X Tools`) lists only `publish`, `publishvr`, `publishx4`, `update`, `updatepreview`, `updatetags`, `showpage`, `showagreement` and switches `-path -preview -foldername -contentdef -namedesc -tags -changenote -minor -buildcat -buildvcat -keepcatfiles -batchmode`. None of them sets a branch range, and the readme's version history (1.01 to 1.15, 2014-08 to 2025-08-26) never mentions branch versions. **(Inferred:)** an X4 Workshop item has one live version, and every subscriber gets it.
- **X4's own version check:** for an update that "requires a higher game version", "the game discards the download (with a warning message)" and keeps the files already on disk. Changes to dependencies on other Workshop items aren't checked this way. ([Egosoft wiki, Steam Workshop for X Rebirth and X4](https://wiki.egosoft.com/X%20Rebirth%20Wiki/Modding%20support/Steam%20Workshop%20for%20X%20Rebirth%20and%20X4/), section "Updating an extension")
- **Supporting two game versions in one item:** the same wiki page ("Supporting multiple game versions") describes version catalogs. The game "will search for a version catalog of the current game version in your extension folder" (e.g. `ext_v150.cat`), and that catalog overrides the normal ones. You keep a `v150\` folder with the older files, keep `content.xml`'s required game version at the *older* version, and publish with `-buildvcat`. That builds a diff catalog. This was written for X Rebirth 1.50 vs a 2.00 beta, but the tool still has `-buildvcat` for X4. **(Inferred:)** this is how one Workshop item could serve both 8.00 (`ext_v800.cat`) and 9.00. We don't need it while SWI only runs on 8.00.
- **Consequences for us:**
  - A Steam player on an `8.00` branch who subscribes gets our item and loads it, as long as `content.xml` asks for game version `800` (or lower).
  - Our dev install runs `X4_nonsteam.exe`, so it never gets Workshop items. **(Inferred** from "without having to run the Steam client"; the Workshop download needs the Steam client.) Test from `extensions/`, as now.
  - A player on 9.x can also subscribe and enable it. Nothing in the manifest stops them, since `<dependency version>` is a minimum only. With `SW Interworlds` declared, X4 reports the missing dependency. On Workshop, where SWI can only be optional, nothing does.

## 3. How SWI is published

- **SWI's own site** ([sites.google.com/view/swinterworlds](https://sites.google.com/view/swinterworlds/Home)) links two downloads: Nexus Mods (`nexusmods.com/x4foundations/mods/349`) and Google Drive, the latter "preferable, as Nexus may corrupt big files". "All communication on the mod is done via Discord." It says "YOU NEED ALL DLCs". It doesn't mention the Workshop or a game version. Install: extract into the game's `extensions` folder, "DO NOT INSTALL MOD IN DOCUMENTS FOLDER".
- **Not on the Workshop:** "The reason it is not on Steam Workshop is simply because it is too big." ([Steam discussion](https://steamcommunity.com/app/392160/discussions/0/3043858879866346443/), Pathogenic, 2021-09-04). Workshop collections that bundle SWI add-ons link to Nexus 349 for SWI itself. One such collection ("X4: Star Wars Interworlds Modpack", id 3460247232) now shows "removed for violating Steam guidelines" ([Steam](https://steamcommunity.com/sharedfiles/filedetails/?id=3460247232)). The reason isn't stated. Star Wars IP is a plausible risk for Workshop listings **(inferred)**.
- **Nexus 349** (from search snippets; the page blocks automated fetches): requires all five DLCs, X4 8.0 (8.0 HF4 listed as the supported version), Protected UI Mode off, and a save started on SWI 0.90 or later. No requirements beyond the official DLCs.
- **SWI's manifest** (`/mnt/e/x4-dev/reference/mods/swi-0.90/starwarsmod_m1/content.xml`):
  ```xml
  <content id="SW Interworlds" name="SW Interworlds" ... version="090" date="2025-12-06" save="1" enabled="0">
    <dependency version="800" />
    <dependency id="ego_dlc_split" optional="false" name="Split Vendetta"/>
    ... (terran, pirate, boron, timelines, all optional="false")
  ```
  The extension id is `SW Interworlds` (with a space). The folder name is `starwarsmod_m1`. Dependencies use the id, not the folder name.

## 4. How SWI add-ons declare the dependency

From each add-on's `content.xml` on GitHub (found with `gh search code 'dependency id="SW Interworlds"'`):

| Add-on | Dependency on SWI | Game version dep |
|---|---|---|
| [Dhomie/SWI-Sith-Extension](https://github.com/Dhomie/SWI-Sith-Extension) (v200, 2026-01-22, "testing version for SWI 0.9X") | `<dependency id="SW Interworlds" name="Star Wars Interworlds" optional="false"/>` | none |
| [Akenno95/akenno_swi_expansion](https://github.com/Akenno95/akenno_swi_expansion) | `id="SW Interworlds" optional="false"`, plus optional deps on non-Workshop and `ws_3649092747` items | none |
| [archenovalis/one_sector_swi](https://github.com/archenovalis/one_sector_swi) | `id="SW Interworlds" optional="false"` | none |
| [ecarlste/swi_heroes_rebalanced](https://github.com/ecarlste/swi_heroes_rebalanced) (v086) | `id="SW Interworlds" optional="false" version="086"` (minimum SWI 0.86) | none |
| [chemodun/x4-mod-ui-extensions-for-swi](https://github.com/chemodun/x4-mod-ui-extensions-for-swi) (kuertee UIX for SWI, v804, Nexus 2134) | `id="SW Interworlds" optional="true"`, used only to load after SWI | none |
| archenovalis/sanitized_slan_cheat, ScuffleKerfuffle/X4ModCollection | `optional="true"` | n/a |

- The usual pattern is `optional="false"`, with `name` as a display label. None of these declare a game version; they rely on SWI's own `<dependency version="800"/>`.
- On Nexus, add-ons such as Closed Loop Reborn (1024), Interworlds at War (1992), SWI Sandbox Tweaks (1515), SWI Cockpit Camera Tweaks (1346), InterGalactic Bank - SWI (1577) and SWI Careers (1534) list "X4 Star Wars Interworlds" under Nexus Requirements, often with the DLCs and sometimes SirNukes' Mod Support APIs. Several name the SWI version they target in the description, e.g. the Boron modules add-on (2081): "Boron modules addon for SWInterworlds 0.9 (X4 = 0.8)". The UIX for SWI page (2134) says it is "oriented on a X4: Foundations version 8.00 with latest hotfixes". (Search snippets; Nexus blocks automated fetches.)
- On Workshop, SWI add-ons such as SWI: Careers say "THIS MOD REQUIRES STAR WARS INTERWORLDS TO BE INSTALLED TO FUNCTION" in the description and link to Nexus. They can't list it as a required item, because SWI isn't a Workshop item.

## 5. How the WorkshopTool upload works

Primary: `X Tools\Readme.txt` and `WorkshopTool help` (v1.15, 2025-08-26; Steam app 282160 "X Tools"), plus the [Egosoft wiki Workshop page](https://wiki.egosoft.com/X%20Rebirth%20Wiki/Modding%20support/Steam%20Workshop%20for%20X%20Rebirth%20and%20X4/) (the Readme's old link, [Steam guide 245117855](https://steamcommunity.com/sharedfiles/filedetails/?id=245117855), rate-limited me).

- **First upload:** `WorkshopTool publishx4 -path "<...>\extensions\swibh" -preview shot.jpg -buildcat`. `-buildcat` packs loose files into `ext_01.cat` (only if no catalogs exist yet). "Only files in <path> with extensions .cat/dat/cur/mkv/txt/pdf will be uploaded." So loose `md/`, `aiscripts/` and `t/` files must be packed into catalogs, and `content.xml` is uploaded as metadata. The tool is a Steam app: "You must be logged into Steam while the WorkshopTool is running", and "You can only publish an extension for a game that you own on Steam".
- **Updates:** `WorkshopTool update -path ... -buildcat -changenote "..."`. `-changenote` is required. The tool expects `version` to go up; use `-minor` if it doesn't. `-namedesc up|down` syncs the title and description.
- **content.xml rewrite:** "The value of the id attribute has no relevance before publishing - it will be replaced with a Workshop-specific ID" (`ws_<publishedfileid>`). The tool writes `sync="false"` so the author's local copy isn't overwritten by Workshop downloads.
- **Dependencies:** "You can have dependencies on other extensions, but these must already exist in the Workshop" (as `ws_<id>`). Players "have to subscribe to all of them manually, otherwise they will get an error message in the game." DLC ids are allowed (`ego_dlc_split` from 1.08 through `ego_dlc_mini_02` in 1.15). Readme v1.12 (2023-03-29): "Allow Steam Workshop mods to have optional dependencies on non-Workshop extensions". So a required dependency on `SW Interworlds` is rejected and an optional one is accepted. **(Inferred** from the changelog wording; not tested.)
- **Game version:** the tool doesn't check the installed game version. It reads `content.xml` from `-path`, and the path can be anywhere. Nothing in the help or readme ties it to a game build. **(Inferred:)** uploading from the 8.00 folder (or any folder) works, as long as Steam is running and logged in. The tool needs the Steam client, not the game. The `<dependency version>` you write is what decides which game versions accept it.
- **Workshop id vs our id:** after publishing, the Workshop copy's id is `ws_<n>`, not `swibh`. Saves made with the Nexus copy (`swibh`) and the Workshop copy (`ws_<n>`) would see two different extensions **(inferred** from the id-replacement rule). design.md wants `swibh` to stay stable for saves, so pick one channel as the primary, or warn players that switching channels breaks saves.

## 6. Version-pinning practice in content.xml

- `version` on `<content>` is the extension version × 100, as an integer string: `version="250"` = 2.50 (Egosoft wiki). SWI uses `"090"` for 0.90; heroes_rebalanced uses `"086"`. The WorkshopTool expects it to go up on each update, unless you use `-minor`.
- `<dependency version="800"/>` (no id) = minimum game version ("You can also have a dependency on the version of X Rebirth (i.e. the minimum required version)"). The wiki's example: `<!-- Requires minimum game version 1.50 --> <dependency version="150" />`. Vanilla DLC manifests in the 8.00 install use the same form (`ego_dlc_boron` has `<dependency version="600" />`).
- `<dependency id="..." version="NNN"/>` = minimum version of that extension (wiki example: `<dependency id="ws_12345" version="100" />`, "Requires Workshop item 12345, minimum version 1.00").
- `optional="true"`: a vanilla comment in `ego_dlc_boron/content.xml` says: "No error if dependency missing/disabled. This is only used to define the loading order of extensions (dependencies are loaded first)."
- **No maximum version exists** in any source I found. Head Hunter - Reloaded's `<dependency version="900"/>` is what blocks it on 8.00 (see [headhunter.md](headhunter.md)). The reverse, blocking 9.x, isn't possible in the manifest.

## Recommendation for swibh

1. **Primary channel: Nexus**, the same as SWI and its add-ons. `content.xml`:
   ```xml
   <content id="swibh" name="..." version="010" save="1" ...>
     <dependency version="800" />
     <dependency id="SW Interworlds" name="SW Interworlds" version="090" optional="false" />
   </content>
   ```
   Make "X4 Star Wars Interworlds" (349) a Nexus requirement. In the description, say X4 8.00 HF4 + SWI 0.90, and point Steam players at Properties > Betas.
2. **Workshop: optional, later.** If we publish there, the SWI dependency has to be `optional="true"`, so the mod needs a runtime SWI check that shows a message and stops if SWI is missing. Accept that the id becomes `ws_<n>`, and watch the Star Wars guideline risk.
3. Don't publish from the NoSteam install expecting it to test the Workshop path. A Workshop test needs the Steam client and a Steam install on an 8.00 branch.

## Open questions

- Confirm in the Steam client that the Betas dropdown for X4 lists `8.00` (we saw `9.00`).
- Confirm by test that the WorkshopTool rejects `optional="false"` on `SW Interworlds` and accepts `optional="true"`.
- Nexus 349's exact requirements text and permissions. I read it from search snippets only.
