# UsoHontoGame (ウソホント)

Next.js 16、React 19、SQLiteを使った真偽判定ゲーム。プレイヤーは3つのエピソードの中から嘘のエピソードを当てます。

## クイックスタート

### 前提条件

- Node.js 20+
- npm

### インストールと起動

```bash
# リポジトリをクローン（または既存のディレクトリで）
npm install

# 環境変数を設定
echo "DATABASE_URL=\"file:./dev.db\"" > .env
echo "DATABASE_URL=\"file:$(pwd)/prisma/dev.db\"" > .env.local

# データベースをセットアップ
npx prisma migrate dev
npx prisma generate

# 開発サーバーを起動
npm run dev
```

[http://localhost:3000](http://localhost:3000)にアクセスしてください。

### 初回アクセス時

1. ニックネームを登録（Cookieに保存）
2. セッションが自動的に作成されます

### 2つのエントリーポイント

- **プレイヤービュー** (`/`): 公開中のゲームに参加
- **モデレータービュー** (`/games`): 自分のゲームを管理
  - `/games`には自分が作成したゲームのみが表示されます
  - `/games/[id]`は自分が作成したゲーム以外はアクセスできません（編集機能があるため）

⚠️ ナビゲーションボタンはありません。URLを直接入力してください。

## ゲームの流れ

### モデレーター（ゲーム作成者）

1. **ゲーム一覧を確認** → `/games`
   - 自分のゲーム一覧を表示
   - 「ゲーム作成」ボタンから新規作成

2. **ゲーム作成** → `/games/create`
   - ゲーム名、プレイヤー上限（1-100人）を設定
   - ステータス：**準備中**

3. **出題者とエピソード登録** → `/games/[id]/presenters`
   - 出題者を追加（1-10人）
   - 各出題者につき3つのエピソードを登録
   - 1つのエピソードを「嘘」としてマーク（プレイヤーには非公開）

4. **ゲーム公開** → `/games/[id]`
   - ステータスを**出題中**に変更
   - プレイヤーが参加可能になる

5. **ゲーム終了** → `/games/[id]`
   - ステータスを**締切**に変更
   - 結果を公開

### プレイヤー

1. **ゲーム発見** → `/`
   - 「出題中」と「締切」のゲーム一覧を表示

2. **投票**（出題中のゲーム） → `/games/[id]/answer`
   - 各出題者の3つのエピソードを閲覧
   - 「嘘だと思うエピソード」を選択
   - 回答を送信

3. **回答状況確認**（出題中のゲーム） → `/games/[id]/dashboard`
   - リアルタイムで回答状況を確認
   - 参加者一覧と回答状況

4. **結果確認**（締切のゲーム） → `/games/[id]/results`
   - 正解数ランキング
   - 勝者の表彰

## 実装済み機能

### セッション管理
- Cookieベースの認証
- ニックネーム登録
- 永続的なセッション

### モデレーター機能
- ゲームの作成・編集・削除
- 出題者とエピソードの登録
- ゲームステータス管理（準備中 → 出題中 → 締切）
- リアルタイムダッシュボード

### プレイヤー機能
- アクティブなゲーム一覧の表示
- ゲーム参加と投票
- 結果表示とランキング

### その他
- 多言語対応（日本語・英語）
- SQLite永続化
- 自動マイグレーション

---

## 開発者向け情報

### 技術スタック

#### コア
- **フレームワーク**: Next.js 16.0.1 (App Router)
- **言語**: TypeScript 5 (strictモード)
- **UIライブラリ**: React 19.2.0
- **スタイリング**: Tailwind CSS v4

#### データ・永続化
- **データベース**: SQLite (Prisma経由)
- **ORM**: Prisma 6.19.0
- **バリデーション**: Zod 4.1.12
- **ID生成**: nanoid 5.1.6

#### テスト
- **ユニットテスト**: Vitest 4.0.7
- **E2Eテスト**: Playwright 1.56.1
- **コンポーネントテスト**: Testing Library

⚠️ **注意**: 多くのテストが現在失敗します。テストファイルは現在メンテナンスされていません。

#### コード品質
- **リント・フォーマット**: Biome 2.3.4、ESLint 9

### アーキテクチャ

**クリーンアーキテクチャ** + **ドメイン駆動設計**

```
src/
├── app/                    # Next.jsページ（プレゼンテーション層）
├── components/             # Reactコンポーネント（プレゼンテーション層）
└── server/
    ├── application/        # ユースケース（アプリケーション層）
    ├── domain/             # エンティティ、値オブジェクト（ドメイン層）
    └── infrastructure/     # データベース、外部API（インフラ層）
```

**主要パターン**:
- リポジトリパターン
- サーバーアクション（Next.js）
- 値オブジェクト
- ユースケースパターン

### プロジェクト構造

```
.
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── actions/                # サーバーアクション
│   │   ├── api/                    # APIルート
│   │   ├── games/                  # ゲームページ
│   │   │   ├── [id]/
│   │   │   │   ├── answer/         # 回答送信ページ
│   │   │   │   ├── dashboard/      # ダッシュボード
│   │   │   │   ├── presenters/     # 出題者管理
│   │   │   │   └── results/        # 結果表示
│   │   │   ├── create/             # ゲーム作成
│   │   │   └── page.tsx            # ゲーム一覧
│   │   └── page.tsx                # TOP（セッション）
│   ├── components/
│   │   ├── domain/                 # ドメインコンポーネント
│   │   ├── pages/                  # ページコンポーネント
│   │   └── ui/                     # 再利用可能なUI
│   ├── hooks/                      # カスタムReactフック
│   ├── lib/                        # ユーティリティ
│   ├── server/
│   │   ├── application/            # ユースケース・DTO
│   │   ├── domain/                 # ドメイン層
│   │   └── infrastructure/         # 外部依存関係
│   └── types/                      # TypeScript型定義
├── tests/
│   ├── e2e/                        # Playwright E2Eテスト
│   ├── integration/                # 統合テスト
│   └── utils/                      # テストユーティリティ
├── prisma/
│   ├── schema.prisma               # データベーススキーマ
│   ├── migrations/                 # マイグレーションファイル
│   └── dev.db                      # SQLiteデータベース
└── specs/                          # 機能仕様
```

### データベーススキーマ

```prisma
model Game {
  id              String          @id @default(uuid())
  name            String?
  creatorId       String
  maxPlayers      Int
  currentPlayers  Int             @default(0)
  status          String          @default("準備中")
  presenters      Presenter[]
  answers         Answer[]
  participations  Participation[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model Presenter {
  id        String    @id @default(uuid())
  gameId    String
  nickname  String
  episodes  Episode[]
  game      Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())
}

model Episode {
  id          String    @id @default(uuid())
  presenterId String
  text        String
  isLie       Boolean
  presenter   Presenter @relation(fields: [presenterId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
}

model Answer {
  id         String   @id @default(uuid())
  sessionId  String
  gameId     String
  nickname   String
  selections Json
  game       Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([sessionId, gameId])
}

model Participation {
  id        String   @id @default(uuid())
  sessionId String
  gameId    String
  nickname  String
  joinedAt  DateTime @default(now())
  game      Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@unique([sessionId, gameId])
}
```

## 開発ガイド

### 利用可能なコマンド

#### 開発
```bash
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm start            # 本番サーバー起動
```

#### テスト
```bash
npm test                   # すべてのテストを実行
npm run test:unit          # ユニットテストのみ
npm run test:integration   # 統合テストのみ
npm run test:ui            # インタラクティブUI
npm run test:coverage      # カバレッジレポート
npm run test:e2e           # E2Eテスト
npm run test:e2e:ui        # E2EテストUI
npm run test:e2e:debug     # E2Eデバッグ
```

#### データベース
```bash
npx prisma migrate dev     # マイグレーション実行（開発）
npx prisma migrate deploy  # マイグレーション実行（本番）
npx prisma studio          # データベースGUI
npx prisma generate        # Prismaクライアント生成
```

#### シードスクリプト（テストデータ生成）
```bash
# グローバルシード：データベース全体をリセットして新規データを作成
npm run seed
# - すべての既存データを削除
# - 固定の作成者ID（seed-creator-session-id）で150ゲーム作成
# - 各ステータス（準備中/出題中/締切）50ゲームずつ
# - 用途：初期状態に戻したい時、全ステータスのテスト

# ユーザー固有シード：自分のセッションでテストデータを作成
npm run seed:my <session-id>
# - 指定セッションIDの既存ゲームのみを削除
# - そのセッションIDで約100ゲーム作成
# - 他のユーザーのゲームは保持される
# - 用途：/gamesページで大量データをテスト
```

#### コード品質
```bash
npm run lint               # ESLintでリント
npm run lint:biome         # Biomeでリント
npm run format             # Biomeでフォーマット
npm run format:check       # フォーマットチェック
npm run check              # リント＋フォーマット
```

### 開発のヒント

#### セッションIDの確認方法

1. DevTools（F12）を開く
2. Application → Cookies → `http://localhost:3000`
3. `sessionId` Cookieの値をコピー

**用途:**
- `npm run seed:my <session-id>` でテストデータ生成
- セッション固有の問題をデバッグ

#### 複数ユーザーのテスト

- **通常のブラウザ**: ユーザーA
- **シークレットモード**: ユーザーB

各ブラウザで独立したセッションを作成できます。

```bash
# ターミナル1: ユーザーAのゲームをシード
npm run seed:my <session-id-A>

# ターミナル2: ユーザーBのゲームをシード
npm run seed:my <session-id-B>
```

### 開発ワークフロー

#### データベース変更
1. `prisma/schema.prisma`を更新
2. マイグレーション作成: `npx prisma migrate dev --name description`
3. リポジトリ実装を更新
4. ドメインエンティティを更新（必要に応じて）

### 開発のヒント

#### セッションIDの確認方法

1. DevTools（F12）を開く
2. Application → Cookies → `http://localhost:3000`
3. `sessionId` Cookieの値をコピー

**用途:**
- `npm run seed:my <session-id>` でテストデータ生成
- セッション固有の問題をデバッグ

#### 複数ユーザーのテスト

- **通常のブラウザ**: ユーザーA
- **シークレットモード**: ユーザーB

各ブラウザで独立したセッションを作成できます。

```bash
# ターミナル1: ユーザーAのゲームをシード
npm run seed:my <session-id-A>

# ターミナル2: ユーザーBのゲームをシード
npm run seed:my <session-id-B>
```

### 環境変数

`.env`:
```env
DATABASE_URL="file:./dev.db"
```

`.env.local`:
```env
DATABASE_URL="file:/absolute/path/to/prisma/dev.db"
```

⚠️ **注意**: 両方のファイルが必要です。
- `.env`: Prisma CLI用（相対パス）
- `.env.local`: Next.jsランタイム用（絶対パス）

## ライセンス

プライベートプロジェクト - All rights reserved

## 謝辞

[Claude Code](https://claude.ai/code)を使用して構築されました
