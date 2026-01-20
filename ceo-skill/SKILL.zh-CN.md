---
name: ceo-skill
description: 智能项目管理仪表盘 - 以 CEO 视角查看所有项目状态、优先级和待办事项
---

# CEO Skill

你的智能项目管理仪表盘。像 CEO 一样思考 - 鸟瞰所有项目，按潜在价值和紧急程度排序。

## 用法

| 命令 | 说明 |
|------|------|
| `/ceo` | 显示项目排名仪表盘（每日首次运行时自动触发） |
| `/ceo scan` | 重新扫描代码库中的所有项目 |
| `/ceo config` | 配置评分权重和设置 |
| `/ceo <name>` | 查看特定项目的详细信息 |
| `/ceo todo <name>` | 管理项目待办事项 |
| `/ceo jump <name>` | 生成终端命令以在新 Claude Code 中打开项目 |

## 触发词

以下自然语言短语应触发此技能：
- "显示我所有的项目"
- "今天我应该做什么？"
- "项目概览/仪表盘"
- "哪个项目最重要？"
- "列出所有项目及优先级"

## 支持的项目类型

| 类型 | 标识文件 | 依赖检测 |
|------|----------|---------|
| Node.js | `package.json` | dependencies + devDependencies |
| Python | `pyproject.toml` 或 `requirements.txt` | [project.dependencies] 或行数 |
| Go | `go.mod` | require 块 |
| Rust | `Cargo.toml` | [dependencies] |

## 评估维度

### 1. 复杂度评分 (0-100)

| 指标 | 权重 | 检测方式 |
|------|------|---------|
| 代码文件数 | 25% | 根据项目类型扫描对应扩展名 |
| 依赖数量 | 20% | 解析配置文件 |
| 技术栈 | 20% | 检测 monorepo、数据库、测试框架 |
| 目录深度 | 15% | 项目结构最大深度 |
| 配置文件数 | 10% | `*.config.*`、`*.toml`、`*.yaml` 等 |
| 脚本数量 | 10% | scripts/Makefile/justfile |

**按项目类型扫描的文件扩展名：**
- Node.js: `*.ts`, `*.tsx`, `*.js`, `*.jsx`
- Python: `*.py`
- Go: `*.go`
- Rust: `*.rs`

### 2. ROI 评分 (0-100)

**投入指标：**
- 启动时间预估（依赖数、构建脚本）
- 环境配置复杂度（.env 文件、外部服务）

**产出指标：**
- 最近 7 天提交数：`git log --since="7 days ago" --oneline | wc -l`
- 最后活跃时间
- 未完成任务数

### 3. 商业潜力评分 (0-100)

通过代码特征自动检测：

| 检测项 | 分值 | 检测方式 |
|--------|------|---------|
| 支付集成 | +25 | grep -r "stripe\|paypal\|payment\|billing" |
| 用户认证 | +20 | grep -r "auth\|login\|session\|jwt\|oauth" |
| 数据库 | +15 | 检测 drizzle/prisma/sqlalchemy/gorm 等 |
| 部署配置 | +15 | Dockerfile, vercel.json, fly.toml, k8s yaml |
| API 路由 | +10 | 检测 /api 目录或路由配置 |
| 环境变量 | +10 | .env.example 存在且有 API_KEY 类变量 |
| 域名配置 | +5 | CNAME 文件或自定义域名配置 |

### 4. 综合评分

```
final = complexity * 0.3 + roi * 0.4 + business * 0.3
```

权重可由用户自定义。

## 配置文件

### 全局配置：`~/.claude/ceo-dashboard.json`

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

### 项目级配置（可选）：`<project>/.claude/dashboard.json`

```json
{
  "name": "项目名称",
  "description": "简要描述",
  "priority_boost": 10,
  "business_override": 85,
  "todos": [
    { "title": "完成 E2E 测试", "priority": "high" }
  ]
}
```

## 执行步骤

### 首次运行：代码库初始化

首次运行时，检测代码库位置：

1. **从现有配置自动检测：**

```bash
# 优先级顺序：
# 1. port-allocator 配置
CODE_ROOT=$(jq -r '.code_root // empty' ~/.claude/port-registry.json 2>/dev/null)

# 2. share-skill 配置
if [ -z "$CODE_ROOT" ]; then
  CODE_ROOT=$(jq -r '.code_root // empty' ~/.claude/share-skill-config.json 2>/dev/null)
fi

# 3. 自动检测常见目录
if [ -z "$CODE_ROOT" ]; then
  for dir in ~/Codes ~/Code ~/Projects ~/Dev ~/Development ~/repos; do
    if [ -d "$dir" ]; then
      CODE_ROOT="$dir"
      break
    fi
  done
fi
```

2. **如果自动检测失败**，使用 AskUserQuestion：

```
无法自动检测代码库位置。

请选择或输入你的代码主目录：
  [1] ~/Codes
  [2] ~/Code
  [3] ~/Projects
  [4] 其他（自定义路径）
```

3. **初始化输出：**

```
CEO Skill 初始化中...

✓ 代码库检测: ~/Codes (来自 port-allocator)

配置已保存到: ~/.claude/ceo-dashboard.json

运行 /ceo config 可修改代码库路径
```

4. **更新用户的 CLAUDE.md**（追加模式，不覆盖现有内容）：

检查 `~/.claude/CLAUDE.md` 是否存在且不包含 CEO skill 部分。如果符合条件，追加以下内容：

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

**重要：** 先检查是否已存在该部分：
```bash
grep -q "CEO 项目仪表盘" ~/.claude/CLAUDE.md 2>/dev/null
```

如果已存在，跳过此步骤。

### 命令：`/ceo`（默认）

显示项目排名仪表盘。每日首次运行时自动触发。

1. **检查每日触发：**

```bash
TODAY=$(date +%Y-%m-%d)
LAST=$(jq -r '.last_daily_report // ""' ~/.claude/ceo-dashboard.json 2>/dev/null)

if [ "$TODAY" != "$LAST" ]; then
  # 今日首次运行 - 执行完整扫描
fi
```

2. **读取配置** `~/.claude/ceo-dashboard.json`
   - 如果不存在，运行首次初始化

3. **计算每个项目的评分：**
   - 复杂度评分
   - ROI 评分
   - 商业潜力评分
   - 最终加权评分

4. **按最终评分降序排列**项目

5. **显示仪表盘**，包含排名表格和前三详情

6. **更新 last_daily_report** 为今天日期

### 命令：`/ceo scan`

重新扫描代码库中的所有项目。

1. **读取配置**获取 `code_root`
   - 如果不存在，运行首次初始化

2. **查找所有项目文件：**

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

3. **对每个项目：**
   - 确定项目类型
   - 按扩展名统计代码文件
   - 解析依赖
   - 检查 git 活动
   - 检测商业特征
   - 计算所有评分

4. **更新配置**保存新项目数据

5. **显示扫描结果**

### 缓存策略（Token 优化）

为减少 Token 消耗，使用基于 git commit hash 的增量扫描。

#### 缓存结构

在 `ceo-dashboard.json` 的每个项目中添加：

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

#### 增量扫描算法

**步骤 1：快速变更检测（每个项目 O(1)）**

```bash
# 获取当前 commit hash - 瞬时操作
CURRENT_HASH=$(cd <project> && git rev-parse HEAD 2>/dev/null)
CACHED_HASH=$(jq -r '.projects["<name>"].cache.commit_hash // ""' ~/.claude/ceo-dashboard.json)

if [ "$CURRENT_HASH" = "$CACHED_HASH" ]; then
  echo "SKIP" # 使用缓存指标
else
  echo "SCAN" # 需要重新扫描
fi
```

**步骤 2：项目分类**

| 类别 | 条件 | 操作 |
|------|------|------|
| 新项目 | 不在缓存中 | 完整扫描 |
| 已变更 | Hash 不匹配 | 完整扫描 |
| 未变更 | Hash 匹配 | 使用缓存 |
| 非 git | 无 .git 目录 | 检查 package.json 的 mtime |

**步骤 3：选择性输出**

```bash
# 只输出变更项目的详情
# 未变更的项目只在排名中显示缓存分数
```

#### Token 节省

| 扫描类型 | Token 消耗 | 使用场景 |
|----------|-----------|---------|
| 完整扫描 | ~1,000/项目 | 新项目或已变更项目 |
| 缓存命中 | ~50/项目 | 未变更项目 |
| Hash 检查 | ~10/项目 | 所有项目 |

**节省示例：**
- 10 个项目，每天 2 个变更
- 完整扫描：10 × 1,000 = 10,000 tokens
- 使用缓存：2 × 1,000 + 8 × 50 = 2,400 tokens
- **节省：76%**

#### 每日扫描流程

```
/ceo（每日首次运行）
  │
  ├─ 读取缓存配置
  │
  ├─ 对每个已知项目：
  │   └─ git rev-parse HEAD → 与缓存比较
  │       ├─ 匹配 → 使用缓存分数
  │       └─ 不匹配 → 加入重扫队列
  │
  ├─ 检查新项目：
  │   └─ find <code_root> -name "package.json" ...
  │       └─ 将路径与缓存项目比较
  │           └─ 新路径 → 加入完整扫描队列
  │
  ├─ 只重新扫描队列中的项目
  │
  └─ 显示仪表盘（所有项目，缓存 + 新鲜数据混合）
```

#### 强制完整重扫

使用 `/ceo scan --force` 绕过缓存，重新扫描所有项目。

### 命令：`/ceo config`

配置评分权重和设置。

使用 AskUserQuestion 展示选项：

```
CEO 仪表盘配置

当前权重：
  - 复杂度: 30%
  - ROI: 40%
  - 商业: 30%

你想配置什么？
  [1] 修改评分权重
  [2] 修改代码库路径
  [3] 配置跳过规则
  [4] 重置为默认值
```

### 命令：`/ceo <name>`

查看特定项目的详细信息。

1. **查找项目**（支持部分名称匹配）
2. **显示详细指标：**
   - 所有评分明细
   - 技术栈
   - 最近提交
   - 待办事项
   - 文件统计

### 命令：`/ceo todo <name>`

管理项目待办事项。

1. **查找项目**
2. **显示当前待办事项**
3. **展示选项：**
   - 添加新待办
   - 标记完成
   - 删除待办
   - 设置优先级

### 命令：`/ceo jump <name>`

生成终端命令以打开项目。

1. **查找项目**
2. **生成命令：**

```
要跳转到 <project-name>，运行：

  cd <project-path> && claude

命令已复制到剪贴板（按 ⌘V 粘贴）
```

3. **复制到剪贴板**（如果 pbcopy 可用）：

```bash
echo "cd <project-path> && claude" | pbcopy
```

## 输出格式

### 每日仪表盘

```
╔════════════════════════════════════════════════════════════════════╗
║                      CEO 仪表盘 - 2026-01-20                       ║
╚════════════════════════════════════════════════════════════════════╝

  #  │ 项目         │ 类型   │ 评分  │ ROI │ 商业 │ 待办  │ 活跃
 ────┼──────────────┼────────┼───────┼─────┼──────┼───────┼─────────
  1  │ saifuri      │ Node   │  84.5 │  85 │  90  │   3   │ 2小时前
  2  │ kimeeru      │ Node   │  72.3 │  78 │  80  │   1   │ 1天前
  3  │ ml-pipeline  │ Python │  68.1 │  65 │  75  │   2   │ 3天前
  4  │ api-gateway  │ Go     │  55.2 │  50 │  60  │   0   │ 5天前
  5  │ livelist     │ Node   │  45.0 │  40 │  55  │   1   │ 1周前

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  #1 SAIFURI                                              评分: 84.5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  用自然语言创建你的可编程区块链钱包

  待办事项 (3):
    [高] 实现合约模拟执行
    [中] 完成 E2E 测试套件
    [低] 优化钱包创建流程 UX

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  #2 KIMEERU                                              评分: 72.3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ...

快速跳转: /ceo jump <name>
命令: [scan] 重新扫描 | [config] 设置 | [todo <name>] 管理任务
```

### 扫描结果

```
扫描完成: ~/Codes

发现项目 (N):
  ✓ saifuri (Node.js) - 156 文件, 47 依赖
  ✓ kimeeru (Node.js) - 89 文件, 32 依赖
  ✓ ml-pipeline (Python) - 45 文件, 23 依赖
  + new-project (Go) - 新发现

已跳过:
  - .next, node_modules, dist (构建产物)
  - research-folder (无项目文件)

配置已更新: ~/.claude/ceo-dashboard.json
```

### 项目详情

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SAIFURI                                                  评分: 84.5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  路径: ~/Codes/saifuri
  类型: Node.js (Next.js)

  评分明细:
    复杂度:  78/100 (加权: 23.4)
    ROI:     85/100 (加权: 34.0)
    商业:    90/100 (加权: 27.0)
    ─────────────────────────────
    最终:    84.4

  指标:
    文件:     156 (ts: 120, tsx: 36)
    依赖:     47
    最后提交: 2小时前
    提交数(7天): 24

  技术栈:
    [next] [drizzle] [viem] [tailwind]

  检测到的商业特征:
    ✓ 支付集成 (stripe)
    ✓ 用户认证 (jwt)
    ✓ 数据库 (drizzle)
    ✓ 部署配置 (vercel.json)

  待办事项 (3):
    [高] 实现合约模拟执行
    [中] 完成 E2E 测试套件
    [低] 优化钱包创建流程 UX

快速跳转: cd ~/Codes/saifuri && claude
```

## 与其他技能集成

- **port-allocator**：复用项目扫描逻辑，显示端口信息
- **share-skill**：复用配置文件模式

## 注意事项

1. **每日自动触发** - 每天首次 `/ceo` 调用会执行完整扫描
2. **追加模式** - 不覆盖用户现有配置，始终合并
3. **部分名称匹配** - 项目名称可以部分匹配
4. **项目级覆盖** - 在项目中使用 `.claude/dashboard.json` 进行自定义设置
5. **剪贴板支持** - 跳转命令在 macOS 上自动复制
