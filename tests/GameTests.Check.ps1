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
    '[Scripts] 40.01 *** Context:md.SWIBH_Tests.Begin<inst:2a1b>: [swibh-test] RUN START 2 tests'
    '[Scripts] 40.02 *** Context:md.SWIBH_Tests.Smoke: [swibh-test] INFO smoke: gamestart swibh_test, galaxy sws_galaxy_macro'
    '[Scripts] 40.03 *** Context:md.SWIBH_Tests.Report<inst:2a1c>: [swibh-test] PASS smoke: gamestart swibh_test on sws_galaxy_macro'
    '[Scripts] 42.00 *** Context:md.SWIBH_Tests.T01PayCap_Measure: [swibh-test] INFO t01_pay_cap: L target hapan_nova_macro, size 412m'
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
Expect 'info lines' $run.Info.Count 2
Expect 'verdict' $run.Verdicts[0].Text 'cap bites: a 1000000Cr reward L (size 412m) pays 20.60Cr (EM library);'
Expect 'version' $run.GameVersion '8.00 (580212)'
Expect 'signature warning is not an error' $run.Errors.Count 0
Expect 'menu and autostart' "$($run.MenuReady) $($run.Autostarted)" 'True True'
Expect 'no problems' @(Get-RunProblems $run 'finished').Count 0

$failing = $passingLog -replace 'PASS t01_pay_cap', 'FAIL t01_pay_cap'
Expect 'failed test named' ((Get-RunProblems (Read-GameTestLog $failing) 'finished') -join ';') '1 failed: t01_pay_cap'

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

$junit = [xml] (ConvertTo-JUnitXml $run @())
Expect 'junit cases' $junit.testsuite.tests 3
Expect 'junit failures' $junit.testsuite.failures 0
$md = ConvertTo-MarkdownReport $run @() @{ ProfileId = '90000201'; Extensions = @('SW Interworlds', 'swibh_tests'); StartedAt = (Get-Date '2026-10-31 20:00'); DurationSeconds = 161 }
Expect 'report title' ($md -split "`n")[0] '### Game tests: passed, 2 of 2'
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
