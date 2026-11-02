<#
.SYNOPSIS
    Validates the test extension's XML against X4 8.00's own schemas, without the game.

.DESCRIPTION
    Uses .NET's XSD validator (Windows PowerShell 5.1 has it built in, so nothing to install):
    - md/*.xml against libraries/md.xsd (which includes common.xsd), or diff.xsd for a diff on
      another extension's script (a <diff> root);
    - aiscripts/*.xml against libraries/aiscripts.xsd;
    - each <gamestart> that libraries/gamestarts.xml adds, inside a <gamestarts> root, against
      libraries/gamestarts.xsd;
    - every diff file (libraries/*.xml) against libraries/diff.xsd.
    Prints one line per file and exits 1 on any error.

    The schema folder comes from -SchemaDir, the X4_UNPACKED environment variable, or
    X4_UNPACKED in test.config: the unpacked 8.00 game files, the folder holding libraries/md.xsd.

.PARAMETER SchemaDir
    The unpacked game folder with libraries/*.xsd (vanilla 8.00 base).

.PARAMETER ExtensionDir
    The extension to check. Default tests/game/swibh_tests.

.EXAMPLE
    .\tools\validate-xml.ps1
#>
[CmdletBinding()]
param(
    [string] $SchemaDir,
    [string] $ExtensionDir
)

$ErrorActionPreference = 'Stop'

$root = Split-Path $PSScriptRoot -Parent
. (Join-Path $PSScriptRoot 'run-game-tests.ps1')

if (-not $SchemaDir) { $SchemaDir = if ($env:X4_UNPACKED) { $env:X4_UNPACKED } else { Get-TestConfigValue $root 'X4_UNPACKED' } }
if (-not $SchemaDir) { throw "X4_UNPACKED not set: pass -SchemaDir, set X4_UNPACKED, or add it to test.config" }
$SchemaDir = ConvertFrom-WslPath $SchemaDir
if (-not $ExtensionDir) { $ExtensionDir = Join-Path $root 'tests/game/swibh_tests' }
$libraries = Join-Path $SchemaDir 'libraries'
if (-not (Test-Path (Join-Path $libraries 'md.xsd'))) { throw "No libraries/md.xsd under $SchemaDir" }

function New-SchemaSet([string] $Xsd) {
    $set = New-Object System.Xml.Schema.XmlSchemaSet
    $resolver = New-Object System.Xml.XmlUrlResolver
    $set.XmlResolver = $resolver
    # diff.xsd starts with a DTD, which .NET refuses by default
    $settings = New-Object System.Xml.XmlReaderSettings
    $settings.DtdProcessing = [System.Xml.DtdProcessing]::Parse
    $settings.XmlResolver = $resolver
    $reader = [System.Xml.XmlReader]::Create((Join-Path $libraries $Xsd), $settings)
    try { [void] $set.Add($null, $reader) } finally { $reader.Close() }
    $set.Compile()
    $set
}

# Validates XML text against a schema set, reading it with a validating reader so each error
# carries its line; returns the errors as "line N: message". Warnings ("no schema information")
# count only for the root element: a root no schema declares means nothing was validated, while
# a diff's added content is lax (xs:any) by design.
function Test-Xml([string] $Text, $Schemas) {
    $settings = New-Object System.Xml.XmlReaderSettings
    $settings.ValidationType = [System.Xml.ValidationType]::Schema
    $settings.Schemas = $Schemas
    $settings.ValidationFlags = $settings.ValidationFlags -bor [System.Xml.Schema.XmlSchemaValidationFlags]::ReportValidationWarnings
    $found = New-Object System.Collections.ArrayList
    # The root element's line: the first line that opens an element other than <?xml or <!--
    $rootLine = 1
    $lines = $Text -split "`n"
    for ($i = 0; $i -lt $lines.Count; $i++) { if ($lines[$i] -match '^\s*<[A-Za-z]') { $rootLine = $i + 1; break } }
    $settings.add_ValidationEventHandler({
        param($s, $e)
        if ($e.Severity -eq [System.Xml.Schema.XmlSeverityType]::Error -or $e.Exception.LineNumber -le $rootLine) {
            [void] $found.Add("line $($e.Exception.LineNumber): $($e.Message)")
        }
    }.GetNewClosure())
    $reader = [System.Xml.XmlReader]::Create((New-Object IO.StringReader($Text)), $settings)
    try { while ($reader.Read()) { } } finally { $reader.Close() }
    @($found)
}

$failures = 0
function Write-Result([string] $Name, [string[]] $Errors) {
    if ($Errors.Count) {
        $script:failures++
        Write-Host "FAIL $Name"
        $Errors | ForEach-Object { Write-Host "  $_" }
    }
    else { Write-Host "ok   $Name" }
}

$diffSchemas = $null
$checks = @(
    @{ Folder = 'md'; Xsd = 'md.xsd' }
    @{ Folder = 'aiscripts'; Xsd = 'aiscripts.xsd' }
)
foreach ($check in $checks) {
    $files = @(Get-ChildItem (Join-Path $ExtensionDir $check.Folder) -Filter *.xml -ErrorAction SilentlyContinue)
    if (-not $files.Count) { continue }
    $schemas = New-SchemaSet $check.Xsd
    foreach ($file in $files) {
        $text = [IO.File]::ReadAllText($file.FullName)
        if ($text -match '(?m)^\s*<diff[\s>]') {
            if (-not $diffSchemas) { $diffSchemas = New-SchemaSet 'diff.xsd' }
            Write-Result "$($check.Folder)/$($file.Name) (diff.xsd)" (Test-Xml $text $diffSchemas)
        }
        else { Write-Result "$($check.Folder)/$($file.Name) ($($check.Xsd))" (Test-Xml $text $schemas) }
    }
}

$diffs = @(Get-ChildItem (Join-Path $ExtensionDir 'libraries') -Filter *.xml -ErrorAction SilentlyContinue)
if ($diffs.Count) {
    if (-not $diffSchemas) { $diffSchemas = New-SchemaSet 'diff.xsd' }
    foreach ($file in $diffs) {
        $text = [IO.File]::ReadAllText($file.FullName)
        Write-Result "libraries/$($file.Name) (diff.xsd)" (Test-Xml $text $diffSchemas)
        if ($file.Name -eq 'gamestarts.xml') {
            # What the diff adds, as a gamestarts file of its own
            $doc = New-Object System.Xml.XmlDocument
            $doc.LoadXml($text)
            $gamestarts = New-Object System.Xml.XmlDocument
            $gamestarts.LoadXml('<gamestarts/>')
            foreach ($node in $doc.SelectNodes("/diff/add[@sel='/gamestarts']/gamestart")) {
                [void] $gamestarts.DocumentElement.AppendChild($gamestarts.ImportNode($node, $true))
            }
            # Line numbers here are of this extract, which keeps the gamestarts' own formatting
            $count = $gamestarts.DocumentElement.ChildNodes.Count
            $errors = if ($count) { Test-Xml $gamestarts.OuterXml (New-SchemaSet 'gamestarts.xsd') } else { @("no <add sel=`"/gamestarts`"><gamestart> found") }
            Write-Result "libraries/$($file.Name), added gamestarts ($count, gamestarts.xsd)" $errors
        }
    }
}

if ($failures) {
    Write-Host "XML VALIDATION FAILED: $failures files with errors"
    exit 1
}
Write-Host "All XML valid against the schemas in $libraries"
