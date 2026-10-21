param(
    [string]$SourceRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$OutputRoot = (Join-Path (Split-Path -Parent $PSScriptRoot) 'artifacts\windows-gecko45'),
    [string]$Configuration = 'Release'
)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Add-Type -AssemblyName System.IO.Compression.FileSystem
[xml]$config = Get-Content (Join-Path $SourceRoot 'KaiosSim\packages.config')
foreach ($package in $config.packages.package) {
    $name = $package.id; $version = $package.version
    $dest = Join-Path $SourceRoot "packages\$name.$version"
    if (!(Test-Path $dest)) {
        $id = $name.ToLowerInvariant(); $zip = Join-Path ([IO.Path]::GetTempPath()) "$id.$version.nupkg"
        Invoke-WebRequest "https://api.nuget.org/v3-flatcontainer/$id/$version/$id.$version.nupkg" -OutFile $zip -UseBasicParsing
        [IO.Compression.ZipFile]::ExtractToDirectory($zip, $dest)
        Remove-Item $zip
    }
}
$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
$vs = & $vswhere -latest -products '*' -requires Microsoft.Component.MSBuild -property installationPath
if (!$vs) { throw 'Visual Studio MSBuild was not found.' }
$msbuild = Join-Path $vs 'MSBuild\Current\Bin\MSBuild.exe'
New-Item -ItemType Directory -Force $OutputRoot | Out-Null
& $msbuild (Join-Path $SourceRoot 'KaiosSim.sln') /t:Build /m /nologo /verbosity:minimal "/p:Configuration=$Configuration" /p:Platform=x86 "/p:OutDir=$OutputRoot\"
if ($LASTEXITCODE -ne 0) { throw "MSBuild failed: $LASTEXITCODE" }
Copy-Item (Join-Path $SourceRoot 'LICENSE') $OutputRoot -Force
Copy-Item (Join-Path $SourceRoot 'THIRD-PARTY-NOTICES.md') $OutputRoot -Force
Copy-Item (Join-Path $SourceRoot 'README.md') $OutputRoot -Force
Write-Host "Built Gecko 45 x86: $OutputRoot\KaiosSim.exe"
