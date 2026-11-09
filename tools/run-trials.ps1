<#
.SYNOPSIS
    Installs the dev-only trials extension, starts X4 in the test profile for hand-flown wing
    config fights, and waits until you quit. See tests/game/trials.md.

.DESCRIPTION
    1. Checks X4 isn't running and the test profile (X4_PROFILE_ID) has SWI switched on, and
       switches the trials extension on in that profile's content.xml (never the root profile's).
    2. Copies tests/game/swibh_trials into the game's extensions\swibh_trials. It has no
       autostart: pick a trial gamestart from New Game yourself.
    3. Starts X4 with -debug all -logfile debuglog.txt, so the trials' "[swibh-trial]" lines are
       logged, and waits for the game to exit.
    4. Removes the extension (unless -KeepExtension) and copies the log to
       tests/game/trials-debuglog.txt; make trials then prints the results table from it.

    The trials extension is never loaded in a recorded episode. Its MD only runs in its own
    gamestarts, so if a killed run leaves it installed nothing changes in other games, but its
    gamestarts stay in New Game: remove it with -Uninstall.

    Settings as in run-game-tests.ps1: parameters, else environment variables, else test.config.

.PARAMETER KeepExtension
    Leave the extension installed after X4 exits.

.PARAMETER Uninstall
    Only remove the installed extension; starts nothing.

.EXAMPLE
    .\tools\run-trials.ps1

.EXAMPLE
    .\tools\run-trials.ps1 -Uninstall
#>
[CmdletBinding()]
param(
    [string] $X4Path,
    [string] $ProfileId,
    [string] $GameExe,
    [switch] $KeepExtension,
    [switch] $Uninstall
)

$ErrorActionPreference = 'Stop'

# The runner's settings and profile helpers, and $SwiId. Dot-sourcing it only defines them, but its
# param block runs in this scope and resets the parameters it shares with this script
$given = @{ X4Path = $X4Path; ProfileId = $ProfileId; GameExe = $GameExe; KeepExtension = [bool] $KeepExtension }
. (Join-Path $PSScriptRoot 'run-game-tests.ps1')
$X4Path, $ProfileId, $GameExe, $KeepExtension = $given.X4Path, $given.ProfileId, $given.GameExe, $given.KeepExtension

$TrialsId = 'swibh_trials'
$root = Split-Path $PSScriptRoot -Parent
if (-not $X4Path) { $X4Path = Resolve-Setting $root 'X4_PATH' '' }
if (-not $X4Path) { throw "X4_PATH not set: pass -X4Path, set X4_PATH, or copy test.config.example to test.config" }
$X4Path = ConvertFrom-WslPath $X4Path
if (-not $GameExe) { $GameExe = Join-Path $X4Path (Resolve-Setting $root 'X4_EXE' 'X4_nonsteam.exe') }
if (-not $ProfileId) { $ProfileId = Resolve-Setting $root 'X4_PROFILE_ID' '90000201' }
if ($ProfileId -notmatch '^\d+$') { throw "X4_PROFILE_ID must be numeric (got '$ProfileId'): X4 falls back to the root profile, the real playthrough's, for anything else" }
$profileRoot = ConvertFrom-WslPath (Resolve-Setting $root 'X4_PROFILE_ROOT' (Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'Egosoft\X4'))
$profileDir = Join-Path $profileRoot $ProfileId
$logPath = Join-Path $profileDir 'debuglog.txt'
$extension = Join-Path $X4Path "extensions/$TrialsId"

$gameName = [IO.Path]::GetFileNameWithoutExtension($GameExe)
if (Get-Process -Name $gameName -ErrorAction SilentlyContinue) { throw "$gameName is running; close it first" }

function Remove-Trials {
    # The game may still hold files for a moment after exiting
    for ($i = 0; $i -lt 10 -and (Test-Path $extension); $i++) {
        try { Remove-Item $extension -Recurse -Force } catch { Start-Sleep -Seconds 1 }
    }
    if (Test-Path $extension) { throw "Couldn't remove $extension; delete it by hand" }
}

if ($Uninstall) {
    if (Test-Path $extension) { Remove-Trials; Write-Host "Removed $extension" }
    else { Write-Host "The trials extension isn't installed" }
    exit 0
}

if (-not (Test-Path $GameExe)) { throw "$GameExe not found; check X4_PATH and X4_EXE in test.config" }
$contentXml = Join-Path $profileDir 'content.xml'
if ((Get-EnabledExtensions $contentXml) -notcontains $SwiId) {
    throw "SWI ('$SwiId') isn't switched on in $contentXml; run make game-test ARGS=-PrepareProfile once (tests/game/README.md)"
}
Enable-Extensions $contentXml @($TrialsId)

if (Test-Path $extension) { Remove-Item $extension -Recurse -Force }
Copy-Item (Join-Path $root "tests/game/$TrialsId") $extension -Recurse
if (Test-Path $logPath) { Move-Item $logPath (Join-Path $profileDir 'debuglog.previous.txt') -Force }

$arguments = "-skipintro -debug all -logfile debuglog.txt -scriptlogfiles -personalfolderid $ProfileId"
Write-Host "Starting $GameExe $arguments"
Write-Host "New Game > the utility group: pick an 'SWIBH trial' start. Comm any of your wingmen for 'Trials: spawn ...'. Quit X4 when done."
$game = Start-Process -FilePath $GameExe -ArgumentList $arguments -WorkingDirectory $X4Path -PassThru
try { $game.WaitForExit() }
finally {
    if (-not $KeepExtension) { Remove-Trials }
}

$copy = Join-Path $root 'tests/game/trials-debuglog.txt'
if (Test-Path $logPath) {
    Copy-Item $logPath $copy -Force
    Write-Host "Log copied to $copy"
} else {
    Write-Host "No $logPath (did -personalfolderid $ProfileId take?)"
    exit 1
}
