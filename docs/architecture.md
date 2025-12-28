# アーキテクチャ

## 技術スタック

- UI: React + TypeScript + Vite（SPA）
- ダイアグラム: React Flow（ノード/エッジ管理）
- UI: MUI（テーマ/レイアウト、必要に応じて Emotion）
- Lint/Format: ESLint + Prettier（`npm run lint`, `npm run format`）

## クライアント構成方針

- エントリ: `src/main.tsx` で MUI テーマとアプリコンテキストを注入。
- ルートレイアウト: ヘッダ（ファイル操作/エクスポート/Undo-Redo）、左パレット、中央キャンバス、右プロパティ/検証、下ステータス。
- 状態管理: 当面 React コンテキスト + hooks。複雑化したら zustand/Recoil 等を ADR で検討。
- データモデル: `src/types/diagram.ts`（blocks/nets/connections/layout/metadata/ports）、`docs/spec.md` と整合を保つ。
- 永続化: `project.json` v1.0.0 を基本フォーマットとし、Storage 層（ローカル保存/読み込み・エクスポート）を分離。
- 検証: `src/services/validation.ts` などに集約し、電圧/相整合・電流計算・未割当 net・未確定負荷（I/P 未入力）・参照整合チェックを実装。
- レイアウト: React Flow のノード/エッジ変化を `onNodesChange`/`onEdgesChange` で反映。直交配線・ポイント列を `layout.edges` に保存。

## 依存の使い方メモ

- React Flow: カスタムノード登録（Type A/B/C 表現）、`useReactFlow` でズーム/パン/fitView。エッジ色やスタイルは状態に応じて更新。
- MUI: `ThemeProvider` でブランドカラー/タイポ設定。`AppBar/Drawer/Stack/Grid` で 3 カラム + ヘッダ + ステータスバーを構成。

## データ・型の要点（実装指針）

- Block: `id`, `type` ("A"|"B"|"C"), `name`, `rating`, `props`, `part_id?`.
  - TypeA rating `{ V_max, I_max, phase }`
  - TypeB rating `{ V_in, phase, I_in?, P_in? }`
  - TypeC rating `{ in:{...}, out:{...}, eta? }`
- Net: `{ id, kind, voltage, phase, label, tolerance? }`
- Connection: `{ from, to, net|null, label? }`
- Layout: blocks の位置/サイズ/回転、edges の routing/points。
- Meta: `title`, `created_at`, `updated_at`, `author`, `description?`.

## テスト

- 現状フレームワーク未導入。必要に応じて Vitest を追加し、サービス層（検証/計算）を単体テスト可能にする。

## オープンな検討事項

- 永続化/共有（ローカルのみ vs バックエンド API）
- 検証実行タイミング（リアルタイム 100ms 以内 vs 手動）
- 大規模データ時の最適化（ノード数 100 超を意識した描画/計算分離）
