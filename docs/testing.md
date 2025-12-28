# テストガイド

実装開始前に、テスト戦略と運用をまとめたドキュメントです。テスト導入時は本ドキュメントを更新してください。

## 方針

- ドメインロジック（検証/計算/シリアライズ）は UI から分離し、ユニットテストでカバーする。
- 入出力が明確な関数はテーブル駆動（パラメタライズ）で網羅。
- project.json の読み書きはスナップショットではなくスキーマ検証と差分検証で行う。

## 推奨ツール

- テストランナー: Vitest（未導入。必要になった段階で `npm install -D vitest @testing-library/react @testing-library/jest-dom` を検討）。
- 型チェック: TypeScript（`npm run build` で noEmit チェック）。

## カバレッジ対象の優先度

- 高: 検証ロジック（電圧/相整合、電流計算、I/P 未入力の警告、tolerance 判定、eta 未設定時の扱い）。
- 中: project.json のパーサ/バリデータ（参照整合、ID ユニーク、net 未参照警告）。
- 中: net 割当フローの状態更新（net 変更時の再計算ハンドラ）。
- 低: UI の見た目。React コンポーネントはロジックが含まれる部分のみライトにテスト。

## テストケース例

- TypeB: `I_in` 指定時に `P_in` は無視して電流計算が優先される。
- TypeB: `I_in` と `P_in` 両方未入力 → 未確定負荷として警告カウント、検証はスキップ。
- TypeC: `eta` 未設定 → 効率計算スキップで警告、I_in_required を計算しない。
- TypeA: `I_through` が `I_max` を超えるとエラー。
- Net tolerance: ±% 内なら OK、それ以外はエラー。
- project.json: `connections.net` が未知 → エラー、未参照 net → 警告。

## 実行手順（導入後）

1. `npm install`（一度だけ）
2. `npm test`（Vitest 導入後にスクリプトを追加）
3. 型チェック: `npm run build`
4. Lint/Format: `npm run lint`, `npm run format`

## 今後のタスク

- Vitest と Testing Library を導入し、`npm test` スクリプトを追加する。
- `src/services/validation.test.ts` などに検証ロジックのユニットテストを追加する。
- CI で `npm run lint && npm run build && npm test` を実行するワークフローを整備する。
