# LINEサポAI (MessageCraft) 💬

「なんて返信すればいいかわからない…」「角を立てずに断りたい」「気になる人を自然に誘いたい」を秒で解決する、LINEメッセージ下書き・返信AIアシスタントです。

---

## 🌟 特徴

- **📱 LINEトーク画面風プレビュー**:
  送ったときの見え方（文字量・改行・絵文字のバランス）がリアルなスマホ画面の吹き出しで直感的にわかります。
- **📋 ワンタップコピー**:
  気に入った文面をボタン1つですぐにコピーしてLINEに貼り付け可能。
- **🎯 3パターン同時提案**:
  「自然・王道」「親しみ・フランク」「丁寧・気遣い」の3種類を解説ポイント付きで同時に提案。
- **⚡ Google Gemini API & モック両対応**:
  - APIキー未設定でも内蔵モックですぐにお試し可能。
  - Google AI StudioのGemini APIキーを設定すると、リアルタイムAI生成に切り替わります。
  - **回数制限（RPD/RPM）が多くて高速な `gemini-2.5-flash-lite` や `gemini-3.5-flash-lite` に最適化**されています（カスタムモデル入力も対応）。

---

## 🚀 使い方

1. `index.html` をお好みのブラウザで開くだけで起動します（ビルド不要・サーバー不要）。
2. 右上の「⚙️ Gemini設定」からAPIキーを入力すれば本物のAI生成が利用できます。

---

## 🔑 Google Gemini APIキーの取得方法（完全無料・約1分）

クレジットカード登録不要・完全無料で利用できます。

1. **[Google AI Studio (API Keys)](https://aistudio.google.com/app/apikey)** にアクセスします。
2. お手持ちの Google アカウントでログインします。
3. 青いボタン **「Create API key（APIキーを作成）」** をクリックします。
4. 「Create API key in new project（新しいプロジェクトで作成）」を選択します。
5. 発行されたキー（`AIzaSy...` から始まる文字列）をコピーします。
6. 本アプリ右上の **「⚙️ Gemini設定」** を開き、APIキー入力欄に貼り付けて「保存する」を押せば完了です！

※ 本アプリでは、無料枠の回数上限が最も緩く動作が速い **`gemini-2.5-flash-lite`** を標準利用しています。

---

## 🛠 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript
- Google Gemini API (`gemini-2.5-flash-lite` / `gemini-3.5-flash-lite`)
- ブラウザ `localStorage` (APIキーはクライアント側でのみ安全に保持)

