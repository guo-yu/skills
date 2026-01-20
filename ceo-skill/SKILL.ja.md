---
name: ceo-skill
description: インテリジェントなプロジェクト管理ダッシュボード - CEOの視点から全プロジェクトの状態、優先度、タスクを確認
---

# CEO Skill

インテリジェントなプロジェクト管理ダッシュボードです。CEOのように考え、全プロジェクトを俯瞰し、潜在的価値と緊急度で優先順位付けします。

## 使い方

| コマンド | 説明 |
|---------|------|
| `/ceo` | プロジェクトランキングダッシュボードを表示（毎日初回実行時に自動トリガー） |
| `/ceo scan` | コードベース内の全プロジェクトを再スキャン |
| `/ceo config` | スコアリング重みと設定を構成 |
| `/ceo <name>` | 特定プロジェクトの詳細情報を表示 |
| `/ceo todo <name>` | プロジェクトのTODOを管理 |
| `/ceo jump <name>` | 新しいClaude Codeでプロジェクトを開くターミナルコマンドを生成 |

## トリガー

このスキルを呼び出す自然言語フレーズ：
- 「全プロジェクトを見せて」
- 「今日は何に取り組むべき？」
- 「プロジェクト概要/ダッシュボード」
- 「どのプロジェクトが最も重要？」
- 「優先度付きで全プロジェクトをリスト」

## 対応プロジェクトタイプ

| タイプ | 識別ファイル | 依存関係検出 |
|--------|-------------|-------------|
| Node.js | `package.json` | dependencies + devDependencies |
| Python | `pyproject.toml` または `requirements.txt` | [project.dependencies] または行数 |
| Go | `go.mod` | require ブロック |
| Rust | `Cargo.toml` | [dependencies] |

## 評価軸

### 1. 複雑度スコア (0-100)

| 指標 | 重み | 検出方法 |
|------|------|---------|
| コードファイル数 | 25% | プロジェクトタイプ別拡張子でスキャン |
| 依存関係数 | 20% | 設定ファイルを解析 |
| 技術スタック | 20% | monorepo、データベース、テストフレームワークを検出 |
| ディレクトリ深度 | 15% | プロジェクト構造の最大深度 |
| 設定ファイル数 | 10% | `*.config.*`、`*.toml`、`*.yaml` など |
| スクリプト数 | 10% | scripts/Makefile/justfile |

**プロジェクトタイプ別ファイル拡張子：**
- Node.js: `*.ts`, `*.tsx`, `*.js`, `*.jsx`
- Python: `*.py`
- Go: `*.go`
- Rust: `*.rs`

### 2. ROIスコア (0-100)

**投入指標：**
- 起動時間の推定（依存関係、ビルドスクリプト）
- 環境設定の複雑さ（.envファイル、外部サービス）

**産出指標：**
- 直近7日間のコミット数: `git log --since="7 days ago" --oneline | wc -l`
- 最終アクティブ時間
- 未完了タスク数

### 3. ビジネスポテンシャルスコア (0-100)

コード特性から自動検出：

| 検出項目 | ポイント | 検出方法 |
|---------|---------|---------|
| 決済連携 | +25 | grep -r "stripe\|paypal\|payment\|billing" |
| ユーザー認証 | +20 | grep -r "auth\|login\|session\|jwt\|oauth" |
| データベース | +15 | drizzle/prisma/sqlalchemy/gorm などを検出 |
| デプロイ設定 | +15 | Dockerfile, vercel.json, fly.toml, k8s yaml |
| APIルート | +10 | /api ディレクトリまたはルート設定を検出 |
| 環境変数 | +10 | API_KEY系変数を含む .env.example |
| ドメイン設定 | +5 | CNAMEファイルまたはカスタムドメイン設定 |

### 4. 総合スコア

```
final = complexity * 0.3 + roi * 0.4 + business * 0.3
```

重みはユーザーがカスタマイズ可能です。

## 設定ファイル

### グローバル設定: `~/.claude/ceo-dashboard.json`

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

### プロジェクト単位の設定（任意）: `<project>/.claude/dashboard.json`

```json
{
  "name": "プロジェクト名",
  "description": "簡単な説明",
  "priority_boost": 10,
  "business_override": 85,
  "todos": [
    { "title": "E2Eテストを完了", "priority": "high" }
  ]
}
```

## 実行手順

### 初回実行：コードベースの初期化

初回実行時、コードベースの場所を検出します：

1. **既存設定から自動検出：**

```bash
# 優先順位：
# 1. port-allocator 設定
CODE_ROOT=$(jq -r '.code_root // empty' ~/.claude/port-registry.json 2>/dev/null)

# 2. share-skill 設定
if [ -z "$CODE_ROOT" ]; then
  CODE_ROOT=$(jq -r '.code_root // empty' ~/.claude/share-skill-config.json 2>/dev/null)
fi

# 3. 一般的なディレクトリを自動検出
if [ -z "$CODE_ROOT" ]; then
  for dir in ~/Codes ~/Code ~/Projects ~/Dev ~/Development ~/repos; do
    if [ -d "$dir" ]; then
      CODE_ROOT="$dir"
      break
    fi
  done
fi
```

2. **自動検出に失敗した場合**、AskUserQuestion を使用：

```
コードベースの場所を自動検出できませんでした。

メインのコードディレクトリを選択または入力してください：
  [1] ~/Codes
  [2] ~/Code
  [3] ~/Projects
  [4] その他（カスタムパス）
```

3. **初期化出力：**

```
CEO Skill を初期化中...

✓ コードベース検出: ~/Codes (port-allocator から取得)

設定を保存しました: ~/.claude/ceo-dashboard.json

/ceo config でコードベースパスを変更できます
```

4. **ユーザーの CLAUDE.md を更新**（追記モード、既存コンテンツは上書きしない）：

`~/.claude/CLAUDE.md` が存在し、CEO skill セクションが含まれていないことを確認します。条件を満たす場合、以下を追記：

```markdown
## CEO プロジェクトダッシュボード

`/ceo` skill を使用して、CEOの視点から全プロジェクトを管理します。

### クイックコマンド

| コマンド | 説明 |
|---------|------|
| `/ceo` | プロジェクトランキングダッシュボードを表示 |
| `/ceo scan` | 全プロジェクトを再スキャン |
| `/ceo config` | スコアリング重みを設定 |
| `/ceo <name>` | 特定プロジェクトの詳細を表示 |
| `/ceo todo <name>` | プロジェクトのTODOを管理 |
| `/ceo jump <name>` | ジャンプコマンドを生成 |

### 毎日の自動トリガー

毎日初回の `/ceo` 実行時に自動でフルスキャンを実行し、全プロジェクトの以下を計算：
- **複雑度スコア** (30%): コードファイル数、依存関係数、技術スタック
- **ROIスコア** (40%): 最近のアクティビティ、コミット頻度
- **ビジネスポテンシャル** (30%): 決済連携、ユーザー認証、デプロイ設定

### 設定ファイル

- **ダッシュボードデータ**: `~/.claude/ceo-dashboard.json`
- **プロジェクト単位の設定**: `<project>/.claude/dashboard.json`（任意）
```

**重要：** 既存セクションを先に確認：
```bash
grep -q "CEO プロジェクトダッシュボード" ~/.claude/CLAUDE.md 2>/dev/null
```

セクションが既に存在する場合、このステップをスキップします。

### コマンド: `/ceo`（デフォルト）

プロジェクトランキングダッシュボードを表示します。毎日初回実行時に自動トリガーされます。

1. **毎日のトリガーを確認：**

```bash
TODAY=$(date +%Y-%m-%d)
LAST=$(jq -r '.last_daily_report // ""' ~/.claude/ceo-dashboard.json 2>/dev/null)

if [ "$TODAY" != "$LAST" ]; then
  # 今日初めての実行 - フルスキャンを実行
fi
```

2. **設定を読み込み** `~/.claude/ceo-dashboard.json` から
   - 存在しない場合、初回初期化を実行

3. **各プロジェクトのスコアを計算：**
   - 複雑度スコア
   - ROIスコア
   - ビジネスポテンシャルスコア
   - 最終加重スコア

4. **プロジェクトをソート** 最終スコアの降順で

5. **ダッシュボードを表示** ランキングテーブルとトップ3の詳細

6. **last_daily_report を更新** 今日の日付に

### コマンド: `/ceo scan`

コードベース内の全プロジェクトを再スキャンします。

1. **設定を読み込み** `code_root` を取得
   - 存在しない場合、初回初期化を実行

2. **全プロジェクトファイルを検索：**

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

3. **各プロジェクトについて：**
   - プロジェクトタイプを判定
   - 拡張子別にコードファイルをカウント
   - 依存関係を解析
   - gitアクティビティを確認
   - ビジネス機能を検出
   - 全スコアを計算

4. **設定を更新** 新しいプロジェクトデータで

5. **スキャン結果を表示**

### キャッシュ戦略（Token最適化）

Token消費を最小限に抑えるため、git commit hashに基づく増分スキャンを使用します。

#### キャッシュ構造

`ceo-dashboard.json`の各プロジェクトに追加：

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

#### 増分スキャンアルゴリズム

**ステップ1：クイック変更検出（プロジェクトごとにO(1)）**

```bash
# 現在のcommit hashを取得 - 瞬時操作
CURRENT_HASH=$(cd <project> && git rev-parse HEAD 2>/dev/null)
CACHED_HASH=$(jq -r '.projects["<name>"].cache.commit_hash // ""' ~/.claude/ceo-dashboard.json)

if [ "$CURRENT_HASH" = "$CACHED_HASH" ]; then
  echo "SKIP" # キャッシュされたメトリクスを使用
else
  echo "SCAN" # 再スキャンが必要
fi
```

**ステップ2：プロジェクトの分類**

| カテゴリ | 条件 | アクション |
|---------|------|-----------|
| 新規 | キャッシュにない | フルスキャン |
| 変更あり | Hashが不一致 | フルスキャン |
| 変更なし | Hashが一致 | キャッシュを使用 |
| 非git | .gitディレクトリなし | package.jsonのmtimeを確認 |

**ステップ3：選択的出力**

```bash
# 変更されたプロジェクトの詳細のみを出力
# 変更なしのプロジェクトはランキングにキャッシュスコアのみ表示
```

#### Token節約

| スキャンタイプ | Tokenコスト | 使用場面 |
|--------------|------------|---------|
| フルスキャン | ~1,000/プロジェクト | 新規または変更されたプロジェクト |
| キャッシュヒット | ~50/プロジェクト | 変更なしのプロジェクト |
| Hash確認 | ~10/プロジェクト | 全プロジェクト |

**節約例：**
- 10プロジェクト、毎日2つが変更
- フルスキャン：10 × 1,000 = 10,000 tokens
- キャッシュ使用：2 × 1,000 + 8 × 50 = 2,400 tokens
- **節約：76%**

#### デイリースキャンフロー

```
/ceo（毎日初回実行）
  │
  ├─ キャッシュ設定を読み込み
  │
  ├─ 各既知プロジェクトについて：
  │   └─ git rev-parse HEAD → キャッシュと比較
  │       ├─ 一致 → キャッシュスコアを使用
  │       └─ 不一致 → 再スキャンキューに追加
  │
  ├─ 新規プロジェクトを確認：
  │   └─ find <code_root> -name "package.json" ...
  │       └─ パスをキャッシュされたプロジェクトと比較
  │           └─ 新しいパス → フルスキャンキューに追加
  │
  ├─ キューに入ったプロジェクトのみ再スキャン
  │
  └─ ダッシュボードを表示（全プロジェクト、キャッシュ＋新規データ混合）
```

#### 強制フルスキャン

`/ceo scan --force`を使用してキャッシュをバイパスし、全プロジェクトを再スキャンします。

### コマンド: `/ceo config`

スコアリング重みと設定を構成します。

AskUserQuestion を使用してオプションを提示：

```
CEO ダッシュボード設定

現在の重み：
  - 複雑度: 30%
  - ROI: 40%
  - ビジネス: 30%

何を設定しますか？
  [1] スコアリング重みを変更
  [2] コードベースパスを変更
  [3] スキップパターンを設定
  [4] デフォルトにリセット
```

### コマンド: `/ceo <name>`

特定プロジェクトの詳細情報を表示します。

1. **プロジェクトを検索**（部分一致対応）
2. **詳細メトリクスを表示：**
   - 全スコアの内訳
   - 技術スタック
   - 最近のコミット
   - 未完了のTODO
   - ファイル統計

### コマンド: `/ceo todo <name>`

プロジェクトのTODOを管理します。

1. **プロジェクトを検索**
2. **現在のTODOを表示**
3. **オプションを提示：**
   - 新しいTODOを追加
   - TODOを完了としてマーク
   - TODOを削除
   - 優先度を設定

### コマンド: `/ceo jump <name>`

プロジェクトを開くターミナルコマンドを生成します。

1. **プロジェクトを検索**
2. **コマンドを生成：**

```
<project-name> にジャンプするには、以下を実行：

  cd <project-path> && claude

コマンドをクリップボードにコピーしました（⌘V で貼り付け）
```

3. **クリップボードにコピー**（pbcopy が利用可能な場合）：

```bash
echo "cd <project-path> && claude" | pbcopy
```

## 出力フォーマット

### デイリーダッシュボード

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
  自然言語でプログラマブルなブロックチェーンウォレットを作成

  未完了タスク (3):
    [HIGH] コントラクトシミュレーション実行を実装
    [MED]  E2Eテストスイートを完了
    [LOW]  ウォレット作成UXを最適化

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  #2 KIMEERU                                              Score: 72.3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ...

クイックジャンプ: /ceo jump <name>
コマンド: [scan] 再スキャン | [config] 設定 | [todo <name>] タスク管理
```

### スキャン結果

```
スキャン完了: ~/Codes

発見したプロジェクト (N):
  ✓ saifuri (Node.js) - 156 ファイル, 47 依存関係
  ✓ kimeeru (Node.js) - 89 ファイル, 32 依存関係
  ✓ ml-pipeline (Python) - 45 ファイル, 23 依存関係
  + new-project (Go) - 新規発見

スキップ:
  - .next, node_modules, dist (ビルド成果物)
  - research-folder (プロジェクトファイルなし)

設定を更新しました: ~/.claude/ceo-dashboard.json
```

### プロジェクト詳細

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SAIFURI                                                 Score: 84.5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  パス: ~/Codes/saifuri
  タイプ: Node.js (Next.js)

  スコア内訳:
    複雑度:    78/100 (加重: 23.4)
    ROI:       85/100 (加重: 34.0)
    ビジネス:  90/100 (加重: 27.0)
    ─────────────────────────────
    最終:      84.4

  メトリクス:
    ファイル:   156 (ts: 120, tsx: 36)
    依存関係:   47
    最終コミット: 2時間前
    コミット数(7日): 24

  技術スタック:
    [next] [drizzle] [viem] [tailwind]

  検出されたビジネス機能:
    ✓ 決済連携 (stripe)
    ✓ ユーザー認証 (jwt)
    ✓ データベース (drizzle)
    ✓ デプロイ設定 (vercel.json)

  未完了タスク (3):
    [HIGH] コントラクトシミュレーション実行を実装
    [MED]  E2Eテストスイートを完了
    [LOW]  ウォレット作成UXを最適化

クイックジャンプ: cd ~/Codes/saifuri && claude
```

## 他のスキルとの連携

- **port-allocator**: プロジェクトスキャンロジックを再利用、ポート情報を表示
- **share-skill**: 設定ファイルパターンを再利用

## 注意事項

1. **毎日の自動トリガー** - 毎日初回の `/ceo` 呼び出しでフルスキャンを実行
2. **追記モード** - ユーザーの既存設定を上書きせず、常にマージ
3. **部分名一致** - プロジェクト名は部分一致で検索可能
4. **プロジェクト単位のオーバーライド** - プロジェクト内の `.claude/dashboard.json` でカスタム設定
5. **クリップボード対応** - ジャンプコマンドはmacOSで自動コピー
