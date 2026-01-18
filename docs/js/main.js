// Repository configuration
const REPO_OWNER = 'guo-yu';
const REPO_NAME = 'skills';
const BRANCH = 'master';

// Skills configuration
const SKILLS = {
    'port-allocator': {
        title: 'Port Allocator',
        description: '自动分配和管理开发服务器端口',
        icon: '⚡'
    },
    'share-skill': {
        title: 'Share Skill',
        description: '将本地 skill 迁移到代码仓库',
        icon: '🔗'
    },
    'skill-permissions': {
        title: 'Skill Permissions',
        description: '分析 skill 所需权限',
        icon: '🔐'
    }
};

// Default skill to show
const DEFAULT_SKILL = 'port-allocator';

// Detect if running on GitHub Pages or locally
function getBasePath(skillName) {
    const isGitHubPages = window.location.hostname.includes('github.io') ||
                          window.location.hostname === 'skill.guoyu.me' ||
                          window.location.hostname === 'guoyu.me';

    if (isGitHubPages) {
        return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${skillName}/SKILL.md`;
    } else {
        return `../${skillName}/SKILL.md`;
    }
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

    const skillPath = getBasePath(skillName);
    console.log('Loading skill:', skillName);
    console.log('Path:', skillPath);

    try {
        document.getElementById('content').innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading documentation...</p>
            </div>`;

        const response = await fetch(skillPath);
        console.log('Response status:', response.status);

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
document.addEventListener('DOMContentLoaded', () => {
    handleNavigation();
    setupMobileMenuLinks();
});

// Handle popstate for back/forward navigation
window.addEventListener('popstate', handleNavigation);
