<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <a href="README.ja.md">日本語</a>
</p>

# Guo Yu のスキル

生産性と自動化のための Claude Code カスタムスキルコレクション。

## スキル一覧

| スキル | 説明 |
|--------|------|
| [port-allocator](./port-allocator/) | 開発サーバーポートの自動割り当てと管理、複数の Claude Code インスタンス間のポート競合を回避 |
| [share-skill](./share-skill/) | ローカルスキルをコードリポジトリに移行、Git バージョン管理とオープンソース対応 |
| [skill-permissions](./skill-permissions/) | スキルの必要な権限を分析し、ワンタイム認証コマンドを生成 |

## インストール

### プラグインマーケットプレイス経由（推奨）

最も簡単なインストール方法は Claude Code のプラグインマーケットプレイス経由です：

```bash
# スキルマーケットプレイスを追加
/plugin marketplace add guo-yu/skills

# スキルをインストール
/plugin install port-allocator@guo-yu-skills
/plugin install share-skill@guo-yu-skills
/plugin install skill-permissions@guo-yu-skills
```

### 手動インストール

または、リポジトリをクローンしてシンボリックリンクを作成：

```bash
# コードディレクトリにクローン
git clone git@github.com:guo-yu/skills.git ~/Codes/skills

# ~/.claude/skills/ にシンボリックリンクを作成
ln -s ~/Codes/skills/port-allocator ~/.claude/skills/port-allocator
ln -s ~/Codes/skills/share-skill ~/.claude/skills/share-skill
ln -s ~/Codes/skills/skill-permissions ~/.claude/skills/skill-permissions
```

## 使用方法

Claude Code でスラッシュコマンドを使用：

```
/port-allocator          # ポートの照会/割り当て
/share-skill <name>      # スキルをオープンソース化
/skill-permissions       # スキル権限を分析
```

## ドキュメント

このスキルセットには [share-skill](https://github.com/guo-yu/skills/tree/master/share-skill) で生成されたオンラインドキュメントサイトがあります。

### ドキュメントへのアクセス

**カスタムドメイン：**
```
https://skill.guoyu.me/
```

**GitHub Pages：**
```
https://guo-yu.github.io/skills/
```

### GitHub Pages の設定

1. リポジトリの **Settings** → **Pages** に移動
2. "Source" で **Deploy from a branch** を選択
3. ブランチ: `master` (または `main`)、フォルダ: `/docs` を選択
4. (オプション) "Custom domain" にカスタムドメインを追加

## ライセンス

MIT

---

Made with ♥ by [Yu's skills](https://skill.guoyu.me/)
