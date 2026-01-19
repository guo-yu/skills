// Repository configuration
const REPO_OWNER = 'guo-yu';
const REPO_NAME = 'skills';
const BRANCH = 'master';

// Cache busting version (update this when content changes)
const CACHE_VERSION = Date.now();

// i18n translations
const I18N = {
    en: {
        skills: 'Skills',
        onThisPage: 'On This Page',
        loading: 'Loading documentation...',
        installation: 'Installation',
        installNaturalDesc: 'We recommend installing via natural language:',
        installNaturalExample: 'Please help me install this skill:',
        installDesc: 'The easiest way to install:',
        addMarketplace: 'Add marketplace',
        installSkills: 'Install skills',
        moreOptions: 'More installation options',
        titleSuffix: "'s Skills",
        whyUseThis: 'Why Use This Skill?',
        painPoints: 'Problems It Solves',
        triggersTitle: 'How to Use',
        triggersDesc: 'Trigger this skill with natural language:'
    },
    'zh-CN': {
        skills: '技能列表',
        onThisPage: '本页目录',
        loading: '加载文档中...',
        installation: '安装方法',
        installNaturalDesc: '我们推荐使用自然语言安装：',
        installNaturalExample: '请帮我安装这个 skill：',
        installDesc: '最简单的安装方式：',
        addMarketplace: '添加技能市场',
        installSkills: '安装技能',
        moreOptions: '更多安装选项',
        titleSuffix: ' 的技能集',
        whyUseThis: '为什么使用这个技能？',
        painPoints: '它解决的问题',
        triggersTitle: '如何调用',
        triggersDesc: '使用自然语言即可触发此 skill：'
    },
    ja: {
        skills: 'スキル',
        onThisPage: 'このページ',
        loading: 'ドキュメントを読み込み中...',
        installation: 'インストール',
        installNaturalDesc: '自然言語でのインストールをお勧めします：',
        installNaturalExample: 'このスキルをインストールしてください：',
        installDesc: '最も簡単なインストール方法：',
        addMarketplace: 'マーケットプレイスを追加',
        installSkills: 'スキルをインストール',
        moreOptions: 'その他のインストールオプション',
        titleSuffix: ' のスキル',
        whyUseThis: 'なぜこのスキルを使うのか？',
        painPoints: '解決する問題',
        triggersTitle: '使い方',
        triggersDesc: '自然言語でこのスキルを呼び出せます：'
    }
};

// Marketing content for each skill - compelling reasons to use
const SKILL_MARKETING = {
    'port-allocator': {
        en: {
            headline: 'Never fight with port conflicts again',
            why: 'Every developer knows the frustration: you start your dev server and see "Port 3000 is already in use". You kill a process, break another project, and waste 10 minutes debugging. Port Allocator eliminates this chaos by giving each project its own dedicated port range.',
            painPoints: [
                {
                    icon: '🔥',
                    title: '"Port 3000 is already in use"',
                    desc: 'The most common error message in development. Stop guessing which process to kill.'
                },
                {
                    icon: '🧠',
                    title: 'Mental overhead of port management',
                    desc: 'No more remembering "was project A on 3000 or 3001?" Each project gets a predictable port range.'
                },
                {
                    icon: '💥',
                    title: 'Accidentally killing other projects',
                    desc: 'Running `pkill node` nukes everything. This skill ensures you only touch your current project\'s ports.'
                }
            ],
            triggers: [
                'Help me allocate a port for my project',
                'Start the dev server for me'
            ]
        },
        'zh-CN': {
            headline: '告别端口冲突的烦恼',
            why: '每个开发者都经历过这种挫败感：启动开发服务器时看到"端口 3000 已被占用"。你杀掉一个进程，结果破坏了另一个项目，浪费 10 分钟调试。Port Allocator 通过为每个项目分配专属端口范围，彻底消除这种混乱。',
            painPoints: [
                {
                    icon: '🔥',
                    title: '"端口 3000 已被占用"',
                    desc: '开发中最常见的错误信息。不用再猜测该杀掉哪个进程。'
                },
                {
                    icon: '🧠',
                    title: '端口管理的心智负担',
                    desc: '不用再记忆"项目 A 是 3000 还是 3001？"每个项目都有可预测的端口范围。'
                },
                {
                    icon: '💥',
                    title: '误杀其他项目',
                    desc: '执行 `pkill node` 会杀死所有进程。这个技能确保你只操作当前项目的端口。'
                }
            ],
            triggers: [
                '帮我为项目自动分配端口',
                '帮我启动开发服务器'
            ]
        },
        ja: {
            headline: 'ポート競合との戦いを終わらせる',
            why: 'すべての開発者が経験するフラストレーション：開発サーバーを起動すると「ポート3000は既に使用中」と表示される。プロセスを終了させると別のプロジェクトが壊れ、デバッグに10分を無駄にする。Port Allocatorは各プロジェクトに専用のポート範囲を割り当て、この混乱を解消します。',
            painPoints: [
                {
                    icon: '🔥',
                    title: '「ポート3000は既に使用中」',
                    desc: '開発で最も一般的なエラーメッセージ。どのプロセスを終了すべきか推測する必要がなくなります。'
                },
                {
                    icon: '🧠',
                    title: 'ポート管理の認知負荷',
                    desc: '「プロジェクトAは3000？3001？」と覚える必要はありません。各プロジェクトに予測可能なポート範囲。'
                },
                {
                    icon: '💥',
                    title: '他のプロジェクトを誤って終了',
                    desc: '`pkill node`は全てを終了させます。このスキルは現在のプロジェクトのポートのみを操作することを保証。'
                }
            ],
            triggers: [
                'プロジェクトにポートを自動割り当てしてください',
                '開発サーバーを起動してください'
            ]
        }
    },
    'share-skill': {
        en: {
            headline: 'Transform local AI tools into shareable, versioned assets',
            why: 'Your custom Claude skills are powerful—but they\'re trapped in ~/.claude/skills with no backup, no version control, and no way to share. One machine failure and they\'re gone. Share Skill migrates your skills to a proper Git repository with documentation, making them discoverable and shareable.',
            painPoints: [
                {
                    icon: '💾',
                    title: 'Skills stuck without backup',
                    desc: 'Local skills in ~/.claude have no version history. One accidental delete or machine failure loses everything.'
                },
                {
                    icon: '🤝',
                    title: 'Can\'t collaborate or share',
                    desc: 'Your team could benefit from your skills, but there\'s no easy way to distribute them.'
                },
                {
                    icon: '🔍',
                    title: 'No discovery mechanism',
                    desc: 'Skills hidden in local folders with no documentation. This creates a beautiful docs site automatically.'
                }
            ],
            triggers: [
                'Help me open source my skill',
                'Generate documentation for my skills'
            ]
        },
        'zh-CN': {
            headline: '将本地 AI 工具转化为可分享、版本化的资产',
            why: '你的自定义 Claude 技能非常强大——但它们被困在 ~/.claude/skills 中，没有备份、没有版本控制、无法分享。一次机器故障就会全部丢失。Share Skill 将你的技能迁移到正规的 Git 仓库，并配有文档，使它们可被发现和分享。',
            painPoints: [
                {
                    icon: '💾',
                    title: '技能没有备份',
                    desc: '~/.claude 中的本地技能没有版本历史。一次误删或机器故障就会丢失一切。'
                },
                {
                    icon: '🤝',
                    title: '无法协作或分享',
                    desc: '你的团队可以从你的技能中受益，但没有简单的方式来分发它们。'
                },
                {
                    icon: '🔍',
                    title: '没有发现机制',
                    desc: '技能隐藏在本地文件夹中，没有文档。这个技能会自动创建精美的文档站点。'
                }
            ],
            triggers: [
                '帮我开源这个技能',
                '帮我生成技能文档'
            ]
        },
        ja: {
            headline: 'ローカルAIツールを共有可能なバージョン管理資産に変換',
            why: 'カスタムClaudeスキルは強力ですが、~/.claude/skillsに閉じ込められ、バックアップも、バージョン管理も、共有方法もありません。マシン障害で全て失われます。Share Skillはスキルをドキュメント付きの適切なGitリポジトリに移行し、発見可能で共有可能にします。',
            painPoints: [
                {
                    icon: '💾',
                    title: 'バックアップのないスキル',
                    desc: '~/.claudeのローカルスキルにはバージョン履歴がありません。誤削除やマシン障害で全て失われます。'
                },
                {
                    icon: '🤝',
                    title: 'コラボレーション・共有ができない',
                    desc: 'チームがあなたのスキルから恩恵を受けられるのに、配布する簡単な方法がありません。'
                },
                {
                    icon: '🔍',
                    title: '発見メカニズムがない',
                    desc: 'スキルがドキュメントなしでローカルフォルダに隠れています。美しいドキュメントサイトを自動作成します。'
                }
            ],
            triggers: [
                'スキルをオープンソースにしてください',
                'スキルのドキュメントを生成してください'
            ]
        }
    },
    'skill-permissions': {
        en: {
            headline: 'One command to authorize, zero interruptions while coding',
            why: 'Every time you use a skill, Claude asks "Allow this command?" You click allow, lose focus, and break your flow—dozens of times per session. Skill Permissions analyzes what a skill needs upfront and generates a single command to authorize everything at once.',
            painPoints: [
                {
                    icon: '⏸️',
                    title: 'Constant permission prompts',
                    desc: '"Allow Bash(git...)?" "Allow Bash(ls...)?" Every prompt breaks your concentration and workflow.'
                },
                {
                    icon: '❓',
                    title: 'Unknown permission requirements',
                    desc: 'You don\'t know what commands a skill will run until it asks. This analyzes everything upfront.'
                },
                {
                    icon: '⚙️',
                    title: 'Tedious manual configuration',
                    desc: 'Manually editing settings.json to add allowedCommands is error-prone and time-consuming.'
                }
            ],
            triggers: [
                'Analyze what permissions this skill needs',
                'Help me authorize this skill'
            ]
        },
        'zh-CN': {
            headline: '一条命令授权，编码零打扰',
            why: '每次使用技能时，Claude 都会问"允许这个命令吗？"你点击允许，失去焦点，打断工作流——每个会话数十次。Skill Permissions 预先分析技能需要什么，并生成一条命令一次性授权所有权限。',
            painPoints: [
                {
                    icon: '⏸️',
                    title: '不断的权限提示',
                    desc: '"允许 Bash(git...)？""允许 Bash(ls...)？"每次提示都会打断你的专注和工作流。'
                },
                {
                    icon: '❓',
                    title: '未知的权限需求',
                    desc: '你不知道技能会运行什么命令，直到它询问。这个技能会预先分析所有内容。'
                },
                {
                    icon: '⚙️',
                    title: '繁琐的手动配置',
                    desc: '手动编辑 settings.json 添加 allowedCommands 容易出错且耗时。'
                }
            ],
            triggers: [
                '分析这个技能需要什么权限',
                '帮我授权这个技能'
            ]
        },
        ja: {
            headline: '1つのコマンドで認証、コーディング中の中断ゼロ',
            why: 'スキルを使うたびに、Claudeは「このコマンドを許可しますか？」と尋ねます。許可をクリックし、集中を失い、フローが途切れる—セッションごとに数十回。Skill Permissionsはスキルが必要とするものを事前に分析し、全てを一度に認証する単一のコマンドを生成します。',
            painPoints: [
                {
                    icon: '⏸️',
                    title: '絶え間ない許可プロンプト',
                    desc: '「Bash(git...)を許可？」「Bash(ls...)を許可？」毎回のプロンプトが集中とワークフローを中断。'
                },
                {
                    icon: '❓',
                    title: '未知の権限要件',
                    desc: 'スキルがどのコマンドを実行するか、尋ねられるまで分かりません。事前に全てを分析します。'
                },
                {
                    icon: '⚙️',
                    title: '面倒な手動設定',
                    desc: 'settings.jsonを手動で編集してallowedCommandsを追加するのはエラーが起きやすく時間がかかります。'
                }
            ],
            triggers: [
                'このスキルに必要な権限を分析してください',
                'このスキルを認証してください'
            ]
        }
    },
    'skill-i18n': {
        en: {
            headline: 'Make your skills accessible to developers worldwide',
            why: 'You built an amazing skill, but it only speaks one language. International developers can\'t use it, can\'t discover it, and won\'t adopt it. Skill i18n automatically translates your SKILL.md into multiple languages, expanding your reach from local to global.',
            painPoints: [
                {
                    icon: '🌍',
                    title: 'Skills trapped in one language',
                    desc: 'Your English-only documentation excludes millions of developers who would benefit from your skill.'
                },
                {
                    icon: '⏰',
                    title: 'Manual translation is tedious',
                    desc: 'Translating documentation by hand takes hours and requires language expertise you may not have.'
                },
                {
                    icon: '🔄',
                    title: 'Translations get out of sync',
                    desc: 'Every update to the original requires re-translating. Automated i18n keeps all versions aligned.'
                }
            ],
            triggers: [
                'Translate my skill into Chinese and Japanese',
                'Help me internationalize this skill'
            ]
        },
        'zh-CN': {
            headline: '让你的技能触达全球开发者',
            why: '你创建了一个很棒的技能，但它只支持一种语言。国际开发者无法使用、无法发现、也不会采用它。Skill i18n 自动将你的 SKILL.md 翻译成多种语言，让你的技能从本地走向全球。',
            painPoints: [
                {
                    icon: '🌍',
                    title: '技能被困在单一语言中',
                    desc: '只有英文的文档排除了数百万可能从你的技能中受益的开发者。'
                },
                {
                    icon: '⏰',
                    title: '手动翻译太繁琐',
                    desc: '手工翻译文档需要数小时，还需要你可能不具备的语言专业知识。'
                },
                {
                    icon: '🔄',
                    title: '翻译版本不同步',
                    desc: '每次更新原文都需要重新翻译。自动化 i18n 让所有版本保持一致。'
                }
            ],
            triggers: [
                '帮我把技能翻译成中文和日文',
                '帮我做技能国际化'
            ]
        },
        ja: {
            headline: 'あなたのスキルを世界中の開発者に届ける',
            why: '素晴らしいスキルを作りましたが、一つの言語しか対応していません。海外の開発者は使えず、発見できず、採用しません。Skill i18nはSKILL.mdを自動的に複数言語に翻訳し、ローカルからグローバルへリーチを拡大します。',
            painPoints: [
                {
                    icon: '🌍',
                    title: 'スキルが一言語に閉じ込められている',
                    desc: '英語のみのドキュメントは、あなたのスキルから恩恵を受ける何百万人もの開発者を除外しています。'
                },
                {
                    icon: '⏰',
                    title: '手動翻訳は面倒',
                    desc: 'ドキュメントを手作業で翻訳するには何時間もかかり、持っていないかもしれない語学力が必要です。'
                },
                {
                    icon: '🔄',
                    title: '翻訳が同期しなくなる',
                    desc: 'オリジナルを更新するたびに再翻訳が必要。自動化されたi18nは全バージョンを整合させます。'
                }
            ],
            triggers: [
                'スキルを中国語と日本語に翻訳してください',
                'スキルの国際化を手伝ってください'
            ]
        }
    }
};

// Skills configuration with SVG icons
const SKILLS = {
    'port-allocator': {
        title: 'Port Allocator',
        description: '自动分配和管理开发服务器端口',
        icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'
    },
    'share-skill': {
        title: 'Share Skill',
        description: '将本地 skill 迁移到代码仓库',
        icon: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>'
    },
    'skill-permissions': {
        title: 'Skill Permissions',
        description: '分析 skill 所需权限',
        icon: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
    },
    'skill-i18n': {
        title: 'Skill i18n',
        description: '将 SKILL.md 翻译成多语言版本',
        icon: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'
    }
};

// Generate skill icon SVG
function skillIcon(skillId, size = 18) {
    const skill = SKILLS[skillId];
    if (!skill) return '';
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${skill.icon}</svg>`;
}

// Render skill lists dynamically
function renderSkillLists() {
    const currentSkill = new URLSearchParams(window.location.search).get('skill') || DEFAULT_SKILL;

    // 1. Navbar dropdown
    const navDropdown = document.getElementById('navSkillList');
    if (navDropdown) {
        navDropdown.innerHTML = Object.keys(SKILLS).map(id => `
            <a href="?skill=${id}">${skillIcon(id, 16)} ${id}</a>
        `).join('');
    }

    // 2. Mobile menu
    const mobileMenu = document.getElementById('mobileSkillList');
    if (mobileMenu) {
        mobileMenu.innerHTML = Object.keys(SKILLS).map(id => `
            <a href="?skill=${id}">${id}</a>
        `).join('');
    }

    // 3. Sidebar
    const sidebar = document.getElementById('sidebarSkillList');
    if (sidebar) {
        sidebar.innerHTML = Object.keys(SKILLS).map(id => `
            <a class="sidebar-link${id === currentSkill ? ' active' : ''}" href="?skill=${id}">
                ${skillIcon(id)} ${id}
            </a>
        `).join('');
    }
}

// Render install code dynamically
function renderInstallCode() {
    const installCode = document.getElementById('installCode');
    if (!installCode) return;

    const t = I18N[currentLang];
    const repoSlug = `${REPO_OWNER}-${REPO_NAME}`;
    const skillCommands = Object.keys(SKILLS)
        .map(id => `<span class="cmd">/plugin install ${id}@${repoSlug}</span>`)
        .join('\n');

    installCode.innerHTML = `<div class="install-natural">
<p class="install-natural-desc">${t.installNaturalDesc}</p>
<div class="install-natural-example">"${t.installNaturalExample} https://github.com/${REPO_OWNER}/${REPO_NAME}"</div>
</div>
<pre><code><span class="comment"># <span data-i18n="addMarketplace">${t.addMarketplace}</span></span>
<span class="cmd">/plugin marketplace add ${REPO_OWNER}/${REPO_NAME}</span>

<span class="comment"># <span data-i18n="installSkills">${t.installSkills}</span></span>
${skillCommands}</code></pre>`;
}

// Default skill to show
const DEFAULT_SKILL = 'port-allocator';

// Current language
let currentLang = localStorage.getItem('docs-lang') || 'en';

// User info cache
let userInfo = null;

// Detect if running on GitHub Pages or locally
function getBasePath(skillName, lang = 'en') {
    const isGitHubPages = window.location.hostname.includes('github.io') ||
                          window.location.hostname === 'skill.guoyu.me' ||
                          window.location.hostname === 'guoyu.me';

    // Determine file name based on language
    const fileName = lang === 'en' ? 'SKILL.md' : `SKILL.${lang}.md`;

    if (isGitHubPages) {
        // Add cache busting for GitHub raw content
        return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${skillName}/${fileName}?v=${CACHE_VERSION}`;
    } else {
        // Add cache busting for local development
        return `../${skillName}/${fileName}?v=${CACHE_VERSION}`;
    }
}

// Fetch GitHub user info
async function fetchUserInfo() {
    if (userInfo) return userInfo;

    try {
        const response = await fetch(`https://api.github.com/users/${REPO_OWNER}`);
        if (response.ok) {
            userInfo = await response.json();
            return userInfo;
        }
    } catch (error) {
        console.log('Could not fetch GitHub user info:', error);
    }

    // Fallback
    return {
        login: REPO_OWNER,
        name: REPO_OWNER,
        avatar_url: `https://github.com/${REPO_OWNER}.png`
    };
}

// Update brand title with user name
async function updateBrandTitle() {
    const user = await fetchUserInfo();
    const displayName = user.name || user.login;
    const suffix = I18N[currentLang].titleSuffix;

    // Update brand title
    const brandTitle = document.getElementById('brandTitle');
    if (brandTitle) {
        brandTitle.innerHTML = `<span class="brand-name">${displayName}</span>${suffix}`;
    }

    // Update avatar
    const avatar = document.getElementById('userAvatar');
    if (avatar) {
        avatar.src = user.avatar_url;
        avatar.alt = displayName;
    }

    // Update favicon to user's avatar
    const favicon = document.getElementById('favicon');
    if (favicon) {
        favicon.href = user.avatar_url;
    }

    // Update repo link
    const repoLink = document.getElementById('repoLink');
    if (repoLink) {
        repoLink.href = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
    }

    // Update page title
    document.title = `${displayName}${suffix}`;
}

// Apply i18n translations
function applyI18n() {
    const translations = I18N[currentLang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            el.textContent = translations[key];
        }
    });

    // Update HTML lang attribute
    document.documentElement.lang = currentLang === 'zh-CN' ? 'zh-CN' : (currentLang === 'ja' ? 'ja' : 'en');

    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });

    // Update brand title
    updateBrandTitle();
}

// Set language
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('docs-lang', lang);
    applyI18n();

    // Update install code with new language
    renderInstallCode();

    // Reload documentation with new language
    const skillName = getCurrentSkill();
    loadDocumentation(skillName);
}

// Setup language switcher
function setupLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
}

// Configure marked
marked.setOptions({
    breaks: true,
    gfm: true
});

// Render triggers section for a skill
function renderTriggersSection(skillName) {
    const marketing = SKILL_MARKETING[skillName];
    if (!marketing) return '';

    const content = marketing[currentLang] || marketing['en'];
    if (!content || !content.triggers || content.triggers.length === 0) return '';

    const t = I18N[currentLang];

    const triggersHtml = content.triggers.map(trigger => `
        <div class="trigger-item">
            <span class="trigger-quote">"${trigger}"</span>
        </div>
    `).join('');

    return `
        <div class="triggers-section">
            <h3 class="triggers-title">💬 ${t.triggersTitle}</h3>
            <p class="triggers-desc">${t.triggersDesc}</p>
            <div class="triggers-list">
                ${triggersHtml}
            </div>
        </div>
    `;
}

// Render marketing section for a skill
function renderMarketingSection(skillName) {
    const marketing = SKILL_MARKETING[skillName];
    if (!marketing) return '';

    const content = marketing[currentLang] || marketing['en'];
    if (!content) return '';

    const t = I18N[currentLang];

    const painPointsHtml = content.painPoints.map(point => `
        <div class="pain-point-card">
            <div class="pain-point-icon">${point.icon}</div>
            <div class="pain-point-content">
                <h4 class="pain-point-title">${point.title}</h4>
                <p class="pain-point-desc">${point.desc}</p>
            </div>
        </div>
    `).join('');

    const triggersHtml = renderTriggersSection(skillName);

    return `
        <div class="marketing-section">
            <div class="marketing-headline">
                <h2 class="marketing-title">${content.headline}</h2>
            </div>
            <div class="marketing-why">
                <p>${content.why}</p>
            </div>
            <div class="marketing-pain-points">
                <h3 class="pain-points-title">${t.painPoints}</h3>
                <div class="pain-points-grid">
                    ${painPointsHtml}
                </div>
            </div>
            ${triggersHtml}
        </div>
    `;
}

// Post-process HTML to add IDs to headings
function addHeadingIds(html) {
    return html.replace(/<h([1-6])>(.*?)<\/h[1-6]>/gi, (match, level, text) => {
        const id = text
            .toLowerCase()
            .replace(/<[^>]*>/g, '')
            .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        return `<h${level} id="${id}">${text}</h${level}>`;
    });
}

// Get current skill from URL
function getCurrentSkill() {
    const params = new URLSearchParams(window.location.search);
    return params.get('skill') || DEFAULT_SKILL;
}

// Update active nav link
function updateActiveNav(skillName) {
    // Update sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
        if (link.href.includes(`skill=${skillName}`)) {
            link.classList.add('active');
        }
    });

    // Update dropdown links
    document.querySelectorAll('.nav-dropdown-content a').forEach(link => {
        link.classList.remove('active');
        if (link.href.includes(`skill=${skillName}`)) {
            link.classList.add('active');
        }
    });
}

// Fetch and render the Markdown file
async function loadDocumentation(skillName) {
    const skill = SKILLS[skillName];

    if (!skill) {
        document.getElementById('content').innerHTML = `
            <div class="alert alert-danger">
                <h4>Skill Not Found</h4>
                <p>The skill "${skillName}" does not exist.</p>
                <p>Available skills: ${Object.keys(SKILLS).join(', ')}</p>
            </div>`;
        return;
    }

    // Try loading language-specific file first, fallback to English
    let skillPath = getBasePath(skillName, currentLang);
    let fallbackToEnglish = false;

    console.log('Loading skill:', skillName);
    console.log('Language:', currentLang);
    console.log('Path:', skillPath);

    try {
        const loadingText = I18N[currentLang].loading;
        document.getElementById('content').innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>${loadingText}</p>
            </div>`;

        let response = await fetch(skillPath);
        console.log('Response status:', response.status);

        // If language-specific file not found, fallback to English
        if (!response.ok && currentLang !== 'en') {
            console.log('Language-specific file not found, falling back to English');
            skillPath = getBasePath(skillName, 'en');
            response = await fetch(skillPath);
            fallbackToEnglish = true;
        }

        if (!response.ok) {
            throw new Error(`Failed to load: ${response.status}`);
        }

        let markdown = await response.text();

        // Remove YAML frontmatter
        markdown = markdown.replace(/^---[\s\S]*?---\n*/m, '');

        // Parse and render
        let html = marked.parse(markdown);
        html = addHeadingIds(html);

        // Add marketing section before the main content
        const marketingHtml = renderMarketingSection(skillName);
        document.getElementById('content').innerHTML = marketingHtml + html;

        // Update page title
        const user = await fetchUserInfo();
        const displayName = user.name || user.login;
        document.title = `${skill.title} - ${displayName}${I18N[currentLang].titleSuffix}`;

        // Highlight code blocks
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

        // Initialize table of contents
        setTimeout(() => {
            tocbot.destroy();
            tocbot.init({
                tocSelector: '.js-toc',
                contentSelector: '.js-toc-content',
                headingSelector: 'h1, h2, h3',
                scrollSmooth: true,
                scrollSmoothDuration: 300,
                headingsOffset: 100,
                scrollSmoothOffset: -100
            });
        }, 100);

        // Update active nav
        updateActiveNav(skillName);

    } catch (error) {
        console.error('Error loading documentation:', error);
        document.getElementById('content').innerHTML = `
            <div class="alert alert-danger">
                <h4>Error Loading Documentation</h4>
                <p>${error.message}</p>
                <p>Path: ${skillPath}</p>
            </div>`;
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
}

// Close mobile menu when clicking a link
function setupMobileMenuLinks() {
    document.querySelectorAll('.mobile-menu-content a').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('mobileMenu').classList.remove('active');
        });
    });
}

// Handle URL changes (for SPA-like navigation)
function handleNavigation() {
    const skillName = getCurrentSkill();
    loadDocumentation(skillName);
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Render dynamic skill lists
    renderSkillLists();

    // Render install code
    renderInstallCode();

    // Setup language switcher
    setupLanguageSwitcher();

    // Apply initial i18n
    applyI18n();

    // Fetch user info and update UI
    await fetchUserInfo();
    await updateBrandTitle();

    // Handle navigation
    handleNavigation();
    setupMobileMenuLinks();
});

// Handle popstate for back/forward navigation
window.addEventListener('popstate', handleNavigation);
