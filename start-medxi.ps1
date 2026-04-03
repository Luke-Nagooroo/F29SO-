$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$clientDir = Join-Path $repoRoot "client"
$serverDir = Join-Path $repoRoot "server"
$clientEnvPath = Join-Path $clientDir ".env"
$serverEnvPath = Join-Path $serverDir ".env"
$powershellExe = Join-Path $env:WINDIR "System32\WindowsPowerShell\v1.0\powershell.exe"

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-CommandExists {
  param([string]$Name)
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Ensure-Command {
  param(
    [string]$Name,
    [string]$InstallHint
  )

  if (-not (Test-CommandExists $Name)) {
    throw "$Name is required. $InstallHint"
  }
}

function Read-EnvFile {
  param([string]$Path)

  $values = @{}
  if (-not (Test-Path $Path)) {
    return $values
  }

  foreach ($line in Get-Content -Path $Path) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    if ($line.TrimStart().StartsWith("#")) { continue }
    $parts = $line -split "=", 2
    if ($parts.Count -ne 2) { continue }
    $values[$parts[0].Trim()] = $parts[1]
  }

  return $values
}

function Write-EnvFile {
  param(
    [string]$Path,
    [hashtable]$Values,
    [string[]]$Order
  )

  $lines = foreach ($key in $Order) {
    "$key=$($Values[$key])"
  }

  Set-Content -Path $Path -Value $lines
}

function New-RandomSecret {
  param([int]$Length = 48)

  $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"
  $bytes = New-Object byte[] ($Length)
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $builder = New-Object System.Text.StringBuilder

  foreach ($byte in $bytes) {
    [void]$builder.Append($chars[$byte % $chars.Length])
  }

  return $builder.ToString()
}

function Prompt-Value {
  param(
    [string]$Label,
    [string]$CurrentValue = "",
    [string]$DefaultValue = "",
    [bool]$Required = $false
  )

  while ($true) {
    $suffix = ""
    if ($CurrentValue) {
      $suffix = " [Press Enter to keep current]"
    } elseif ($DefaultValue) {
      $suffix = " [Default: $DefaultValue]"
    }

    $inputValue = Read-Host "$Label$suffix"
    if ($inputValue) { return $inputValue.Trim() }
    if ($CurrentValue) { return $CurrentValue }
    if ($DefaultValue) { return $DefaultValue }
    if (-not $Required) { return "" }

    Write-Host "This value is required." -ForegroundColor Yellow
  }
}

function Ensure-NpmDependencies {
  param(
    [string]$WorkingDirectory,
    [string]$Label
  )

  $nodeModulesPath = Join-Path $WorkingDirectory "node_modules"
  if (Test-Path $nodeModulesPath) {
    Write-Host "$Label dependencies already present." -ForegroundColor DarkGray
    return
  }

  Write-Step "Installing $Label dependencies"
  & npm install --prefix $WorkingDirectory
}

function Ensure-ClientEnv {
  $clientEnv = Read-EnvFile $clientEnvPath
  if (-not $clientEnv.ContainsKey("VITE_API_URL")) {
    $clientEnv["VITE_API_URL"] = "http://localhost:5000/api"
  }
  if (-not $clientEnv.ContainsKey("VITE_ENABLE_REALTIME")) {
    $clientEnv["VITE_ENABLE_REALTIME"] = "true"
  }

  Write-EnvFile -Path $clientEnvPath -Values $clientEnv -Order @(
    "VITE_API_URL",
    "VITE_ENABLE_REALTIME"
  )
}

function Ensure-ServerEnv {
  $serverEnv = Read-EnvFile $serverEnvPath

  if (-not $serverEnv.ContainsKey("PORT")) { $serverEnv["PORT"] = "5000" }
  if (-not $serverEnv.ContainsKey("NODE_ENV")) { $serverEnv["NODE_ENV"] = "development" }
  if (-not $serverEnv.ContainsKey("CLIENT_URL")) { $serverEnv["CLIENT_URL"] = "http://localhost:5173" }
  if (-not $serverEnv.ContainsKey("JWT_EXPIRE")) { $serverEnv["JWT_EXPIRE"] = "1h" }
  if (-not $serverEnv.ContainsKey("JWT_REFRESH_EXPIRE")) { $serverEnv["JWT_REFRESH_EXPIRE"] = "7d" }
  if (-not $serverEnv.ContainsKey("JWT_SECRET") -or [string]::IsNullOrWhiteSpace($serverEnv["JWT_SECRET"])) {
    $serverEnv["JWT_SECRET"] = New-RandomSecret
  }
  if (-not $serverEnv.ContainsKey("JWT_REFRESH_SECRET") -or [string]::IsNullOrWhiteSpace($serverEnv["JWT_REFRESH_SECRET"])) {
    $serverEnv["JWT_REFRESH_SECRET"] = New-RandomSecret
  }
  if (-not $serverEnv.ContainsKey("GOOGLE_FIT_REDIRECT_URI")) {
    $serverEnv["GOOGLE_FIT_REDIRECT_URI"] = "http://localhost:5000/api/googlefit/callback"
  }
  if (-not $serverEnv.ContainsKey("GOOGLE_AUTH_REDIRECT_URI")) {
    $serverEnv["GOOGLE_AUTH_REDIRECT_URI"] = "http://localhost:5000/api/auth/google/callback"
  }
  if (-not $serverEnv.ContainsKey("EMAIL_MODE") -or [string]::IsNullOrWhiteSpace($serverEnv["EMAIL_MODE"])) {
    $serverEnv["EMAIL_MODE"] = "maildev"
  }

  Write-Step "Checking backend environment"
  if (-not $serverEnv.ContainsKey("MONGODB_URI") -or [string]::IsNullOrWhiteSpace($serverEnv["MONGODB_URI"])) {
    $serverEnv["MONGODB_URI"] = Prompt-Value `
      -Label "MongoDB connection string" `
      -DefaultValue "mongodb://127.0.0.1:27017/medxi" `
      -Required $true
  } else {
    Write-Host "Using shared MongoDB connection from server/.env" -ForegroundColor DarkGray
  }

  $serverEnv["GEMINI_API_KEY"] = Prompt-Value `
    -Label "Gemini API key for AI features (user-specific, leave blank to keep current or skip)" `
    -CurrentValue $serverEnv["GEMINI_API_KEY"]

  if ($serverEnv["GOOGLE_FIT_CLIENT_ID"] -or $serverEnv["GOOGLE_FIT_CLIENT_SECRET"]) {
    Write-Host "Using shared Google Fit credentials from server/.env" -ForegroundColor DarkGray
  }
  if ($serverEnv["GOOGLE_AUTH_CLIENT_ID"] -or $serverEnv["GOOGLE_AUTH_CLIENT_SECRET"]) {
    Write-Host "Using shared Google login credentials from server/.env" -ForegroundColor DarkGray
  }

  Write-EnvFile -Path $serverEnvPath -Values $serverEnv -Order @(
    "PORT",
    "NODE_ENV",
    "MONGODB_URI",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "JWT_EXPIRE",
    "JWT_REFRESH_EXPIRE",
    "GEMINI_API_KEY",
    "GOOGLE_FIT_CLIENT_ID",
    "GOOGLE_FIT_CLIENT_SECRET",
    "GOOGLE_FIT_REDIRECT_URI",
    "GOOGLE_AUTH_CLIENT_ID",
    "GOOGLE_AUTH_CLIENT_SECRET",
    "GOOGLE_AUTH_REDIRECT_URI",
    "CLIENT_URL",
    "EMAIL_MODE"
  )
}

Write-Step "Checking required tools"
Ensure-Command -Name "node" -InstallHint "Install Node.js 18+ from https://nodejs.org/"
Ensure-Command -Name "npm" -InstallHint "Install Node.js 18+ from https://nodejs.org/"

Ensure-NpmDependencies -WorkingDirectory $serverDir -Label "backend"
Ensure-NpmDependencies -WorkingDirectory $clientDir -Label "frontend"

Ensure-ServerEnv
Ensure-ClientEnv

Write-Step "Starting MEDXI"
$backendProc = Start-Process -FilePath $powershellExe -ArgumentList @("-NoExit", "-ExecutionPolicy", "Bypass", "-File", (Join-Path $repoRoot "backend-dev.ps1")) -PassThru
$frontendProc = Start-Process -FilePath $powershellExe -ArgumentList @("-NoExit", "-ExecutionPolicy", "Bypass", "-File", (Join-Path $repoRoot "frontend-dev.ps1")) -PassThru

$pidFile = Join-Path $env:TEMP "medxi-pids.txt"
@("$($backendProc.Id)", "$($frontendProc.Id)") | Set-Content -Path $pidFile

Write-Host ""
Write-Host "MEDXI is starting in two PowerShell windows:" -ForegroundColor Green
Write-Host "  Backend: http://localhost:5000" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Green
