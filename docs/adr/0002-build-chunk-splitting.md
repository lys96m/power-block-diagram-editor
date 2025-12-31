# ADR 0002: Vite ビルドの chunk サイズ警告への対応

## コンテキスト

- Vite ビルドで 500kB 超の chunk が生成されると警告が出る。
- 現状は React Flow + MUI など大きめ依存のため、chunk 分割が推奨される。

## 決定

- 警告がノイズにならないよう、`vite.config.ts` に `build.chunkSizeWarningLimit` を 1000 に引き上げつつ、依存ごとに manualChunks を設定し、ライブラリを分割する。
- 必要に応じて動的 import で画面単位の遅延読込を検討する。

## 影響

- ビルド設定により chunk が複数に分割され、ネットワーク初回ロードが改善される可能性がある。
- 設定追加によるビルド時間への大きな影響は想定しない。

## 対応

- `vite.config.ts` に manualChunks と `chunkSizeWarningLimit` を追加する。
- 警告解消と bundle サイズの変化をビルドログで確認する。
