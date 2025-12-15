<#
.SYNOPSIS
  Diagnose missing Docker CLI on Windows and optionally add it to the user PATH.

.DESCRIPTION
  When Docker Desktop is installed but the `docker` command is not available
  in PowerShell, this script attempts to locate common installation paths for
  `docker.exe` and suggests (or optionally performs) a safe update to the
  user's PATH environment variable.

.PARAMETER Fix
  If provided, the script will add the found folder to the user's PATH using
  `setx`. Note: you must restart your shell to see the change.

.EXAMPLE
  .\check_docker_windows.ps1
  .\check_docker_windows.ps1 -Fix
#>

param(
    [switch]$Fix
)

function Write-Ok($msg){ Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-Warn($msg){ Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Err($msg){ Write-Host "[ERROR] $msg" -ForegroundColor Red }

try {
    $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
    if ($dockerCmd) {
        Write-Ok "Docker CLI found: $($dockerCmd.Source)"
        exit 0
    }

    Write-Warn "Docker CLI not found on PATH. Searching common installation locations..."

    $candidates = @(
        'C:\Program Files\Docker\Docker\resources\bin',
        'C:\Program Files\Docker\Docker',
        'C:\Program Files\Docker\Docker\resources',
        "$env:ProgramFiles\Docker\Docker\resources\bin"
    )

    $found = $null
    foreach ($p in $candidates) {
        $exe = Join-Path $p 'docker.exe'
        if (Test-Path $exe) { $found = $p; break }
    }

    if ($found) {
        Write-Ok "Found docker.exe in: $found"
        $suggest = 'setx PATH "' + $env:PATH + ';' + $found + '"'
        Write-Host "Suggested action to add to PATH (run as your user):"
        Write-Host "  $suggest"
        Write-Host "After running the command, restart PowerShell to pick up the new PATH."

        if ($Fix) {
            Write-Host "Applying fix: adding $found to user PATH..."
            $newPath = "$env:PATH;$found"
            setx PATH $newPath | Out-Null
            Write-Ok "Updated user PATH. Restart your terminal to see changes."
        }

        exit 0
    }

    Write-Err "No Docker installation found in common locations."
    Write-Host "- If you have Docker Desktop installed, open Docker Desktop and ensure it's running."
    Write-Host "- If not installed, install it: https://www.docker.com/get-started"
    Write-Host "- If you use WSL2, ensure WSL is enabled: wsl -l -v"

    exit 2

} catch {
    Write-Err "Unexpected error: $_"
    exit 99
}
