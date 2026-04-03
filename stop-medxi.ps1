$ErrorActionPreference = "SilentlyContinue"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendScript = (Join-Path $repoRoot "backend-dev.ps1").ToLowerInvariant()
$frontendScript = (Join-Path $repoRoot "frontend-dev.ps1").ToLowerInvariant()

function Stop-LauncherProcess {
  param(
    [string]$ScriptPath,
    [string]$Label
  )

  $target = $ScriptPath.Replace("\", "\\")
  $query = "Name = 'powershell.exe' OR Name = 'pwsh.exe'"
  $processes = Get-CimInstance Win32_Process -Filter $query

  foreach ($process in $processes) {
    $commandLine = ""
    if ($null -ne $process.CommandLine) {
      $commandLine = $process.CommandLine.ToLowerInvariant()
    }
    if ($commandLine.Contains($ScriptPath)) {
      Write-Host "Closing $Label window..." -ForegroundColor Yellow
      Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
    }
  }
}

function Stop-PortProcess {
  param(
    [int]$Port,
    [string]$Label
  )

  $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if (-not $connections) {
    Write-Host "$Label is not running on port $Port." -ForegroundColor DarkGray
    return
  }

  $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($processId in $processIds) {
    Write-Host "Stopping $Label on port $Port..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
  }
}

Write-Host ""
Write-Host "Stopping MEDXI..." -ForegroundColor Cyan

function Stop-ProcessTree {
  param([int]$ParentId)
  $children = Get-CimInstance Win32_Process -Filter "ParentProcessId = $ParentId" -ErrorAction SilentlyContinue
  foreach ($child in $children) {
    Stop-ProcessTree -ParentId $child.ProcessId
    Stop-Process -Id $child.ProcessId -Force -ErrorAction SilentlyContinue
  }
  Stop-Process -Id $ParentId -Force -ErrorAction SilentlyContinue
}

$pidFile = Join-Path $env:TEMP "medxi-pids.txt"
if (Test-Path $pidFile) {
  foreach ($line in Get-Content $pidFile) {
    $procId = [int]$line.Trim()
    if (Get-Process -Id $procId -ErrorAction SilentlyContinue) {
      Write-Host "Closing window (PID $procId)..." -ForegroundColor Yellow
      Stop-ProcessTree -ParentId $procId
    }
  }
  Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
} else {
  Stop-LauncherProcess -ScriptPath $backendScript -Label "Backend"
  Stop-LauncherProcess -ScriptPath $frontendScript -Label "Frontend"
}

Stop-PortProcess -Port 5000 -Label "Backend"
Stop-PortProcess -Port 5173 -Label "Frontend"
Write-Host ""
Write-Host "Done." -ForegroundColor Green
