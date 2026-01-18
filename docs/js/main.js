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
        installDesc: 'The easiest way to install:',
        addMarketplace: 'Add marketplace',
        installSkills: 'Install skills',
        moreOptions: 'More installation options',
        titleSuffix: "'s Skills"
    },
    'zh-CN': {
        skills: '技能列表',
        onThisPage: '本页目录',
        loading: '加载文档中...',
        installation: '安装方法',
        installDesc: '最简单的安装方式：',
        addMarketplace: '添加技能市场',
        installSkills: '安装技能',
        moreOptions: '更多安装选项',
        titleSuffix: ' 的技能集'
    },
    ja: {
        skills: 'スキル',
        onThisPage: 'このページ',
        loading: 'ドキュメントを読み込み中...',
        installation: 'インストール',
        installDesc: '最も簡単なインストール方法：',
        addMarketplace: 'マーケットプレイスを追加',
        installSkills: 'スキルをインストール',
        moreOptions: 'その他のインストールオプション',
        titleSuffix: ' のスキル'
    }
};

// Skills configuration
const SKILLS = {
    'port-allocator': {
        title: 'Port Allocator',
        description: '自动分配和管理开发服务器端口',
        icon: 'port'
    },
    'share-skill': {
        title: 'Share Skill',
        description: '将本地 skill 迁移到代码仓库',
        icon: 'share'
    },
    'skill-permissions': {
        title: 'Skill Permissions',
        description: '分析 skill 所需权限',
        icon: 'lock'
    }
};

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
        document.getElementById('content').innerHTML = html;

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
