---
name: ceo-skill
description: Intelligent project management dashboard - view all projects status, priorities, and todos from a CEO perspective
---

# CEO Skill

Your intelligent project management dashboard. Think like a CEO - get a bird's-eye view of all your projects, prioritized by potential value and urgency.

## Usage

| Command | Description |
|---------|-------------|
| `/ceo` | Show project ranking dashboard (auto-triggered daily on first run) |
| `/ceo scan` | Rescan all projects in codebase |
| `/ceo config` | Configure scoring weights and settings |
| `/ceo <name>` | View detailed info for a specific project |
| `/ceo todo <name>` | Manage project TODOs |
| `/ceo jump <name>` | Generate terminal command to open project in new Claude Code |

## Triggers

Natural language phrases that should invoke this skill:
- "Show me all my projects"
- "What should I work on today?"
- "Project overview/dashboard"
- "Which project is most important?"
- "List all projects with priority"

## Supported Project Types

| Type | Identifier Files | Dependency Detection |
|------|------------------|---------------------|
| Node.js | `package.json` | dependencies + devDependencies |
| Python | `pyproject.toml` or `requirements.txt` | [project.dependencies] or line count |
| Go | `go.mod` | require block |
| Rust | `Cargo.toml` | [dependencies] |

## Evaluation Dimensions

### 1. Complexity Score (0-100)

| Metric | Weight | Detection Method |
|--------|--------|-----------------|
| Code files count | 25% | Scan by project type extensions |
| Dependencies count | 20% | Parse config files |
| Tech stack | 20% | Detect monorepo, database, test framework |
| Directory depth | 15% | Max project structure depth |
| Config files count | 10% | `*.config.*`, `*.toml`, `*.yaml`, etc. |
| Scripts count | 10% | scripts/Makefile/justfile |

**File extensions by project type:**
- Node.js: `*.ts`, `*.tsx`, `*.js`, `*.jsx`
- Python: `*.py`
- Go: `*.go`
- Rust: `*.rs`

### 2. ROI Score (0-100)

**Input metrics:**
- Startup time estimate (dependencies, build scripts)
- Environment config complexity (.env files, external services)

**Output metrics:**
- Commits in last 7 days: `git log --since="7 days ago" --oneline | wc -l`
- Last active time
- Pending tasks count

### 3. Business Potential Score (0-100)

Auto-detected through code characteristics:

| Detection Item | Points | Detection Method |
|---------------|--------|------------------|
| Payment integration | +25 | grep -r "stripe\|paypal\|payment\|billing" |
| User authentication | +20 | grep -r "auth\|login\|session\|jwt\|oauth" |
| Database | +15 | Detect drizzle/prisma/sqlalchemy/gorm etc. |
| Deployment config | +15 | Dockerfile, vercel.json, fly.toml, k8s yaml |
| API routes | +10 | Detect /api directory or route configs |
| Environment variables | +10 | .env.example with API_KEY type variables |
| Domain config | +5 | CNAME file or custom domain config |

### 4. Final Score

```
final = complexity * 0.3 + roi * 0.4 + business * 0.3
```

Weights are user-configurable.

## Configuration Files

### Global Config: `~/.claude/ceo-dashboard.json`

```json
{
  "version": "1.0.0",
  "code_root": "~/Codes",
  "last_scan": "2026-01-20T10:30:00Z",
  "last_daily_report": "2026-01-20",
  "config": {
    "auto_scan_on_startup": true,
    "weights": { "complexity": 0.3, "roi": 0.4, "business": 0.3 },
    "scan_depth": 3,
    "skip_patterns": [".next", "node_modules", "dist", "build", ".venv", "target"]
  },
  "projects": {}
}
```

### Project-level Config (optional): `<project>/.claude/dashboard.json`

```json
{
  "name": "Project Name",
  "description": "Brief description",
  "priority_boost": 10,
  "business_override": 85,
  "todos": [
    { "title": "Complete E2E tests", "priority": "high" }
  ]
}
```

## Execution Steps

### First Run: Codebase Initialization

On first run, detect codebase location:

1. **Auto-detect from existing configs:**

```bash
# Priority order:
# 1. port-allocator config
CODE_ROOT=$(jq -r '.code_root // empty' ~/.claude/port-registry.json 2>/dev/null)

# 2. share-skill config
if [ -z "$CODE_ROOT" ]; then
  CODE_ROOT=$(jq -r '.code_root // empty' ~/.claude/share-skill-config.json 2>/dev/null)
fi

# 3. Auto-detect common directories
if [ -z "$CODE_ROOT" ]; then
  for dir in ~/Codes ~/Code ~/Projects ~/Dev ~/Development ~/repos; do
    if [ -d "$dir" ]; then
      CODE_ROOT="$dir"
      break
    fi
  done
fi
```

2. **If auto-detection fails**, use AskUserQuestion:

```
Unable to auto-detect codebase location.

Please select or enter your main code directory:
  [1] ~/Codes
  [2] ~/Code
  [3] ~/Projects
  [4] Other (custom path)
```

3. **Initialization output:**

```
CEO Skill initializing...

✓ Codebase detected: ~/Codes (from port-allocator)

Config saved to: ~/.claude/ceo-dashboard.json

Run /ceo config to modify codebase path
```

4. **Update user's CLAUDE.md** (append, never overwrite existing content):

Check if `~/.claude/CLAUDE.md` exists and doesn't already contain CEO skill section. If so, append the following:

```markdown
## CEO 项目仪表盘

使用 `/ceo` skill 从 CEO 视角管理所有项目。

### 快速命令

| 命令 | 说明 |
|------|------|
| `/ceo` | 显示项目排名仪表盘 |
| `/ceo scan` | 重新扫描所有项目 |
| `/ceo config` | 配置评分权重 |
| `/ceo <name>` | 查看特定项目详情 |
| `/ceo todo <name>` | 管理项目待办事项 |
| `/ceo jump <name>` | 生成跳转命令 |

### 每日自动触发

每天首次运行 `/ceo` 时会自动执行完整扫描，计算所有项目的：
- **复杂度评分** (30%): 代码文件数、依赖数、技术栈
- **ROI 评分** (40%): 最近活跃度、提交频率
- **商业潜力** (30%): 支付集成、用户认证、部署配置

### 配置文件

- **仪表盘数据**: `~/.claude/ceo-dashboard.json`
- **项目级配置**: `<project>/.claude/dashboard.json`（可选）
```

**Important:** Check for existing section first:
```bash
grep -q "CEO 项目仪表盘" ~/.claude/CLAUDE.md 2>/dev/null
```

If section already exists, skip this step.

### Command: `/ceo` (default)

Show project ranking dashboard. Auto-triggered on first daily run.

1. **Check daily trigger:**

```bash
TODAY=$(date +%Y-%m-%d)
LAST=$(jq -r '.last_daily_report // ""' ~/.claude/ceo-dashboard.json 2>/dev/null)

if [ "$TODAY" != "$LAST" ]; then
  # First run today - do full scan
fi
```

2. **Read config** from `~/.claude/ceo-dashboard.json`
   - If doesn't exist, run first-run initialization

3. **Calculate scores** for each project:
   - Complexity score
   - ROI score
   - Business potential score
   - Final weighted score

4. **Sort projects** by final score descending

5. **Display dashboard** with ranking table and top 3 details

6. **Update last_daily_report** to today's date

### Command: `/ceo scan`

Rescan all projects in codebase.

1. **Read config** to get `code_root`
   - If doesn't exist, run first-run initialization

2. **Find all project files:**

```bash
find <code_root> -maxdepth 3 -type f \
  \( -name "package.json" -o -name "pyproject.toml" -o -name "requirements.txt" -o -name "go.mod" -o -name "Cargo.toml" \) \
  -not -path "*/.next/*" \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -not -path "*/.venv/*" \
  -not -path "*/target/*"
```

3. **For each project:**
   - Determine project type
   - Count code files by extension
   - Parse dependencies
   - Check git activity
   - Detect business features
   - Calculate all scores

4. **Update config** with new project data

5. **Display scan results**

### Caching Strategy (Token Optimization)

To minimize token consumption, use incremental scanning based on git commit hashes.

#### Cache Structure

Add to each project in `ceo-dashboard.json`:

```json
{
  "projects": {
    "saifuri": {
      "path": "~/Codes/saifuri",
      "cache": {
        "commit_hash": "a1b2c3d4",
        "last_full_scan": "2026-01-20T10:30:00Z",
        "metrics": {
          "files_count": 403,
          "deps_count": 68,
          "commits_7d": 102
        },
        "scores": {
          "complexity": 78,
          "roi": 98,
          "business": 85,
          "final": 92.3
        }
      }
    }
  }
}
```

#### Incremental Scan Algorithm

**Step 1: Quick change detection (O(1) per project)**

```bash
# Get current commit hash - instant operation
CURRENT_HASH=$(cd <project> && git rev-parse HEAD 2>/dev/null)
CACHED_HASH=$(jq -r '.projects["<name>"].cache.commit_hash // ""' ~/.claude/ceo-dashboard.json)

if [ "$CURRENT_HASH" = "$CACHED_HASH" ]; then
  echo "SKIP" # Use cached metrics
else
  echo "SCAN" # Needs rescan
fi
```

**Step 2: Categorize projects**

| Category | Condition | Action |
|----------|-----------|--------|
| New | Not in cache | Full scan |
| Changed | Hash mismatch | Full scan |
| Unchanged | Hash match | Use cache |
| Non-git | No .git dir | Check mtime of package.json |

**Step 3: Selective output**

```bash
# Only output details for changed projects
# For unchanged, just show cached score in ranking
```

#### Token Savings

| Scan Type | Token Cost | When Used |
|-----------|------------|-----------|
| Full scan | ~1,000/project | New or changed projects |
| Cache hit | ~50/project | Unchanged projects |
| Hash check | ~10/project | Every project |

**Example savings:**
- 10 projects, 2 changed daily
- Full scan: 10 × 1,000 = 10,000 tokens
- With cache: 2 × 1,000 + 8 × 50 = 2,400 tokens
- **Savings: 76%**

#### Daily Scan Flow

```
/ceo (daily first run)
  │
  ├─ Read cached config
  │
  ├─ For each known project:
  │   └─ git rev-parse HEAD → compare with cache
  │       ├─ Match → use cached scores
  │       └─ Mismatch → queue for rescan
  │
  ├─ Check for new projects:
  │   └─ find <code_root> -name "package.json" ...
  │       └─ Compare paths with cached projects
  │           └─ New path → queue for full scan
  │
  ├─ Rescan only queued projects
  │
  └─ Display dashboard (all projects, mixed cache + fresh)
```

#### Force Full Rescan

Use `/ceo scan --force` to bypass cache and rescan all projects.

### Command: `/ceo config`

Configure scoring weights and settings.

Use AskUserQuestion to present options:

```
CEO Dashboard Configuration

Current weights:
  - Complexity: 30%
  - ROI: 40%
  - Business: 30%

What would you like to configure?
  [1] Change scoring weights
  [2] Change codebase path
  [3] Configure skip patterns
  [4] Reset to defaults
```

### Command: `/ceo <name>`

View detailed info for a specific project.

1. **Find project** by name (partial match supported)
2. **Display detailed metrics:**
   - All score breakdowns
   - Tech stack
   - Recent commits
   - Pending todos
   - File statistics

### Command: `/ceo todo <name>`

Manage project TODOs.

1. **Find project** by name
2. **Display current todos**
3. **Present options:**
   - Add new todo
   - Mark todo complete
   - Remove todo
   - Set priority

### Command: `/ceo jump <name>`

Generate terminal command to open project.

1. **Find project** by name
2. **Generate command:**

```
To jump to <project-name>, run:

  cd <project-path> && claude

Command copied to clipboard (press ⌘V to paste)
```

3. **Copy to clipboard** (if pbcopy available):

```bash
echo "cd <project-path> && claude" | pbcopy
```

## Output Format

### Daily Dashboard

```
╔════════════════════════════════════════════════════════════════════╗
║                      CEO Dashboard - 2026-01-20                    ║
╚════════════════════════════════════════════════════════════════════╝

  #  │ Project      │ Type   │ Score │ ROI │ Biz │ Pending │ Active
 ────┼──────────────┼────────┼───────┼─────┼─────┼─────────┼─────────
  1  │ saifuri      │ Node   │  84.5 │  85 │  90 │    3    │ 2h ago
  2  │ kimeeru      │ Node   │  72.3 │  78 │  80 │    1    │ 1d ago
  3  │ ml-pipeline  │ Python │  68.1 │  65 │  75 │    2    │ 3d ago
  4  │ api-gateway  │ Go     │  55.2 │  50 │  60 │    0    │ 5d ago
  5  │ livelist     │ Node   │  45.0 │  40 │  55 │    1    │ 1w ago

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  #1 SAIFURI                                              Score: 84.5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Create your programmable blockchain wallet with natural language

  Pending Tasks (3):
    [HIGH] Implement contract simulation execution
    [MED]  Complete E2E test suite
    [LOW]  Optimize wallet creation UX

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  #2 KIMEERU                                              Score: 72.3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ...

Quick Jump: /ceo jump <name>
Commands: [scan] Rescan | [config] Settings | [todo <name>] Manage tasks
```

### Scan Results

```
Scan complete: ~/Codes

Found projects (N):
  ✓ saifuri (Node.js) - 156 files, 47 deps
  ✓ kimeeru (Node.js) - 89 files, 32 deps
  ✓ ml-pipeline (Python) - 45 files, 23 deps
  + new-project (Go) - newly discovered

Skipped:
  - .next, node_modules, dist (build artifacts)
  - research-folder (no project files)

Config updated: ~/.claude/ceo-dashboard.json
```

### Project Details

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SAIFURI                                                 Score: 84.5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Path: ~/Codes/saifuri
  Type: Node.js (Next.js)

  Score Breakdown:
    Complexity:  78/100 (weighted: 23.4)
    ROI:         85/100 (weighted: 34.0)
    Business:    90/100 (weighted: 27.0)
    ─────────────────────────────
    Final:       84.4

  Metrics:
    Files:       156 (ts: 120, tsx: 36)
    Dependencies: 47
    Last commit: 2h ago
    Commits (7d): 24

  Tech Stack:
    [next] [drizzle] [viem] [tailwind]

  Business Features Detected:
    ✓ Payment integration (stripe)
    ✓ User authentication (jwt)
    ✓ Database (drizzle)
    ✓ Deployment config (vercel.json)

  Pending Tasks (3):
    [HIGH] Implement contract simulation execution
    [MED]  Complete E2E test suite
    [LOW]  Optimize wallet creation UX

Quick Jump: cd ~/Codes/saifuri && claude
```

## Integration with Other Skills

- **port-allocator**: Reuses project scanning logic, displays port info
- **share-skill**: Reuses config file patterns

## Notes

1. **Daily auto-trigger** - First `/ceo` call each day performs a full scan
2. **Append mode** - Never overwrite user's existing config, always merge
3. **Partial name match** - Project names can be matched partially
4. **Project-level override** - Use `.claude/dashboard.json` in project for custom settings
5. **Clipboard support** - Jump commands are auto-copied on macOS
