---
name: call-agy-cli
description: >-
  Use this skill when the user wants to invoke, automate, script, or delegate tasks using the Antigravity CLI (agy) or agentapi, run headless agent commands, verify CLI setup, or manage CLI workflows.
---

# Antigravity CLI (`agy`) Execution & Automation Skill

This skill provides step-by-step instructions, safety rules, and helper scripts for invoking and orchestrating the Antigravity CLI (`agy`) and `agentapi` from within agent sessions, background scripts, or terminal workflows.

---

## 1. Safety Rules & Execution Guidelines

> [!IMPORTANT]
> **Always use Headless / Prompt Mode (`-p` / `--prompt`):**
> Running `agy` without flags launches an interactive Text User Interface (TUI). When executed by an automated script or background tool, this will cause the command to hang waiting for user stdin.
> **Never** execute bare `agy` inside automated scripts or agent tool calls.

- **Non-interactive execution:** Always pass `-p "<prompt>"` or pipe input via stdin.
- **Model selection:** Use `--model <flash|pro>` when you need a specific reasoning tier.
- **Auto-approval / Turbo:** If executing unattended batch jobs, specify appropriate flags or configuration.

---

## 2. Quick Command Reference

| Action | Command |
| :--- | :--- |
| **Check Installation** | `agy --version` or `.\scripts\check-agy.ps1` |
| **Run One-Shot Task** | `agy -p "Viết unit test cho auth service"` |
| **Specify Model** | `agy --model flash -p "Tóm tắt file README.md"` |
| **Pipe Input** | `Get-Content task.txt \| agy -p "Thực thi tác vụ này"` |
| **Agent API (Fallback)** | `agentapi new-conversation --model=flash "Prompt nội dung"` |

For full CLI flags, slash commands, and configuration keys, consult [references/cli-reference.md](./references/cli-reference.md).

---

## 3. Execution Procedures

### Step 1: Verify CLI Availability
Run the helper script or check if `agy` is in the system PATH:
```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/call-agy-cli/scripts/check-agy.ps1
```

If `agy` is not installed:
- **Windows (PowerShell):**
  ```powershell
  irm https://antigravity.google/cli/install.ps1 | iex
  ```
- **Windows (WinGet):**
  ```cmd
  winget install Google.Antigravity.CLI
  ```
- **macOS / Linux:**
  ```bash
  curl -fsSL https://antigravity.google/cli/install.sh | bash
  ```

### Step 2: Execute Headless Prompt
Invoke `agy` safely using the helper runner:
```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/call-agy-cli/scripts/invoke-agy.ps1 -Prompt "Nội dung yêu cầu cần xử lý" -Model "flash"
```

Or call `agy` directly:
```bash
agy -p "Nội dung yêu cầu"
```

### Step 3: Inspect Output and Verify Result
1. Check the CLI exit code (`0` for success).
2. For long-running automated tasks, check logs generated in `~/.gemini/antigravity-cli/cli.log`.
