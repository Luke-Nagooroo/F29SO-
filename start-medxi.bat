@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File ".\start-medxi.ps1"
