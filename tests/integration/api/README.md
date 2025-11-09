# Integration API Tests

このディレクトリには、Next.js API routesの統合テストが含まれています。

## テストアプローチ

### 現在の状況

2つのテストアプローチを用意しています:

#### 1. 直接呼び出しアプローチ (現在の実装)

```typescript
import { POST } from '@/app/api/sessions/route';
import { createMockRequest } from './test-helpers';

const request = createMockRequest('POST', 'http://localhost:3000/api/sessions', {
  body: { hostNickname: 'Test' },
});

const response = await POST(request);
```

**メリット:**
- 高速実行
- サーバー起動不要
- デバッグが容易
- 実際のroute.tsの関数を直接テスト

**デメリット:**
- HTTPサーバーのミドルウェアレイヤーをバイパス
- 完全なリクエスト/レスポンスサイクルをテストしない

#### 2. HTTP経由アプローチ (新しい実装)

```typescript
import { http } from './http-client';

const response = await http.post('/api/sessions', {
  hostNickname: 'Test',
});
```

**メリット:**
- 完全なHTTPリクエスト/レスポンスサイクルをテスト
- Next.jsのミドルウェアも含めてテスト
- 本番環境に近い条件でテスト

**デメリット:**
- テストサーバーの起動が必要
- 実行が遅い
- テスト間の状態管理が複雑

## 使用方法

### 直接呼び出しテストの実行

```bash
npm test tests/integration/api
```

### HTTP経由テストの実行

```bash
npm run test:integration
```

これは内部で `start-server-and-test` を使用して、Next.jsサーバーを起動してからテストを実行します。

## ファイル説明

- `test-helpers.ts` - 直接呼び出しアプローチ用のヘルパー関数
- `http-client.ts` - HTTP経由アプローチ用のHTTPクライアント
- `*.test.ts` - テストファイル

## 変換作業

`sessions.test.ts` はHTTP経由アプローチに変換済みです。他のファイルを変換する場合は、このファイルをテンプレートとして参照してください。

### 変換パターン

**Before:**
```typescript
import { POST } from '@/app/api/sessions/route';
import { createMockRequest, parseResponse } from './test-helpers';

const request = createMockRequest('POST', 'http://localhost:3000/api/sessions', {
  body: { hostNickname: 'Test' },
});
const response = await POST(request);
```

**After:**
```typescript
import { http, parseResponse } from './http-client';

const response = await http.post('/api/sessions', {
  hostNickname: 'Test',
});
```

## 推奨事項

開発速度を優先する場合は**直接呼び出しアプローチ**を、
本番環境に近いテストを優先する場合は**HTTP経由アプローチ**を使用してください。

両方のアプローチとも、実際の`route.ts`ファイルのコードをテストしています。
