#!/usr/bin/env python3
"""
EcoCompute Energy Audit — GitHub Action Script

Scans Python files in PR diffs for LLM energy waste patterns.
Based on 93+ empirical measurements across RTX 5090, RTX 4090D, and A800.

Detection rules derived from the EcoCompute OpenClaw Skill v2.0 AUDIT protocol:
  https://clawhub.ai/hongping-zh/ecocompute

Author: Hongping Zhang
"""

import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass, field
from enum import IntEnum
from pathlib import Path
from typing import Optional


# ---------------------------------------------------------------------------
# Severity levels
# ---------------------------------------------------------------------------

class Severity(IntEnum):
    INFO = 0
    WARNING = 1
    CRITICAL = 2


SEVERITY_LABELS = {
    Severity.CRITICAL: "🔴 Critical",
    Severity.WARNING: "🟡 Warning",
    Severity.INFO: "🟠 Info",
}

SEVERITY_THRESHOLD_MAP = {
    "info": Severity.INFO,
    "warning": Severity.WARNING,
    "critical": Severity.CRITICAL,
}


# ---------------------------------------------------------------------------
# Issue data class
# ---------------------------------------------------------------------------

@dataclass
class Issue:
    severity: Severity
    title: str
    description: str
    fix: str
    file: str
    line: Optional[int] = None
    energy_impact: str = ""


# ---------------------------------------------------------------------------
# Detection rules — derived from OpenClaw Skill AUDIT protocol
# ---------------------------------------------------------------------------

def detect_default_int8(content: str, filename: str) -> list[Issue]:
    """Rule 1: load_in_8bit=True without llm_int8_threshold=0.0
    Energy impact: +17-147% vs FP16 (paradox_data.md)
    """
    issues = []

    # Find load_in_8bit=True
    int8_pattern = re.compile(
        r'load_in_8bit\s*=\s*True', re.IGNORECASE
    )
    threshold_pattern = re.compile(
        r'llm_int8_threshold\s*=\s*0(?:\.0)?', re.IGNORECASE
    )

    lines = content.split('\n')
    has_int8 = False
    has_threshold_fix = False
    int8_line = None

    for i, line in enumerate(lines, 1):
        stripped = line.split('#')[0]  # ignore comments
        if int8_pattern.search(stripped):
            has_int8 = True
            int8_line = i
        if threshold_pattern.search(stripped):
            has_threshold_fix = True

    if has_int8 and not has_threshold_fix:
        issues.append(Issue(
            severity=Severity.CRITICAL,
            title="Default INT8 (bitsandbytes mixed-precision decomposition)",
            description=(
                "`load_in_8bit=True` without `llm_int8_threshold=0.0` causes "
                "17–147% energy waste due to INT8↔FP16 type conversion at every "
                "linear layer. Measured on RTX 4090D (+32.7%) and A800 (+122–147%)."
            ),
            fix=(
                "Add `llm_int8_threshold=0.0` to your BitsAndBytesConfig:\n"
                "```python\n"
                "config = BitsAndBytesConfig(\n"
                "    load_in_8bit=True,\n"
                "    llm_int8_threshold=0.0,  # Disables mixed-precision decomposition\n"
                ")\n"
                "```"
            ),
            file=filename,
            line=int8_line,
            energy_impact="+17–147% energy vs FP16",
        ))

    return issues


def detect_nf4_small_model(content: str, filename: str) -> list[Issue]:
    """Rule 2: NF4/4-bit quantization on small models (<=3B)
    Energy impact: +11-29% vs FP16 (paradox_data.md)
    """
    issues = []

    nf4_pattern = re.compile(
        r'load_in_4bit\s*=\s*True', re.IGNORECASE
    )

    small_models = [
        (r'[Qq]wen2?-1\.5[Bb]', 'Qwen2-1.5B'),
        (r'[Pp]hi-?3-?mini', 'Phi-3-mini (3.8B)'),
        (r'[Pp]hi-?2', 'Phi-2 (2.7B)'),
        (r'[Gg]emma-?2[Bb]', 'Gemma-2B'),
        (r'[Tt]iny[Ll]lama', 'TinyLlama (1.1B)'),
        (r'[Ss]table[Ll][Mm]-?2?-?1\.6', 'StableLM-1.6B'),
        (r'[Oo]pt-?1\.3[Bb]', 'OPT-1.3B'),
        (r'[Oo]pt-?2\.7[Bb]', 'OPT-2.7B'),
        (r'[Gg][Pp][Tt]-?2', 'GPT-2'),
        (r'[Bb]loom-?1[Bb]', 'BLOOM-1B'),
    ]

    lines = content.split('\n')
    has_nf4 = False
    nf4_line = None
    detected_model = None

    for i, line in enumerate(lines, 1):
        stripped = line.split('#')[0]
        if nf4_pattern.search(stripped):
            has_nf4 = True
            nf4_line = i

    if has_nf4:
        for pattern, model_name in small_models:
            if re.search(pattern, content):
                detected_model = model_name
                break

    if has_nf4 and detected_model:
        issues.append(Issue(
            severity=Severity.WARNING,
            title=f"NF4 quantization on small model ({detected_model})",
            description=(
                f"NF4 (4-bit) quantization on models ≤3B wastes 11–29% energy vs FP16. "
                f"De-quantization compute overhead dominates memory savings when the model "
                f"fits comfortably in VRAM. Measured: Qwen2-1.5B +29.4%, Phi-3-mini +11.7% "
                f"on RTX 5090."
            ),
            fix=(
                f"Use FP16 instead for {detected_model}:\n"
                "```python\n"
                "model = AutoModelForCausalLM.from_pretrained(\n"
                "    model_name,\n"
                "    torch_dtype=torch.float16,\n"
                '    device_map="auto",\n'
                ")\n"
                "```"
            ),
            file=filename,
            line=nf4_line,
            energy_impact="+11–29% energy vs FP16",
        ))

    return issues


def detect_bs1_loop(content: str, filename: str) -> list[Issue]:
    """Rule 3: Sequential single-request processing (batch_size=1 pattern)
    Energy impact: up to 95.7% waste vs batched (batch_size_guide.md)
    """
    issues = []

    # Pattern: for loop calling model.generate() on single items
    loop_generate = re.compile(
        r'for\s+\w+\s+in\s+\w+.*:\s*\n'
        r'(?:\s+.*\n)*?'
        r'\s+.*\.generate\(',
        re.MULTILINE,
    )

    match = loop_generate.search(content)
    if match:
        line_num = content[:match.start()].count('\n') + 1
        issues.append(Issue(
            severity=Severity.WARNING,
            title="Sequential single-request processing (BS=1)",
            description=(
                "Processing prompts in a loop wastes up to 95.7% energy vs batched inference. "
                "Measured on A800: BS=1 → 1,768 J/request, BS=64 → 76 J/request. "
                "GPU utilization at BS=1 is only 45%."
            ),
            fix=(
                "Batch your inputs or use a serving framework:\n"
                "```python\n"
                "# Option 1: Batch with tokenizer\n"
                "inputs = tokenizer(prompts, padding=True, return_tensors='pt').to('cuda')\n"
                "outputs = model.generate(**inputs)\n"
                "\n"
                "# Option 2: Use vLLM for production\n"
                "from vllm import LLM\n"
                "llm = LLM(model=model_name)\n"
                "outputs = llm.generate(prompts)\n"
                "```"
            ),
            file=filename,
            line=line_num,
            energy_impact="Up to 95.7% energy waste vs batched",
        ))

    return issues


def detect_mixed_precision_conflict(content: str, filename: str) -> list[Issue]:
    """Rule 4: Conflicting precision settings
    e.g., load_in_8bit + load_in_4bit, or torch_dtype mismatch
    """
    issues = []

    lines = content.split('\n')
    has_8bit = False
    has_4bit = False
    line_8bit = None
    line_4bit = None

    for i, line in enumerate(lines, 1):
        stripped = line.split('#')[0]
        if re.search(r'load_in_8bit\s*=\s*True', stripped):
            has_8bit = True
            line_8bit = i
        if re.search(r'load_in_4bit\s*=\s*True', stripped):
            has_4bit = True
            line_4bit = i

    if has_8bit and has_4bit:
        issues.append(Issue(
            severity=Severity.CRITICAL,
            title="Mixed precision conflict: both INT8 and NF4 enabled",
            description=(
                "Both `load_in_8bit=True` and `load_in_4bit=True` are present in the same "
                "file. This creates undefined behavior — bitsandbytes may silently pick one, "
                "leading to unexpected energy consumption and potential errors."
            ),
            fix=(
                "Choose one quantization method. For models ≥6B on consumer GPUs, "
                "use NF4. For datacenter GPUs with ample VRAM, use FP16.\n"
                "Remove the conflicting flag."
            ),
            file=filename,
            line=line_8bit,
            energy_impact="Unpredictable",
        ))

    return issues


def detect_missing_device_map(content: str, filename: str) -> list[Issue]:
    """Rule 5: from_pretrained without device_map
    May cause CPU inference or suboptimal device placement
    """
    issues = []

    pretrained_pattern = re.compile(
        r'from_pretrained\s*\(', re.IGNORECASE
    )
    device_map_pattern = re.compile(
        r'device_map\s*=', re.IGNORECASE
    )

    lines = content.split('\n')

    for i, line in enumerate(lines, 1):
        stripped = line.split('#')[0]
        if pretrained_pattern.search(stripped):
            # Check surrounding context (±5 lines) for device_map
            context_start = max(0, i - 6)
            context_end = min(len(lines), i + 5)
            context = '\n'.join(lines[context_start:context_end])

            if not device_map_pattern.search(context):
                # Also check if it's a tokenizer call (skip those)
                if 'tokenizer' in line.lower() or 'Tokenizer' in line:
                    continue
                issues.append(Issue(
                    severity=Severity.INFO,
                    title="Missing device_map in from_pretrained()",
                    description=(
                        "Without `device_map`, the model may load on CPU or a suboptimal "
                        "device, causing significant performance degradation."
                    ),
                    fix=(
                        'Add `device_map="auto"` or `device_map="cuda"`:\n'
                        "```python\n"
                        "model = AutoModelForCausalLM.from_pretrained(\n"
                        "    model_name,\n"
                        '    device_map="auto",\n'
                        ")\n"
                        "```"
                    ),
                    file=filename,
                    line=i,
                    energy_impact="Potential: significant if model runs on CPU",
                ))
                break  # one per file is enough

    return issues


def detect_redundant_params(content: str, filename: str) -> list[Issue]:
    """Rule 6: Redundant or conflicting quantization parameters"""
    issues = []

    # Check for bnb_4bit_compute_dtype without load_in_4bit
    has_4bit_dtype = bool(re.search(r'bnb_4bit_compute_dtype', content))
    has_4bit = bool(re.search(r'load_in_4bit\s*=\s*True', content))

    if has_4bit_dtype and not has_4bit:
        issues.append(Issue(
            severity=Severity.INFO,
            title="Redundant parameter: bnb_4bit_compute_dtype without load_in_4bit",
            description=(
                "`bnb_4bit_compute_dtype` is set but `load_in_4bit` is not enabled. "
                "This parameter has no effect."
            ),
            fix="Remove `bnb_4bit_compute_dtype` or enable `load_in_4bit=True`.",
            file=filename,
            energy_impact="None (code quality)",
        ))

    # Check for bnb_4bit_quant_type without load_in_4bit
    has_quant_type = bool(re.search(r'bnb_4bit_quant_type', content))

    if has_quant_type and not has_4bit:
        issues.append(Issue(
            severity=Severity.INFO,
            title="Redundant parameter: bnb_4bit_quant_type without load_in_4bit",
            description=(
                "`bnb_4bit_quant_type` is set but `load_in_4bit` is not enabled. "
                "This parameter has no effect."
            ),
            fix="Remove `bnb_4bit_quant_type` or enable `load_in_4bit=True`.",
            file=filename,
            energy_impact="None (code quality)",
        ))

    return issues


# ---------------------------------------------------------------------------
# All detection rules
# ---------------------------------------------------------------------------

ALL_RULES = [
    detect_default_int8,
    detect_nf4_small_model,
    detect_bs1_loop,
    detect_mixed_precision_conflict,
    detect_missing_device_map,
    detect_redundant_params,
]


# ---------------------------------------------------------------------------
# Diff parsing
# ---------------------------------------------------------------------------

def get_pr_diff() -> str:
    """Get the diff of the current PR using gh CLI or git."""
    # Try GitHub Actions context
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    if event_path and Path(event_path).exists():
        with open(event_path) as f:
            event = json.load(f)
        pr_number = event.get("pull_request", {}).get("number")
        if pr_number:
            try:
                result = subprocess.run(
                    ["gh", "pr", "diff", str(pr_number), "--name-only"],
                    capture_output=True, text=True, check=True,
                )
                return result.stdout
            except (subprocess.CalledProcessError, FileNotFoundError):
                pass

    # Fallback: git diff against main/master
    for base in ["origin/main", "origin/master", "HEAD~1"]:
        try:
            result = subprocess.run(
                ["git", "diff", base, "--name-only"],
                capture_output=True, text=True, check=True,
            )
            if result.stdout.strip():
                return result.stdout
        except subprocess.CalledProcessError:
            continue

    return ""


def get_changed_python_files() -> list[str]:
    """Get list of changed Python files from the PR diff."""
    diff_output = get_pr_diff()
    files = []
    for line in diff_output.strip().split('\n'):
        line = line.strip()
        if line.endswith('.py'):
            if Path(line).exists():
                files.append(line)
    return files


def get_all_python_files() -> list[str]:
    """Fallback: scan common directories for Python files."""
    py_files = []
    scan_dirs = ['.', 'src', 'scripts', 'examples']
    for d in scan_dirs:
        p = Path(d)
        if p.exists():
            for f in p.rglob('*.py'):
                # Skip common non-relevant dirs
                parts = f.parts
                if any(skip in parts for skip in [
                    'venv', '.venv', 'node_modules', '__pycache__',
                    '.git', 'test', 'tests', 'migrations',
                ]):
                    continue
                py_files.append(str(f))
    return py_files[:50]  # cap to avoid scanning huge repos


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------

def generate_report(issues: list[Issue], files_scanned: int) -> str:
    """Generate markdown audit report."""
    critical = [i for i in issues if i.severity == Severity.CRITICAL]
    warnings = [i for i in issues if i.severity == Severity.WARNING]
    infos = [i for i in issues if i.severity == Severity.INFO]

    lines = []
    lines.append("## ⚡ EcoCompute Energy Audit")
    lines.append("")

    if not issues:
        lines.append(
            f"Scanned **{files_scanned}** Python file(s). "
            f"**No energy waste patterns detected.** ✅"
        )
        lines.append("")
        lines.append(
            "> Your quantization configuration looks good! "
            "For deeper analysis (cost estimation, carbon footprint, optimization), "
            "try the [EcoCompute OpenClaw Skill](https://clawhub.ai/hongping-zh/ecocompute)."
        )
        return '\n'.join(lines)

    issue_summary = []
    if critical:
        issue_summary.append(f"**{len(critical)}** critical")
    if warnings:
        issue_summary.append(f"**{len(warnings)}** warning(s)")
    if infos:
        issue_summary.append(f"**{len(infos)}** info")

    lines.append(
        f"Scanned **{files_scanned}** Python file(s). "
        f"Found {', '.join(issue_summary)}."
    )
    lines.append("")

    # Critical issues
    if critical:
        lines.append("### 🔴 Critical Issues")
        lines.append("")
        for issue in critical:
            loc = f"`{issue.file}`"
            if issue.line:
                loc += f" (line {issue.line})"
            lines.append(f"**{issue.title}** — {loc}")
            lines.append(f"> {issue.description}")
            lines.append("")
            lines.append(f"**Energy impact:** {issue.energy_impact}")
            lines.append("")
            lines.append(f"**Fix:** {issue.fix}")
            lines.append("")

    # Warnings
    if warnings:
        lines.append("### 🟡 Warnings")
        lines.append("")
        for issue in warnings:
            loc = f"`{issue.file}`"
            if issue.line:
                loc += f" (line {issue.line})"
            lines.append(f"**{issue.title}** — {loc}")
            lines.append(f"> {issue.description}")
            lines.append("")
            lines.append(f"**Energy impact:** {issue.energy_impact}")
            lines.append("")
            lines.append(f"**Fix:** {issue.fix}")
            lines.append("")

    # Info
    if infos:
        lines.append("### 🟠 Info")
        lines.append("")
        for issue in infos:
            loc = f"`{issue.file}`"
            if issue.line:
                loc += f" (line {issue.line})"
            lines.append(f"**{issue.title}** — {loc}")
            lines.append(f"> {issue.description}")
            lines.append("")

    # Footer
    lines.append("---")
    lines.append("")
    lines.append(
        "📊 Based on **93+ measurements** across RTX 4090D / A800 / RTX 5090 "
        "· [Full data](https://github.com/hongping-zh/ecocompute-dynamic-eval) "
        "· [Install Bot](https://github.com/apps/ecocompute-energy-auditor) "
        "· [OpenClaw Skill](https://clawhub.ai/hongping-zh/ecocompute)"
    )

    return '\n'.join(lines)


# ---------------------------------------------------------------------------
# GitHub Actions integration
# ---------------------------------------------------------------------------

def post_pr_comment(report: str):
    """Post the audit report as a PR comment using gh CLI."""
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    if not event_path or not Path(event_path).exists():
        print("No GITHUB_EVENT_PATH — skipping PR comment.")
        return

    with open(event_path) as f:
        event = json.load(f)

    pr_number = event.get("pull_request", {}).get("number")
    if not pr_number:
        print("No PR number found in event — skipping comment.")
        return

    # Check for existing comment to update (avoid duplicates)
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    marker = "<!-- ecocompute-energy-audit -->"
    report_with_marker = f"{marker}\n{report}"

    try:
        # List existing comments
        result = subprocess.run(
            ["gh", "api", f"/repos/{repo}/issues/{pr_number}/comments",
             "--jq", f'.[] | select(.body | startswith("{marker}")) | .id'],
            capture_output=True, text=True,
        )
        existing_id = result.stdout.strip().split('\n')[0] if result.stdout.strip() else ""

        if existing_id:
            # Update existing comment
            subprocess.run(
                ["gh", "api", "--method", "PATCH",
                 f"/repos/{repo}/issues/comments/{existing_id}",
                 "-f", f"body={report_with_marker}"],
                capture_output=True, text=True, check=True,
            )
            print(f"Updated existing comment #{existing_id}")
        else:
            # Create new comment
            subprocess.run(
                ["gh", "pr", "comment", str(pr_number), "--body", report_with_marker],
                capture_output=True, text=True, check=True,
            )
            print(f"Posted new comment on PR #{pr_number}")

    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"Failed to post comment: {e}")
        print("Report output to stdout instead:")
        print(report)


def set_output(name: str, value: str):
    """Set GitHub Actions output variable."""
    output_file = os.environ.get("GITHUB_OUTPUT")
    if output_file:
        with open(output_file, "a") as f:
            # Handle multiline values
            if '\n' in value:
                import uuid
                delimiter = uuid.uuid4().hex
                f.write(f"{name}<<{delimiter}\n{value}\n{delimiter}\n")
            else:
                f.write(f"{name}={value}\n")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=" * 60)
    print("⚡ EcoCompute Energy Audit")
    print("   Based on 93+ measurements · 3 GPU architectures")
    print("   Skill: https://clawhub.ai/hongping-zh/ecocompute")
    print("=" * 60)

    severity_threshold = SEVERITY_THRESHOLD_MAP.get(
        os.environ.get("SEVERITY_THRESHOLD", "warning").lower(),
        Severity.WARNING,
    )
    post_comment = os.environ.get("POST_COMMENT", "true").lower() == "true"

    # Get files to scan
    py_files = get_changed_python_files()
    scan_mode = "PR diff"

    if not py_files:
        py_files = get_all_python_files()
        scan_mode = "full scan"

    if not py_files:
        print("No Python files found to scan.")
        report = generate_report([], 0)
        set_output("issues_found", "0")
        set_output("critical_count", "0")
        set_output("warning_count", "0")
        return

    print(f"\nScan mode: {scan_mode}")
    print(f"Files to scan: {len(py_files)}")

    # Run all detection rules on all files
    all_issues: list[Issue] = []

    for filepath in py_files:
        print(f"  Scanning: {filepath}")
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except OSError as e:
            print(f"    Error reading {filepath}: {e}")
            continue

        # Quick check: skip files with no quantization-related keywords
        keywords = [
            'BitsAndBytesConfig', 'load_in_8bit', 'load_in_4bit',
            'quantization_config', 'from_pretrained', '.generate(',
            'bnb_4bit', 'llm_int8',
        ]
        if not any(kw in content for kw in keywords):
            print(f"    Skipped (no quantization keywords)")
            continue

        for rule in ALL_RULES:
            issues = rule(content, filepath)
            all_issues.extend(issues)

    # Filter by severity threshold
    filtered = [i for i in all_issues if i.severity >= severity_threshold]

    # Sort: critical first, then warning, then info
    filtered.sort(key=lambda i: (-i.severity, i.file))

    # Generate report
    report = generate_report(filtered, len(py_files))

    # Count by severity
    critical_count = len([i for i in filtered if i.severity == Severity.CRITICAL])
    warning_count = len([i for i in filtered if i.severity == Severity.WARNING])

    # Output
    print(f"\n{'=' * 60}")
    print(f"Results: {len(filtered)} issue(s) found")
    print(f"  Critical: {critical_count}")
    print(f"  Warning:  {warning_count}")
    print(f"  Info:     {len(filtered) - critical_count - warning_count}")
    print(f"{'=' * 60}\n")
    print(report)

    # Set GitHub Actions outputs
    set_output("issues_found", str(len(filtered)))
    set_output("critical_count", str(critical_count))
    set_output("warning_count", str(warning_count))

    # Save report to file
    report_file = os.environ.get("GITHUB_WORKSPACE", ".") + "/ecocompute-audit-report.md"
    try:
        with open(report_file, 'w') as f:
            f.write(report)
        set_output("report_file", report_file)
        print(f"Report saved to: {report_file}")
    except OSError:
        pass

    # Post PR comment
    if post_comment and os.environ.get("GITHUB_EVENT_PATH"):
        post_pr_comment(report)

    # Exit with failure if critical issues found (optional CI gate)
    if critical_count > 0:
        print(f"\n❌ {critical_count} critical issue(s) found. See report above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
