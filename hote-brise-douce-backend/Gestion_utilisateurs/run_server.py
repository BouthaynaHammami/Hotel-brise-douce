#!/usr/bin/env python3
"""
Startup wrapper for FastAPI application
Changes to the correct directory before starting uvicorn
"""
import os
import sys
import subprocess
from pathlib import Path

# Get the directory of this script
script_dir = Path(__file__).parent.absolute()
print(f"[INFO] Script location: {script_dir}")

# Change to the script directory
os.chdir(script_dir)
print(f"[INFO] Changed working directory to: {os.getcwd()}")

# Start uvicorn
cmd = [
    sys.executable, "-m", "uvicorn",
    "main:app",
    "--reload",
    "--port", "8000",
    "--host", "0.0.0.0"
]

print(f"[INFO] Starting server with command: {' '.join(cmd)}")
print("=" * 70)

try:
    subprocess.run(cmd, check=True)
except KeyboardInterrupt:
    print("\n[INFO] Server stopped by user")
except Exception as e:
    print(f"\n[ERROR] Failed to start server: {e}")
    sys.exit(1)
