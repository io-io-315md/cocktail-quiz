// --- マスタデータ（全カクテル共通の選択肢） ---
const masterChoices = {
  // 変更：「専用グラス」という項目名に整理
  glass: ["コリンズグラス", "ロックグラス", "カクテルグラス", "ゾンビグラス", "専用グラス"],
  technique: ["ビルド", "ステア", "シェイク"],
  mixerAmount: ["10ml", "15ml", "20ml", "30ml", "45ml", "UP", "1tsp"]
};

// --- カクテルデータ（お店のレシピ） ---
const cocktailData = [
  {
    name: "ジントニック",
    baseName: "ジン",
    baseAmount: "45ml",
    subName: "ライム",
    mixerName: "トニックウォーター",
    mixerAmount: "UP",
    glass: "ゾンビグラス",
    technique: "ビルド",
    choices: {
      baseName: ["ジン"],
      baseAmount: ["30ml", "45ml"],
      subName: ["なし", "ライム", "レモン"],
      mixerName: ["トニックウォーター", "ソーダ", "ジンジャーエール"]
    }
  },
  {
    name: "ホワイトレディ",
    baseName: "ジン",
    baseAmount: "30ml",
    subName: "コアントロー",
    subAmount: "15ml",
    mixerName: "レモンジュース",
    mixerAmount: "15ml",
    glass: "カクテルグラス",
    technique: "シェイク",
    choices: {
      baseName: ["ジン", "ウォッカ", "ラム", "テキーラ"],
      baseAmount: ["30ml", "45ml"],
      subName: ["なし", "コアントロー", "ドライベルモット"],
      subAmount: ["10ml", "15ml", "30ml"],
      mixerName: ["ジンジャーエール","レモンジュース", "ライムジュース", "トニックウォーター"]
    }
  },
  {
    name: "マティーニ", 
    baseName: "ジン",
    baseAmount: "45ml",
    subName: "オリーブ",
    mixerName: "ドライベルモット",
    mixerAmount: "15ml",
    glass: "カクテルグラス",
    technique: "ステア",
    choices: {
      baseName: ["ジン", "ウォッカ", "ラム", "テキーラ"],
      baseAmount: ["30ml", "45ml", "60ml"],
      subName: ["なし", "レモン", "ライム", "オリーブ"],
      mixerName: ["オレンジジュース", "ドライベルモット", "ソーダ"]
    }
  },
  {
    name: "ソルティドッグ", 
    baseName: "ウォッカ",
    baseAmount: "45ml",
    mixerName: "グレープフルーツジュース",
    mixerAmount: "UP",
    subName: "スノースタイル",
    glass: "専用グラス", // 変更：専用グラスに統一
    technique: "ビルド",
    choices: {
      baseName: ["ジン", "ウォッカ", "ラム"],
      baseAmount: ["30ml", "45ml"],
      mixerName: ["オレンジジュース", "グレープフルーツジュース", "トニックウォーター"],
      subName: ["なし", "レモン", "ライム", "スノースタイル"]
    }
  },
  {
    // 追加：ファジーネーブル
    name: "ファジーネーブル", 
    baseName: "ピーチリキュール",
    baseAmount: "45ml",
    mixerName: "オレンジジュース",
    mixerAmount: "UP",
    subName: "なし",
    glass: "専用グラス", 
    technique: "ビルド",
    choices: {
      baseName: ["ピーチリキュール", "カシスリキュール", "カンパリ"],
      baseAmount: ["30ml", "45ml"],
      mixerName: ["オレンジジュース", "グレープフルーツジュース", "ウーロン茶"],
      subName: ["なし", "レモン", "オレンジスライス"]
    }
  }
];

let currentCocktail = null;
let selectedAnswers = {};

const categories = ['baseName', 'baseAmount', 'mixerName', 'mixerAmount', 'subName', 'subAmount', 'glass', 'technique'];

const childContainers = {
  'baseName': { category: 'baseAmount', id: 'baseAmount-container' },
  'subName': { category: 'subAmount', id: 'subAmount-container' },
  'mixerName': { category: 'mixerAmount', id: 'mixerAmount-container' }
};

function setRandomQuestion() {
  selectedAnswers = { baseName: "", baseAmount: "", subName: "", subAmount: "", mixerName: "", mixerAmount: "", glass: "", technique: "" };
  document.getElementById("result-message").innerHTML = "";
  document.querySelectorAll('.amount-container').forEach(el => el.style.display = 'none');

  const randomIndex = Math.floor(Math.random() * cocktailData.length);
  currentCocktail = cocktailData[randomIndex];
  document.getElementById("question-title").textContent = `問題：${currentCocktail.name} のレシピは？`;

  categories.forEach(category => {
    const container = document.getElementById(`${category}-buttons`);
    if (!container) return;
    container.innerHTML = "";

    let choices = currentCocktail.choices[category] || masterChoices[category] || [];

    if (choices.length > 0) {
      choices.forEach(choiceText => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = choiceText;
        btn.onclick = function() { selectOption(this, category, choiceText); };
        container.appendChild(btn);
      });
    }
  });
}

function selectOption(btnElement, category, answer) {
  if (btnElement.classList.contains('selected')) {
    selectedAnswers[category] = ""; 
    btnElement.classList.remove('selected');

    if (childContainers[category]) {
      const child = childContainers[category];
      selectedAnswers[child.category] = ""; 
      document.getElementById(child.id).style.display = "none"; 
      const childButtons = document.querySelectorAll(`#${child.category}-buttons .choice-btn`);
      childButtons.forEach(btn => btn.classList.remove('selected'));
    }
  } else {
    selectedAnswers[category] = answer;
    const buttons = document.querySelectorAll(`#${category}-buttons .choice-btn`);
    buttons.forEach(btn => btn.classList.remove('selected'));
    btnElement.classList.add('selected');

    if (childContainers[category]) {
      const child = childContainers[category];
      const hasChoices = (currentCocktail.choices[child.category] || masterChoices[child.category] || []).length > 0;
      
      if (answer === "なし" || answer === "スノースタイル") {
        document.getElementById(child.id).style.display = "none";
        selectedAnswers[child.category] = answer === "なし" ? "なし" : ""; 
      } else if (hasChoices) {
        document.getElementById(child.id).style.display = "block";
      }
    }
  }
}

function checkAnswer() {
  const resultText = document.getElementById("result-message");

  for (const key of categories) {
    const choices = currentCocktail.choices[key] || masterChoices[key] || [];
    if (choices.length > 0 && selectedAnswers[key] === "" && selectedAnswers.subName !== "なし" && selectedAnswers.subName !== "スノースタイル") {
        resultText.textContent = "全ての項目を選択してください！";
        resultText.style.color = "orange";
        return;
    }
  }

  let isCorrect = true;
  for (const key of categories) {
    const expected = currentCocktail[key] || (key.includes('Amount') ? "なし" : "");
    let actual = selectedAnswers[key] || (key.includes('Amount') ? "なし" : "");
    
    if (key === "subAmount" && selectedAnswers.subName === "スノースタイル") {
      actual = "";
    }

    if (actual !== expected) {
      isCorrect = false;
      break;
    }
  }

  if (isCorrect) {
    resultText.innerHTML = "⭕ 正解！完璧です！<br><button onclick='setRandomQuestion()' style='margin-top:15px; padding:10px;'>次の問題へ</button>";
    resultText.style.color = "green";
  } else {
    const ans = currentCocktail;
    const mixerText = ans.mixerAmount ? `${ans.mixerName} ${ans.mixerAmount}` : ans.mixerName;
    const subText = ans.subAmount ? `${ans.subName} ${ans.subAmount}` : ans.subName;
    
    resultText.innerHTML = `❌ 不正解...<br><span style="font-size:14px; color:#333;">【正解】<br>ベース: ${ans.baseName} ${ans.baseAmount}<br>割材: ${mixerText}<br>副材料: ${subText}<br>グラス: ${ans.glass}<br>技法: ${ans.technique}</span>`;
    resultText.style.color = "red";
  }
}

window.onload = setRandomQuestion;