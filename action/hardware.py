#!/usr/bin/env python3
"""
EcoCompute — Hardware Detection Module

Detects GPU model, driver version, CUDA version, and maps to known
architecture profiles from the EcoCompute reference dataset.

No heavy dependencies — uses nvidia-smi CLI only.
"""

import hashlib
import json
import os
import re
import subprocess
from dataclasses import asdict, dataclass
from typing import Optional


# ---------------------------------------------------------------------------
# Known GPU architecture profiles (from hardware_profiles.md)
# ---------------------------------------------------------------------------

KNOWN_GPUS = {
    # Blackwell
    "rtx 5090": {"arch": "blackwell", "sm": 120, "vram_gb": 32, "tdp_w": 575, "idle_w": 22},
    "rtx 5080": {"arch": "blackwell", "sm": 120, "vram_gb": 16, "tdp_w": 360, "idle_w": 18},
    # Ada Lovelace
    "rtx 4090": {"arch": "ada", "sm": 89, "vram_gb": 24, "tdp_w": 450, "idle_w": 17},
    "rtx 4090d": {"arch": "ada", "sm": 89, "vram_gb": 24, "tdp_w": 425, "idle_w": 17},
    "rtx 4080": {"arch": "ada", "sm": 89, "vram_gb": 16, "tdp_w": 320, "idle_w": 15},
    "rtx 4070": {"arch": "ada", "sm": 89, "vram_gb": 12, "tdp_w": 200, "idle_w": 12},
    # Ampere
    "a800": {"arch": "ampere", "sm": 80, "vram_gb": 80, "tdp_w": 400, "idle_w": 65},
    "a100": {"arch": "ampere", "sm": 80, "vram_gb": 80, "tdp_w": 400, "idle_w": 65},
    "a6000": {"arch": "ampere", "sm": 86, "vram_gb": 48, "tdp_w": 300, "idle_w": 25},
    "rtx 3090": {"arch": "ampere", "sm": 86, "vram_gb": 24, "tdp_w": 350, "idle_w": 20},
    "rtx 3080": {"arch": "ampere", "sm": 86, "vram_gb": 10, "tdp_w": 320, "idle_w": 18},
    # Hopper
    "h100": {"arch": "hopper", "sm": 90, "vram_gb": 80, "tdp_w": 700, "idle_w": 70},
    "h200": {"arch": "hopper", "sm": 90, "vram_gb": 141, "tdp_w": 700, "idle_w": 70},
    # Volta
    "v100": {"arch": "volta", "sm": 70, "vram_gb": 32, "tdp_w": 300, "idle_w": 40},
    # Cloud GPUs
    "t4": {"arch": "turing", "sm": 75, "vram_gb": 16, "tdp_w": 70, "idle_w": 10},
    "l4": {"arch": "ada", "sm": 89, "vram_gb": 24, "tdp_w": 72, "idle_w": 12},
    "l40s": {"arch": "ada", "sm": 89, "vram_gb": 48, "tdp_w": 350, "idle_w": 30},
}

# Cross-architecture energy scaling factors (relative to RTX 4090D FP16 baseline)
# Derived from paradox_data.md: Mistral-7B FP16, BS=1
ARCH_ENERGY_SCALE = {
    "blackwell": 0.85,   # RTX 5090 estimated ~15% more efficient
    "ada": 1.00,         # RTX 4090D baseline
    "ampere": 0.77,      # A800 FP16: 4,334 / 5,661 = 0.77 (more efficient due to HBM)
    "hopper": 0.65,      # H100 estimated ~35% more efficient than 4090D
    "turing": 1.40,      # T4 estimated ~40% less efficient
    "volta": 1.50,       # V100 estimated ~50% less efficient
}


@dataclass
class HardwareInfo:
    gpu_name: str = "Unknown"
    gpu_count: int = 0
    driver_version: str = "Unknown"
    cuda_version: str = "Unknown"
    vram_total_mb: int = 0
    architecture: str = "unknown"
    known_profile: bool = False
    tdp_w: int = 0
    idle_w: int = 0
    energy_scale: float = 1.0
    hardware_hash: str = ""

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, d: dict) -> "HardwareInfo":
        return cls(**{k: v for k, v in d.items() if k in cls.__dataclass_fields__})


def detect_gpu() -> HardwareInfo:
    """Detect GPU hardware using nvidia-smi. Returns HardwareInfo."""
    info = HardwareInfo()

    # Try nvidia-smi --query-gpu
    try:
        result = subprocess.run(
            [
                "nvidia-smi",
                "--query-gpu=name,driver_version,memory.total,count",
                "--format=csv,noheader,nounits",
            ],
            capture_output=True, text=True, check=True, timeout=10,
        )
        lines = result.stdout.strip().split('\n')
        if lines and lines[0]:
            parts = [p.strip() for p in lines[0].split(',')]
            if len(parts) >= 3:
                info.gpu_name = parts[0]
                info.driver_version = parts[1]
                info.vram_total_mb = int(float(parts[2]))
                info.gpu_count = len(lines)
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        pass

    # Get CUDA version
    try:
        result = subprocess.run(
            ["nvidia-smi"],
            capture_output=True, text=True, check=True, timeout=10,
        )
        cuda_match = re.search(r'CUDA Version:\s*([\d.]+)', result.stdout)
        if cuda_match:
            info.cuda_version = cuda_match.group(1)
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        pass

    # Try nvcc as fallback for CUDA version
    if info.cuda_version == "Unknown":
        try:
            result = subprocess.run(
                ["nvcc", "--version"],
                capture_output=True, text=True, check=True, timeout=10,
            )
            cuda_match = re.search(r'release\s+([\d.]+)', result.stdout)
            if cuda_match:
                info.cuda_version = cuda_match.group(1)
        except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
            pass

    # Match against known GPU profiles
    gpu_lower = info.gpu_name.lower()
    for key, profile in KNOWN_GPUS.items():
        if key in gpu_lower:
            info.architecture = profile["arch"]
            info.known_profile = True
            info.tdp_w = profile["tdp_w"]
            info.idle_w = profile["idle_w"]
            info.energy_scale = ARCH_ENERGY_SCALE.get(profile["arch"], 1.0)
            break

    # Generate hardware hash for cache isolation
    hash_input = f"{info.gpu_name}|{info.driver_version}|{info.vram_total_mb}"
    info.hardware_hash = hashlib.md5(hash_input.encode()).hexdigest()[:12]

    return info


def format_hardware_section(info: HardwareInfo) -> str:
    """Format hardware info as Markdown section for the audit report."""
    lines = []
    lines.append("### 🖥️ Hardware Environment")
    lines.append("")

    if info.gpu_count == 0:
        lines.append(
            "> ⚠️ **No GPU detected.** Energy measurement requires NVIDIA GPU. "
            "This run uses static analysis + estimation only."
        )
        return '\n'.join(lines)

    lines.append(f"| Property | Value |")
    lines.append(f"|----------|-------|")
    lines.append(f"| GPU | **{info.gpu_name}** {'(' + info.architecture.title() + ')' if info.known_profile else ''} |")
    lines.append(f"| GPU Count | {info.gpu_count} |")
    lines.append(f"| VRAM | {info.vram_total_mb / 1024:.1f} GB |")
    lines.append(f"| Driver | {info.driver_version} |")
    lines.append(f"| CUDA | {info.cuda_version} |")

    if info.known_profile:
        lines.append(f"| TDP | {info.tdp_w}W |")
        lines.append(f"| Architecture Match | ✅ Matched to reference dataset |")
        lines.append(f"| Energy Scale Factor | {info.energy_scale:.2f}× (vs RTX 4090D baseline) |")
    else:
        lines.append(f"| Architecture Match | ⚠️ Not in reference dataset — estimates may vary |")

    lines.append(f"| Hardware Hash | `{info.hardware_hash}` |")
    lines.append("")

    return '\n'.join(lines)


if __name__ == "__main__":
    info = detect_gpu()
    print(json.dumps(info.to_dict(), indent=2))
    print()
    print(format_hardware_section(info))
