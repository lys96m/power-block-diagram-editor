# CONTRIBUTING

このリポジトリで仕様と実装を一体管理します。変更前にドキュメントを参照し、必要に応じて更新してください。

## 開発フロー

- main ブランチを保護し、作業はブランチを切って PR を作成。
- タスクごとに専用ブランチを作成し、作業単位を明確にする。
- 大きな設計変更は ADR を追加して合意する。
- 仕様変更時は `docs/spec.md` や関連ドキュメントを更新する。
- コミット前に `npm run format` とテスト（`npm test` など）を実行し、完了後は必ず PR を作成する。

## コーディング規約

- TypeScript strict 設定を前提に型を明示的に扱う。
- React hooks ルールに従う（ESLint でチェック）。
- 命名: コンポーネントは `PascalCase`, hooks は `useXxx`, 型/インターフェースは `PascalCase`.
- ディレクトリ構成指針は `docs/architecture.md` を参照。

## Lint / Format / テスト

- Lint: `npm run lint`
- Format: `npm run format`
- Build チェック: `npm run build`
- テスト: 未導入。追加する場合は `npm test` に統一し、詳細は `docs/testing.md` を参照。

## ドキュメント更新

- 仕様: `docs/spec.md`
- アーキテクチャ: `docs/architecture.md`
- UI 方針: `docs/ui.md`
- 設計判断: `docs/adr/` に ADR を追加（`YYYY-NN-title.md` 形式目安）
- README に必要なリンクを忘れずに追加/更新。

## コミットメッセージ

- 形式は自由だが、内容を端的に示すこと。複数コミットの場合は粒度を意識する。

## PR チェック項目（目安）

- [ ] 仕様・ドキュメントは更新されたか
- [ ] Lint/Format はパスしているか
- [ ] 必要ならスクリーンショットや動作確認手順を添付したか
