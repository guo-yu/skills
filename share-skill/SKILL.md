---
name: share-skill
description: Automatically share skills, migrate local skills to code repositories, open source skills, skill version management, configure git remote
---

# Share Skill

Migrate user's locally created temporary skills to a project repository via symlinks, and initialize Git for version tracking.

## Usage

| Command | Description |
|---------|-------------|
| `/share-skill <skill-name>` | Migrate specified skill to code repository and initialize git |
| `/share-skill config` | Configure code_root and other settings |
| `/share-skill <skill-name> --remote <url>` | Migrate and configure remote URL |
| `/share-skill list` | List all local skills available for migration |
| `/share-skill remote <alias> <endpoint>` | Configure Git remote alias |
| `/share-skill remote list` | List configured remote aliases |
| `/share-skill docs` | Generate documentation website for the repository |
| `/share-skill docs --style <name>` | Generate docs with specified design style |
| `/share-skill docs --skill <ui-skill>` | Use specified UI skill to design docs |
| `/share-skill docs config` | Configure default design style or UI skill |
| `/share-skill allow` | One-time authorization for this skill's permissions |
| Natural language | e.g., "Help me open source port-allocator and push to github" |

## Configuration File

All settings are stored in `~/.claude/share-skill-config.json`:

```json
{
  "code_root": "~/Codes",
  "skills_repo": "skills",
  "github_username": "guo-yu",
  "remotes": {
    "github": "git@github.com:guo-yu/skills",
    "gitlab": "git@gitlab.com:guo-yu/skills"
  },
  "default_remote": "github",
  "auto_detected": true,
  "docs": {
    "style": "botanical",
    "custom_skill": null,
    "custom_domain": null
  }
}
```

**Configuration Fields:**

| Field | Description | Default |
|-------|-------------|---------|
| `code_root` | Base directory for code repositories | `~/Codes` |
| `skills_repo` | Name of skills repository folder | `skills` |
| `github_username` | GitHub username for URLs | Auto-detected |
| `remotes` | Git remote aliases | Auto-configured |
| `docs.custom_domain` | Custom domain for docs site | `null` (use GitHub Pages) |

**Path Variables:**

Throughout this document, the following variables are used:
- `{code_root}` → Value of `code_root` config (e.g., `~/Codes`)
- `{skills_repo}` → Value of `skills_repo` config (e.g., `skills`)
- `{skills_path}` → `{code_root}/{skills_repo}` (e.g., `~/Codes/skills`)
- `{username}` → Value of `github_username` config

### Auto-detection on First Run

On first invocation of share-skill, it automatically detects settings:

**Auto-detection Logic:**

1. **Check if config file exists**
   ```bash
   if [ ! -f ~/.claude/share-skill-config.json ]; then
     # First run, perform auto-detection
   fi
   ```

2. **Detect code_root directory**
   ```bash
   # Check common code directory locations in order
   for dir in ~/Codes ~/Code ~/Projects ~/Dev ~/Development ~/repos; do
     if [ -d "$dir" ]; then
       CODE_ROOT="$dir"
       break
     fi
   done

   # If none found, default to ~/Codes
   CODE_ROOT="${CODE_ROOT:-~/Codes}"
   ```

3. **Read Git global config for username**
   ```bash
   # Try to get username
   USERNAME=$(git config --global user.name)

   # If username contains spaces, try extracting from GitHub email
   if [[ "$USERNAME" == *" "* ]]; then
     EMAIL=$(git config --global user.email)
     # Extract from xxx@users.noreply.github.com
     USERNAME=$(echo "$EMAIL" | grep -oP '^\d+-?\K[^@]+(?=@users\.noreply\.github\.com)')
   fi

   # If still unable to determine, try extracting from remote URL
   if [ -z "$USERNAME" ]; then
     USERNAME=$(git config --global --get-regexp "url.*github.com" | grep -oP 'github\.com[:/]\K[^/]+' | head -1)
   fi
   ```

4. **Generate default config**
   ```json
   {
     "code_root": "<detected-code-root>",
     "skills_repo": "skills",
     "github_username": "<detected-username>",
     "remotes": {
       "github": "git@github.com:<detected-username>/skills"
     },
     "default_remote": "github",
     "auto_detected": true,
     "docs": {
       "style": "botanical",
       "custom_skill": null,
       "custom_domain": null
     }
   }
   ```

5. **Output detection result**
   ```
   First run, auto-detecting settings...

   Detected settings:
     Code root: ~/Codes
     GitHub username: guo-yu

   Auto-configured:
     Skills path: ~/Codes/skills
     Remote: git@github.com:guo-yu/skills

   Config file: ~/.claude/share-skill-config.json

   To modify, use:
     /share-skill config
   ```

### Command: `/share-skill config`

Interactive configuration for share-skill settings:

**TUI Interface (AskUserQuestion):**
```
Configure share-skill settings:

Code root directory:
  Current: ~/Codes
  [ ] ~/Codes
  [ ] ~/Code
  [ ] ~/Projects
  [ ] Other... (enter custom path)

Custom domain for documentation:
  Current: (none - using GitHub Pages)
  [ ] No custom domain (use {username}.github.io/{repo})
  [ ] Enter custom domain...
```

**Implementation:**
```bash
# Read current config
CONFIG=$(cat ~/.claude/share-skill-config.json 2>/dev/null || echo '{}')

# After user selection, update config
# Example: Update code_root
jq --arg root "$NEW_CODE_ROOT" '.code_root = $root' <<< "$CONFIG" > ~/.claude/share-skill-config.json
```

### Handling Detection Failure

If settings cannot be auto-detected, prompt user to configure:

```
Unable to auto-detect settings

Please configure manually:
  /share-skill config

Or specify when migrating:
  /share-skill <skill-name> --remote git@github.com:your-username/skills.git
```

## Natural Language Invocation

When user invokes via natural language, intelligent analysis is needed:

### 1. Identify User's Referenced Skill

User might say:
- "Help me open source xxx skill" -> Extract skill name `xxx`
- "Share the skill I just created" -> Find most recently modified skill
- "Migrate this skill to repository" -> Determine from current context
- "Open source port-allocator" -> Use name directly

### 2. Identify Remote Address

**Default behavior:** Use auto-detected username + default repository name `skills`

User might say:
- "Help me open source xxx" -> Use default: `git@github.com:<username>/skills/<skill-name>.git`
- "push to github" -> Use default github config
- "Push to git@github.com:other-user/repo.git" -> **Must explicitly specify full address**
- "Open source to my my-tools repository" -> **Must explicitly specify repository name**

**Important rule: Modifying remote path requires explicit specification**

If user wants to use non-default remote path, must **explicitly specify** via:

1. **Explicit command-line specification**
   ```bash
   /share-skill <skill-name> --remote git@github.com:other-user/other-repo.git
   ```

2. **Explicit path in natural language**
   ```
   OK: "Help me push port-allocator to git@github.com:my-org/tools.git"
   OK: "Open source to gitlab, address is git@gitlab.com:team/shared-skills.git"

   NOT OK: "Help me push to somewhere else" (unclear, will ask for specific address)
   NOT OK: "Use another repository" (unclear, will ask for specific address)
   ```

**Address Resolution Rules:**
```
"Help me open source xxx"
  -> Use default config: git@github.com:<auto-detected-user>/skills
  -> Final address: git@github.com:<user>/skills/<skill-name>.git

"Push to git@github.com:other-user/repo.git"
  -> Detected full address, use directly

"Open source to gitlab" (gitlab not configured)
  -> Prompt: Please specify full GitLab address
```

### 3. Auto-search Skill Location

Skills may exist at the following locations, searched by priority:

```bash
# 1. Standard skills directory
~/.claude/skills/<skill-name>/SKILL.md

# 2. User custom skills directory
~/.claude/skills/*/<skill-name>/SKILL.md

# 3. Standalone skill file
~/.claude/skills/<skill-name>.md

# 4. Project-level skills (current working directory)
.claude/skills/<skill-name>/SKILL.md
```

**Search command:**
```bash
# Search for directories containing SKILL.md under ~/.claude
find ~/.claude -name "SKILL.md" -type f 2>/dev/null | while read f; do
  dir=$(dirname "$f")
  name=$(basename "$dir")
  echo "$name: $dir"
done

# Or search for specific name
find ~/.claude -type d -name "<skill-name>" 2>/dev/null
```

### 4. Post-confirmation Actions

After finding skill:
1. Display found location, ask user to confirm
2. If multiple matches found, list options for user to choose
3. Execute migration after confirmation
4. **If user didn't specify remote, ask whether to configure after migration completes**

## Execution Steps

### Command: `/share-skill remote <alias> <endpoint>`

Configure Git remote alias:

1. **Read existing config**
   ```bash
   cat ~/.claude/share-skill-config.json 2>/dev/null || echo '{"remotes":{}}'
   ```

2. **Update config**
   ```json
   {
     "remotes": {
       "<alias>": "<endpoint>"
     }
   }
   ```

3. **Write config file** (preserve existing config)

4. **Output confirmation**
   ```
   Remote alias configured

   Alias: github
   Address: git@github.com:guo-yu/skills

   Usage:
     /share-skill <skill-name> --remote github
     or: "Help me open source xxx to github"
   ```

### Command: `/share-skill remote list`

List configured remote aliases:

```bash
cat ~/.claude/share-skill-config.json | jq '.remotes'
```

**Output format:**
```
Configured remote aliases:

  github  -> git@github.com:guo-yu/skills
  gitlab  -> git@gitlab.com:guo-yu/skills
  gitee   -> git@gitee.com:guo-yu/skills

Default: github
```

### Command: `/share-skill <skill-name> [--remote <url|alias>]`

Migrate specified skill from `~/.claude/` directory to `{skills_path}/`:

1. **Search skill location**
   ```bash
   # First check standard location
   if [ -d ~/.claude/skills/<skill-name> ]; then
     SKILL_PATH=~/.claude/skills/<skill-name>
   else
     # Recursive search
     SKILL_PATH=$(find ~/.claude -type d -name "<skill-name>" 2>/dev/null | head -1)
   fi
   ```
   - If not found, error and exit
   - If already a symlink, prompt already migrated and show link target
   - If multiple found, list for user to choose

2. **Check target directory**
   ```bash
   ls {skills_path}/<skill-name> 2>/dev/null
   ```
   - If target exists, error and exit (avoid overwriting)

3. **Execute migration**
   ```bash
   # Create target directory (if doesn't exist)
   mkdir -p {skills_path}

   # Move skill to code directory
   mv ~/.claude/skills/<skill-name> {skills_path}/

   # Create symlink
   ln -s {skills_path}/<skill-name> ~/.claude/skills/<skill-name>
   ```

4. **Create .gitignore**
   ```bash
   cat > {skills_path}/<skill-name>/.gitignore << 'EOF'
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

5. **Initialize Git**
   ```bash
   cd {skills_path}/<skill-name>
   git init
   git add .
   git commit -m "Initial commit: <skill-name> skill"
   ```

6. **Configure remote (if specified)**

   If user specified `--remote`:
   ```bash
   # If it's an alias, resolve to full address
   if [ "<remote>" is alias ]; then
     ENDPOINT=$(read alias's endpoint from config)
     REMOTE_URL="${ENDPOINT}/<skill-name>.git"
   else
     REMOTE_URL="<remote>"
   fi

   cd {skills_path}/<skill-name>
   git remote add origin "$REMOTE_URL"
   git push -u origin master
   ```

7. **Ask when remote not specified**

   If user didn't specify remote, ask after migration using AskUserQuestion:
   ```
   Do you want to configure Git remote address?

   Options:
   - Use github (git@github.com:guo-yu/skills/<skill-name>.git)
   - Use gitlab (git@gitlab.com:guo-yu/skills/<skill-name>.git)
   - Enter custom address
   - Skip for now
   ```

### Command: `/share-skill list`

List all local skills available for migration (excluding symlinks):

```bash
# Search for all directories containing SKILL.md under ~/.claude
echo "Discovered skills:"
find ~/.claude -name "SKILL.md" -type f 2>/dev/null | while read f; do
  dir=$(dirname "$f")
  name=$(basename "$dir")
  if [ -L "$dir" ]; then
    target=$(readlink "$dir")
    echo "  $name -> $target (migrated)"
  else
    echo "  $name: $dir (available)"
  fi
done
```

## Output Format

### Migration Success (with remote)
```
Skill migration successful

skill: <skill-name>
New location: {skills_path}/<skill-name>
Symlink: ~/.claude/skills/<skill-name> -> {skills_path}/<skill-name>
Git: Initialized and committed
Remote: git@github.com:guo-yu/skills/<skill-name>.git
Pushed to remote

Repository URL: https://github.com/guo-yu/skills
```

### Migration Success (without remote)
```
Skill migration successful

skill: <skill-name>
New location: {skills_path}/<skill-name>
Symlink: ~/.claude/skills/<skill-name> -> {skills_path}/<skill-name>
Git: Initialized and committed

Do you want to configure remote address?
```

### Already Migrated
```
Skill already migrated

<skill-name> is already a symlink:
  ~/.claude/skills/<skill-name> -> {skills_path}/<skill-name>
```

### List
```
Local skills available for migration (N):
  - art-master
  - design-master
  - prompt-generator

Migrated skills (M):
  - port-allocator -> {skills_path}/port-allocator
  - share-skill -> {skills_path}/share-skill
```

## Directory Structure

### Hybrid Git Management Mode

share-skill supports two Git management modes:

| Mode | Trigger | Git Structure | Remote |
|------|---------|---------------|--------|
| **Monorepo** | Default endpoint | Parent repo managed | `guo-yu/skills` |
| **Standalone** | Custom endpoint | Independent .git | User specified |

### Monorepo Mode (Default)

When using default endpoint, all skills are managed by parent repo `{skills_path}/.git`:

```
{skills_path}/
├── .git/                      # Parent repo -> guo-yu/skills
├── .gitignore
├── README.md
├── port-allocator/            # No independent .git, managed by parent
│   ├── .gitignore
│   └── SKILL.md
├── share-skill/
│   ├── .gitignore
│   └── SKILL.md
└── skill-permissions/
    ├── .gitignore
    └── SKILL.md
```

**Operations:**
```bash
# After adding new skill
cd {skills_path}
git add <new-skill>/
git commit -m "Add <new-skill>"
git push
```

### Standalone Mode (Custom Endpoint)

When user specifies custom endpoint, that skill has independent .git:

```
{skills_path}/
├── .git/                      # Parent repo
├── .gitignore                 # Contains: /custom-skill/
├── custom-skill/              # Independent repo -> user specified address
│   ├── .git/
│   └── SKILL.md
└── port-allocator/            # Managed by parent repo
```

**Parent repo .gitignore auto-updates:**
```gitignore
# Skills with custom endpoints
/custom-skill/
```

### Symlinks

Regardless of mode, `~/.claude/skills/` uses symlinks:

```
~/.claude/skills/
├── port-allocator -> {skills_path}/port-allocator
├── share-skill -> {skills_path}/share-skill
└── skill-permissions -> {skills_path}/skill-permissions
```

## First Use

If you encounter permission prompts, first run:
```
/share-skill allow
```

### Command: `/share-skill allow`

Execute one-time authorization, adding permissions required by this skill to Claude Code config:

1. Read `~/.claude/settings.json`
2. Merge following permissions to `permissions.allow`:

```json
{
  "permissions": {
    "allow": [
      "Bash(cat ~/.claude/*)",
      "Bash(find ~/.claude *)",
      "Bash(ls {skills_path}/*)",
      "Bash(mkdir -p {skills_path}*)",
      "Bash(mv ~/.claude/skills/* *)",
      "Bash(ln -s {skills_path}/* *)",
      "Bash(git *)",
      "Bash(dirname *)",
      "Bash(basename *)",
      "Bash(readlink *)"
    ]
  }
}
```

3. Write config file (preserve existing permissions)
4. Output authorization result

**Output format:**
```
Claude Code permissions configured

Added allowed command patterns:
  - Bash(cat ~/.claude/*)
  - Bash(find ~/.claude *)
  - Bash(ls {skills_path}/*)
  - Bash(mkdir -p {skills_path}*)
  - Bash(mv ~/.claude/skills/* *)
  - Bash(ln -s {skills_path}/* *)
  - Bash(git *)
  - Bash(dirname *)
  - Bash(basename *)
  - Bash(readlink *)

Config file: ~/.claude/settings.json
```

## Notes

1. **No overwrite** - If target directory exists, error instead of overwrite
2. **Maintain compatibility** - Symlinks ensure Claude Code can still read skills normally
3. **Git tracking** - Automatically initialize git and create initial commit
4. **Alias priority** - When using alias, automatically append skill name as repository name
5. **Ask about remote** - When remote not specified, proactively ask user after migration
6. **First authorization** - Recommend running `/share-skill allow` to configure permissions first

---

## Documentation Website Generation

share-skill supports automatically generating elegant documentation websites to showcase skill usage instructions.

### Command: `/share-skill docs`

Generate GitHub Pages documentation website for skills repository.

**Parameters:**
- `--style <name>`: Use preset design style (default: `botanical`)
- `--skill <ui-skill>`: Use specified UI skill for design
- `--domain <domain>`: Configure custom domain
- `--i18n`: Enable i18n language selection for SKILL.md and README files

### i18n Language Selection

Since generating multi-language documentation is time-consuming and token-intensive, users can select which languages to generate via an interactive TUI checkbox.

**Trigger:** When running `/share-skill docs` with `--i18n` flag, or when the command detects SKILL.md files need translation.

**TUI Interface:**
```
Select languages for documentation (Space to toggle, Enter to confirm):

  [x] English (en)        - Always generated
  [ ] 简体中文 (zh-CN)    - Simplified Chinese
  [ ] 日本語 (ja)         - Japanese
  [ ] Other...            - Enter custom language code

Selected: English
```

**Default Selection:**
- English: **checked** (required, always generated)
- Chinese (zh-CN): **unchecked**
- Japanese (ja): **unchecked**
- Other: **unchecked** (allows custom language code input)

**Custom Language Input:**
When user selects "Other...", prompt for language code:
```
Enter language code (e.g., 'ko' for Korean, 'de' for German):
> ko

Language added: 한국어 (ko)
```

**AskUserQuestion Implementation:**
```json
{
  "questions": [
    {
      "question": "Which languages should be generated for documentation?",
      "header": "Languages",
      "multiSelect": true,
      "options": [
        { "label": "English (en)", "description": "Required, always generated" },
        { "label": "简体中文 (zh-CN)", "description": "Simplified Chinese translation" },
        { "label": "日本語 (ja)", "description": "Japanese translation" },
        { "label": "Other...", "description": "Enter a custom language code" }
      ]
    }
  ]
}
```

**Generated Files Based on Selection:**
| Selection | SKILL Files | README Files |
|-----------|-------------|--------------|
| English only | `SKILL.md` | `README.md` |
| +Chinese | `SKILL.md`, `SKILL.zh-CN.md` | `README.md`, `README.zh-CN.md` |
| +Japanese | `SKILL.md`, `SKILL.ja.md` | `README.md`, `README.ja.md` |
| +Korean | `SKILL.md`, `SKILL.ko.md` | `README.md`, `README.ko.md` |

**Execution steps:**

1. **Check repository structure**
   ```bash
   # Confirm in skills repository directory
   if [ ! -d {skills_path}/.git ]; then
     echo "Please run this command in skills repository first"
     exit 1
   fi
   ```

2. **Read config**
   ```bash
   # Read design preferences from config
   cat ~/.claude/share-skill-config.json | jq '.docs'
   ```

3. **Select design method**
   - If `--skill` specified: call corresponding UI skill (e.g., `ui-ux-pro-max`)
   - Otherwise use preset style specified by `--style` (default `botanical`)

4. **Generate documentation website**
   ```bash
   mkdir -p {skills_path}/docs
   mkdir -p {skills_path}/docs/css
   mkdir -p {skills_path}/docs/js
   ```

5. **Configure local development server**

   Handle based on endpoint config and existing package.json:

   **Scenario A: Monorepo mode (default endpoint)**

   Check if `{skills_path}/package.json` exists:

   ```bash
   if [ -f {skills_path}/package.json ]; then
     # Exists, only add docs-related scripts (don't overwrite existing content)
     # Use jq or manual merge for scripts
   else
     # Doesn't exist, create new package.json
   fi
   ```

   - **package.json exists**: Append `dev:docs` script
     ```bash
     # Read existing package.json, add new script
     jq '.scripts["dev:docs"] = "npx serve . -l <port>"' package.json > tmp.json
     mv tmp.json package.json
     ```

   - **package.json doesn't exist**: Create new file
     ```json
     {
       "name": "claude-code-skills",
       "version": "1.0.0",
       "private": true,
       "scripts": {
         "dev": "npx serve . -l <port>"
       }
     }
     ```

   **Scenario B: Standalone mode (custom endpoint)**

   Each skill has independent Git repository, check each package.json:

   ```bash
   SKILL_DIR={skills_path}/<skill-name>

   if [ -f "$SKILL_DIR/package.json" ]; then
     # Important: don't overwrite user's existing package.json
     # Only append docs script (if doesn't exist)
     echo "Detected existing package.json, appending dev:docs script"
   else
     # Create minimal package.json
     echo "Creating package.json..."
   fi
   ```

   **Port allocation flow:**
   - Read `~/.claude/port-registry.json` to get next available port
   - Update port-registry to register this project
   - Append or create development script in package.json

   **Safety rules:**
   - **Never overwrite** existing package.json
   - Only **append** new commands in `scripts` field
   - If `dev` script exists, use `dev:docs` as alternative command name

6. **Configure custom domain**

   Handle custom domain based on config:

   ```bash
   # Read custom_domain from config
   CUSTOM_DOMAIN=$(cat ~/.claude/share-skill-config.json | jq -r '.docs.custom_domain // empty')
   USERNAME=$(cat ~/.claude/share-skill-config.json | jq -r '.github_username')
   REPO=$(cat ~/.claude/share-skill-config.json | jq -r '.skills_repo')

   # Check if CNAME already exists
   if [ -f {skills_path}/docs/CNAME ]; then
     EXISTING_DOMAIN=$(cat {skills_path}/docs/CNAME)
     echo "CNAME already exists: $EXISTING_DOMAIN"
   fi
   ```

   **First-time setup - Ask user via AskUserQuestion:**
   ```json
   {
     "questions": [{
       "question": "Do you want to configure a custom domain for the documentation site?",
       "header": "Domain",
       "multiSelect": false,
       "options": [
         { "label": "No custom domain", "description": "Use {username}.github.io/{repo}" },
         { "label": "Enter custom domain", "description": "e.g., docs.example.com" }
       ]
     }]
   }
   ```

   **Based on user selection:**
   ```bash
   if [ -n "$CUSTOM_DOMAIN" ]; then
     # User has custom domain configured
     echo "$CUSTOM_DOMAIN" > {skills_path}/docs/CNAME

     # Update config
     jq --arg domain "$CUSTOM_DOMAIN" '.docs.custom_domain = $domain' \
       ~/.claude/share-skill-config.json > tmp.json && mv tmp.json ~/.claude/share-skill-config.json
   else
     # No custom domain - remove CNAME if exists
     rm -f {skills_path}/docs/CNAME
   fi
   ```

   **Update footer link based on domain:**
   ```javascript
   // main.js - Dynamic footer URL
   function getDocsUrl() {
     const config = { /* loaded from config or constants */ };
     if (config.custom_domain) {
       return `https://${config.custom_domain}/`;
     }
     return `https://${REPO_OWNER}.github.io/${REPO_NAME}/`;
   }
   ```

7. **Update cache version number**

   Auto-update resource file version numbers each time docs content is modified to avoid browser cache issues:

   ```bash
   # Generate version number (using timestamp)
   VERSION=$(date +%s)

   # Update version number in index.html
   sed -i '' "s/main.js?v=[0-9]*/main.js?v=$VERSION/" docs/index.html
   sed -i '' "s/custom.css?v=[0-9]*/custom.css?v=$VERSION/" docs/index.html
   ```

   **Or use file hash:**
   ```bash
   JS_HASH=$(md5 -q docs/js/main.js | head -c 8)
   CSS_HASH=$(md5 -q docs/css/custom.css | head -c 8)

   sed -i '' "s/main.js?v=[a-z0-9]*/main.js?v=$JS_HASH/" docs/index.html
   sed -i '' "s/custom.css?v=[a-z0-9]*/custom.css?v=$CSS_HASH/" docs/index.html
   ```

   **index.html template should contain version placeholders:**
   ```html
   <link rel="stylesheet" href="css/custom.css?v=1">
   <script src="js/main.js?v=1"></script>
   ```

8. **Commit and push**
   ```bash
   git add docs/
   git commit -m "Update documentation site"
   git push
   ```

### Documentation Site Features

The generated documentation site includes the following features:

#### 1. Dynamic Navbar Brand

The navbar brand (avatar + title) links to the repository URL and is dynamically populated from GitHub API:

```html
<!-- index.html -->
<a class="navbar-brand" id="repoLink" href="https://github.com/{username}/{repo}" target="_blank">
    <img class="brand-avatar" id="userAvatar" src="" alt="Avatar">
    <span class="brand-text" id="brandTitle">Skills</span>
</a>
```

```javascript
// main.js - Update repo link dynamically
const repoLink = document.getElementById('repoLink');
if (repoLink) {
    repoLink.href = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
}
```

#### 2. Dynamic Favicon

The favicon uses the GitHub user's avatar image:

```html
<!-- index.html head section -->
<link rel="icon" id="favicon" type="image/png" href="">
```

```javascript
// main.js - Set favicon to user's avatar
const favicon = document.getElementById('favicon');
if (favicon) {
    favicon.href = user.avatar_url;
}
```

#### 3. Footer Attribution

Footer links to the documentation site, dynamically choosing between custom domain and GitHub Pages:

```html
<footer class="footer">
    <div class="footer-content">
        <p>Made with <span class="heart">♥</span> by <a id="footerLink" href="">Yu's skills</a></p>
    </div>
</footer>
```

```javascript
// main.js - Set footer link based on custom_domain config
const CUSTOM_DOMAIN = null;  // Set to domain string or null for GitHub Pages

function getDocsUrl() {
    if (CUSTOM_DOMAIN) {
        return `https://${CUSTOM_DOMAIN}/`;
    }
    return `https://${REPO_OWNER}.github.io/${REPO_NAME}/`;
}

// Update footer link
const footerLink = document.getElementById('footerLink');
if (footerLink) {
    footerLink.href = getDocsUrl();
}
```

**URL Selection Logic:**
| `custom_domain` config | Footer URL |
|------------------------|------------|
| `null` | `https://{username}.github.io/{repo}/` |
| `"docs.example.com"` | `https://docs.example.com/` |

#### 4. i18n Cache Busting for SKILL.md

When loading language-specific SKILL.md files, add cache busting to ensure fresh content:

```javascript
// main.js
const CACHE_VERSION = Date.now();

function getBasePath(skillName, lang = 'en') {
    const fileName = lang === 'en' ? 'SKILL.md' : `SKILL.${lang}.md`;

    if (isGitHubPages) {
        // Add cache busting for GitHub raw content
        return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${skillName}/${fileName}?v=${CACHE_VERSION}`;
    } else {
        // Add cache busting for local development
        return `../${skillName}/${fileName}?v=${CACHE_VERSION}`;
    }
}
```

#### 5. main.js Configuration

The `main.js` file should include repository configuration at the top:

```javascript
// Repository configuration - UPDATE THESE VALUES
const REPO_OWNER = '{github-username}';  // e.g., 'guo-yu'
const REPO_NAME = '{repo-name}';          // e.g., 'skills'
const BRANCH = 'master';                   // or 'main'

// Cache busting version
const CACHE_VERSION = Date.now();
```

#### 6. Three-Column Layout

The documentation site uses a three-column responsive layout:

```html
<div class="main-container three-column">
    <!-- Left Sidebar: Skills navigation + Table of Contents -->
    <aside class="sidebar glass">
        <div class="sidebar-content">
            <div class="sidebar-section">
                <h4 class="sidebar-heading" data-i18n="skills">Skills</h4>
                <nav class="sidebar-nav">
                    <a class="sidebar-link" href="?skill=port-allocator">port-allocator</a>
                    <a class="sidebar-link" href="?skill=share-skill">share-skill</a>
                    <!-- ... more skills -->
                </nav>
            </div>
            <div class="sidebar-section">
                <h4 class="sidebar-heading" data-i18n="onThisPage">On This Page</h4>
                <div class="js-toc"></div>  <!-- Tocbot generates TOC here -->
            </div>
        </div>
    </aside>

    <!-- Main Content: Markdown documentation -->
    <main class="main-content">
        <article class="js-toc-content content-card glass" id="content">
            <!-- Rendered markdown content -->
        </article>
    </main>

    <!-- Right Sidebar: Installation instructions -->
    <aside class="sidebar-right glass">
        <!-- Installation section -->
    </aside>
</div>
```

**Responsive Behavior:**
- Desktop: Three columns visible
- Tablet: Right sidebar hidden
- Mobile: Both sidebars hidden, mobile menu available

#### 7. Right Sidebar - Installation Section

The right sidebar provides quick installation instructions:

```html
<aside class="sidebar-right glass">
    <div class="sidebar-content">
        <div class="sidebar-section">
            <h4 class="sidebar-heading" data-i18n="installation">Installation</h4>
            <p class="install-desc" data-i18n="installDesc">The easiest way to install:</p>
            <div class="install-code">
                <pre><code><span class="comment"># <span data-i18n="addMarketplace">Add marketplace</span></span>
<span class="cmd">/plugin marketplace add {username}/{repo}</span>

<span class="comment"># <span data-i18n="installSkills">Install skills</span></span>
<span class="cmd">/plugin install {skill-name}@{username}-{repo}</span></code></pre>
            </div>
            <a class="install-link" href="https://github.com/{username}/{repo}#installation" target="_blank" data-i18n="moreOptions">More installation options</a>
        </div>
    </div>
</aside>
```

**i18n Support for Installation:**
```javascript
const I18N = {
    en: {
        installation: 'Installation',
        installDesc: 'The easiest way to install:',
        addMarketplace: 'Add marketplace',
        installSkills: 'Install skills',
        moreOptions: 'More installation options'
    },
    'zh-CN': {
        installation: '安装方法',
        installDesc: '最简单的安装方式：',
        addMarketplace: '添加技能市场',
        installSkills: '安装技能',
        moreOptions: '更多安装选项'
    },
    ja: {
        installation: 'インストール',
        installDesc: '最も簡単なインストール方法：',
        addMarketplace: 'マーケットプレイスを追加',
        installSkills: 'スキルをインストール',
        moreOptions: 'その他のインストールオプション'
    }
};
```

#### 8. Table of Contents (Tocbot)

Use Tocbot library to auto-generate table of contents from headings:

```html
<!-- In <head> -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tocbot/4.32.2/tocbot.min.css">

<!-- Before closing </body> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/tocbot/4.32.2/tocbot.min.js"></script>
```

```javascript
// Initialize after content loads
tocbot.init({
    tocSelector: '.js-toc',
    contentSelector: '.js-toc-content',
    headingSelector: 'h1, h2, h3',
    scrollSmooth: true,
    scrollSmoothDuration: 300,
    headingsOffset: 100,
    scrollSmoothOffset: -100
});
```

#### 9. Code Syntax Highlighting (highlight.js)

Use highlight.js for code block syntax highlighting:

```html
<!-- In <head> -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">

<!-- Before closing </body> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
```

```javascript
// After rendering markdown
document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
});
```

### Command: `/share-skill docs config`

Configure documentation generation default settings.

**Interactive options:**
```
Configure documentation website design

Design method:
  1. Use preset style
  2. Use UI skill

Preset styles:
  - botanical (default): Natural botanical style, elegant and soft
  - minimal: Minimalist black and white
  - tech: Modern tech-forward style

UI skills:
  - ui-ux-pro-max: Professional UI/UX design skill
  - (other UI skills user has installed)

Custom domain: (optional)
```

### Design Style Presets

#### `botanical` - Natural Botanical Style (default)

**Design Philosophy:**
A digital tribute to nature—breathing, flowing, rooted in organic beauty. Soft, refined, and thoughtful, rejecting the rigid technocratic coldness and hyper-digital sharpness of modern tech aesthetic in favor of warmth, tactility, and the imperfections of the natural world.

**Core Elements:**
- **Organic softness**: Rounded corners everywhere, shapes flow like terrazzo
- **Elegant typography**: Playfair Display high-contrast serif + Source Sans 3 humanist sans-serif
- **Earth tones**: Forest green (#2D3A31), sage green (#8C9A84), terracotta (#C27B66), rice paper white (#F9F8F4)
- **Paper texture**: Essential SVG noise overlay, transforming cold digital pixels into warm tactile feel
- **Breathing space**: Generous whitespace, section spacing py-32, card spacing gap-16
- **Slow motion**: Like plants swaying in breeze, duration-500 to duration-700

**Color System:**
| Usage | Color | Value |
|-------|-------|-------|
| Background | Warm white/Rice paper | `#F9F8F4` |
| Foreground | Deep forest green | `#2D3A31` |
| Primary | Sage green | `#8C9A84` |
| Secondary | Soft clay/Mushroom | `#DCCFC2` |
| Border | Stone | `#E6E2DA` |
| Interactive | Terracotta | `#C27B66` |

**Font Pairing:**
- Headings: **Playfair Display** (Google Font) - Transitional serif, high-contrast strokes
- Body: **Source Sans 3** (Google Font) - Clear, readable humanist sans-serif

**Border Radius Rules:**
- Cards: `rounded-3xl` (24px)
- Buttons: `rounded-full` (pill shape)
- Images: `rounded-t-full` (arch) or `rounded-[40px]`

**Paper Texture Overlay (Critical):**
```jsx
<div
  className="pointer-events-none fixed inset-0 z-50 opacity-[0.015]"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    backgroundRepeat: "repeat",
  }}
/>
```

**Shadow System:**
```css
/* Default */
box-shadow: 0 4px 6px -1px rgba(45, 58, 49, 0.05);
/* Medium */
box-shadow: 0 10px 15px -3px rgba(45, 58, 49, 0.05);
/* Large */
box-shadow: 0 20px 40px -10px rgba(45, 58, 49, 0.05);
```

**Motion Guidelines:**
- Fast interaction: `duration-300` (button hover, link color)
- Standard: `duration-500` (card lift, transforms)
- Slow dramatic: `duration-700` to `duration-1000` (image zoom)
- Hover behavior: `-translate-y-1` with enhanced shadow

**Responsive Strategy:**
- Mobile: Hide sidebar, title from text-8xl down to text-5xl
- Touch targets: Maintain minimum 44px height
- Grid breakpoints: `grid-cols-1` -> `md:grid-cols-3`

### Using External UI Skills

If user has installed `ui-ux-pro-max` or other UI skills, can call it to design docs:

```bash
/share-skill docs --skill ui-ux-pro-max
```

**Execution flow:**

1. **Detect if skill exists**
   ```bash
   if [ -d ~/.claude/skills/ui-ux-pro-max ] || [ -L ~/.claude/skills/ui-ux-pro-max ]; then
     echo "Detected ui-ux-pro-max skill"
   fi
   ```

2. **Call skill to generate design**
   - Pass current skills list and structure info to UI skill
   - UI skill generates complete HTML/CSS/JS
   - Output to `{skills_path}/docs/` directory

3. **Ask design preference** (if UI skill supports)
   ```
   Using ui-ux-pro-max to design documentation website

   Please select design style:
     1. glassmorphism
     2. claymorphism
     3. minimalism
     4. brutalism
     5. neumorphism
     6. bento-grid
   ```

### Output Format

**Generation success:**
```
Documentation website generated

Location: {skills_path}/docs/
Design style: botanical (Natural Botanical Style)
Custom domain: skill.guoyu.me

File structure:
  docs/
  ├── index.html
  ├── CNAME
  ├── css/
  │   └── custom.css
  └── js/
      └── main.js

Pushed to GitHub
Visit: https://skill.guoyu.me

GitHub Pages setup:
   1. Repository Settings -> Pages
   2. Source: Deploy from a branch
   3. Branch: master, /docs
```

**Using UI skill:**
```
Documentation website generated

Location: {skills_path}/docs/
Design: ui-ux-pro-max (glassmorphism style)
Custom domain: skill.guoyu.me

Visit: https://skill.guoyu.me
```

---

## README Auto-generation

share-skill automatically generates/updates multi-language README files when creating or updating repositories.

### Supported Languages

| Language | Filename | Language Code |
|----------|----------|---------------|
| English (default) | `README.md` | `en` |
| Simplified Chinese | `README.zh-CN.md` | `zh-CN` |
| Japanese | `README.ja.md` | `ja` |

### File Structure

```
skills/
├── README.md              # English (default)
├── README.zh-CN.md        # Simplified Chinese
├── README.ja.md           # Japanese
└── ...
```

### Language Switch Navigation

Each README file contains language switch links at the top:

```markdown
<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <a href="README.ja.md">日本語</a>
</p>
```

### README Title Rules

| Repository Type | English | Simplified Chinese | Japanese |
|-----------------|---------|-------------------|----------|
| **Skill Set** | `{username}'s Skills` | `{username} 的技能集` | `{username} のスキル` |
| **Single Skill** | `{username}'s Skill: {name}` | `{username} 的技能: {name}` | `{username} のスキル: {name}` |

### README Template - English (README.md)

```markdown
<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <a href="README.ja.md">日本語</a>
</p>

# {username}'s Skills

My collection of custom Claude Code skills for productivity and automation.

## Skills

| Skill | Description |
|-------|-------------|
| [port-allocator](./port-allocator/) | Automatically allocate development server ports |
| [share-skill](./share-skill/) | Migrate skills to repositories with Git support |

## Documentation

This skill set has an online documentation site generated by [share-skill](https://github.com/guo-yu/skills/tree/master/share-skill).

**With Custom Domain:**
```
https://{custom_domain}/
```

**GitHub Pages:**
```
https://{username}.github.io/{repo-name}/
```

### Setup GitHub Pages

1. Go to repository **Settings** -> **Pages**
2. Under "Source", select **Deploy from a branch**
3. Choose branch: `master` (or `main`), folder: `/docs`
4. (Optional) Add custom domain

## License

MIT

---

Made with ♥ by [Yu's skills](https://skill.guoyu.me/)
```

### README Template - Simplified Chinese (README.zh-CN.md)

```markdown
<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <a href="README.ja.md">日本語</a>
</p>

# {username} 的技能集

我的 Claude Code 自定义技能集合，用于提高生产力和自动化。

## 技能列表

| 技能 | 说明 |
|------|------|
| [port-allocator](./port-allocator/) | 自动分配开发服务器端口 |
| [share-skill](./share-skill/) | 将技能迁移到仓库并支持 Git 版本管理 |

## 在线文档

本技能集有一个由 [share-skill](https://github.com/guo-yu/skills/tree/master/share-skill) 生成的在线文档网站。

**自定义域名访问：**
```
https://{custom_domain}/
```

**GitHub Pages 访问：**
```
https://{username}.github.io/{repo-name}/
```

### 配置 GitHub Pages

1. 进入仓库 **Settings** -> **Pages**
2. 在 "Source" 下选择 **Deploy from a branch**
3. 选择分支: `master` (或 `main`)，文件夹: `/docs`
4. (可选) 在 "Custom domain" 中添加自定义域名

## 许可证

MIT

---

Made with ♥ by [Yu's skills](https://skill.guoyu.me/)
```

### README Template - Japanese (README.ja.md)

```markdown
<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <a href="README.ja.md">日本語</a>
</p>

# {username} のスキル

生産性と自動化のための Claude Code カスタムスキルコレクション。

## スキル一覧

| スキル | 説明 |
|--------|------|
| [port-allocator](./port-allocator/) | 開発サーバーポートの自動割り当て |
| [share-skill](./share-skill/) | Git サポート付きでスキルをリポジトリに移行 |

## ドキュメント

このスキルセットには [share-skill](https://github.com/guo-yu/skills/tree/master/share-skill) で生成されたオンラインドキュメントサイトがあります。

**カスタムドメイン：**
```
https://{custom_domain}/
```

**GitHub Pages：**
```
https://{username}.github.io/{repo-name}/
```

### GitHub Pages の設定

1. リポジトリの **Settings** -> **Pages** に移動
2. "Source" で **Deploy from a branch** を選択
3. ブランチ: `master` (または `main`)、フォルダ: `/docs` を選択
4. (オプション) "Custom domain" にカスタムドメインを追加

## ライセンス

MIT

---

Made with ♥ by [Yu's skills](https://skill.guoyu.me/)
```

### Execution Steps

When executing `/share-skill docs` or `/share-skill <skill-name>`:

1. **Read config**
   ```bash
   CONFIG=$(cat ~/.claude/share-skill-config.json)
   GITHUB_URL=$(echo "$CONFIG" | jq -r '.remotes.github')
   GITHUB_USERNAME=$(echo "$GITHUB_URL" | grep -oP 'github\.com[:/]\K[^/]+')
   CUSTOM_DOMAIN=$(echo "$CONFIG" | jq -r '.docs.custom_domain // empty')
   REPO_NAME=$(basename "$(git rev-parse --show-toplevel)")
   ```

2. **Generate language switch navigation**
   ```bash
   LANG_NAV='<p align="center">
     <a href="README.md">English</a> |
     <a href="README.zh-CN.md">简体中文</a> |
     <a href="README.ja.md">日本語</a>
   </p>'
   ```

3. **Generate README for all languages**
   ```bash
   # Define language config
   declare -A LANG_CONFIG
   LANG_CONFIG[en]="README.md"
   LANG_CONFIG[zh-CN]="README.zh-CN.md"
   LANG_CONFIG[ja]="README.ja.md"

   # Generate README for each language
   for lang in en zh-CN ja; do
     FILE="${LANG_CONFIG[$lang]}"
     generate_readme "$lang" "$FILE"
   done
   ```

4. **Write README files**
   ```bash
   generate_readme() {
     local lang=$1
     local file=$2

     # Select template based on language
     case $lang in
       en)
         TITLE="${GITHUB_USERNAME}'s Skills"
         # ... English content
         ;;
       zh-CN)
         TITLE="${GITHUB_USERNAME} 的技能集"
         # ... Chinese content
         ;;
       ja)
         TITLE="${GITHUB_USERNAME} のスキル"
         # ... Japanese content
         ;;
     esac

     cat > "$file" << EOF
     $LANG_NAV

     # $TITLE
     ...
     EOF
   }
   ```

### Output Format

```
README multi-language files updated

Generated files:
  - README.md (English)
  - README.zh-CN.md (Simplified Chinese)
  - README.ja.md (Japanese)

Documentation link: https://skill.guoyu.me/

Included sections:
  - Language switch navigation
  - Skills list
  - Documentation (online docs instructions)
  - License
  - Attribution (Made with ♥)
```

---

## Local Testing

share-skill provides a verification script to ensure generated documentation matches the SKILL.md specifications.

### Verification Script

Location: `share-skill/test/verify-docs.sh`

**Usage:**
```bash
# Test current directory
./share-skill/test/verify-docs.sh .

# Test specific repository
./share-skill/test/verify-docs.sh ~/Codes/skills
```

**Checks performed:**

| Category | Checks |
|----------|--------|
| **Directory Structure** | docs/index.html, docs/js/main.js, docs/css/custom.css, docs/CNAME |
| **index.html** | Favicon, navbar brand, three-column layout, language switcher, installation section, tocbot, highlight.js, footer, version numbers |
| **main.js** | REPO_OWNER, REPO_NAME, BRANCH, CACHE_VERSION, I18N object, getBasePath, dynamic favicon/repoLink, tocbot.init, hljs |
| **README Files** | README.md, README.zh-CN.md, README.ja.md, language navigation links, footer attribution |
| **Skill Files** | SKILL.md, SKILL.zh-CN.md, SKILL.ja.md for each skill |
| **Skills Config** | Each skill configured in main.js SKILLS object |

**Sample Output:**
```
╔════════════════════════════════════════════════════════════╗
║     share-skill Documentation Verification Script          ║
╚════════════════════════════════════════════════════════════╝

Repository: /Users/username/Codes/skills

── 1. Directory Structure ──
  ✓ docs/index.html exists
  ✓ docs/js/main.js exists
  ✓ docs/css/custom.css exists
  ✓ docs/CNAME exists (custom domain configured)

── 2. index.html Structure ──
  ✓ Favicon element with id='favicon'
  ✓ Navbar brand with id='repoLink'
  ...

════════════════════════════════════════════════════════════
                        Summary
════════════════════════════════════════════════════════════

  Passed:  71
  Failed:  0
  Warnings: 0

✓ All required checks passed!
```

**Exit Codes:**
- `0`: All checks passed
- `1`: One or more checks failed

### When to Run

Run the verification script:
- After generating documentation with `/share-skill docs`
- Before committing documentation changes
- When troubleshooting documentation issues
- As part of CI/CD pipeline for documentation
