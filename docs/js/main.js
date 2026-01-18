// Repository configuration
const REPO_OWNER = 'guo-yu';
const REPO_NAME = 'skills';
const BRANCH = 'master';

// Detect if running on GitHub Pages or locally
function getBasePath(skillName) {
    const isGitHubPages = window.location.hostname.includes('github.io');

    if (isGitHubPages) {
        // Use GitHub raw content URL
        return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${skillName}/SKILL.md`;
    } else {
        // Local development - use relative path
        return `../${skillName}/SKILL.md`;
    }
}

// Skills configuration
const SKILLS = {
    'port-allocator': {
        title: 'Port Allocator',
        description: '自动分配和管理开发服务器端口'
    },
    'share-skill': {
        title: 'Share Skill',
        description: '将本地 skill 迁移到代码仓库'
    },
    'skill-permissions': {
        title: 'Skill Permissions',
        description: '分析 skill 所需权限'
    }
};

// Default skill to show
const DEFAULT_SKILL = 'port-allocator';

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
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.href.includes(`skill=${skillName}`)) {
            link.classList.add('active');
        }
    });

    document.querySelectorAll('.dropdown-item').forEach(link => {
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
            <div class="alert alert-danger" role="alert">
                <h4>Skill Not Found</h4>
                <p>The skill "${skillName}" does not exist.</p>
                <p>Available skills: ${Object.keys(SKILLS).join(', ')}</p>
            </div>`;
        return;
    }

    const skillPath = getBasePath(skillName);

    try {
        document.getElementById('content').innerHTML = '<div class="loading">Loading...</div>';

        const response = await fetch(skillPath);

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
        document.title = `${skill.title} - Claude Code Skills`;

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
                headingsOffset: 80,
                scrollSmoothOffset: -80
            });
        }, 100);

        // Update active nav
        updateActiveNav(skillName);

    } catch (error) {
        console.error('Error loading documentation:', error);
        document.getElementById('content').innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4>Error Loading Documentation</h4>
                <p>${error.message}</p>
                <p>Path: ${skillPath}</p>
            </div>`;
    }
}

// Dark/Light mode toggle
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update icon
    document.getElementById('themeIcon').textContent = newTheme === 'dark' ? '🌙' : '☀️';

    // Update highlight.js theme
    updateHighlightTheme(newTheme);
}

function updateHighlightTheme(theme) {
    const link = document.getElementById('hljs-theme');
    if (link) {
        link.href = theme === 'dark'
            ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css'
            : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css';
    }
}

// Initialize theme icon on load
function initThemeIcon() {
    const theme = document.documentElement.getAttribute('data-bs-theme');
    document.getElementById('themeIcon').textContent = theme === 'dark' ? '🌙' : '☀️';
    updateHighlightTheme(theme);
}

// Handle URL changes (for SPA-like navigation)
function handleNavigation() {
    const skillName = getCurrentSkill();
    loadDocumentation(skillName);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initThemeIcon();
    handleNavigation();
});

// Handle popstate for back/forward navigation
window.addEventListener('popstate', handleNavigation);
