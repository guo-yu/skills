---
name: share-skill
description: 自动分享skill、将本地skill迁移到代码仓库、skill开源、skill版本管理、配置git远端
---

# Share Skill

将用户本地临时创建的 skill 通过符号链接的方式迁移到项目仓库，并初始化 Git 进行版本跟踪。

## 使用方法

| 命令 | 说明 |
|------|------|
| `/share-skill <skill-name>` | 迁移指定 skill 到 ~/Codes/skills 并初始化 git |
| `/share-skill <skill-name> --remote <url>` | 迁移并配置远端地址 |
| `/share-skill list` | 列出所有可迁移的本地 skill |
| `/share-skill remote <alias> <endpoint>` | 配置 Git 远端别名 |
| `/share-skill remote list` | 列出已配置的远端别名 |
| `/share-skill allow` | 一次性授权本 skill 所需的权限 |
| 自然语言 | 例如："帮我把 port-allocator 开源并 push 到 github" |

## 配置文件

远端别名配置存储在 `~/.claude/share-skill-config.json`：

```json
{
  "remotes": {
    "github": "git@github.com:guo-yu/skills",
    "gitlab": "git@gitlab.com:guo-yu/skills"
  },
  "default_remote": "github",
  "auto_detected": true
}
```

### 首次运行自动检测

首次调用 share-skill 时，会自动从用户的 Git 全局配置中读取用户名：

```bash
# 读取 GitHub 用户名
git config --global user.name
# 或从 GitHub URL 模式中提取
git config --global --get-regexp "url.*github.com" | head -1
```

**自动检测逻辑：**

1. **检查配置文件是否存在**
   ```bash
   if [ ! -f ~/.claude/share-skill-config.json ]; then
     # 首次运行，执行自动检测
   fi
   ```

2. **读取 Git 全局配置**
   ```bash
   # 尝试获取用户名
   USERNAME=$(git config --global user.name)

   # 如果用户名包含空格，尝试从 GitHub 邮箱提取
   if [[ "$USERNAME" == *" "* ]]; then
     EMAIL=$(git config --global user.email)
     # 从 xxx@users.noreply.github.com 提取
     USERNAME=$(echo "$EMAIL" | grep -oP '^\d+-?\K[^@]+(?=@users\.noreply\.github\.com)')
   fi

   # 如果还是无法确定，尝试从 remote URL 提取
   if [ -z "$USERNAME" ]; then
     USERNAME=$(git config --global --get-regexp "url.*github.com" | grep -oP 'github\.com[:/]\K[^/]+' | head -1)
   fi
   ```

3. **生成默认配置**
   ```json
   {
     "remotes": {
       "github": "git@github.com:<检测到的用户名>/skills"
     },
     "default_remote": "github",
     "auto_detected": true
   }
   ```

4. **输出检测结果**
   ```
   🔍 首次运行，自动检测 Git 配置...

   检测到 GitHub 用户名: guo-yu

   已自动配置默认远端:
     github → git@github.com:guo-yu/skills

   配置文件: ~/.claude/share-skill-config.json

   💡 如需修改，请使用:
      /share-skill remote github git@github.com:其他用户名/skills
   ```

### 无法检测时的处理

如果无法自动检测到用户名，提示用户手动配置：

```
⚠️ 无法自动检测 Git 用户名

请手动配置远端地址:
  /share-skill remote github git@github.com:你的用户名/skills

或在迁移时指定:
  /share-skill <skill-name> --remote git@github.com:你的用户名/skills.git
```

## 自然语言调用

当用户通过自然语言调用时，需要智能分析：

### 1. 识别用户指代的 skill

用户可能说：
- "帮我把 xxx skill 开源" → 提取 skill 名称 `xxx`
- "分享刚才创建的 skill" → 查找最近修改的 skill
- "把这个技能迁移到仓库" → 根据当前上下文判断
- "开源 port-allocator" → 直接使用名称

### 2. 识别远端地址

**默认行为：** 使用自动检测的用户名 + 默认仓库名 `skills`

用户可能说：
- "帮我把 xxx 开源" → 使用默认: `git@github.com:<用户名>/skills/<skill-name>.git`
- "push 到 github" → 使用默认 github 配置
- "推送到 git@github.com:other-user/repo.git" → **必须明确指定完整地址**
- "开源到我的 my-tools 仓库" → **必须明确指定仓库名**

**⚠️ 重要规则：修改远端路径必须显式指定**

如果用户想使用非默认的远端路径，必须通过以下方式**明确指定**：

1. **命令行显式指定**
   ```bash
   /share-skill <skill-name> --remote git@github.com:other-user/other-repo.git
   ```

2. **自然语言中明确路径**
   ```
   ✅ "帮我把 port-allocator 推送到 git@github.com:my-org/tools.git"
   ✅ "开源到 gitlab，地址是 git@gitlab.com:team/shared-skills.git"

   ❌ "帮我推送到其他地方" (不明确，会询问具体地址)
   ❌ "换个仓库" (不明确，会询问具体地址)
   ```

**地址解析规则：**
```
"帮我把 xxx 开源"
  → 使用默认配置: git@github.com:<auto-detected-user>/skills
  → 最终地址: git@github.com:<user>/skills/<skill-name>.git

"推送到 git@github.com:other-user/repo.git"
  → 检测到完整地址，直接使用

"开源到 gitlab" (未配置 gitlab)
  → 提示: 请指定完整的 GitLab 地址
```

### 3. 自动搜索 skill 位置

skill 可能存在于以下位置，按优先级搜索：

```bash
# 1. 标准 skills 目录
~/.claude/skills/<skill-name>/SKILL.md

# 2. 用户自定义 skills 目录
~/.claude/skills/*/<skill-name>/SKILL.md

# 3. 独立 skill 文件
~/.claude/skills/<skill-name>.md

# 4. 项目级 skills（当前工作目录）
.claude/skills/<skill-name>/SKILL.md
```

**搜索命令：**
```bash
# 在 ~/.claude 下搜索包含 SKILL.md 的目录
find ~/.claude -name "SKILL.md" -type f 2>/dev/null | while read f; do
  dir=$(dirname "$f")
  name=$(basename "$dir")
  echo "$name: $dir"
done

# 或搜索特定名称
find ~/.claude -type d -name "<skill-name>" 2>/dev/null
```

### 4. 确认后操作

找到 skill 后：
1. 显示找到的位置，请用户确认
2. 如果找到多个匹配，列出选项让用户选择
3. 确认后执行迁移
4. **如果用户未指定远端，迁移完成后询问是否配置**

## 执行步骤

### 命令: `/share-skill remote <alias> <endpoint>`

配置 Git 远端别名：

1. **读取现有配置**
   ```bash
   cat ~/.claude/share-skill-config.json 2>/dev/null || echo '{"remotes":{}}'
   ```

2. **更新配置**
   ```json
   {
     "remotes": {
       "<alias>": "<endpoint>"
     }
   }
   ```

3. **写入配置文件**（保留现有配置）

4. **输出确认**
   ```
   ✅ 已配置远端别名

   别名: github
   地址: git@github.com:guo-yu/skills

   使用方式:
     /share-skill <skill-name> --remote github
     或: "帮我把 xxx 开源到 github"
   ```

### 命令: `/share-skill remote list`

列出已配置的远端别名：

```bash
cat ~/.claude/share-skill-config.json | jq '.remotes'
```

**输出格式：**
```
📡 已配置的远端别名:

  github  → git@github.com:guo-yu/skills
  gitlab  → git@gitlab.com:guo-yu/skills
  gitee   → git@gitee.com:guo-yu/skills

默认: github
```

### 命令: `/share-skill <skill-name> [--remote <url|alias>]`

将指定的 skill 从 `~/.claude/` 目录迁移到 `~/Codes/skills/`：

1. **搜索 skill 位置**
   ```bash
   # 优先在标准位置查找
   if [ -d ~/.claude/skills/<skill-name> ]; then
     SKILL_PATH=~/.claude/skills/<skill-name>
   else
     # 递归搜索
     SKILL_PATH=$(find ~/.claude -type d -name "<skill-name>" 2>/dev/null | head -1)
   fi
   ```
   - 如果找不到，报错退出
   - 如果已经是符号链接，提示已迁移并显示链接目标
   - 如果找到多个，列出让用户选择

2. **检查目标目录**
   ```bash
   ls ~/Codes/skills/<skill-name> 2>/dev/null
   ```
   - 如果目标已存在，报错退出（避免覆盖）

3. **执行迁移**
   ```bash
   # 创建目标目录（如果不存在）
   mkdir -p ~/Codes/skills

   # 移动 skill 到代码目录
   mv ~/.claude/skills/<skill-name> ~/Codes/skills/

   # 创建符号链接
   ln -s ~/Codes/skills/<skill-name> ~/.claude/skills/<skill-name>
   ```

4. **创建 .gitignore**
   ```bash
   cat > ~/Codes/skills/<skill-name>/.gitignore << 'EOF'
   # OS
   .DS_Store
   Thumbs.db

   # Editor
   .vscode/
   .idea/
   *.swp
   *.swo

   # Logs
   *.log

   # Temp
   tmp/
   temp/
   EOF
   ```

5. **初始化 Git**
   ```bash
   cd ~/Codes/skills/<skill-name>
   git init
   git add .
   git commit -m "Initial commit: <skill-name> skill"
   ```

6. **配置远端（如果指定）**

   如果用户指定了 `--remote`：
   ```bash
   # 如果是别名，解析为完整地址
   if [ "<remote>" 是别名 ]; then
     ENDPOINT=$(从配置读取别名对应的 endpoint)
     REMOTE_URL="${ENDPOINT}/<skill-name>.git"
   else
     REMOTE_URL="<remote>"
   fi

   cd ~/Codes/skills/<skill-name>
   git remote add origin "$REMOTE_URL"
   git push -u origin master
   ```

7. **未指定远端时询问**

   如果用户未指定远端，迁移完成后使用 AskUserQuestion 询问：
   ```
   是否需要配置 Git 远端地址？

   选项:
   - 使用 github (git@github.com:guo-yu/skills/<skill-name>.git)
   - 使用 gitlab (git@gitlab.com:guo-yu/skills/<skill-name>.git)
   - 输入自定义地址
   - 暂不配置
   ```

### 命令: `/share-skill list`

列出所有可迁移的本地 skill（排除已是符号链接的）：

```bash
# 搜索 ~/.claude 下所有包含 SKILL.md 的目录
echo "📋 发现的 skill:"
find ~/.claude -name "SKILL.md" -type f 2>/dev/null | while read f; do
  dir=$(dirname "$f")
  name=$(basename "$dir")
  if [ -L "$dir" ]; then
    target=$(readlink "$dir")
    echo "  🔗 $name -> $target (已迁移)"
  else
    echo "  📦 $name: $dir (可迁移)"
  fi
done
```

## 输出格式

### 迁移成功（带远端）
```
✅ Skill 迁移成功

📦 skill: <skill-name>
📁 新位置: ~/Codes/skills/<skill-name>
🔗 符号链接: ~/.claude/skills/<skill-name> -> ~/Codes/skills/<skill-name>
📝 Git: 已初始化并提交
📡 远端: git@github.com:guo-yu/skills/<skill-name>.git
🚀 已推送到远端

仓库地址: https://github.com/guo-yu/skills
```

### 迁移成功（无远端）
```
✅ Skill 迁移成功

📦 skill: <skill-name>
📁 新位置: ~/Codes/skills/<skill-name>
🔗 符号链接: ~/.claude/skills/<skill-name> -> ~/Codes/skills/<skill-name>
📝 Git: 已初始化并提交

是否需要配置远端地址？
```

### 已迁移
```
ℹ️ Skill 已迁移

<skill-name> 已经是符号链接：
  ~/.claude/skills/<skill-name> -> ~/Codes/skills/<skill-name>
```

### 列表
```
📋 可迁移的本地 skill (N个):
  - art-master
  - design-master
  - prompt-generator

🔗 已迁移的 skill (M个):
  - port-allocator -> ~/Codes/skills/port-allocator
  - share-skill -> ~/Codes/skills/share-skill
```

## 目录结构

### 混合 Git 管理模式

share-skill 支持两种 Git 管理模式：

| 模式 | 触发条件 | Git 结构 | 远端 |
|------|---------|---------|------|
| **Monorepo** | 使用默认端点 | 父仓库管理 | `guo-yu/skills` |
| **独立仓库** | 指定自定义端点 | 独立 .git | 用户指定 |

### Monorepo 模式（默认）

当使用默认端点时，所有 skill 由父仓库 `~/Codes/skills/.git` 统一管理：

```
~/Codes/skills/
├── .git/                      # 父仓库 → guo-yu/skills
├── .gitignore
├── README.md
├── port-allocator/            # 无独立 .git，由父仓库管理
│   ├── .gitignore
│   └── SKILL.md
├── share-skill/
│   ├── .gitignore
│   └── SKILL.md
└── skill-permissions/
    ├── .gitignore
    └── SKILL.md
```

**操作方式：**
```bash
# 新增 skill 后
cd ~/Codes/skills
git add <new-skill>/
git commit -m "Add <new-skill>"
git push
```

### 独立仓库模式（自定义端点）

当用户指定自定义端点时，该 skill 拥有独立的 .git：

```
~/Codes/skills/
├── .git/                      # 父仓库
├── .gitignore                 # 包含: /custom-skill/
├── custom-skill/              # 独立仓库 → 用户指定的地址
│   ├── .git/
│   └── SKILL.md
└── port-allocator/            # 由父仓库管理
```

**父仓库 .gitignore 自动更新：**
```gitignore
# Skills with custom endpoints
/custom-skill/
```

### 符号链接

无论哪种模式，`~/.claude/skills/` 中都使用符号链接：

```
~/.claude/skills/
├── port-allocator -> ~/Codes/skills/port-allocator
├── share-skill -> ~/Codes/skills/share-skill
└── skill-permissions -> ~/Codes/skills/skill-permissions
```

## 首次使用

如果遇到权限提示，请先运行：
```
/share-skill allow
```

### 命令: `/share-skill allow`

执行一次性授权，将本 skill 所需的权限添加到 Claude Code 配置中：

1. 读取 `~/.claude/settings.json`
2. 合并以下权限到 `permissions.allow`：

```json
{
  "permissions": {
    "allow": [
      "Bash(cat ~/.claude/*)",
      "Bash(find ~/.claude *)",
      "Bash(ls ~/Codes/skills/*)",
      "Bash(mkdir -p ~/Codes/skills*)",
      "Bash(mv ~/.claude/skills/* *)",
      "Bash(ln -s ~/Codes/skills/* *)",
      "Bash(git *)",
      "Bash(dirname *)",
      "Bash(basename *)",
      "Bash(readlink *)"
    ]
  }
}
```

3. 写入配置文件（保留现有权限）
4. 输出授权结果

**输出格式：**
```
✅ 已配置 Claude Code 权限

新增允许的命令模式：
  - Bash(cat ~/.claude/*)
  - Bash(find ~/.claude *)
  - Bash(ls ~/Codes/skills/*)
  - Bash(mkdir -p ~/Codes/skills*)
  - Bash(mv ~/.claude/skills/* *)
  - Bash(ln -s ~/Codes/skills/* *)
  - Bash(git *)
  - Bash(dirname *)
  - Bash(basename *)
  - Bash(readlink *)

配置文件: ~/.claude/settings.json
```

## 注意事项

1. **不覆盖** - 如果目标目录已存在，会报错而非覆盖
2. **保持兼容** - 符号链接确保 Claude Code 仍能正常读取 skill
3. **Git 跟踪** - 自动初始化 git 并创建首次提交
4. **别名优先** - 使用别名时自动拼接 skill 名称作为仓库名
5. **询问远端** - 未指定远端时，迁移后主动询问用户
6. **首次授权** - 建议先运行 `/share-skill allow` 配置权限
