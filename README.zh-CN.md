<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <a href="README.ja.md">日本語</a>
</p>

# Guo Yu 的技能集

我的 Claude Code 自定义技能集合，用于提高生产力和自动化。

## 技能列表

| 技能 | 说明 |
|------|------|
| [port-allocator](./port-allocator/) | 自动分配和管理开发服务器端口，避免多个 Claude Code 实例之间的端口冲突 |
| [share-skill](./share-skill/) | 将本地技能迁移到代码仓库，支持 Git 版本管理和开源 |
| [skill-permissions](./skill-permissions/) | 分析技能所需权限，生成一次性授权命令 |

## 安装方法

### 通过插件市场安装（推荐）

最简单的安装方式是通过 Claude Code 的插件市场：

```bash
# 添加技能市场
/plugin marketplace add guo-yu/skills

# 安装技能
/plugin install port-allocator@guo-yu-skills
/plugin install share-skill@guo-yu-skills
/plugin install skill-permissions@guo-yu-skills
```

### 手动安装

也可以克隆本仓库并创建符号链接：

```bash
# 克隆到代码目录
git clone git@github.com:guo-yu/skills.git ~/Codes/skills

# 创建符号链接到 ~/.claude/skills/
ln -s ~/Codes/skills/port-allocator ~/.claude/skills/port-allocator
ln -s ~/Codes/skills/share-skill ~/.claude/skills/share-skill
ln -s ~/Codes/skills/skill-permissions ~/.claude/skills/skill-permissions
```

## 使用方法

在 Claude Code 中使用斜杠命令：

```
/port-allocator          # 查询/分配端口
/share-skill <name>      # 开源技能
/skill-permissions       # 分析技能权限
```

## 在线文档

本技能集有一个由 [share-skill](https://github.com/guo-yu/skills) 生成的在线文档网站。

### 访问文档

**自定义域名：**
```
https://skill.guoyu.me/
```

**GitHub Pages：**
```
https://guo-yu.github.io/skills/docs/
```

### 配置 GitHub Pages

1. 进入仓库 **Settings** → **Pages**
2. 在 "Source" 下选择 **Deploy from a branch**
3. 选择分支: `master` (或 `main`)，文件夹: `/docs`
4. (可选) 在 "Custom domain" 中添加自定义域名

## 许可证

MIT

---

Made with ♥ by [Yu's skills](https://github.com/guo-yu/skills)
