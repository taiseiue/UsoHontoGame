# ウソホントゲーム運営アプリケーション
# Two Truths and a Lie - Game Management App

<div align="center">

**チームビルディングイベントを盛り上げる、インタラクティブなゲーム運営Webアプリケーション**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## 📖 プロジェクト概要

「ウソホントゲーム（Two Truths and a Lie）」を円滑に運営するためのWebアプリケーションです。手動での集計や進行に伴うオペレーション負荷を軽減し、参加者全員がゲームに集中できる環境を提供します。リアルタイムのスコア表示でゲームの盛り上がりを最大化します。

### 🎯 主な目的

- **オペレーション負荷の軽減**: 手動集計・進行管理の自動化
- **参加者体験の向上**: ゲームへの集中とインタラクティブ性の向上
- **リアルタイム性**: スコアやゲーム状況の即時反映
- **使いやすさ**: 直感的なUI/UXでルールを知らない人でも簡単に参加可能

## ✨ 主な機能

### 🎮 ゲーム準備機能
- **ゲームセッション管理**: 新規セッション作成、参加用URL/ID発行
- **チーム管理**: ドラッグ&ドロップによる直感的なチーム分け
- **ゲーム設定**: 得点ルール設定、出題順序決定

### 🎭 ゲームプレイ機能
- **エピソード登録**: 参加者による3つのエピソード（真実2つ、嘘1つ）登録
- **出題・回答管理**: タイマー付き回答フェーズ、チーム回答投票
- **リアルタイムスコアボード**: 自動ポイント計算、即時反映
- **結果発表**: 正解発表、ランキング表示、優勝チーム祝賀演出

### 👥 ロール別機能

#### 司会者 (Host)
- ゲーム全体の管理・進行
- チーム設定、出題チーム指定
- タイマー管理、正解発表

#### 参加者 (Player)
- セッション参加（セッションID + ニックネーム）
- エピソード登録
- チーム内での相談・投票

## 🏗️ 技術スタック

### Frontend
- **Next.js 15**: App Router with React Server Components
- **React 19**: 最新機能（Server Components, Actions）
- **TypeScript 5**: 完全な型安全性
- **Tailwind CSS v4**: ユーティリティファーストスタイリング

### Backend
- **Next.js API Routes**: RESTful API実装
- **Clean Architecture**: 4層アーキテクチャ（Presentation, Application, Domain, Infrastructure）
- **Type-Safe APIs**: エンドツーエンドの型安全性

### アーキテクチャの特徴

#### フロントエンド設計
- **Server Components First**: パフォーマンスとSEO最適化
- **Custom Hooks Architecture**: ロジックと表示の完全分離
- **Component Composition**: Pages → Domain → UI の階層構造
- **Responsive Design**: マルチデバイス対応（スマホ、タブレット、PC）

#### バックエンド設計
- **Clean Architecture**: ビジネスロジックの独立性確保
- **Repository Pattern**: データアクセスの抽象化
- **Use Case Driven**: ビジネスユースケースベースの実装
- **Error Handling**: ドメイン固有のエラー処理

## 📁 プロジェクト構造

```
.
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes (Clean Architecture)
│   │   └── (pages)/           # Pages and layouts
│   ├── components/            # UI Components
│   │   ├── pages/            # Page-level components
│   │   ├── domain/           # Domain-specific components
│   │   └── ui/               # Reusable UI components
│   ├── server/               # Backend (Clean Architecture)
│   │   ├── domain/           # Domain Layer (Entities, Interfaces)
│   │   ├── application/      # Application Layer (Use Cases)
│   │   └── infrastructure/   # Infrastructure Layer (Repositories, DB)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and configurations
│   └── types/                # TypeScript type definitions
├── docs/                     # Documentation
│   ├── requirement.md        # Requirements specification
│   └── screen_spec/          # Screen specifications
└── architecture.md           # Architecture documentation
```

## 🚀 Getting Started

### 前提条件

- Node.js 18.x以降
- npm, yarn, pnpm, または bun

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/UsoHontoGame.git
cd UsoHontoGame

# 依存関係のインストール
npm install
# or
yarn install
# or
pnpm install
```

### 開発サーバーの起動

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて動作を確認できます。

### ビルド

```bash
npm run build
npm run start
```

## 🎨 デザイン原則

- **モバイルファースト**: 小さい画面でも見やすく、操作しやすいUI/UX
- **シンプル＆直感的**: 複雑な操作を避け、誰でも迷わず使える
- **リアルタイム性**: スコアやゲーム状況の即座の視覚的反映
- **ロールベースUI**: 司会者と参加者で表示・操作を明確に区別
- **視覚的フィードバック**: アクションに対する適切なフィードバック

## 📋 非機能要件

| 項目 | 要件 |
|------|------|
| **ユーザビリティ** | 直感的操作、視覚的な状況把握、マルチデバイス対応 |
| **パフォーマンス** | 3秒以内のレスポンス、タイマー遅延なし |
| **信頼性** | 99.9%の稼働率、状態の永続化 |
| **拡張性** | ポイント設定変更可能、チーム数の柔軟な対応 |
| **セキュリティ** | 正解情報の秘匿、回答の非公開（投票完了まで） |

## 📚 ドキュメント

詳細なドキュメントは以下を参照してください：

- [要件定義書](./docs/requirement.md) - 機能要件と非機能要件の詳細
- [アーキテクチャ設計](./architecture.md) - フロントエンド・バックエンドの技術設計
- [画面仕様](./docs/screen_spec/) - 各画面の詳細仕様とUI設計

## 🛠️ 開発

### コーディング規約

- TypeScript strict mode有効
- Biome for formatting and linting
- Custom hooks for all logic (components are presentational only)
- Clean Architecture principles for backend code

### テスト

```bash
# テストの実行
npm run test

# カバレッジレポート
npm run test:coverage
```

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 お問い合わせ

質問や提案がある場合は、Issueを作成してください。

---

<div align="center">

**Made with ❤️ for better team building events**

</div>