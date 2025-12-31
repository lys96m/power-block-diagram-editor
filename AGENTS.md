# Codex Agents Guide

## Branching / PR

- 作業は Issue ごとに新ブランチを切り、完了したら PR を作成する。
- 他の作業が混在しないよう、ブランチは小さく保つ。

## Before Commit

- `npm run format`
- `npm run lint`
- `npm test`
- 必要なら `npm run build`（CI 前にローカル確認したい場合）

## PR チェック

- CI が通ること（format/lint/test/build）。
- 変更内容とテスト結果を PR 本文に記載する。

## ローカル運用メモ

- 主要コマンド: `npm run format`, `npm run lint`, `npm test`, `npm run build`.
- 依存更新や設計変更は関連ドキュメント（README, CONTRIBUTING, docs/）を更新する。
- UI 変更を伴う場合は `docs/ui.md`、手動確認ポイントは `docs/testing.md` を忘れず更新する。
- 設計メモ: 検証・集計などのロジックは専用フック/サービスへ分離し、コンポーネントは描画に専念させる。状態初期値や履歴は `state/initialDiagram.ts` や `state/netHistory.ts` など別モジュールに置く。
