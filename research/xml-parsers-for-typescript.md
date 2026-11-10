# XML parser findings for porting tools/check_game_tests.py to TypeScript

Probes were run from a throwaway folder outside the repo (not kept); the `xmlprobe/` names below refer to it. Decision: [ADR 0003](../docs/adr/0003-typescript-first-fewest-languages.md).
Ground truth: `python3 -I` `xml.dom.minidom.parse` (expat, namespace-aware builder).

## Versions (E)

| item | version | published | runtime deps |
|---|---|---|---|
| Node | 26.13.0 (`process.features.typescript` = `strip`) | | |
| @xmldom/xmldom | 0.9.12 (latest) | 2026-08-21 | none |
| xpath | 0.0.36 (latest) | 2026-10-28 (13 days old today) | none |
| saxes | 6.0.0 (latest) | 2021-11-07 | xmlchars ^2.2.0 |
| fast-xml-parser | 5.12.0 (latest) | 2026-11-03 | 6 packages |

All four load under native type stripping with `"type": "module"` and the repo's tsconfig
(`module`/`moduleResolution` `nodenext`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `types: ["node"]`):
`import { DOMParser } from '@xmldom/xmldom'`, `import * as xpath from 'xpath'`, `import { SaxesParser } from 'saxes'`,
`import { XMLValidator } from 'fast-xml-parser'` all run, and `tsc -p .` passes. Type friction:
`xpath.d.ts` starts with `/// <reference lib="dom" />`, so importing it pulls the DOM lib into the whole program, and
xmldom 0.9 ships its own `Node`/`Element` interfaces (inside `declare module '@xmldom/xmldom'`) that don't match lib.dom's.
Passing an xmldom document to `xpath.select` and reading results back as xmldom `Element`s needs `as unknown as Node` /
`as unknown as Element[]` casts.

Input decoding: xmldom and saxes take strings, so invalid UTF-8 must be caught before parsing with
`new TextDecoder('utf-8', { fatal: true }).decode(buf)` (also strips a leading BOM). With that, bad UTF-8 is rejected like expat.

## A + B. Malformed-input matrix

R = reject (throws), A = accept. **Bold** = differs from expat.
Columns: xmldom with no `onError` (errors go to console.error, only fatalError throws); `onErrorStopParsing`;
`onWarningStopParsing`; "xmldomStrict" = `onError: (level, msg) => { throw new Error(...) }` plus a `documentElement` check
(equivalent to onWarningStopParsing); saxes = `new SaxesParser({ xmlns: true })` with `on('error', e => { throw e })`,
`write(s).close()`; fxp = `XMLValidator.validate(s) !== true`.
`errorHandler` is deprecated in 0.9 (a function is used as `onError`; an object throws TypeError).

| case | expat | xmldomDefault | xmldomErrStop | xmldomWarnStop | xmldomStrict | saxes | fxp |
|---|---|---|---|---|---|---|---|
| amp_in_attr | R | **A** | **A** | **A** | **A** | R | **A** |
| amp_in_text | R | **A** | **A** | **A** | **A** | R | R |
| attr_no_value | R | **A** | **A** | R | R | R | R |
| bad_charref | R | **A** | **A** | **A** | **A** | R | **A** |
| bad_name | R | R | R | R | R | R | R |
| bad_utf8 (row is latin1 fallback; TextDecoder fatal rejects it first) | R | **A** | **A** | **A** | **A** | **A** | **A** |
| cdata_end_in_text | R | **A** | **A** | **A** | **A** | R | **A** |
| comment_ends_dash | R | R | R | R | R | R | **A** |
| control_char | R | **A** | **A** | **A** | **A** | R | **A** |
| dashdash_comment | R | R | R | R | R | R | **A** |
| doctype_after_root | R | R | R | R | R | R | **A** |
| duplicate_attr | R | R | R | R | R | R | R |
| empty_file | R | R | R | R | R | R | R |
| lt_in_attr | R | R | R | R | R | R | **A** |
| lt_in_text | R | **A** | R | R | R | R | R |
| mismatched_close | R | R | R | R | R | R | R |
| no_space_between_attrs | R | **A** | **A** | R | R | R | R |
| ok_basic | A | A | A | A | A | A | A |
| ok_bom | A | A | A | A | A | A | A |
| ok_gt_in_attr | A | A | A | A | A | A | A |
| pi_xml_reserved | R | R | R | R | R | R | **A** |
| text_after_root | R | **A** | R | R | R | R | **A** |
| text_before_root | R | **A** | R | R | R | R | R |
| two_roots | R | R | R | R | R | R | **A** |
| unbound_prefix | R | R | R | R | R | R | **A** |
| unclosed_root | R | R | R | R | R | R | R |
| unclosed_tag | R | R | R | R | R | R | R |
| undefined_entity | R | **A** | R | R | R | R | **A** |
| undefined_entity_attr | R | **A** | R | R | R | R | **A** |
| unquoted_attr | R | **A** | **A** | R | R | R | R |
| unterminated_comment | R | R | R | R | R | R | R |
| xmldecl_not_first | R | R | R | R | R | R | R |
| xmldecl_twice | R | R | R | R | R | R | R |


Extra cases (cases2/):

| case | expat | xmldomDefault | xmldomErrStop | xmldomWarnStop | xmldomStrict | saxes | fxp |
|---|---|---|---|---|---|---|---|
| amp_no_semicolon_attr | R | **A** | R | R | R | R | **A** |
| amp_no_semicolon_text | R | **A** | R | R | R | R | R |
| cdata_ok | A | A | A | A | A | A | A |
| close_tag_space_ok | A | A | A | A | A | A | A |
| crlf_ok | A | A | A | A | A | A | A |
| doctype_external | A | A | A | A | A | A | A |
| doctype_internal_entity | A | A | **R** | **R** | **R** | **R** | A |
| dup_attr_ns | R | **A** | **A** | **A** | **A** | R | **A** |
| end_tag_attr | R | R | R | R | R | R | R |
| lone_amp_end | R | **A** | **A** | **A** | **A** | R | R |
| pi_ok | A | A | A | A | A | A | A |
| surrogate_charref | R | **A** | **A** | **A** | **A** | R | **A** |
| tab_attr_ok | A | A | A | A | A | A | A |
| unbound_attr_prefix | R | R | R | R | R | R | **A** |
| unclosed_cdata | R | R | R | R | R | R | R |


Rejection messages for xmldomStrict and saxes are in `xmlprobe/probeA.out`.

### What strict xmldom (throw on every level) still accepts that expat rejects

| input | xmldom result |
|---|---|
| `<a x="a & b"/>` (bare & in attribute) | accepted, attribute value `a & b` |
| `<a>a & b</a>`, `<a>x &</a>` (bare & in text followed by space / at end) | accepted as literal `&` (`&amp b` without `;` is rejected) |
| `<a>&#0;</a>`, `<a>&#xD800;</a>` (illegal char refs) | accepted, text contains U+0000 / lone surrogate |
| `<a>]]></a>` | accepted |
| raw control char `\x01` in text | accepted |
| `<a xmlns:p="u" xmlns:q="u" p:x="1" q:x="2"/>` (same expanded attribute name twice) | accepted |

saxes rejects every one of these. The only expat/saxes difference found: saxes rejects an internal-subset entity
(`<!DOCTYPE a [<!ENTITY e "v">]><a>&e;</a>`, "undefined entity") because it does not read the internal DTD; expat
accepts it. xmldom also rejects it. No X4 or repo file uses a DTD, so being stricter here is harmless.

fast-xml-parser's XMLValidator is much weaker: accepts two roots, `<` and `&` in attributes, undefined entities, unbound
prefixes, bad comments, DOCTYPE after root, misplaced `<?xml?>`. Not suitable as a well-formedness gate.

## C. XPath (`xpath` 0.0.36) on xmldom documents

All `<diff>` op sels in the repo (grep `<diff` over extension/ and tests/game/; the only ops are `add`), counted with
`xpath.select(sel, doc).length` and with the Python check's ElementTree method (`root.findall(<sel minus /root/>)`).
Tiny targets: `xmlprobe/tiny_md.xml` (built so the two engines differ), `tiny_gamestarts.xml`, `tiny_loadouts.xml`.
Real target: SWI 0.91hf1 `ext02/md/kuertee_emergent_missions.xml`. ET "n/a" = the Python check refuses `//` and
doesn't check library diffs at all.

| diff file | op | sel | tiny target: xpath / ET | real target: xpath / ET |
|---|---|---|---|---|
| extension/swibh/extensions/starwarsmod_m1/md/kuertee_emergent_missions.xml | add | `/mdscript/cues/cue[@name='kEMissions']/cues/cue[@name='Missions_Hunts']/cues/cue[@name='Mission_Hunt']/cues/cue[@name='Mission_Hunt_CreateMission']/actions/reset_cue[@cue='this']` | 1 / 1 | 1 / 1 |
| extension/swibh/extensions/starwarsmod_m1/md/kuertee_emergent_missions.xml | add | `/mdscript/cues/cue[@name='kEMissions']/cues/cue[@name='Missions_Hunts']/cues/cue[@name='Mission_Hunt']/cues/cue[@name='Mission_Hunt_Resolve']/actions/do_else[2]/do_if[@value='$Result == $Result_success'][2]/do_if[@value='kEMissions.$IsSWIExists']` | 2 / 1 | 1 / 1 |
| extension/swibh/extensions/starwarsmod_m1/md/kuertee_emergent_missions.xml | add | `/mdscript/cues/cue[@name='kEMissions']/cues/cue[@name='Missions_Hunts']/cues/cue[@name='Mission_Hunt']/cues/cue[@name='Mission_Hunt_Resolve']/actions/reset_cue[@cue='this']` | 1 / 1 | 1 / 1 |
| extension/swibh/extensions/starwarsmod_m1/md/kuertee_emergent_missions.xml | add | `/mdscript/cues/cue[@name='kEMissions']/cues/cue[@name='Missions_Hunts']/cues/cue[@name='Mission_Hunt']/cues/cue[@name='Mission_Hunt_CleanUp']/actions` | 1 / 1 | 1 / 1 |
| tests/game/swibh_trials/libraries/loadouts.xml | add | `//loadouts` | 1 / n/a | not an MD diff |
| tests/game/swibh_trials/libraries/gamestarts.xml | add | `/gamestarts` | 1 / n/a | not an MD diff |
| tests/game/swibh_tests/libraries/gamestarts.xml | add | `/gamestarts` | 1 / n/a | not an MD diff |
| tests/game/swibh_tests/extensions/starwarsmod_m1/md/kuertee_emergent_missions.xml | add | `/mdscript/cues/cue[@name='kEMissions']/actions` | 1 / 1 | 1 / 1 |
| tests/game/swibh_tests/extensions/starwarsmod_m1/md/kuertee_emergent_missions.xml | add | `/mdscript/cues/cue[@name='kEMissions']/cues/library[@name='CapRewardBasedOnMissionTarget']/actions/return` | 1 / 1 | 1 / 1 |

All sels parse; malformed sels (`/a/b[@x='y'`, `/a/b[`, `///a`) throw "XPath parse error".

**Semantic difference (important):** ElementTree's `[n]` is not XPath's. ET's `tag[@a='v'][2]` keeps elements that match
`@a='v'` AND are the 2nd `tag` child of their parent; XPath's means the 2nd of the `tag[@a='v']` matches. On
`<r><x v="b"/><x v="a"/><x v="b"/><x v="a"/></r>`:

    /r/x[@v='a'][2]: xpath 1 (child #4) ; ET 1
    /r/x[2][@v='a']: xpath 1 (child #2) ; ET 1
    /r/x[@v='b'][2]: xpath 1 (child #3) ; ET 0
    //x: xpath 4 (child #1,2,3,4) ; ET 4
    /r/x[@v='a'][3]: xpath 0 (child #) ; ET 0

X4's diff patching uses XPath (RFC 5261) semantics, so `xpath` matches the game and the Python check can miscount. In
`tiny_md.xml`, the `do_else[2]/do_if[@value='$Result == $Result_success'][2]/...` sel matches 2 nodes by XPath and 1 by
ET (ET picked the wrong do_if). In the real SWI target the two agree only because the 2nd do_if child also happens to
be the 2nd `$Result_success` match (lines 5671, 5684; `probeC2.ts`). The TS port with `xpath` is more correct here
and also handles `//` (the Python check rejects it).

## D. All repo XML through the recommended parsers

| file | minidom | saxes | xmldom strict |
|---|---|---|---|
| extension/swibh/content.xml | accept | accept | accept |
| extension/swibh/extensions/starwarsmod_m1/md/kuertee_emergent_missions.xml | accept | accept | accept |
| extension/swibh/md/swibh_engagement.xml | accept | accept | accept |
| extension/swibh/md/swibh_hunt.xml | accept | accept | accept |
| extension/swibh/md/swibh_log.xml | accept | accept | accept |
| tests/game/swibh_tests/content.xml | accept | accept | accept |
| tests/game/swibh_tests/extensions/starwarsmod_m1/md/kuertee_emergent_missions.xml | accept | accept | accept |
| tests/game/swibh_tests/libraries/gamestarts.xml | accept | accept | accept |
| tests/game/swibh_tests/md/swibh_hooks.xml | accept | accept | accept |
| tests/game/swibh_tests/md/swibh_tests.xml | accept | accept | accept |
| tests/game/swibh_tests/ui.xml | accept | accept | accept |
| tests/game/swibh_trials/content.xml | accept | accept | accept |
| tests/game/swibh_trials/libraries/gamestarts.xml | accept | accept | accept |
| tests/game/swibh_trials/libraries/loadouts.xml | accept | accept | accept |
| tests/game/swibh_trials/md/swibh_trials.xml | accept | accept | accept |

All 15 files accepted by minidom, saxes and strict xmldom.

## Recommendation

- **Well-formedness gate:** `TextDecoder('utf-8', { fatal: true })` then saxes (`xmlns: true`, throw in `on('error')`).
  Matches expat on every case tested except internal-DTD entities (saxes stricter; unused in X4).
- **DOM + sel counting:** @xmldom/xmldom 0.9.12 with `onError: onWarningStopParsing` (or a throwing `onError`), and
  `xpath` for `sel`. Run saxes first on the same string, since xmldom alone accepts bare `&`, `&#0;`, `]]>`, control
  chars and duplicate namespaced attributes.
- Alternative with fewer deps: saxes alone, building a small element tree from its events, and a hand-written
  evaluator for the sel subset in use (`/a/b[@x='y'][n]`, leading `//`). That's more code to keep correct than `xpath`.
- Skip fast-xml-parser.
- Pin exact versions; xpath 0.0.36 is 13 days old (0.0.35 is the previous release, if an older pin is wanted).
