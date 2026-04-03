$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "client")
$Host.UI.RawUI.WindowTitle = "MEDXI Frontend"
npm run dev
