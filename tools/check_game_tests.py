#!/usr/bin/env python3
"""Offline checks for the in-game test extension (tests/game/swibh_tests) and the swibh extension
(extension/swibh), no game needed. Checks 1, 3 and 4 cover both; check 2 is the test extension's.

1. Every XML file is well-formed by a strict parser (X4 skips a file it can't parse).
2. Every test named in md/swibh_tests.xml's $Tests is a cue, and every root test cue is listed.
3. Every macro, faction and ware the extension names exists in X4 8.00 or SWI 0.90:
   - macros: a "<name>.xml" file in a catalog (.cat) of the install or one of its extensions, a
     <macro name="..."> in a catalog's maps/ files, or one in the unpacked game's libraries
     (character macros); ship macros also print their class;
   - factions and wares: an id in the unpacked game's or SWI's libraries/factions.xml, wares.xml.
4. Every MD diff (an md/*.xml with a <diff> root) targets a script that exists, and each sel matches
   exactly one node there (X4 skips an operation whose sel matches nothing). X4 patches by path:
   md/<name> patches the game's md/<name>; extensions/<folder>/md/<name> patches that extension's
   (starwarsmod_m1 is SWI, unpacked at SWI_UNPACKED/ext02, then /ext for 0.90; a DLC folder sits next
   to X4_UNPACKED).

Reads the game's and SWI's files as data only. Paths come from test.config (or the environment):
X4_PATH (the 8.00 install), X4_UNPACKED (unpacked vanilla 8.00, the folder with libraries/md.xsd;
DLC folders next to it are read too), SWI_UNPACKED (SWI's unpacked reference, with ext/libraries).
Each part is skipped with a note when its path isn't available.

  python3 -I tools/check_game_tests.py              # run the checks
  python3 -I tools/check_game_tests.py --get KEY    # print a test.config value as a WSL path
"""
import glob
import os
import re
import subprocess
import sys
import xml.dom.minidom
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTENSION = os.path.join(ROOT, 'tests', 'game', 'swibh_tests')
MD_FILE = os.path.join(EXTENSION, 'md', 'swibh_tests.xml')
EXTENSIONS = [EXTENSION, os.path.join(ROOT, 'extension', 'swibh'), os.path.join(ROOT, 'tests', 'game', 'swibh_trials')]

# Names that look like references but aren't ids to look up
FACTION_KEYWORDS = {'player', 'ownerless'}
MAX_MAP_FILE = 4 * 1024 * 1024


def config_value(key):
    """A KEY="value" setting from the environment or test.config, as a WSL path ('' if unset)."""
    value = os.environ.get(key, '')
    if not value:
        path = os.path.join(ROOT, 'test.config')
        if os.path.exists(path):
            with open(path, encoding='utf-8') as f:
                for line in f:
                    m = re.match(r'^\s*' + re.escape(key) + r'\s*=\s*(.*)$', line)
                    if m:
                        value = m.group(1).strip().strip('"').strip("'")
    m = re.match(r'^([A-Za-z]):[\\/](.*)$', value)
    if m:
        value = '/mnt/%s/%s' % (m.group(1).lower(), m.group(2).replace('\\', '/'))
    return value


def windows_path(path):
    """A WSL path as Windows sees it (wslpath -w), for the PowerShell checks."""
    return subprocess.run(['wslpath', '-w', path], check=True, capture_output=True, text=True).stdout.strip()


def extension_files(pattern):
    """(extension folder, file) for each file matching pattern in either extension."""
    return [(ext, f) for ext in EXTENSIONS for f in sorted(glob.glob(os.path.join(ext, '**', pattern), recursive=True))]


def check_well_formed():
    bad = []
    files = extension_files('*.xml')
    for _, f in files:
        try:
            xml.dom.minidom.parse(f)
        except Exception as e:  # any parse error fails the file
            bad.append('%s: %s' % (os.path.relpath(f, ROOT), e))
    return ['%d XML files well-formed' % len(files)], bad


def check_test_list():
    doc = xml.dom.minidom.parse(MD_FILE)
    cues = doc.getElementsByTagName('cues')[0]
    roots = [n.getAttribute('name') for n in cues.childNodes if n.nodeType == n.ELEMENT_NODE and n.tagName == 'cue']
    tests = None
    for node in doc.getElementsByTagName('set_value'):
        if node.getAttribute('name') == '$Tests':
            tests = [t.strip() for t in node.getAttribute('exact').strip('[]').split(',') if t.strip()]
    if tests is None:
        return [], ['md/swibh_tests.xml: no $Tests list']
    bad = ['$Tests names %s, which is not a root cue' % t for t in tests if t not in roots]
    bad += ['root cue %s is not in $Tests' % c for c in roots if c not in tests and c != 'Run']
    return ['%d tests listed: %s' % (len(tests), ', '.join(tests))], bad


def references():
    """Macros, factions and wares the extension names, each with where it's named."""
    found = {'macro': {}, 'faction': {}, 'ware': {}, 'loadout': {}}
    for _, f in extension_files('*.xml'):
        rel = os.path.relpath(f, ROOT)
        with open(f, encoding='utf-8') as fh:
            text = re.sub(r'<!--.*?-->', '', fh.read(), flags=re.S)
        # (?<![$.\w]) skips a variable or property such as $faction.id or $x.ware.id
        for kind, patterns in (
            ('macro', [r'\bmacro="([a-z0-9_]+_macro)"', r'\b(?:galaxy|sector|zone)="([a-z0-9_]+_macro)"', r'\bmacro\.([a-z0-9_]+_macro)\b']),
            ('faction', [r'(?<![$.\w])faction\.([a-z0-9_]+)\b', r'\bfaction="([a-z0-9_]+)"']),
            ('ware', [r'(?<![$.\w])ware\.([a-z0-9_]+)\b', r'\bware="([a-z0-9_]+)"']),
            ('loadout', [r'<loadout ref="([A-Za-z0-9_]+)"']),
        ):
            for pattern in patterns:
                for name in re.findall(pattern, text):
                    if kind == 'faction' and name in FACTION_KEYWORDS:
                        continue
                    found[kind].setdefault(name, set()).add(rel)
    return found


def catalogs(install):
    cats = sorted(glob.glob(os.path.join(install, '[0-9][0-9].cat')))
    cats += sorted(glob.glob(os.path.join(install, 'extensions', '*', '*.cat')))
    return [c for c in cats if not c.endswith('_sig.cat')]


def read_catalog(cat):
    """(path, offset, size) for each entry of a .cat."""
    entries = []
    offset = 0
    with open(cat, encoding='utf-8', errors='replace') as f:
        for line in f:
            parts = line.rstrip('\n').rsplit(' ', 3)
            if len(parts) != 4:
                continue
            size = int(parts[1])
            entries.append((parts[0], offset, size))
            offset += size
    return entries


def read_entry(cat, offset, size):
    with open(cat[:-4] + '.dat', 'rb') as f:
        f.seek(offset)
        return f.read(size).decode('utf-8', errors='replace')


def where(cat, install):
    return os.path.relpath(cat, install)


def check_macros(names, install, unpacked):
    notes, bad = [], []
    if not install or not os.path.isdir(install):
        return ['macros not checked: X4_PATH not found'], []
    wanted = set(names)
    hits = {}
    for cat in catalogs(install):
        for path, offset, size in read_catalog(cat):
            base = os.path.basename(path)
            if base.endswith('.xml') and base[:-4] in wanted and '/macros/' in path:
                text = read_entry(cat, offset, size)
                m = re.search(r'<macro name="%s" class="([a-z_]+)"' % re.escape(base[:-4]), text)
                hits[base[:-4]] = '%s, %s' % (m.group(1) if m else 'class unknown', where(cat, install))
            elif path.startswith('maps/') and path.endswith('.xml') and size <= MAX_MAP_FILE:
                text = read_entry(cat, offset, size)
                for name in wanted - set(hits):
                    m = re.search(r'<macro name="%s" class="([a-z_]+)"' % re.escape(name), text)
                    if m:
                        hits[name] = '%s, %s %s' % (m.group(1), where(cat, install), path)
    if unpacked and os.path.isdir(unpacked):
        for lib in glob.glob(os.path.join(os.path.dirname(unpacked), '*', 'libraries', '*.xml')):
            with open(lib, encoding='utf-8', errors='replace') as f:
                text = f.read()
            for name in wanted - set(hits):
                m = re.search(r'<macro name="%s" class="([a-z_]+)"' % re.escape(name), text)
                if m:
                    hits[name] = '%s, %s' % (m.group(1), os.path.relpath(lib, os.path.dirname(unpacked)))
    for name in sorted(wanted):
        if name in hits:
            notes.append('macro %s: %s' % (name, hits[name]))
        else:
            bad.append('macro %s (in %s) not found in the install or the unpacked libraries' % (name, ', '.join(sorted(names[name]))))
    return notes, bad


def library_ids(dirs, filename, element):
    ids = {}
    for d in dirs:
        for lib in glob.glob(os.path.join(d, filename)):
            with open(lib, encoding='utf-8', errors='replace') as f:
                for name in re.findall(r'<%s id="([^"]+)"' % element, f.read()):
                    ids.setdefault(name, lib)
    return ids


SWI_FOLDER = 'starwarsmod_m1'


def swi_ext_dirs(swi):
    """SWI's unpacked catalogs, the one X4 loads last first: 0.91 moved its scripts and
    libraries from ext_01 (ext/) to ext_02 (ext02/), and a later catalog overrides an earlier one."""
    return [d for d in (os.path.join(swi, 'ext02'), os.path.join(swi, 'ext')) if os.path.isdir(d)] if swi else []


def md_diff_target(rel, unpacked, swi):
    """The unpacked MD script the diff at <rel> (relative to the extension) patches, or None.
    An MD diff in our own md/ only reaches the game's scripts: 8.00 loads a diff named after
    another extension's script as a new script and ignores its <diff> root (T12, 2026-11-02)."""
    parts = rel.replace(os.sep, '/').split('/')
    if len(parts) == 2 and unpacked:
        bases = [unpacked]
    elif len(parts) == 4 and parts[0] == 'extensions':
        if parts[1] == SWI_FOLDER:
            bases = swi_ext_dirs(swi)
        else:
            bases = [os.path.join(os.path.dirname(unpacked), parts[1])] if unpacked else []
    else:
        return None
    paths = [os.path.join(b, 'md', parts[-1]) for b in bases]
    return next((p for p in paths if os.path.exists(p)), None)


def check_md_diffs(unpacked, swi):
    notes, bad = [], []
    for ext, f in extension_files('*.xml'):
        if os.path.basename(os.path.dirname(f)) != 'md':
            continue
        diff = ET.parse(f).getroot()
        if diff.tag != 'diff':
            continue
        target = md_diff_target(os.path.relpath(f, ext), unpacked, swi)
        rel = os.path.relpath(f, ROOT)
        if not target:
            if swi or unpacked:
                bad.append('%s: no script at this path to patch (an MD diff in md/ only patches the game\'s own scripts; '
                           'another extension\'s goes in extensions/<its folder>/md/)' % rel)
            else:
                notes.append('%s not checked: SWI_UNPACKED and X4_UNPACKED not found' % rel)
            continue
        root = ET.parse(target).getroot()
        for op in diff:
            sel = op.get('sel', '')
            # ElementTree's XPath subset, from the root: /<roottag>/a/b[@x='y'] -> a/b[@x='y']
            m = re.match(r'^/([A-Za-z_][\w.-]*)/(.+)$', sel)
            if not m or m.group(1) != root.tag or re.search(r'/@|\(\)|//', m.group(2)):
                bad.append('%s: <%s sel="%s">: not a simple element path this check can follow' % (rel, op.tag, sel))
                continue
            count = len(root.findall(m.group(2)))
            line = '%s: <%s sel="%s"> matches %d node%s in %s' % (rel, op.tag, sel, count, '' if count == 1 else 's', target)
            (notes if count == 1 else bad).append(line)
    return notes, bad


def check_ids(kind, names, unpacked, swi):
    dirs = []
    if unpacked and os.path.isdir(unpacked):
        dirs += glob.glob(os.path.join(os.path.dirname(unpacked), '*', 'libraries'))
    dirs += [os.path.join(d, 'libraries') for d in swi_ext_dirs(swi) if os.path.isdir(os.path.join(d, 'libraries'))]
    if not dirs:
        return ['%ss not checked: X4_UNPACKED and SWI_UNPACKED not found' % kind], []
    # Our extensions' own libraries (the trials' loadouts) count too
    dirs += [os.path.join(ext, 'libraries') for ext in EXTENSIONS if os.path.isdir(os.path.join(ext, 'libraries'))]
    ids = library_ids(dirs, kind + 's.xml', kind)
    notes, bad = [], []
    for name in sorted(names):
        if name in ids:
            notes.append('%s %s: %s' % (kind, name, ids[name].split('/')[-3] + '/libraries/' + os.path.basename(ids[name])))
        else:
            bad.append('%s %s (in %s) not found in %ss.xml' % (kind, name, ', '.join(sorted(names[name])), kind))
    return notes, bad


def main(argv):
    if len(argv) == 3 and argv[1] == '--get':
        value = config_value(argv[2])
        print(value)
        return 0 if value else 1
    if len(argv) == 3 and argv[1] == '--get-windows':
        value = config_value(argv[2])
        print(windows_path(value) if value else '')
        return 0 if value else 1
    install, unpacked, swi = config_value('X4_PATH'), config_value('X4_UNPACKED'), config_value('SWI_UNPACKED')
    refs = references()
    failed = False
    for title, (notes, bad) in (
        ('Well-formed XML', check_well_formed()),
        ('Test list', check_test_list()),
        ('Macros', check_macros(refs['macro'], install, unpacked)),
        ('Factions', check_ids('faction', refs['faction'], unpacked, swi)),
        ('Wares', check_ids('ware', refs['ware'], unpacked, swi)),
        ('Loadouts', check_ids('loadout', refs['loadout'], unpacked, swi)),
        ('MD diffs', check_md_diffs(unpacked, swi)),
    ):
        print('%s: %s' % (title, 'FAIL' if bad else 'ok'))
        for line in notes:
            print('  ' + line)
        for line in bad:
            print('  FAIL ' + line)
        failed = failed or bool(bad)
    print('Offline checks %s' % ('FAILED' if failed else 'passed'))
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
