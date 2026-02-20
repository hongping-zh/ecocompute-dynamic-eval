#!/usr/bin/env python3
"""
EcoCompute — Calibration & Baseline Module

Provides:
1. Lightweight GPU benchmark for establishing energy baselines
2. Baseline storage/loading (JSON, compatible with GitHub Actions cache)
3. Relative change calculation between runs
4. Cross-architecture energy estimation

No ML dependencies — uses raw CUDA matrix ops via PyTorch if available,
falls back to nvidia-smi power sampling if not.
"""

import json
import os
import subprocess
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Optional

from hardware import HardwareInfo


# ---------------------------------------------------------------------------
# Reference energy data (from paradox_data.md & batch_size_guide.md)
# Mistral-7B, BS=1, J/1k tokens
# ---------------------------------------------------------------------------

REFERENCE_ENERGY = {
    # (architecture, quantization) → J/1k tokens for Mistral-7B BS=1
    ("ada", "fp16"): 5661,
    ("ada", "nf4"): 3707,
    ("ada", "int8_default"): 7401,
    ("ada", "int8_pure"): 5212,
    ("ampere", "fp16"): 4334,
    ("ampere", "int8_default"): 9608,
    ("ampere", "int8_pure"): 5781,
    ("blackwell", "fp16"): 4908,     # Phi-3-mini data, scaled
    ("blackwell", "nf4"): 5483,     # Phi-3-mini data
}

# Batch size energy scaling (from batch_size_guide.md, A800 Mistral-7B Pure INT8)
BS_ENERGY_SCALE = {
    1: 1.000,
    2: 0.535,   # -46.5%
    4: 0.268,   # -73.3%
    8: 0.125,   # -87.5%
    16: 0.069,  # -93.1%
    32: 0.051,  # -94.9%
    64: 0.043,  # -95.7%
}


@dataclass
class Baseline:
    """Stored baseline from a previous run."""
    hardware_hash: str = ""
    gpu_name: str = ""
    timestamp: str = ""
    benchmark_score: float = 0.0     # TFLOPS from matrix benchmark
    power_draw_w: float = 0.0        # Average power during benchmark
    energy_per_tflop: float = 0.0    # J per TFLOP (normalize metric)
    issues_found: int = 0
    critical_count: int = 0
    warning_count: int = 0
    commit_sha: str = ""
    branch: str = ""

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, d: dict) -> "Baseline":
        return cls(**{k: v for k, v in d.items() if k in cls.__dataclass_fields__})


@dataclass
class CalibrationResult:
    """Result of a calibration run."""
    benchmark_score: float = 0.0     # TFLOPS
    power_draw_w: float = 0.0        # Average watts during benchmark
    energy_per_tflop: float = 0.0    # Joules per TFLOP
    duration_s: float = 0.0
    method: str = "none"             # "pytorch", "nvidia-smi", "estimated"


@dataclass
class RelativeChange:
    """Comparison between current run and baseline."""
    has_baseline: bool = False
    same_hardware: bool = False
    energy_change_pct: float = 0.0   # + = worse, - = better
    issues_change: int = 0
    critical_change: int = 0
    benchmark_change_pct: float = 0.0
    passed: bool = True
    reason: str = ""


# ---------------------------------------------------------------------------
# Baseline file management
# ---------------------------------------------------------------------------

BASELINE_DIR = ".ecocompute"
BASELINE_FILE = "baseline.json"


def get_baseline_path() -> Path:
    """Get path to baseline file, respecting GITHUB_WORKSPACE."""
    workspace = os.environ.get("GITHUB_WORKSPACE", ".")
    return Path(workspace) / BASELINE_DIR / BASELINE_FILE


def load_baseline(hardware_hash: str = "") -> Optional[Baseline]:
    """Load baseline from file. Optionally filter by hardware hash."""
    path = get_baseline_path()
    if not path.exists():
        return None

    try:
        with open(path) as f:
            data = json.load(f)

        # Support multiple baselines keyed by hardware_hash
        if isinstance(data, dict) and "baselines" in data:
            baselines = data["baselines"]
            if hardware_hash and hardware_hash in baselines:
                return Baseline.from_dict(baselines[hardware_hash])
            elif baselines:
                # Return most recent if no hash match
                latest = max(baselines.values(), key=lambda b: b.get("timestamp", ""))
                return Baseline.from_dict(latest)
        elif isinstance(data, dict):
            return Baseline.from_dict(data)

    except (json.JSONDecodeError, KeyError, TypeError) as e:
        print(f"Warning: Could not load baseline: {e}")

    return None


def save_baseline(baseline: Baseline):
    """Save baseline to file, keyed by hardware hash."""
    path = get_baseline_path()
    path.parent.mkdir(parents=True, exist_ok=True)

    # Load existing baselines
    data = {"baselines": {}}
    if path.exists():
        try:
            with open(path) as f:
                data = json.load(f)
            if "baselines" not in data:
                data = {"baselines": {}}
        except (json.JSONDecodeError, TypeError):
            data = {"baselines": {}}

    # Upsert by hardware hash
    key = baseline.hardware_hash or "default"
    data["baselines"][key] = baseline.to_dict()

    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"Baseline saved to {path} (key: {key})")


# ---------------------------------------------------------------------------
# GPU Benchmark
# ---------------------------------------------------------------------------

def run_pytorch_benchmark(duration_s: float = 5.0) -> CalibrationResult:
    """Run a lightweight matrix multiplication benchmark using PyTorch.
    Returns TFLOPS and average power draw.
    """
    result = CalibrationResult(method="pytorch")

    try:
        import torch
        if not torch.cuda.is_available():
            print("  PyTorch available but no CUDA device.")
            return result

        device = torch.device("cuda:0")
        # Warmup
        a = torch.randn(2048, 2048, device=device, dtype=torch.float16)
        b = torch.randn(2048, 2048, device=device, dtype=torch.float16)
        for _ in range(5):
            torch.mm(a, b)
        torch.cuda.synchronize()

        # Benchmark
        total_flops = 0
        power_samples = []
        start = time.time()

        while time.time() - start < duration_s:
            torch.mm(a, b)
            torch.cuda.synchronize()
            # 2 * N^3 FLOPs for matrix multiply
            total_flops += 2 * (2048 ** 3)

            # Sample power via nvidia-smi
            try:
                r = subprocess.run(
                    ["nvidia-smi", "--query-gpu=power.draw", "--format=csv,noheader,nounits"],
                    capture_output=True, text=True, timeout=2,
                )
                if r.returncode == 0:
                    power = float(r.stdout.strip().split('\n')[0])
                    power_samples.append(power)
            except (subprocess.CalledProcessError, FileNotFoundError,
                    subprocess.TimeoutExpired, ValueError):
                pass

        elapsed = time.time() - start
        result.benchmark_score = total_flops / elapsed / 1e12  # TFLOPS
        result.duration_s = elapsed

        if power_samples:
            result.power_draw_w = sum(power_samples) / len(power_samples)
            if result.benchmark_score > 0:
                result.energy_per_tflop = result.power_draw_w / result.benchmark_score

        del a, b
        torch.cuda.empty_cache()

    except ImportError:
        print("  PyTorch not available — skipping compute benchmark.")
    except Exception as e:
        print(f"  PyTorch benchmark error: {e}")

    return result


def run_power_benchmark(duration_s: float = 3.0) -> CalibrationResult:
    """Fallback: sample idle and load power via nvidia-smi only."""
    result = CalibrationResult(method="nvidia-smi")

    try:
        power_samples = []
        start = time.time()

        while time.time() - start < duration_s:
            r = subprocess.run(
                ["nvidia-smi", "--query-gpu=power.draw", "--format=csv,noheader,nounits"],
                capture_output=True, text=True, timeout=2,
            )
            if r.returncode == 0:
                power = float(r.stdout.strip().split('\n')[0])
                power_samples.append(power)
            time.sleep(0.2)  # ~5 Hz

        if power_samples:
            result.power_draw_w = sum(power_samples) / len(power_samples)
            result.duration_s = time.time() - start

    except (subprocess.CalledProcessError, FileNotFoundError,
            subprocess.TimeoutExpired, ValueError):
        pass

    return result


def calibrate(hw: HardwareInfo, force: bool = False) -> CalibrationResult:
    """Run calibration benchmark. Tries PyTorch first, falls back to nvidia-smi."""
    if hw.gpu_count == 0:
        print("No GPU detected — using estimation mode.")
        return CalibrationResult(method="estimated")

    print("Running calibration benchmark...")

    # Try PyTorch first (more accurate)
    result = run_pytorch_benchmark(duration_s=5.0)
    if result.benchmark_score > 0:
        print(f"  PyTorch benchmark: {result.benchmark_score:.1f} TFLOPS, "
              f"{result.power_draw_w:.0f}W avg")
        return result

    # Fallback to nvidia-smi power sampling
    result = run_power_benchmark(duration_s=3.0)
    if result.power_draw_w > 0:
        print(f"  Power sampling: {result.power_draw_w:.0f}W avg")
        return result

    # Last resort: estimate from known profile
    if hw.known_profile:
        result = CalibrationResult(
            method="estimated",
            power_draw_w=(hw.tdp_w + hw.idle_w) / 2,  # rough midpoint
        )
        print(f"  Estimated from profile: {result.power_draw_w:.0f}W")

    return result


# ---------------------------------------------------------------------------
# Relative change calculation
# ---------------------------------------------------------------------------

def compute_relative_change(
    current_issues: int,
    current_critical: int,
    current_warning: int,
    hw: HardwareInfo,
    cal: CalibrationResult,
    threshold_pct: float = 5.0,
) -> RelativeChange:
    """Compare current audit results against stored baseline."""
    baseline = load_baseline(hw.hardware_hash)

    if baseline is None:
        return RelativeChange(
            has_baseline=False,
            reason="No baseline found. This run will be saved as the new baseline.",
        )

    change = RelativeChange(has_baseline=True)
    change.same_hardware = (baseline.hardware_hash == hw.hardware_hash)
    change.issues_change = current_issues - baseline.issues_found
    change.critical_change = current_critical - baseline.critical_count

    # Energy comparison (via benchmark score if available)
    if cal.energy_per_tflop > 0 and baseline.energy_per_tflop > 0:
        change.energy_change_pct = (
            (cal.energy_per_tflop - baseline.energy_per_tflop)
            / baseline.energy_per_tflop * 100
        )
    elif cal.benchmark_score > 0 and baseline.benchmark_score > 0:
        # Lower score = worse efficiency → invert
        change.benchmark_change_pct = (
            (baseline.benchmark_score - cal.benchmark_score)
            / baseline.benchmark_score * 100
        )

    # Pass/fail logic
    if change.critical_change > 0:
        change.passed = False
        change.reason = (
            f"❌ {change.critical_change} new critical issue(s) introduced."
        )
    elif change.energy_change_pct > threshold_pct:
        change.passed = False
        change.reason = (
            f"❌ Energy efficiency degraded by {change.energy_change_pct:.1f}% "
            f"(threshold: {threshold_pct}%)."
        )
    elif change.issues_change > 0:
        change.passed = True
        change.reason = (
            f"⚠️ {change.issues_change} new issue(s) found, but no critical regressions."
        )
    else:
        change.passed = True
        if change.issues_change < 0:
            change.reason = f"✅ {abs(change.issues_change)} issue(s) fixed!"
        else:
            change.reason = "✅ No regressions detected."

    return change


# ---------------------------------------------------------------------------
# Energy estimation (cross-architecture)
# ---------------------------------------------------------------------------

def estimate_energy(
    model_params_b: float,
    quantization: str,
    batch_size: int,
    hw: HardwareInfo,
) -> dict:
    """Estimate energy consumption based on hardware profile and reference data.
    Returns dict with estimated J/1k tokens and confidence level.
    """
    arch = hw.architecture if hw.known_profile else "ada"  # default to 4090D

    # Find closest reference data
    key = (arch, quantization)
    if key not in REFERENCE_ENERGY:
        # Try architecture-only match with fp16
        key = (arch, "fp16")
    if key not in REFERENCE_ENERGY:
        key = ("ada", "fp16")  # ultimate fallback

    base_energy = REFERENCE_ENERGY[key]

    # Scale by model size (reference is 7B Mistral)
    model_scale = model_params_b / 7.0

    # Scale by batch size
    bs_scale = 1.0
    if batch_size in BS_ENERGY_SCALE:
        bs_scale = BS_ENERGY_SCALE[batch_size]
    else:
        # Interpolate using power law: E ≈ C / BS^0.78
        bs_scale = 1.0 / (batch_size ** 0.78)

    # Scale by architecture (if not directly measured)
    arch_scale = hw.energy_scale if hw.known_profile else 1.0

    estimated = base_energy * model_scale * bs_scale * arch_scale
    confidence = "HIGH" if hw.known_profile and key[0] == arch else "MEDIUM"
    if not hw.known_profile:
        confidence = "LOW"

    return {
        "energy_j_per_1k_tok": round(estimated, 0),
        "confidence": confidence,
        "reference_key": f"{key[0]}/{key[1]}",
        "model_scale": round(model_scale, 2),
        "bs_scale": round(bs_scale, 3),
        "arch_scale": round(arch_scale, 2),
    }


# ---------------------------------------------------------------------------
# Report formatting
# ---------------------------------------------------------------------------

def format_relative_change(change: RelativeChange, baseline: Optional[Baseline]) -> str:
    """Format relative change as Markdown section."""
    lines = []
    lines.append("### 📈 Relative Change (vs Baseline)")
    lines.append("")

    if not change.has_baseline:
        lines.append(f"> {change.reason}")
        lines.append("")
        return '\n'.join(lines)

    # Status badge
    status = "✅ PASSED" if change.passed else "❌ FAILED"
    lines.append(f"**Status: {status}**")
    lines.append("")
    lines.append(f"> {change.reason}")
    lines.append("")

    # Details table
    lines.append("| Metric | Baseline | Current | Change |")
    lines.append("|--------|----------|---------|--------|")

    if baseline:
        lines.append(
            f"| Issues | {baseline.issues_found} | "
            f"{baseline.issues_found + change.issues_change} | "
            f"{'+' if change.issues_change > 0 else ''}{change.issues_change} |"
        )
        lines.append(
            f"| Critical | {baseline.critical_count} | "
            f"{baseline.critical_count + change.critical_change} | "
            f"{'+' if change.critical_change > 0 else ''}{change.critical_change} |"
        )

        if change.energy_change_pct != 0:
            direction = "📈" if change.energy_change_pct > 0 else "📉"
            lines.append(
                f"| Energy/TFLOP | {baseline.energy_per_tflop:.1f} J | "
                f"— | {direction} {change.energy_change_pct:+.1f}% |"
            )

        if not change.same_hardware:
            lines.append("")
            lines.append(
                f"⚠️ **Hardware changed** since baseline "
                f"(was: `{baseline.gpu_name}`, hash: `{baseline.hardware_hash}`). "
                f"Comparison may be affected."
            )

        lines.append("")
        lines.append(
            f"*Baseline from commit `{baseline.commit_sha[:7] if baseline.commit_sha else 'unknown'}` "
            f"on `{baseline.branch or 'unknown'}` ({baseline.timestamp or 'unknown'})*"
        )

    lines.append("")
    return '\n'.join(lines)


def format_estimation(est: dict, model_name: str, batch_size: int) -> str:
    """Format energy estimation as Markdown section."""
    lines = []
    lines.append("### ⚡ Energy Estimation")
    lines.append("")
    lines.append(f"| Parameter | Value |")
    lines.append(f"|-----------|-------|")
    lines.append(f"| Model | {model_name} |")
    lines.append(f"| Batch Size | {batch_size} |")
    lines.append(f"| Estimated Energy | **{est['energy_j_per_1k_tok']:.0f} J/1k tokens** |")
    lines.append(f"| Confidence | {est['confidence']} |")
    lines.append(f"| Reference | {est['reference_key']} × {est['model_scale']}× (model) × {est['bs_scale']}× (BS) × {est['arch_scale']}× (arch) |")
    lines.append("")

    if est['confidence'] == "LOW":
        lines.append(
            "> ⚠️ Low confidence — hardware not in reference dataset. "
            "Run `calibrate: true` to establish a local baseline."
        )
    elif est['confidence'] == "MEDIUM":
        lines.append(
            "> Estimation based on architecture scaling. "
            "For exact values, see the [interactive dashboard]"
            "(https://hongping-zh.github.io/ecocompute-dynamic-eval/)."
        )

    lines.append("")
    return '\n'.join(lines)


if __name__ == "__main__":
    from hardware import detect_gpu
    hw = detect_gpu()
    print(f"Hardware: {hw.gpu_name} ({hw.architecture})")

    cal = calibrate(hw)
    print(f"Calibration: {cal.method}, {cal.benchmark_score:.1f} TFLOPS")

    est = estimate_energy(7.0, "fp16", 1, hw)
    print(f"Estimation: {json.dumps(est, indent=2)}")
