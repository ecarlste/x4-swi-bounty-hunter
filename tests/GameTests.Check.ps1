# Checks for tools/run-game-tests.ps1's functions: log parsing, problems and the reports, against
# log lines as X4 writes them. Plain PowerShell (no Pester needed), so it runs in the Windows
# PowerShell 5.1 that ships with Windows: make check. Exits 1 on the first broken expectation.

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
. (Join-Path $root 'tools/run-game-tests.ps1')

$script:checks = 0
function Expect([string] $What, $Actual, $Expected) {
    $script:checks++
    if ("$Actual" -ne "$Expected") { throw "FAIL ${What}: got '$Actual', expected '$Expected'" }
}

# MD debug_text lines go under [Scripts] with the cue as context; Lua DebugError under [=ERROR=]
$passingLog = @(
    '[General] 0.00 ======================================'
    "[FileIO ] 0.00 File I/O: Failed to verify the file signature for file '.\extensions\swibh_tests\md\swibh_tests.xml' (error: 14)"
    '[Init   ] 6.48 Game initialisation time until start menu fade-in (because of skipped intro video): 32 seconds'
    '[=ERROR=] 8.53 [swibh-test] autostart: starting gamestart swibh_test'
    "[Init   ] 0.00 Starting new game using gamestart 'swibh_test' in 8.00 (580212)"
    '[Scripts] 39.00 *** Context:md.kuertee_emergent_missions.kEMissions: [swibh-test] HOOK T12 kEMissions: patched by swibh_tests (event_cue_signalled)'
    '[Scripts] 39.10 *** Context:md.SWIBH_Hooks.UniverseGenerated: [swibh-test] HOOK H13 event_universe_generated: gamestart swibh_test, player.age 0.5s'
    '[Scripts] 40.01 *** Context:md.SWIBH_Tests.Begin<inst:2a1b>: [swibh-test] RUN START 2 tests'
    '[Scripts] 40.02 *** Context:md.SWIBH_Tests.Smoke: [swibh-test] INFO smoke: gamestart swibh_test, galaxy sws_galaxy_macro'
    '[Scripts] 40.03 *** Context:md.SWIBH_Tests.Report<inst:2a1c>: [swibh-test] PASS smoke: gamestart swibh_test on sws_galaxy_macro'
    '[Scripts] 42.00 *** Context:md.SWIBH_Tests.T01PayCap_Measure: [swibh-test] INFO t01_pay_cap: L target hapan_nova_macro, size 412m'
    '[Scripts] 42.00 *** Context:md.SWIBH_Tests.T01PayCap_Measure: [swibh-test] HOOK T12 CapRewardBasedOnMissionTarget: target hapan_nova_macro, class ship_l, size 412m, mult 5, TotalReward 1000000Cr, CapReward 2060'
    "[Scripts] 42.01 *** Context:md.SWIBH_Tests.T01PayCap_Measure: [swibh-test] VERDICT t01_pay_cap: cap bites: a 1000000Cr reward L (size 412m) pays 20.60Cr (EM library);"
    '[Scripts] 42.02 *** Context:md.SWIBH_Tests.Report<inst:2a1d>: [swibh-test] PASS t01_pay_cap: 1000000Cr reward: L (size 412m) pays 20.60Cr (EM library);'
    '[Scripts] 42.03 *** Context:md.SWIBH_Tests.NextTest<inst:2a1e>: [swibh-test] DONE passed=2 failed=0'
)

$run = Read-GameTestLog $passingLog
Expect 'started' $run.Started $true
Expect 'expected' $run.Expected 2
Expect 'done' $run.Done $true
Expect 'results' $run.Results.Count 2
Expect 'second result' $run.Results[1].Name 't01_pay_cap'
Expect 'info lines, with the hook lines' $run.Info.Count 5
Expect 'hook lines' $run.Hooks.Count 3
$t12 = Get-T12Result $run
Expect 't12 named' $t12.Name 't12_diff_patch'
Expect 't12 passes with both patch lines' $t12.Passed $true
Expect 't12 detail' ([bool] ($t12.Detail -match 'H13 event_universe_generated')) $true
Expect 'a log event is not a hook' (Read-GameTestLog @('[Scripts] 1.00 [swibh] {"v":1,"type":"hunt_offered","t":1.0,"data":{}}')).Hooks.Count 0
Expect 'verdict' $run.Verdicts[0].Text 'cap bites: a 1000000Cr reward L (size 412m) pays 20.60Cr (EM library);'
Expect 'version' $run.GameVersion '8.00 (580212)'
Expect 'signature warning is not an error' $run.Errors.Count 0
Expect 'menu and autostart' "$($run.MenuReady) $($run.Autostarted)" 'True True'
Expect 'no problems' @(Get-RunProblems $run 'finished').Count 0

$failing = $passingLog -replace 'PASS t01_pay_cap', 'FAIL t01_pay_cap'
Expect 'failed test named' ((Get-RunProblems (Read-GameTestLog $failing) 'finished') -join ';') '1 failed: t01_pay_cap'

# T12: the runner judges the diff patch on EM from its HOOK lines (Get-T12Result, called once the run is done)
$noLibraryLine = Get-T12Result (Read-GameTestLog @($passingLog | Where-Object { $_ -notmatch 'HOOK T12 CapReward' }))
Expect 't12 fails without the library line' $noLibraryLine.Passed $false
Expect 't12 says which line is missing' ([bool] ($noLibraryLine.Detail -match 'CapRewardBasedOnMissionTarget')) $true
$noKEMissionsLine = Get-T12Result (Read-GameTestLog @($passingLog | Where-Object { $_ -notmatch 'HOOK T12 kEMissions' }))
Expect 't12 fails without the kEMissions line' $noKEMissionsLine.Passed $false
$patchError = Read-GameTestLog ($passingLog[0..($passingLog.Count - 2)] + @(
    "[General] 41.00 Error: XML patch failed in file 'extensions\swibh_tests\md\kuertee_emergent_missions.xml': sel '/mdscript/cues/cue[@name='kEMissions']/actions' matched nothing"
) + $passingLog[-1])
Expect 't12 fails on a patch error' (Get-T12Result $patchError).Passed $false
Expect 'patch error is also a run error' $patchError.Errors.Count 1

# Errors: ours count, EM's cap library is data, other mods are ignored; markers quoted in error
# details don't count
$withErrors = Read-GameTestLog ($passingLog + @(
    '[=ERROR=] 50.00 Error in MD cue md.SWIBH_Tests.T01PayCap_Measure: property lookup failed'
    '[=ERROR=] 50.10 Error in MD cue md.kuertee_emergent_missions.CapRewardBasedOnMissionTarget: incompatible types'
    "* Expression: `$TotalReward ge `$CapReward"
    '[=ERROR=] 51.00 Error in MD cue md.Setup_DLC_Pirate.Foo: station not found'
    "* Expression: '[swibh-test] PASS fake: x'"
))
Expect 'our error' $withErrors.Errors.Count 1
Expect 'cap errors with detail' $withErrors.CapErrors.Count 2
Expect 'fake PASS ignored' $withErrors.Results.Count 2

$notStarted = Read-GameTestLog @('[Init   ] 6.48 Game initialisation time until start menu fade-in: 32 seconds')
Expect 'hint when the autostart never ran' ((Get-RunProblems $notStarted 'timed out after 1200 s') -like '*autostart never ran*').Count 1
Expect 'DONE before RUN START ignored' (Read-GameTestLog @('[Scripts] 1.00 [swibh-test] DONE passed=0 failed=0')).Done $false

# -Manual: an older save loaded with the extension; the patch applies to it if the patched library
# ran after the load
$loadedLog = @(
    '[Init   ] 6.48 Game initialisation time until start menu fade-in: 32 seconds'
    '[Scripts] 90.00 *** Context:md.SWIBH_Hooks.UniverseGenerated: [swibh-test] HOOK H13 event_universe_generated: gamestart x4ep1_gamestart_bountyhunter, player.age 52000s'
    '[Scripts] 90.01 *** Context:md.SWIBH_Hooks.GameLoaded<inst:1f>: [swibh-test] HOOK H13 event_game_loaded: gamestart x4ep1_gamestart_bountyhunter, player.age 52000s, EM kEMissions complete'
    '[Scripts] 90.02 *** Context:md.SWIBH_Hooks.GameLoaded<inst:1f>: [swibh-test] HOOK T12 CapRewardBasedOnMissionTarget: target fortitude_macro, class ship_m, size 60m, mult 0, TotalReward 0Cr, CapReward null'
)
$loaded = Get-ExistingSaveResult (Read-GameTestLog $loadedLog)
Expect 'existing save: patch applies' $loaded.Passed $true
Expect 'existing save: universe hook reported' ([bool] ($loaded.Detail -match 'event_universe_generated fired')) $true
$libraryBeforeLoad = Get-ExistingSaveResult (Read-GameTestLog @($loadedLog[0], $loadedLog[3], $loadedLog[2]))
Expect 'existing save: library line must follow the load' $libraryBeforeLoad.Passed $false
$noLoad = Get-ExistingSaveResult (Read-GameTestLog @($loadedLog[0]))
Expect 'existing save: no load' $noLoad.Passed $false
Expect 'existing save: says no save was loaded' ([bool] ($noLoad.Detail -match 'no save')) $true

$run.Results = @($run.Results) + $t12  # as the runner adds it once the run is done
$junit = [xml] (ConvertTo-JUnitXml $run @())
Expect 'junit cases' $junit.testsuite.tests 4
Expect 'junit failures' $junit.testsuite.failures 0
$md = ConvertTo-MarkdownReport $run @() @{ ProfileId = '90000201'; Extensions = @('SW Interworlds', 'swibh_tests'); StartedAt = (Get-Date '2026-10-31 20:00'); DurationSeconds = 161 }
Expect 'report title' ($md -split "`n")[0] '### Game tests: passed, 3 of 3'
Expect 'report verdict' ([bool] ($md -match 'cap bites')) $true

Expect 'wsl path' (ConvertFrom-WslPath '/mnt/e/SteamLibrary/x') 'E:\SteamLibrary\x'
Expect 'windows path kept' (ConvertFrom-WslPath 'E:\x') 'E:\x'

# Profile content.xml: switching extensions on keeps other entries
$tmp = Join-Path ([IO.Path]::GetTempPath()) "swibh-check-$PID.xml"
try {
    [IO.File]::WriteAllText($tmp, "<?xml version=`"1.0`" encoding=`"utf-8`"?>`n<content>`n  <extension id=`"SW Interworlds`" enabled=`"false`"/>`n  <extension id=`"other`" enabled=`"true`"/>`n</content>")
    Enable-Extensions $tmp @('SW Interworlds', 'swibh_tests')
    Expect 'enabled extensions' ((Get-EnabledExtensions $tmp) -join ',') 'SW Interworlds,other,swibh_tests'
}
finally { Remove-Item $tmp -ErrorAction SilentlyContinue }

Write-Host "Runner checks passed ($script:checks)"
