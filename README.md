# Power Block Diagram Editor

装置の電気構成（ブレーカ・負荷・電源など）を
ブロック図として作成・検証するための Web アプリケーションです。

※ 本リポジトリには実装コードのみを含みます。
仕様書（spec）は別リポジトリで管理しています。

---

## 開発環境（推奨）

本プロジェクトは **Docker + VS Code Dev Container** を前提としています。
ローカルに Node.js / npm / Vite をインストールする必要はありません。

### 必要なもの

- Docker
- Visual Studio Code
- VS Code 拡張: Dev Containers

### 起動手順

1. 本リポジトリを clone
2. VS Code でフォルダを開く
3. コマンドパレットから
   `Dev Containers: Reopen in Container` を実行
4. コンテナ内ターミナルで以下を実行

```bash
npm install
npm run dev
```

5. ブラウザで以下にアクセス

```
http://localhost:5173/
```

---

## 使用技術

- React
- TypeScript
- Vite
- React Flow
- Material UI (MUI)

---

## ライセンス

TBD
