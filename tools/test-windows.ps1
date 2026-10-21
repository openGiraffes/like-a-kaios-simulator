param(
    [string]$SourceRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$OutputRoot = (Join-Path (Split-Path -Parent $PSScriptRoot) 'artifacts\windows-gecko45'),
    [string[]]$Modes = @('legacy', 'new')
)
$ErrorActionPreference = 'Stop'
$exe = Join-Path $OutputRoot 'KaiosSim.exe'
$manifest = Join-Path $SourceRoot 'tests\compat\manifest.webapp'
$taskName = 'KaiosSim-Smoke-' + [Guid]::NewGuid().ToString('N')
$system = [Security.Principal.WindowsIdentity]::GetCurrent().IsSystem
try {
    foreach ($mode in $Modes) {
        $result = Join-Path $OutputRoot "smoke-$mode.json"
        Remove-Item $result -ErrorAction SilentlyContinue
        Remove-Item "$result.log" -ErrorAction SilentlyContinue
        $arguments = "--smoke `"$manifest`" `"$result`" $mode"
        if ($system) {
            $user = (Get-CimInstance Win32_ComputerSystem).UserName
            if (!$user) { throw 'Sign in to the Windows desktop before running Gecko UI tests.' }
            $action = New-ScheduledTaskAction -Execute $exe -Argument $arguments -WorkingDirectory $OutputRoot
            $principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
            Register-ScheduledTask -TaskName $taskName -Action $action -Principal $principal -Force | Out-Null
            Start-ScheduledTask -TaskName $taskName
        } else {
            $process = Start-Process $exe -ArgumentList $arguments -WorkingDirectory $OutputRoot -PassThru
        }
        $deadline = (Get-Date).AddSeconds(110)
        while (!(Test-Path $result) -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 500 }
        if (!(Test-Path $result)) { throw "No test result for $mode; inspect the Windows desktop." }
        if ($system) {
            while ((Get-ScheduledTask -TaskName $taskName).State -eq 'Running' -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 200 }
        } else { $process.WaitForExit(10000) | Out-Null }
        $report = Get-Content $result -Raw | ConvertFrom-Json
        if (!$report.ok -or !$report.installTests -or !$report.settingsPersisted) { throw "Smoke failed: $result" }
        Write-Output "PASS $mode : $($report.results.Count) browser checks + install/update/path traversal + settings persistence"
    }
} finally {
    if ($system) { Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue }
}
