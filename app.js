// app.js - LINEサポAI メインロジック

// ストレージキー
const STORAGE_KEY_API_KEY = "line_ai_gemini_api_key";
const STORAGE_KEY_MODEL = "line_ai_gemini_model";

// 状態管理
let currentPatterns = [
  {
    id: "A",
    label: "自然・おすすめ",
    text: "全然気にしないで〜！お疲れさま！落ち着いたら息抜きに美味しいものでも食べ行こう〜！空いてる日あったら教えてね☺️",
    point: "相手の負担にならないよう優しく気遣いつつ、サラッと次のお誘いにつなげる自然な文面です。"
  },
  {
    id: "B",
    label: "親しみ・フランク",
    text: "返信ありがと〜！無理しないでね！落ち着いたら美味しいご飯行こ！行きたいお店見つけておくね✨",
    point: "フランクかつテンポ良く、次回の楽しみを作ってポジティブに返す文面です。"
  },
  {
    id: "C",
    label: "丁寧・気遣い",
    text: "忙しいのに返信くれてありがとう！大変だったね。落ち着いたタイミングでぜひご飯行こう。また都合いい時連絡してね！",
    point: "相手の忙しさにしっかり共感と労いを伝え、焦らせない大人の気配り文面です。"
  }
];

let selectedPatternIndex = 0;

// DOM要素
const form = document.getElementById("generate-form");
const generateBtn = document.getElementById("generate-btn");
const btnText = generateBtn.querySelector(".btn-text");
const spinner = generateBtn.querySelector(".spinner");

const relationshipSelect = document.getElementById("relationship");
const myGenderSelect = document.getElementById("my-gender");
const targetGenderSelect = document.getElementById("target-gender");
const receivedMessageInput = document.getElementById("received-message");
const intendedMessageInput = document.getElementById("intended-message");
const toneSelect = document.getElementById("tone");
const emojiLevelSelect = document.getElementById("emoji-level");

const previewTargetName = document.getElementById("preview-target-name");
const receiverAvatar = receiverRow ? receiverRow.querySelector(".avatar") : null;
const receiverRow = document.getElementById("receiver-row");
const receiverBubbleText = document.getElementById("receiver-bubble-text");
const senderBubbleText = document.getElementById("sender-bubble-text");
const chatTime = document.getElementById("chat-time");

const patternTabs = document.getElementById("pattern-tabs");
const tabButtons = patternTabs.querySelectorAll(".tab-btn");
const pointText = document.getElementById("point-text");
const charCount = document.getElementById("char-count");
const copyBtn = document.getElementById("copy-btn");
const toast = document.getElementById("toast");

// 設定モーダル要素
const modeBadge = document.getElementById("mode-badge");
const openSettingsBtn = document.getElementById("open-settings-btn");
const closeSettingsBtn = document.getElementById("close-settings-btn");
const settingsModal = document.getElementById("settings-modal");
const geminiApiKeyInput = document.getElementById("gemini-api-key");
const geminiModelSelect = document.getElementById("gemini-model-select");
const customModelGroup = document.getElementById("custom-model-group");
const geminiCustomModelInput = document.getElementById("gemini-custom-model");
const saveKeyBtn = document.getElementById("save-key-btn");
const clearKeyBtn = document.getElementById("clear-key-btn");

// 初期化
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  updateTime();
  renderPreview();
  setupEventListeners();
});

// 現在時刻のセット
function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  chatTime.textContent = `${hours}:${minutes}`;
}

// 設定のロード
function loadSettings() {
  const savedKey = localStorage.getItem(STORAGE_KEY_API_KEY) || "";
  const savedModel = localStorage.getItem(STORAGE_KEY_MODEL) || "gemini-2.5-flash-lite";

  geminiApiKeyInput.value = savedKey;

  if (["gemini-2.5-flash-lite", "gemini-3.5-flash-lite", "gemini-3.8-flash"].includes(savedModel)) {
    geminiModelSelect.value = savedModel;
    customModelGroup.classList.add("hidden");
  } else if (savedModel) {
    geminiModelSelect.value = "custom";
    geminiCustomModelInput.value = savedModel;
    customModelGroup.classList.remove("hidden");
  }

  // 性別のロード
  const savedMyGender = localStorage.getItem("line_ai_my_gender") || "男性";
  const savedTargetGender = localStorage.getItem("line_ai_target_gender") || "女性";
  myGenderSelect.value = savedMyGender;
  targetGenderSelect.value = savedTargetGender;
  updateTargetHeaderAndAvatar();

  updateModeBadge(savedKey, savedModel);
}

// 相手のヘッダー表示とアバターの更新
function updateTargetHeaderAndAvatar() {
  const rel = relationshipSelect.value;
  const targetGender = targetGenderSelect.value;
  previewTargetName.textContent = `${rel} (トーク)`;

  const avatarEl = document.querySelector(".receiver .avatar");
  if (avatarEl) {
    if (targetGender === "女性") avatarEl.textContent = "👩";
    else if (targetGender === "男性") avatarEl.textContent = "👨";
    else avatarEl.textContent = "👤";
  }
}

// バッジの更新
function updateModeBadge(key, model) {
  if (key.trim()) {
    modeBadge.textContent = `Gemini連携中 (${model})`;
    modeBadge.classList.add("active-api");
  } else {
    modeBadge.textContent = "モックモード中";
    modeBadge.classList.remove("active-api");
  }
}

// イベントリスナーの登録
function setupEventListeners() {
  // モーダル開閉
  openSettingsBtn.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
  });
  closeSettingsBtn.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  });
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) settingsModal.classList.add("hidden");
  });

  // モデル選択切り替え
  geminiModelSelect.addEventListener("change", () => {
    if (geminiModelSelect.value === "custom") {
      customModelGroup.classList.remove("hidden");
    } else {
      customModelGroup.classList.add("hidden");
    }
  });

  // 設定保存
  saveKeyBtn.addEventListener("click", () => {
    const key = geminiApiKeyInput.value.trim();
    let model = geminiModelSelect.value;
    if (model === "custom") {
      model = geminiCustomModelInput.value.trim() || "gemini-2.5-flash-lite";
    }

    localStorage.setItem(STORAGE_KEY_API_KEY, key);
    localStorage.setItem(STORAGE_KEY_MODEL, model);
    updateModeBadge(key, model);
    settingsModal.classList.add("hidden");
    showToast(key ? "Gemini設定を保存しました！" : "モックモードに設定しました");
  });

  // キー削除
  clearKeyBtn.addEventListener("click", () => {
    geminiApiKeyInput.value = "";
    localStorage.removeItem(STORAGE_KEY_API_KEY);
    updateModeBadge("", "モック");
    settingsModal.classList.add("hidden");
    showToast("キーを削除し、モックモードに戻しました");
  });

  // タブ切り替え
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedPatternIndex = parseInt(btn.dataset.index, 10);
      renderPreview();
    });
  });

  // 相手メッセージの入力連動プレビュー
  receivedMessageInput.addEventListener("input", () => {
    const text = receivedMessageInput.value.trim();
    if (text) {
      receiverRow.style.display = "flex";
      receiverBubbleText.textContent = text;
    } else {
      receiverRow.style.display = "none";
    }
  });

  // 相手との関係・性別変更連動
  relationshipSelect.addEventListener("change", updateTargetHeaderAndAvatar);
  targetGenderSelect.addEventListener("change", () => {
    localStorage.setItem("line_ai_target_gender", targetGenderSelect.value);
    updateTargetHeaderAndAvatar();
  });
  myGenderSelect.addEventListener("change", () => {
    localStorage.setItem("line_ai_my_gender", myGenderSelect.value);
  });

  // コピーボタン
  copyBtn.addEventListener("click", () => {
    const currentText = currentPatterns[selectedPatternIndex]?.text || "";
    if (!currentText) return;

    navigator.clipboard.writeText(currentText).then(() => {
      showToast("📋 クリップボードにコピーしました！");
    }).catch(() => {
      showToast("コピーに失敗しました。手動でコピーしてください");
    });
  });

  // 生成フォーム送信
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleGenerate();
  });
}

// プレビュー表示の更新
function renderPreview() {
  const pattern = currentPatterns[selectedPatternIndex] || currentPatterns[0];
  senderBubbleText.textContent = pattern.text;
  pointText.textContent = pattern.point;
  charCount.textContent = `文字数: ${pattern.text.length}文字`;
  updateTime();
}

// 生成処理
async function handleGenerate() {
  const relationship = relationshipSelect.value;
  const myGender = myGenderSelect.value;
  const targetGender = targetGenderSelect.value;
  const received = receivedMessageInput.value.trim();
  const intended = intendedMessageInput.value.trim();
  const tone = toneSelect.value;
  const emoji = emojiLevelSelect.value;

  const apiKey = localStorage.getItem(STORAGE_KEY_API_KEY) || "";
  const model = localStorage.getItem(STORAGE_KEY_MODEL) || "gemini-2.5-flash-lite";

  setLoading(true);

  try {
    if (apiKey) {
      // 本物のGoogle Gemini API呼び出し
      currentPatterns = await callGeminiAPI(apiKey, model, { relationship, myGender, targetGender, received, intended, tone, emoji });
    } else {
      // モックデータ生成（1秒待機でリアルなレスポンス感を演出）
      await new Promise(r => setTimeout(r, 900));
      currentPatterns = generateMockPatterns({ relationship, myGender, targetGender, received, intended, tone, emoji });
    }

    selectedPatternIndex = 0;
    tabButtons.forEach((b, i) => b.classList.toggle("active", i === 0));
    renderPreview();
    showToast("✨ 新しいメッセージ案を生成しました！");
  } catch (error) {
    console.error("生成エラー:", error);
    alert(`生成に失敗しました: ${error.message}\n設定画面でAPIキーやモデル名をご確認ください。`);
  } finally {
    setLoading(false);
  }
}

// Gemini API 呼び出し
async function callGeminiAPI(apiKey, model, params) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `あなたはチャット（LINE）コミュニケーションの達人です。
ユーザーの状況に合わせて、相手が読みやすく、好印象で返信しやすいLINEメッセージ案を3パターン（自然・フランク・気遣い）作成してください。

【状況設定】
- 送信者（あなた）の性別: ${params.myGender}
- 送信相手の性別: ${params.targetGender}
- 相手との関係: ${params.relationship}
${params.received ? `- 相手から届いたメッセージ: "${params.received}"` : "- 新規送信（相手からの直前メッセージなし）"}
- 自分が伝えたいこと / 要件: "${params.intended}"
- 希望トーン: ${params.tone}
- 絵文字の使用量: ${params.emoji}

【性別を意識した表現ルール】
- 送信者（${params.myGender}）と相手（${params.targetGender}）の組み合わせに応じた自然な語尾、テンション、絵文字のトーン、距離感にしてください。
- 男性の場合は爽やかさ・誠実さ・重くならない軽快さ、女性の場合は柔らかさ・親しみやすさ・愛嬌など、リアルなLINEの口調を再現してください。

【出力フォーマット制約】
必ず以下のJSONスキーマに従ったJSONのみを出力してください。Markdownコードブロックを含めても構いません。
{
  "patterns": [
    {
      "id": "A",
      "label": "自然・王道",
      "text": "1つ目のメッセージ本文（LINEとして自然な改行を含む）",
      "point": "この表現にした理由や好印象ポイント"
    },
    {
      "id": "B",
      "label": "親しみ・フランク",
      "text": "2つ目のメッセージ本文",
      "point": "この表現にした理由や好印象ポイント"
    },
    {
      "id": "C",
      "label": "丁寧・気遣い",
      "text": "3つ目のメッセージ本文",
      "point": "この表現にした理由や好印象ポイント"
    }
  ]
}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error("利用制限（429: リクエスト上限）に達しました。設定から「gemini-2.5-flash-lite」などの軽量モデルに変更するか、少し時間をおいてお試しください。");
    }
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("AIから応答が得られませんでした。");

  const parsed = JSON.parse(rawText);
  if (!parsed.patterns || !Array.isArray(parsed.patterns)) {
    throw new Error("JSONの構造が不正です。");
  }
  return parsed.patterns;
}

// モックデータ生成ロジック
function generateMockPatterns(params) {
  const isBusiness = ["先輩・上司", "取引先・目上の人"].includes(params.relationship);
  const emojiChar = params.emoji.includes("なし") ? "" : (params.emoji.includes("多め") ? "✨😊" : "！");

  if (isBusiness) {
    return [
      {
        id: "A",
        label: "自然・おすすめ",
        text: `お疲れ様です。${params.intended}の件、ご連絡いたしました。\nご都合の良い際にご確認いただけますと幸いです。よろしくお願いいたします。`,
        point: "礼儀を保ちつつ、相手のペースを崩さない標準的で信頼感のあるビジネス文面です。"
      },
      {
        id: "B",
        label: "親しみ・フランク",
        text: `お疲れ様です！${params.intended}について確認したくご連絡しました。\n急ぎではありませんので、お時間ある際にお返事いただけますと幸いです！`,
        point: "「急ぎではない」ことを明記し、相手のプレッシャーを軽減する配慮文面です。"
      },
      {
        id: "C",
        label: "丁寧・気遣い",
        text: `大変お疲れ様です。お忙しいところ恐れ入ります。\n${params.intended}についてご相談させていただきたく存じます。恐れ入りますが、ご確認のほどよろしくお願い申し上げます。`,
        point: "丁寧語と敬語を徹底し、目上の方や取引先に送っても失礼のない万全の文面です。"
      }
    ];
  }

  // モックの文面生成（性別ニュアンスの反映）
  const isMale = params.myGender === "男性";
  const isFemale = params.myGender === "女性";
  const targetIsFemale = params.targetGender === "女性";

  if (params.relationship === "気になる人・好きな人") {
    if (isMale && targetIsFemale) {
      return [
        {
          id: "A",
          label: "自然・おすすめ",
          text: `返信ありがとう！最近忙しかったんだね、お疲れさま！\n落ち着いたら息抜きに美味しいものでも食べに行かない？行きたいお店見つけておくよ😊`,
          point: "誠実で頼もしさを感じさせつつ、相手のペースを尊重した好印象なお誘い文面です。"
        },
        {
          id: "B",
          label: "親しみ・フランク",
          text: `お疲れさま！全然気にしないでね！\n${params.intended}ってどうかな？空いてる日あったら気軽に教えて〜✨`,
          point: "重くならず爽やかに、断られても気まずくならないスマートな文面です。"
        },
        {
          id: "C",
          label: "丁寧・気遣い",
          text: `忙しいのに返信くれてありがとう！大変だったね。\n${params.intended}について、無理のないタイミングで教えてもらえると嬉しいな。体調気をつけてね！`,
          point: "体調への気遣いを添えて、優しさと安心感をアピールする大人な文面です。"
        }
      ];
    } else if (isFemale) {
      return [
        {
          id: "A",
          label: "自然・おすすめ",
          text: `返信ありがとう〜！お疲れさま！\n落ち着いたら息抜きに美味しいご飯でも行こ〜！都合いい日あったら教えてね☺️${emojiChar}`,
          point: "親しみやすく柔らかい雰囲気で、相手が返信しやすい王道のお誘い文面です。"
        },
        {
          id: "B",
          label: "親しみ・フランク",
          text: `お疲れさま！全然大丈夫だよ〜！\n${params.intended}行きたいな！タイミング合うとき声かけてね✨`,
          point: "可愛げと明るさを出しつつ、相手のプレッシャーをゼロにする軽快な文面です。"
        },
        {
          id: "C",
          label: "丁寧・気遣い",
          text: `忙しいのに連絡くれてありがとう！\n${params.intended}、落ち着いたときにゆっくり話せたら嬉しいです。無理しないでね！`,
          point: "控えめで上品な気遣いの中に、さりげない好意を伝える文面です。"
        }
      ];
    }
  }

  return [
    {
      id: "A",
      label: "自然・おすすめ",
      text: `連絡ありがとう！${params.intended}のことなんだけど、落ち着いたタイミングで教えてね${emojiChar}`,
      point: "相手との距離感を大切にしつつ、要件を自然に伝えるバランスの良い文面です。"
    },
    {
      id: "B",
      label: "親しみ・フランク",
      text: `お疲れ〜！${params.intended}ってどうかな？空いてる時で全然大丈夫だからまた連絡して〜${emojiChar}`,
      point: "気軽で重くならず、テンポ良くやり取りを続けられるカジュアルな文面です。"
    },
    {
      id: "C",
      label: "丁寧・気遣い",
      text: `お疲れさま！忙しいのにごめんね💦\n${params.intended}について、無理のないタイミングで教えてもらえると嬉しいな！`,
      point: "相手を気遣う一言を添え、好印象と誠実さが伝わる優しい文面です。"
    }
  ];
}

// UIヘルパー
function setLoading(loading) {
  if (loading) {
    generateBtn.disabled = true;
    btnText.textContent = "メッセージ生成中...";
    spinner.classList.remove("hidden");
  } else {
    generateBtn.disabled = false;
    btnText.textContent = "✨ 3パターンを生成する";
    spinner.classList.add("hidden");
  }
}

let toastTimer = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2500);
}

