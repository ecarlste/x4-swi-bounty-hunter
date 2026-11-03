<#
.SYNOPSIS
    Runs the in-game tests: plays scripted scenarios in the real game (X4 8.00 + SWI) and reports
    PASS/FAIL.

.DESCRIPTION
    1. Checks the test profile (Documents\Egosoft\X4\<X4_PROFILE_ID>\) has SWI switched on in its
       content.xml (SWI's own content.xml says enabled="0", so a new profile starts with it off).
       -PrepareProfile creates the folder from the root profile's content.xml and config.xml and
       switches SWI on.
    2. Installs the dev-only test extension (tests/game/swibh_tests) into the game's extensions
       folder.
    3. Starts the NoSteam executable directly (X4_nonsteam.exe, no Steam involved) with
       -skipintro -debug all -logfile debuglog.txt -scriptlogfiles -personalfolderid <id>.
       The test extension starts its own gamestart from the main menu, runs every test, logs
       "[swibh-test] ..." lines to debuglog.txt and quits the game.
    4. Watches the profile's debuglog.txt until the run finishes, the game exits, or the timeout
       passes (the game is then closed).
    5. Removes the test extension, prints a summary and writes a JUnit report
       (tests/game/results.xml) and a Markdown report (tests/game/report.md).

    The previous debuglog.txt is kept as debuglog.previous.txt. Exits 1 if any test failed, the
    run didn't finish, or the log has errors from the test extension.

    Settings come from the parameters, else environment variables of the same name, else
    test.config (copy test.config.example): X4_PATH, X4_EXE, X4_PROFILE_ID, X4_PROFILE_ROOT.

.PARAMETER X4Path
    The X4 8.00 install folder (X4_PATH).

.PARAMETER ProfileId
    The numeric -personalfolderid of the test profile (X4_PROFILE_ID). Only a numeric ID gives a
    separate profile; anything else falls back to the root profile, the real playthrough's.

.PARAMETER LogPath
    The debuglog.txt the game writes. Default <profile>\debuglog.txt.

.PARAMETER TimeoutSeconds
    How long a whole run may take, including the game loading SWI. Default 1200.

.PARAMETER ReportPath
    Where to write the JUnit report. Default tests/game/results.xml.

.PARAMETER MarkdownPath
    Where to write the Markdown report. Default tests/game/report.md.

.PARAMETER GameExe
    Start this executable instead of <X4Path>\<X4_EXE>; for trying the runner with a fake game.

.PARAMETER PrepareProfile
    Create the test profile if needed, copy the root profile's content.xml (extension on/off) and
    config.xml (graphics) into it if it has none, then switch SWI and the test extension on in its
    content.xml. Only reads the root profile, never changes it.

.PARAMETER KeepExtension
    Leave the test extension installed afterwards (X4 then starts the tests on every launch, in
    every profile where SWI is on).

.PARAMETER Manual
    T12's existing-save half: install the test extension without its autostart, start X4 in the
    test profile and wait for you to load an older save (one made without the extension), let it run a few seconds, and quit. Then prints the "[swibh]" lines and whether EM's
    patched library ran after the load. Writes no reports.

.EXAMPLE
    .\tools\run-game-tests.ps1 -PrepareProfile

.EXAMPLE
    .\tools\run-game-tests.ps1 -Manual
#>
[CmdletBinding()]
param(
    [string] $X4Path,
    [string] $ProfileId,
    [string] $LogPath,
    [int] $TimeoutSeconds = 1200,
    [string] $ReportPath,
    [string] $MarkdownPath,
    [string] $GameExe,
    [int] $LaunchTimeoutSeconds = 60,
    [double] $PollSeconds = 2,
    [switch] $PrepareProfile,
    [switch] $KeepExtension,
    [switch] $Manual
)

$ErrorActionPreference = 'Stop'

$TestExtensionId = 'swibh_tests'
$SwiId = 'SW Interworlds'
$SwiFolder = 'starwarsmod_m1'
$Marker = '[swibh-test]'

# Parses debuglog.txt lines into the run's results. Errors are lines that mention the test
# extension and an error, apart from our own markers and the harmless "unsigned file" warnings.
# Errors that name EM's cap library are collected separately: they are T01's data, not harness bugs.
function Read-GameTestLog([string[]] $Lines) {
    $run = [pscustomobject]@{ Started = $false; Expected = 0; Done = $false; Results = @(); Info = @(); Verdicts = @(); Hooks = @(); Errors = @(); CapErrors = @(); GameVersion = ''; MenuReady = $false; Autostarted = $false }
    $results = New-Object System.Collections.ArrayList
    $info = New-Object System.Collections.ArrayList
    $verdicts = New-Object System.Collections.ArrayList
    $errors = New-Object System.Collections.ArrayList
    $capErrors = New-Object System.Collections.ArrayList
    $hooks = New-Object System.Collections.ArrayList
    $lastError = ''
    foreach ($line in $Lines) {
        # X4 follows each script error with "* Expression: ..." and "* Action: ..." lines, which
        # can quote our markers; only the error's own line counts
        if ($line -like '`* *') {
            if ($lastError -eq 'cap') { [void] $capErrors.Add($line.Trim()) }
            continue
        }
        $lastError = ''
        if ($line -match '\[swibh-test\] autostart: starting gamestart') {
            $run.MenuReady = $true
            $run.Autostarted = $true
        }
        elseif ($line -match 'Game initialisation time until start menu') {
            $run.MenuReady = $true
        }
        elseif ($line -match "Starting new game using gamestart '[^']*' in (\S+) \((\d+)\)") {
            $run.GameVersion = "$($Matches[1]) ($($Matches[2]))"
        }
        elseif ($line -match '\[swibh-test\] RUN START (\d+)') {
            $run.Started = $true
            $run.Expected = [int] $Matches[1]
        }
        elseif ($line -match '\[swibh-test\] (PASS|FAIL) ([^:\s]+):? ?(.*)$') {
            [void] $results.Add([pscustomobject]@{ Name = $Matches[2]; Passed = ($Matches[1] -eq 'PASS'); Detail = $Matches[3].Trim() })
        }
        elseif ($line -match '\[swibh-test\] INFO ([^:\s]+):? ?(.*)$') {
            [void] $info.Add([pscustomobject]@{ Name = $Matches[1]; Text = $Matches[2].Trim() })
        }
        elseif ($line -match '\[swibh-test\] VERDICT ([^:\s]+):? ?(.*)$') {
            [void] $verdicts.Add([pscustomobject]@{ Name = $Matches[1]; Text = $Matches[2].Trim() })
        }
        elseif ($line -match '\[swibh-test\] HOOK (.*)$') {
            # Lines from the test extension's hooks outside its own tests: the diff on EM (H12) and
            # md/swibh_hooks.xml (H13). Get-T12Result and Get-ExistingSaveResult judge them
            $text = $Matches[1].Trim()
            [void] $hooks.Add($text)
            [void] $info.Add([pscustomobject]@{ Name = 'hook'; Text = $text })
        }
        elseif ($line -match '\[swibh-test\] DONE' -and $run.Started) {
            $run.Done = $true
        }
        elseif ($line -match 'CapRewardBasedOnMissionTarget' -and $line -match '(?i)error') {
            [void] $capErrors.Add($line.Trim())
            $lastError = 'cap'
        }
        elseif ($line -match '(?i)swibh' -and $line -match '(?i)error' -and
                $line -notmatch '\[swibh-test\]' -and $line -notmatch '(?i)signature') {
            [void] $errors.Add($line.Trim())
        }
    }
    $run.Results = @($results)
    $run.Info = @($info)
    $run.Verdicts = @($verdicts)
    $run.Hooks = @($hooks)
    $run.Errors = @($errors)
    $run.CapErrors = @($capErrors)
    $run
}

# Every way a run can fail, as messages; empty means it passed
function Get-RunProblems($Run, [string] $Ending) {
    $problems = @()
    if (-not $Run.Started) {
        $hint = if (-not $Run.MenuReady) { 'the main menu never appeared' }
                elseif (-not $Run.Autostarted) { 'the autostart never ran: is SWI on in the test profile''s content.xml, and the test extension loaded?' }
                else { 'the test gamestart never reached RUN START' }
        $problems += "the tests never started ($Ending; $hint)"
    }
    elseif (-not $Run.Done) { $problems += "the run didn't finish ($Ending)" }
    if ($Run.Started -and $Run.Results.Count -lt $Run.Expected) {
        $problems += "$($Run.Results.Count) of $($Run.Expected) tests reported"
    }
    $failed = @($Run.Results | Where-Object { -not $_.Passed })
    if ($failed.Count) { $problems += "$($failed.Count) failed: $(($failed | ForEach-Object { $_.Name }) -join ', ')" }
    if ($Run.Errors.Count) { $problems += "$($Run.Errors.Count) errors from the test extension in debuglog.txt" }
    $problems
}

# T12 on a new game, judged by the runner rather than MD: our diff on SWI's
# md/kuertee_emergent_missions.xml applied if both its lines ran (kEMissions at game start, the cap
# library in the T01 tests) and no error names the file. Call it once the run is done
function Get-T12Result($Run) {
    $missing = @()
    if (-not @($Run.Hooks | Where-Object { $_ -like 'T12 kEMissions*' }).Count) { $missing += 'no HOOK T12 kEMissions line' }
    if (-not @($Run.Hooks | Where-Object { $_ -like 'T12 CapRewardBasedOnMissionTarget*' }).Count) { $missing += 'no HOOK T12 CapRewardBasedOnMissionTarget line' }
    $patchErrors = @($Run.Errors | Where-Object { $_ -match 'kuertee_emergent_missions' })
    if ($patchErrors.Count) { $missing += "$($patchErrors.Count) errors naming kuertee_emergent_missions" }
    $h13 = @($Run.Hooks | Where-Object { $_ -like 'H13 *' }) | Select-Object -First 1
    $detail = if ($missing.Count) { $missing -join '; ' } else { 'the diff on EM ran in kEMissions and CapRewardBasedOnMissionTarget' }
    [pscustomobject]@{ Name = 't12_diff_patch'; Passed = (-not $missing.Count); Detail = "$detail; H13: $(if ($h13) { $h13 } else { 'no line' })" }
}

# -Manual's verdict (T12's existing-save half): after an older save loaded (H13's
# event_game_loaded line), EM's patched cap library ran (the hook calls it), so our diff applies to
# a loaded save. Also says whether event_universe_generated fired, H13's own question
function Get-ExistingSaveResult($Run) {
    $lines = @($Run.Hooks)
    $loadAt = -1
    for ($i = 0; $i -lt $lines.Count; $i++) { if ($lines[$i] -like 'H13 event_game_loaded*') { $loadAt = $i; break } }
    $universe = if (@($lines | Where-Object { $_ -like 'H13 event_universe_generated*' }).Count) { 'event_universe_generated fired' } else { 'event_universe_generated did not fire' }
    if ($loadAt -lt 0) {
        return [pscustomobject]@{ Passed = $false; Detail = "no save was loaded (no HOOK H13 event_game_loaded line); $universe" }
    }
    $patched = @($lines[$loadAt..($lines.Count - 1)] | Where-Object { $_ -like 'T12 CapRewardBasedOnMissionTarget*' }).Count -gt 0
    $detail = if ($patched) { 'the patched EM cap library ran after the save loaded: the diff applies to an existing save' }
              else { 'a save loaded, but no HOOK T12 CapRewardBasedOnMissionTarget line followed (no ship found, or the diff did not apply)' }
    [pscustomobject]@{ Passed = $patched; Detail = "$detail; $universe" }
}

function ConvertTo-JUnitXml($Run, [string[]] $Problems) {
    $esc = { param($s) [Security.SecurityElement]::Escape([string] $s) }
    $cases = @()
    foreach ($r in $Run.Results) {
        $body = if ($r.Passed) { '' } else { "<failure message=`"$(& $esc $r.Detail)`"/>" }
        $cases += "    <testcase classname=`"game`" name=`"$(& $esc $r.Name)`">$body</testcase>"
    }
    # The run itself is a test case too, so an unfinished run or log errors show up as failures
    $runProblems = @($Problems | Where-Object { $_ -notmatch '^\d+ failed: ' })
    $body = ''
    if ($runProblems.Count) {
        $details = (@($runProblems) + @($Run.Errors)) -join "`n"
        $body = "<failure message=`"$(& $esc ($runProblems -join '; '))`">$(& $esc $details)</failure>"
    }
    $cases += "    <testcase classname=`"game`" name=`"run`">$body</testcase>"
    $failures = @($Run.Results | Where-Object { -not $_.Passed }).Count + [int] [bool] $runProblems.Count
    @(
        '<?xml version="1.0" encoding="utf-8"?>'
        "<testsuite name=`"x4-swibh-game-tests`" tests=`"$($cases.Count)`" failures=`"$failures`">"
        $cases
        '</testsuite>'
    ) -join "`n"
}

# The Markdown report. $Info: ProfileId, Extensions (enabled in the test profile), StartedAt
# (datetime), DurationSeconds, and optionally Phases (from Get-RunPhases).
function ConvertTo-MarkdownReport($Run, [string[]] $Problems, $Info) {
    $passed = @($Run.Results | Where-Object { $_.Passed }).Count
    $total = [Math]::Max($Run.Expected, $Run.Results.Count)
    $ok = -not @($Problems | Where-Object { $_ }).Count  # PowerShell 7 binds no problems as $null, not an empty array
    $minutes = [int] [Math]::Floor($Info.DurationSeconds / 60)
    $seconds = [int] $Info.DurationSeconds % 60
    $esc = { param($s) ([string] $s) -replace '\|', '\|' }
    $extensions = if ($Info.Extensions) { (@($Info.Extensions) | ForEach-Object { '`' + $_ + '`' }) -join ', ' } else { 'unknown' }
    $lines = @(
        "### Game tests: $(if ($ok) { 'passed' } else { 'FAILED' }), $passed of $total"
        ''
        "X4 $(if ($Run.GameVersion) { $Run.GameVersion } else { 'version unknown' }), profile $($Info.ProfileId), ${minutes} min ${seconds} s, $($Info.StartedAt.ToString('yyyy-MM-dd HH:mm'))"
        ''
        "Extensions on in the test profile: $extensions"
        ''
        '| Test | Result | Detail |'
        '| --- | --- | --- |'
    )
    foreach ($r in $Run.Results) {
        $lines += "| ``$($r.Name)`` | $(if ($r.Passed) { 'PASS' } else { '**FAIL**' }) | $(& $esc $r.Detail) |"
    }
    if ($Run.Verdicts.Count) {
        $lines += ''
        $lines += '**Verdicts:**'
        $lines += ''
        $lines += @($Run.Verdicts | ForEach-Object { "- ``$($_.Name)``: $($_.Text)" })
    }
    if ($Run.Info.Count) {
        $lines += ''
        $lines += '**Measured:**'
        $lines += ''
        $lines += @($Run.Info | ForEach-Object { "- ``$($_.Name)``: $($_.Text)" })
    }
    if ($Info.Phases) {
        $lines += ''
        $lines += '| Phase | Time |'
        $lines += '| --- | --- |'
        foreach ($phase in $Info.Phases) { $lines += "| $($phase.Name) | $(Format-Seconds $phase.Seconds) |" }
    }
    $runProblems = @($Problems | Where-Object { $_ -notmatch '^\d+ failed: ' })
    if ($runProblems.Count) {
        $lines += ''
        $lines += '**Run problems:**'
        $lines += ''
        $lines += @($runProblems | ForEach-Object { "- $_" })
    }
    if ($Run.Errors.Count) {
        $lines += ''
        $lines += '**Errors from the test extension in `debuglog.txt`:**'
        $lines += ''
        $lines += '```'
        $lines += $Run.Errors
        $lines += '```'
    }
    if ($Run.CapErrors.Count) {
        $lines += ''
        $lines += '**Errors in EM''s `CapRewardBasedOnMissionTarget` (T01 data, not a harness failure):**'
        $lines += ''
        $lines += '```'
        $lines += $Run.CapErrors
        $lines += '```'
    }
    $lines += ''
    $lines += '<sub>Local run of <code>make game-test</code>.</sub>'
    $lines -join "`n"
}

function Format-Seconds([double] $Seconds) {
    $total = [int] [Math]::Round($Seconds)
    if ($total -lt 60) { return "$total s" }
    "$([int] [Math]::Floor($total / 60)) min $($total % 60) s"
}

# How long each phase of a run took, from the moments the runner first saw each milestone
# ($Seen: milestone name to seconds since launch; missing ones were never reached)
function Get-RunPhases([hashtable] $Seen, [double] $TotalSeconds) {
    $steps = @(
        @{ Key = 'menu'; Name = 'X4 starts, to the main menu' }
        @{ Key = 'tests'; Name = 'Test game loads, to the first test' }
        @{ Key = 'done'; Name = 'Tests run' }
    )
    $phases = @()
    $last = 0.0
    foreach ($step in $steps) {
        if (-not $Seen.ContainsKey($step.Key)) { break }
        $phases += [pscustomobject]@{ Name = $step.Name; Seconds = $Seen[$step.Key] - $last }
        $last = $Seen[$step.Key]
    }
    $phases += [pscustomobject]@{ Name = $(if ($Seen.ContainsKey('done')) { 'X4 quits, cleanup' } else { 'Until the run ended' }); Seconds = $TotalSeconds - $last }
    $phases += [pscustomobject]@{ Name = '**Total**'; Seconds = $TotalSeconds }
    $phases
}

# A KEY="value" line from test.config ('' if the file or key is missing)
function Get-TestConfigValue([string] $Root, [string] $Key) {
    $config = Join-Path $Root 'test.config'
    if (-not (Test-Path $config)) { return '' }
    $line = Get-Content $config | Where-Object { $_ -match "^\s*$Key\s*=" } | Select-Object -Last 1
    if (-not $line) { return '' }
    ($line -replace "^\s*$Key\s*=", '').Trim().Trim('"').Trim("'")
}

# A setting from the environment, else test.config, else the default
function Resolve-Setting([string] $Root, [string] $Key, [string] $Default) {
    $value = [Environment]::GetEnvironmentVariable($Key)
    if (-not $value) { $value = Get-TestConfigValue $Root $Key }
    if (-not $value) { $value = $Default }
    $value
}

# /mnt/e/x -> E:\x, so test.config can hold either form
function ConvertFrom-WslPath([string] $Path) {
    if ($Path -match '^/mnt/([a-zA-Z])(/.*)?$') {
        return "$($Matches[1].ToUpper()):$(([string] $Matches[2]) -replace '/', '\')"
    }
    $Path
}

# The extension ids switched on in a profile's content.xml
function Get-EnabledExtensions([string] $ContentXml) {
    if (-not (Test-Path $ContentXml)) { return @() }
    [xml] $doc = Get-Content $ContentXml -Raw
    @($doc.content.extension | Where-Object { $_.enabled -eq 'true' -or $_.enabled -eq '1' } | ForEach-Object { $_.id })
}

# Switches these extensions on in a profile's content.xml (made if missing), keeping other entries
function Enable-Extensions([string] $ContentXml, [string[]] $Ids) {
    $doc = New-Object System.Xml.XmlDocument
    if (Test-Path $ContentXml) { $doc.Load($ContentXml) }
    else { $doc.LoadXml("<?xml version=`"1.0`" encoding=`"utf-8`"?>`n<content>`n</content>") }
    foreach ($id in $Ids) {
        $entry = @($doc.content.ChildNodes | Where-Object { $_.Name -eq 'extension' -and $_.id -eq $id }) | Select-Object -First 1
        if (-not $entry) {
            $entry = $doc.CreateElement('extension')
            $entry.SetAttribute('id', $id)
            [void] $doc.DocumentElement.AppendChild($entry)
        }
        $entry.SetAttribute('enabled', 'true')
    }
    $doc.Save($ContentXml)
}

# Reads the log while the game still has it open for writing
function Read-SharedFile([string] $Path) {
    if (-not (Test-Path $Path)) { return @() }
    $stream = [IO.File]::Open($Path, 'Open', 'Read', 'ReadWrite')
    try { $text = (New-Object IO.StreamReader($stream)).ReadToEnd() } finally { $stream.Dispose() }
    $text -split "`r?`n"
}

# Dot-sourced by the checks for the functions above
if ($MyInvocation.InvocationName -eq '.') { return }

$root = Split-Path $PSScriptRoot -Parent
if (-not $X4Path) { $X4Path = Resolve-Setting $root 'X4_PATH' '' }
if (-not $X4Path) { throw "X4_PATH not set: pass -X4Path, set X4_PATH, or copy test.config.example to test.config" }
$X4Path = ConvertFrom-WslPath $X4Path
$exeName = Resolve-Setting $root 'X4_EXE' 'X4_nonsteam.exe'
if (-not $ProfileId) { $ProfileId = Resolve-Setting $root 'X4_PROFILE_ID' '90000201' }
if ($ProfileId -notmatch '^\d+$') { throw "X4_PROFILE_ID must be numeric (got '$ProfileId'): X4 falls back to the root profile, the real playthrough's, for anything else" }
$profileRoot = ConvertFrom-WslPath (Resolve-Setting $root 'X4_PROFILE_ROOT' (Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'Egosoft\X4'))
$profileDir = Join-Path $profileRoot $ProfileId
if (-not $LogPath) { $LogPath = Join-Path $profileDir 'debuglog.txt' }
if (-not $ReportPath) { $ReportPath = Join-Path $root 'tests/game/results.xml' }
if (-not $MarkdownPath) { $MarkdownPath = Join-Path $root 'tests/game/report.md' }
if (-not $GameExe) { $GameExe = Join-Path $X4Path $exeName }

if (-not (Test-Path $GameExe)) { throw "$GameExe not found; check X4_PATH and X4_EXE in test.config" }
if (-not (Test-Path (Join-Path $X4Path "extensions/$SwiFolder/content.xml"))) {
    throw "SWI isn't installed in $X4Path (no extensions\$SwiFolder)"
}
$gameName = [IO.Path]::GetFileNameWithoutExtension($GameExe)
if (Get-Process -Name $gameName -ErrorAction SilentlyContinue) {
    throw "$gameName is already running; close it first"
}

# The test profile must have SWI on: the test extension depends on it, and is off without it
$contentXml = Join-Path $profileDir 'content.xml'
if ($PrepareProfile) {
    New-Item -ItemType Directory -Force -Path $profileDir | Out-Null
    # Start from the playthrough's own extension and graphics settings (root profile), read only
    foreach ($file in 'content.xml', 'config.xml') {
        $source = Join-Path $profileRoot $file
        if (-not (Test-Path (Join-Path $profileDir $file)) -and (Test-Path $source)) { Copy-Item $source $profileDir }
    }
    Enable-Extensions $contentXml @($SwiId, $TestExtensionId)
    Write-Host "Test profile $profileDir ready: $((Get-EnabledExtensions $contentXml) -join ', ') on"
}
$enabled = @(Get-EnabledExtensions $contentXml)
if ($enabled -notcontains $SwiId) {
    throw "SWI ('$SwiId') isn't switched on in $contentXml. Run with -PrepareProfile (make game-test ARGS=-PrepareProfile), or launch the profile once and switch SWI on in Extensions; see tests/game/README.md"
}
if (Test-Path $contentXml) {
    [xml] $doc = Get-Content $contentXml -Raw
    if (@($doc.content.extension | Where-Object { $_.id -eq $TestExtensionId -and ($_.enabled -eq 'false' -or $_.enabled -eq '0') }).Count) {
        throw "The test extension is switched off in $contentXml; run with -PrepareProfile or switch it on"
    }
}

$extension = Join-Path $X4Path "extensions/$TestExtensionId"
$arguments = "-skipintro -debug all -logfile debuglog.txt -scriptlogfiles -personalfolderid $ProfileId"
$startedAt = Get-Date
$game = $null
$ending = ''
$seen = @{}
try {
    if (Test-Path $extension) { Remove-Item $extension -Recurse -Force }
    Copy-Item (Join-Path $root "tests/game/$TestExtensionId") $extension -Recurse
    # The swibh extension's MD (log libraries, engagements) rides along in the test extension, so
    # its tests run against it without installing swibh itself; MD scripts go by name, not folder
    Copy-Item (Join-Path $root 'extension/swibh/md/*.xml') (Join-Path $extension 'md')
    if ($Manual) {
        # Without the autostart the main menu stays, so a save can be loaded
        Remove-Item (Join-Path $extension 'ui.xml'), (Join-Path $extension 'ui') -Recurse -Force
    }
    # A stale log would report the previous run; keep it out of the way instead
    if (Test-Path $LogPath) { Move-Item $LogPath (Join-Path (Split-Path $LogPath -Parent) 'debuglog.previous.txt') -Force }

    Write-Host "Starting $GameExe $arguments; results go to $LogPath"
    $game = Start-Process -FilePath $GameExe -ArgumentList $arguments -WorkingDirectory $X4Path -PassThru
    if ($Manual) {
        Write-Host "Open Load Game, load a save made without the test extension, wait until it has loaded, then quit X4."
        Write-Host "Saves are read from $profileDir\save: copy one in first if the test profile has none."
        $game.WaitForExit()
        $ending = 'manual'
    }
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $launchDeadline = (Get-Date).AddSeconds($LaunchTimeoutSeconds)
    $reported = 0
    while (-not $Manual) {
        Start-Sleep -Milliseconds ([int] ($PollSeconds * 1000))
        $run = Read-GameTestLog (Read-SharedFile $LogPath)
        for ($i = $reported; $i -lt $run.Results.Count; $i++) {
            $r = $run.Results[$i]
            Write-Host ("  {0} {1}: {2}" -f $(if ($r.Passed) { 'PASS' } else { 'FAIL' }), $r.Name, $r.Detail)
        }
        $reported = $run.Results.Count
        $now = ((Get-Date) - $startedAt).TotalSeconds
        if ($run.MenuReady -and -not $seen.ContainsKey('menu')) { $seen.menu = $now }
        if ($run.Started -and -not $seen.ContainsKey('tests')) { $seen.tests = $now }
        if ($run.Done -and -not $seen.ContainsKey('done')) { $seen.done = $now }
        if ($run.Done) { $ending = 'finished'; break }
        if ($game.HasExited) { $ending = 'the game exited early'; break }
        if (-not (Test-Path $LogPath) -and (Get-Date) -gt $launchDeadline) {
            $ending = "no $LogPath within $LaunchTimeoutSeconds s (did -personalfolderid $ProfileId take?)"
            break
        }
        if ((Get-Date) -gt $deadline) { $ending = "timed out after $TimeoutSeconds s"; break }
    }
    # The tests quit the game themselves; give it a moment, then close it
    if (-not $game.HasExited -and ($ending -ne 'finished' -or -not $game.WaitForExit(30000))) {
        Write-Host "Closing the game"
        Stop-Process -Id $game.Id -Force -ErrorAction SilentlyContinue
    }
}
finally {
    if ($game -and -not $game.HasExited) { Stop-Process -Id $game.Id -Force -ErrorAction SilentlyContinue }
    if (-not $KeepExtension -and (Test-Path $extension)) {
        # The game may still hold files for a moment after exiting
        for ($i = 0; $i -lt 10 -and (Test-Path $extension); $i++) {
            try { Remove-Item $extension -Recurse -Force } catch { Start-Sleep -Seconds 1 }
        }
    }
}

$run = Read-GameTestLog (Read-SharedFile $LogPath)
# A copy for the log checks that make game-test runs next (tools/log/game-check.ts)
if (Test-Path $LogPath) { Copy-Item $LogPath (Join-Path $root 'tests/game/debuglog.txt') -Force }
if ($Manual) {
    foreach ($h in $run.Hooks) { Write-Host "  HOOK $h" }
    foreach ($e in $run.Errors) { Write-Host "  log error: $e" }
    $result = Get-ExistingSaveResult $run
    Write-Host "EXISTING SAVE $(if ($result.Passed) { 'PASS' } else { 'FAIL' }): $($result.Detail)"
    exit $(if ($result.Passed -and -not $run.Errors.Count) { 0 } else { 1 })
}
if ($run.Done) {
    $t12 = Get-T12Result $run
    $run.Results = @($run.Results) + $t12
    Write-Host ("  {0} {1}: {2}" -f $(if ($t12.Passed) { 'PASS' } else { 'FAIL' }), $t12.Name, $t12.Detail)
}
$problems = @(Get-RunProblems $run $ending)
New-Item -ItemType Directory -Force -Path (Split-Path $ReportPath -Parent) | Out-Null
[IO.File]::WriteAllText($ReportPath, (ConvertTo-JUnitXml $run $problems))
$total = ((Get-Date) - $startedAt).TotalSeconds
$phases = if ($seen.Count) { @(Get-RunPhases $seen $total) } else { @() }
$info = @{ ProfileId = $ProfileId; Extensions = $enabled; StartedAt = $startedAt; DurationSeconds = $total; Phases = $phases }
New-Item -ItemType Directory -Force -Path (Split-Path $MarkdownPath -Parent) | Out-Null
[IO.File]::WriteAllText($MarkdownPath, (ConvertTo-MarkdownReport $run $problems $info) + "`n")

$passed = @($run.Results | Where-Object { $_.Passed }).Count
foreach ($v in $run.Verdicts) { Write-Host "  VERDICT $($v.Name): $($v.Text)" }
foreach ($e in $run.Errors) { Write-Host "  log error: $e" }
if ($run.CapErrors.Count) { Write-Host "  $($run.CapErrors.Count) error lines from EM's CapRewardBasedOnMissionTarget (see the report)" }
if ($phases) { Write-Host ("Timings: " + (($phases | ForEach-Object { "$($_.Name -replace '\*', '') $(Format-Seconds $_.Seconds)" }) -join '; ')) }
if ($problems.Count) {
    Write-Host "GAME TESTS FAILED ($passed passed): $($problems -join '; ')"
    Write-Host "Report: $MarkdownPath"
    exit 1
}
Write-Host "Game tests passed ($passed of $($run.Results.Count)). Report: $MarkdownPath"
