#!/usr/bin/env python3
"""Docker availability checker.

Exit codes:
  0 - OK
  2 - Docker CLI not found
  3 - Docker daemon not running / cannot connect
"""
import shutil
import subprocess
import sys
from pathlib import Path


def docker_cli_available() -> bool:
    return shutil.which("docker") is not None


def run(cmd):
    try:
        return subprocess.run(cmd, capture_output=True, text=True, check=True)
    except subprocess.CalledProcessError as e:
        return e
    except FileNotFoundError:
        return None


def main():
    # Check if docker command exists
    if not docker_cli_available():
        print("Docker CLI not found on PATH. Please install Docker Desktop:")
        print("  https://www.docker.com/get-started")
        # On Windows, give a hint to the helper script
        if sys.platform.startswith("win"):
            print("If Docker Desktop is installed but 'docker' is missing, run:")
            print("  powershell -ExecutionPolicy Bypass -File scripts/check_docker_windows.ps1")
        sys.exit(2)

    # Check docker daemon connectivity
    res = run(["docker", "info"])
    if res is None:
        print("Docker CLI not found or not executable. Verify your PATH and permissions.")
        sys.exit(2)
    if isinstance(res, subprocess.CalledProcessError):
        print("Docker appears installed but the daemon is not running or cannot be contacted.")
        print("- If you are on Windows, start Docker Desktop and wait until it's fully started.")
        print("- You can check service status in PowerShell: Get-Service -Name com.docker.service")
        print("- If using WSL2 backend, ensure WSL is running: wsl -l -v")
        # Show a short extract from the command error for debugging
        if res.stderr:
            print("--- docker info stderr ---")
            print(res.stderr.strip())
        sys.exit(3)

    print("Docker is installed and the daemon is running.")


if __name__ == '__main__':
    main()
