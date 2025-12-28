# Power Block Diagram Editor — 仕様

version: 0.1.0  
target application version: 0.1.0

本ドキュメントは本リポジトリで管理する仕様と実装指針を示します。変更時は本ファイルと ADR を更新してください。

## 1. 概要と用語

- 目的: ブレーカ・負荷・電源など電気系構成をブロック図として作成・検証し、保存/共有する。
- 用語:
  - **ブロック（Block）**: 電気機器・機能要素の図形。Type A/B/C を持つ。
  - **ポート（Port）**: ブロックの接続点。`power_in` / `power_out` / `pass_through` などの役割。
  - **接続（Connection / Edge）**: `from`/`to` ポート間の線。所属する `net` を持つ。
  - **ネット（Net）**: 電源系統の論理グループ（電圧・相数などの属性を持つ）。
- **定格（Rating）**: 入出力に関する許容/必要値。Typeごとに形式が異なる。
- **props**: ブロック任意属性（キー=文字列、値=文字列推奨。メーカー/型式/品番/備考など）。
- **part_id**: 部品マスタ連携用 ID（文字列または null）。
- **project.json**: アプリ内部状態の保存/エクスポート JSON（nets/blocks/connections/layout を含む）。

## 2. ブロック仕様

すべてのブロックは共通で `id`, `type`, `name`, `rating`, `props`, `part_id?` を持つ。ポートはブロック内でユニークな `port.id` と `role`（`power_in` | `power_out` | `pass_through`）、`direction`（`in` | `out`）を持つ。初期リリースではカスタムポート追加は不可。

### 2.1 Type A（パッシブ: ブレーカ/端子/分岐など）

- 特徴: 電力を消費しない。複数入出力ポート。電圧/電流許容を持つ。
- デフォルトポート: `in` (power_in) と `out` (power_out) を各1。複数ポートは拡張時に検討。
- rating:

```json
{ "V_max": number, "I_max": number, "phase": 0 | 1 | 3 }
```

### 2.2 Type B（負荷: モータ/ヒータ/PLC 等）

- 特徴: power_in を持つ。電力を消費。`I_in` または `P_in` のいずれか必須（未定値も許容）。
- デフォルトポート: `in` (power_in) を1つ。初期は複数入力なし。
- rating:

```json
{ "V_in": number, "phase": 0 | 1 | 3, "I_in": number?, "P_in": number? }
```

- 入力ルール: `I_in` と `P_in` はどちらか必須。両方未入力は「未確定負荷」として警告。両方入力時は `I_in` を優先し `P_in` は参考値として許容。0 または負値はバリデーションエラー。

### 2.3 Type C（変換/電源: AC-DC, DC-DC, インバータ）

- デフォルトポート: `in` (power_in) 1、`out` (power_out) 1。
- rating:

```json
{
  "in":  { "V_in": number, "phase_in": 0 | 1 | 3, "I_in_max": number?, "P_in_max": number? },
  "out": { "V_out": number, "phase_out": 0 | 1 | 3, "I_out_max": number?, "P_out_max": number? },
  "eta": number?
}
```

- `eta` 未設定時は 1.0 を仮定せず、効率計算をスキップして警告扱い（要 UI 表示）。

## 3. ネット（電源系統）

```json
{ "id": "string", "kind": "AC" | "DC" | "SIGNAL", "voltage": number, "phase": 0 | 1 | 3, "label": "string", "tolerance": number? }
```

- `net: null` は未割当。割当後に電圧/相の整合をチェック。
- 接続選択時に右ペインから net を変更/新規作成（案B）。
- `tolerance` は電圧許容の ±%（0–100）。負値や 100 超はバリデーションエラー。

## 4. 接続（connection）

```json
{ "from": "BlockID:PortID", "to": "BlockID:PortID", "net": "NetID" | null, "label": "string?" }
```

- 参照整合: `from/to` は既存 block とその port を参照必須。`net` は null または既存 net。

## 5. project.json スキーマ（v1.0.0）

```json
{
  "schema_version": "1.0.0",
  "meta": { "title": "string", "created_at": "ISO8601", "updated_at": "ISO8601", "author": "string", "description": "string?" },
  "nets": [ ... ],
  "blocks": [ ... ],
  "connections": [ ... ],
  "layout": {
    "blocks": { "QF1": { "x":120, "y":80, "w":140, "h":70, "rotation":0 } },
    "edges": { "QF1:out->PS1:pin": { "routing": "orthogonal", "points": [[260,115],[360,115]] } }
  }
}
```

- 整合ルール: `schema_version` は "1.0.0" 固定。`blocks/nets/connections` の `id` はそれぞれユニーク。`connections.net` は null または `nets.id` を参照。`layout.blocks` キーは `blocks.id` に一致、`layout.edges` キーは `connections` に一致。未参照 net は警告だが許容。参照不整合は読み込み時にエラー。
- レイアウト座標: 単位は px、原点はキャンバス左上、y 軸は下向き。`w/h` は必須、`rotation` は 0 デフォルト。edge `routing` は v1 は `"orthogonal"` 固定。`points` はキャンバス座標の配列で必須。
- 数値単位/範囲: 電圧=V, 電流=A, 電力=W。phase は 0=DC,1=単相,3=三相。`eta` は 0–1 の小数（%入力は内部で 0–1 に変換）。負値や範囲外はエラー。

## 6. net 割当フロー（案B）

1. 接続作成時は `net: null`（必要なら from から暫定推定）。
2. 接続選択で右ペインから net 選択・新規作成。
3. 割当変更時にネット参加者、負荷電流合計、TypeC 入力要求、TypeA の通過電流を再計算し、エッジ色を更新。
4. net が参照中は削除不可（または未割当へ戻す）。

## 7. チェックロジック

- 電圧整合: TypeB `rating.V_in` と net、TypeC `rating.in.V_in` と net が一致（tolerance で範囲許容）。
- 相整合: `phase` が一致（0=DC,1=単相,3=三相）。
- 電流計算:
  - TypeB: `I_load = I_in` または `P_in / V_in`
  - TypeC: `P_out_total = Σ下流負荷`, `I_out_total = P_out_total / V_out`, `P_in_required = P_out_total / eta`, `I_in_required = P_in_required / V_in`
  - TypeA: 出力電流合計を入力へ伝搬し `I_through <= I_max` をチェック
- 未確定負荷: TypeB で `I_in` と `P_in` が両方未入力の場合に警告カウント。計算不可時は対象エッジを灰色表示し検証スキップ。

## 8. UI 構成（ターゲット）

- レイアウト: 上ヘッダー / 左パレット / 中央キャンバス（React Flow） / 右プロパティ / 下ステータス。
- ヘッダー: 新規/開く/保存、エクスポート（SVG/PNG/PDF/JSON/CSV）、Undo/Redo。
- パレット: Type A/B/C をカテゴリ表示しドラッグ配置。
- キャンバス: グリッド、直交エッジ、状態に応じたエッジ色。
- プロパティ: ブロック時はラベルと type別 rating、ID は編集不可。接続時は From/To、net ドロップダウン、新規 net 作成。
- ステータス: 選択中 net の電流合計/容量比、エラー件数、未確定負荷数。

## 9. エクスポート

- `project.json`（構成全情報）、SVG/PNG/PDF（図面）、CSV（BOM, NetSummary）。
- CSV 仕様（UTF-8, LF, ヘッダーあり）:
  - BOM.csv: `block_id, type, name, part_id, V, phase, I_or_P, props_json`
  - NetSummary.csv: `net_id, label, voltage, phase, load_current_total, capacity_headroom`

## 10. 非機能

- 対応ブラウザ: Chrome/Edge/Firefox。
- 推奨最大ブロック数: 100。
- リアルタイムチェック: 100ms 以内を目標。

## 11. 今後の拡張

- 自動採番、テンプレート回路、バス表示、PDF レポート、部品マスタ連携。

## 12. バージョニング

- spec version と app version を分離。
- MAJOR: project.json 互換性破壊、MINOR: 後方互換追加、PATCH: バグ修正。
