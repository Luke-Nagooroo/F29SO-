$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "server")
$Host.UI.RawUI.WindowTitle = "MEDXI Backend"
npm run dev
