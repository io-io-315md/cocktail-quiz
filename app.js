// --- マスタデータ（全カクテル共通の選択肢） ---
const masterChoices = {
  glass: ["コリンズグラス", "ロックグラス", "カクテルグラス", "ゾンビグラス", "専用グラス"],
  technique: ["ビルド", "ステア", "シェイク"],
  mixerAmount: ["1tsp", "10ml", "15ml", "20ml", "30ml", "45ml", "UP"]
};

// --- カクテルデータ（ファジーネーブル削除済み） ---
const cocktailData = [
  {
    name: "ジントニック",
    course: "spirits",
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
    course: "spirits",
    baseName: "ジン",
    baseAmount: "30ml",
    liqueurName: "コアントロー",
    liqueurAmount: "15ml",
    mixerName: "レモンジュース",
    mixerAmount: "15ml",
    subName: "なし", 
    glass: "カクテルグラス",
    technique: "シェイク",
    choices: {
      baseName: ["ジン", "ウォッカ", "ラム", "テキーラ"],
      baseAmount: ["30ml", "45ml"],
      liqueurName: ["コアントロー", "アマレット", "ピーチリキュール"], 
      subName: ["なし", "ドライベルモット", "オリーブ"],
      mixerName: ["ジンジャーエール","レモンジュース", "ライムジュース", "トニックウォーター"]
    }
  },
  {
    name: "マティーニ", 
    course: "spirits",
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
    course: "spirits",
    baseName: "ウォッカ",
    baseAmount: "45ml",
    mixerName: "グレープフルーツジュース",
    mixerAmount: "UP",
    subName: "スノースタイル",
    glass: "専用グラス", 
    technique: "ビルド",
    choices: {
      baseName: ["ジン", "ウォッカ", "ラム"],
      baseAmount: ["30ml", "45ml"],
      mixerName: ["オレンジジュース", "グレープフルーツジュース", "トニックウォーター"],
      subName: ["なし", "レモン", "ライム", "スノースタイル"]
    }
  },
  {
    name: "ギムレット", 
    course: "spirits",
    baseName: "ジン",
    baseAmount: "45ml",
    mixerName: "ライムジュース",
    mixerAmount: "15ml",
    subName: "なし",
    glass: "カクテルグラス", 
    technique: "シェイク",
    choices: {
      baseName: ["ジン", "ウォッカ", "ラム", "テキーラ"],
      baseAmount: ["30ml", "45ml"],
      mixerName: ["ライムジュース", "グレープフルーツジュース", "トニックウォーター"],
      subName: ["なし", "レモン", "ライム", "スノースタイル"]
    }
  },
  {
    name: "ジンライム", 
    course: "spirits",
    baseName: "ジン",
    baseAmount: "45ml",
    mixerName: "ライムジュース",
    mixerAmount: "15ml",
    subName: "ライム",
    glass: "ロックグラス", 
    technique: "ビルド",
    choices: {
      baseName: ["ジン"],
      baseAmount: ["30ml", "45ml"],
      mixerName: ["ライムジュース", "トニックウォーター"],
      subName: ["なし", "レモン", "ライム", "スノースタイル"]
    }
  },
  {
    name: "モスコミュール", 
    course: "spirits",
    baseName: "ウォッカ",
    baseAmount: "45ml",
    mixerName: "ジンジャーエール",
    mixerAmount: "UP",
    subName: "ライム",
    glass: "ゾンビグラス", 
    technique: "ビルド",
    choices: {
      baseName: ["ジン", "ウォッカ", "ラム", "テキーラ"],
      baseAmount: ["30ml", "45ml"],
      mixerName: ["ライムジュース", "グレープフルーツジュース", "トニックウォーター", "ジンジャーエール"],
      subName: ["なし", "レモン", "ライム", "スノースタイル"]
    }
  },
  {
    name: "スクリュードライバー",
    course: "spirits",
    baseName: "ウォッカ",
    baseAmount: "45ml",
    mixerName: "オレンジジュース",
    mixerAmount: "UP",
    subName: "なし",
    glass: "コリンズグラス",
    technique: "ビルド",
    choices: {
      baseName: ["ジン", "ウォッカ", "ラム", "テキーラ"],
      baseAmount: ["30ml", "45ml"],
      mixerName: ["オレンジジュース", "グレープフルーツジュース", "トニックウォーター"],
      subName: ["なし", "ライム", "レモン"]
    }
  },
  {
    name: "バラライカ",
    course: "spirits",
    baseName: "ウォッカ",
    baseAmount: "30ml",
    liqueurName: "コアントロー",
    liqueurAmount: "15ml",
    mixerName: "レモンジュース",
    mixerAmount: "15ml",
    subName: "なし",
    glass: "カクテルグラス",
    technique: "シェイク",
    choices: {
      baseName: ["ジン", "ウォッカ", "ラム", "テキーラ"],
      baseAmount: ["30ml", "45ml"],
      liqueurName: ["コアントロー", "アマレット", "ドライベルモット"], 
      mixerName: ["レモンジュース", "ライムジュース", "グレープフルーツジュース"],
      subName: ["なし", "レモン", "ライム"]
    }
  },
  {
    name: "カミカゼ",
    course: "spirits",
    baseName: "ウォッカ",
    baseAmount: "45ml",
    liqueurName: "コアントロー",
    liqueurAmount: "1tsp",
    mixerName: "ライムジュース",
    mixerAmount: "15ml",
    subName: "なし",
    glass: "ロックグラス",
    technique: "シェイク",
    choices: {
      baseName: ["ジン", "ウォッカ", "ラム", "テキーラ"],
      baseAmount: ["30ml", "45ml"],
      liqueurName: ["コアントロー", "ドライベルモット", "アマレット","なし"], 
      mixerName: ["ライムジュース", "レモンジュース", "トニックウォーター"],
      subName: ["なし", "ライム"]
    }
  },
  {
    name: "バカルディ",
    course: "spirits",
    baseName: "ラム",
    baseAmount: "45ml",
    mixerName: "ライムジュース",
    mixerAmount: "15ml",
    subName: "グレナデンシロップ",
    subAmount: "1tsp",
    glass: "カクテルグラス",
    technique: "シェイク",
    choices: {
      baseName: ["ジン", "ウォッカ", "ラム", "テキーラ"],
      baseAmount: ["30ml", "45ml"],
      mixerName: ["ライムジュース", "レモンジュース", "オレンジジュース"],
      subName: ["なし", "グレナデンシロップ", "ライム"],
      subAmount: ["1tsp", "10ml", "15ml"]
    }
  },
  {
    name: "XYZ",
    course: "spirits",
    baseName: "ラム",
    baseAmount: "30ml",
    liqueurName: "コアントロー",
    liqueurAmount: "15ml",
    mixerName: "レモンジュース",
    mixerAmount: "15ml",
    subName: "なし",
    glass: "カクテルグラス",
    technique: "シェイク",
    choices: {
      baseName: ["ジン", "ウォッカ", "ラム", "テキーラ"],
      baseAmount: ["30ml", "45ml"],
      liqueurName: ["コアントロー", "アマレット", "ブルーキュラソー"], 
      mixerName: ["レモンジュース", "ライムジュース", "グレープフルーツジュース"],
      subName: ["なし", "レモン", "ライム"]
    }
  },
  {
    name: "マルガリータ",
    course: "spirits",
    baseName: "テキーラ",
    baseAmount: "30ml",
    liqueurName: "コアントロー",
    liqueurAmount: "15ml",
    mixerName: "レモンジュース",
    mixerAmount: "15ml",
    subName: "なし",
    glass: "カクテルグラス",
    technique: "シェイク",
    choices: {
      baseName: ["テキーラ", "ジン", "ラム", "ウォッカ"],
      baseAmount: ["30ml", "45ml"],
      liqueurName: ["コアントロー", "ドライベルモット", "ピーチリキュール"], 
      mixerName: ["レモンジュース", "ライムジュース", "オレンジジュース"],
      subName: ["なし", "スノースタイル", "ライム"]
    }
  },
  {
    name: "テキーラサンライズ",
    course: "spirits",
    baseName: "テキーラ",
    baseAmount: "45ml",
    mixerName: "オレンジジュース",
    mixerAmount: "UP",
    subName: "グレナデンシロップ",
    subAmount: "20ml",
    glass: "専用グラス",
    technique: "ビルド",
    choices: {
      baseName: ["テキーラ", "ウォッカ", "ラム", "ジン"],
      baseAmount: ["30ml", "45ml"],
      mixerName: ["オレンジジュース", "グレープフルーツジュース", "トニックウォーター"],
      subName: ["なし", "グレナデンシロップ", "ライム"], 
      subAmount: ["10ml", "15ml", "20ml"] 
    }
  }
];

// --- ゲーム進行用の変数 ---
const QUESTION_LIMIT = 10;
const TIME_LIMIT = 20;

let currentCocktail = null;
let selectedAnswers = {};
let unusedCocktails = []; 
let selectedCourse = "";

let currentQuestionNumber = 0;
let correctCount = 0;
let quizHistory = [];
let totalStartTime = 0;
let timerInterval = null;
let timeRemaining = TIME_LIMIT;
let isFirstAttempt = true; // 1発正解かどうかの判定用

const categories = ['baseName', 'baseAmount', 'liqueurName', 'liqueurAmount', 'mixerName', 'mixerAmount', 'subName', 'subAmount', 'glass', 'technique'];

const childContainers = {
  'baseName': { category: 'baseAmount', id: 'baseAmount-container' },
  'liqueurName': { category: 'liqueurAmount', id: 'liqueurAmount-container' },
  'subName': { category: 'subAmount', id: 'subAmount-container' },
  'mixerName': { category: 'mixerAmount', id: 'mixerAmount-container' }
};

const noShuffleCategories = ['baseAmount', 'liqueurAmount', 'mixerAmount', 'subAmount', 'technique'];
const noAmountSubs = ["なし", "スノースタイル", "ライム", "レモン", "オリーブ", "レモンピール", "ライムスライス"];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

window.onload = function() {
    // 起動時はメニュー画面で待機
};

// --- ゲーム制御 ---

function startQuiz(courseName) {
  selectedCourse = courseName;
  document.getElementById('start-container').style.display = 'none';
  document.getElementById('final-result-container').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
  
  // 初期化処理
  currentQuestionNumber = 0;
  correctCount = 0;
  quizHistory = [];
  totalStartTime = Date.now();
  
  unusedCocktails = cocktailData.filter(cocktail => cocktail.course === courseName); 
  setRandomQuestion();
}

function returnToTitle() {
  stopTimer();
  document.getElementById('final-result-container').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'none';
  // CSSのflex設定を適用するため className を利用
  document.getElementById('start-container').style.display = 'flex';
}

function setRandomQuestion() {
  // 10問終わったらリザルトへ
  if (currentQuestionNumber >= QUESTION_LIMIT) {
      showFinalResult();
      return;
  }

  currentQuestionNumber++;
  isFirstAttempt = true;
  document.getElementById('progress-display').textContent = `第 ${currentQuestionNumber} 問 / 全 ${QUESTION_LIMIT} 問`;

  selectedAnswers = {};
  categories.forEach(cat => selectedAnswers[cat] = "");
  
  closeResultModal();
  document.querySelectorAll('.amount-container').forEach(el => el.style.display = 'none');

  const randomIndex = Math.floor(Math.random() * unusedCocktails.length);
  currentCocktail = unusedCocktails[randomIndex];
  unusedCocktails.splice(randomIndex, 1);
  
  // 履歴保存用
  quizHistory.push(currentCocktail);

  document.getElementById("question-title").textContent = `問題：${currentCocktail.name} のレシピは？`;

  const liqSection = document.getElementById('liqueur-section');
  if (currentCocktail.choices.liqueurName) {
      liqSection.style.display = 'block';
  } else {
      liqSection.style.display = 'none';
  }

  categories.forEach(category => {
    if (category.startsWith('liqueur') && !currentCocktail.choices.liqueurName) return;

    const container = document.getElementById(`${category}-buttons`);
    if (!container) return;
    container.innerHTML = "";

    let choices = currentCocktail.choices[category] || masterChoices[category] || [];
    
    if (choices.length === 0 && category.includes('Amount') && category !== 'subAmount') {
        choices = masterChoices.mixerAmount;
    }

    if (choices.length > 0) {
      let displayChoices = [...choices]; 
      
      if (!noShuffleCategories.includes(category)) {
        const noneIndex = displayChoices.indexOf("なし");
        let hasNone = false;
        if (noneIndex !== -1) {
          displayChoices.splice(noneIndex, 1);
          hasNone = true;
        }
        
        displayChoices = shuffleArray(displayChoices);
        
        if (hasNone) {
          displayChoices.unshift("なし");
        }
      }

      displayChoices.forEach(choiceText => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = choiceText;
        btn.onclick = function() { selectOption(this, category, choiceText); };
        container.appendChild(btn);
      });
    }
  });

  startTimer();
}

// --- タイマー処理 ---

function startTimer() {
  clearInterval(timerInterval);
  timeRemaining = TIME_LIMIT;
  updateTimerUI();
  
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerUI();
    
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      handleTimeUp();
    }
  }, 1000);
}

function updateTimerUI() {
  const timerEl = document.getElementById('timer-display');
  const timerBar = document.getElementById('timer-bar');
  const timerIndicator = document.getElementById('timer-indicator');
  const safeRemaining = Math.max(timeRemaining, 0);
  const remainingRate = (safeRemaining / TIME_LIMIT) * 100;

  if (timerEl) {
    timerEl.textContent = safeRemaining;
  }

  if (timerBar) {
    timerBar.style.width = `${remainingRate}%`;
  }

  if (timerIndicator) {
    timerIndicator.classList.toggle('warning', safeRemaining <= 10 && safeRemaining > 5);
    timerIndicator.classList.toggle('danger', safeRemaining <= 5);
  }
}

function stopTimer() {
  clearInterval(timerInterval);
}

function handleTimeUp() {
  isFirstAttempt = false; // 時間切れはミス扱い
  showResultModal(
    "wrong",
    "⏳ タイムアップ！",
    `<div style="color: #dc3545; font-size: 18px; font-weight: bold; margin-bottom: 15px; text-align: center;">時間切れです。正解はこちら。</div>${getRecipeSummaryHtml(currentCocktail)}`,
    `<button style="padding: 12px 20px; font-size: 16px; cursor: pointer; border-radius: 6px; border: none; background-color: #007bff; color: white; font-weight: bold; transition: 0.2s;" onclick='setRandomQuestion()'>次の問題へ</button>`
  );
}

// --- リザルト処理 ---

function showFinalResult() {
  stopTimer();
  document.getElementById('quiz-container').style.display = 'none';
  const finalContainer = document.getElementById('final-result-container');
  finalContainer.style.display = 'block';

  // タイム計算
  const totalTimeSec = Math.floor((Date.now() - totalStartTime) / 1000);
  const minutes = Math.floor(totalTimeSec / 60);
  const seconds = totalTimeSec % 60;
  const timeStr = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
  
  // 正答率
  const accuracy = Math.round((correctCount / QUESTION_LIMIT) * 100);
  const accuracyColor = accuracy >= 80 ? '#28a745' : '#d9534f';

  document.getElementById('final-score').innerHTML = `正答数：${correctCount} / ${QUESTION_LIMIT} 問 <span style="color: ${accuracyColor};">（正答率 ${accuracy}％）</span>`;
  document.getElementById('final-time').textContent = `所要時間：${timeStr}`;

  // 出題リスト生成（コンパクト表示）
  let historyHtml = "";
  quizHistory.forEach((cocktail, index) => {
    let recipeLine = `${cocktail.baseName}(${cocktail.baseAmount})`;
    if (cocktail.liqueurName) recipeLine += ` + ${cocktail.liqueurName}(${cocktail.liqueurAmount})`;
    recipeLine += ` + ${cocktail.mixerName}(${cocktail.mixerAmount})`;
    
    if (cocktail.subName !== "なし" && cocktail.subName !== "スノースタイル") {
        let sub = cocktail.subName;
        if(cocktail.subAmount && cocktail.subAmount !== "なし") sub += `(${cocktail.subAmount})`;
        recipeLine += ` + ${sub}`;
    } else if (cocktail.subName === "スノースタイル") {
        recipeLine += ` + スノースタイル`;
    }
    
    recipeLine += ` [${cocktail.glass} / ${cocktail.technique}]`;

    historyHtml += `
      <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #ddd;">
          <strong style="color: #333; font-size: 15px;">Q${index + 1}. ${cocktail.name}</strong><br>
          <span style="font-size: 13px; color: #666; display: block; margin-top: 4px;">${recipeLine}</span>
      </div>
    `;
  });
  document.getElementById('recipe-list').innerHTML = historyHtml;
}


function retryQuestion() {
  closeResultModal();
  selectedAnswers = {};
  categories.forEach(cat => selectedAnswers[cat] = "");
  document.querySelectorAll('.choice-btn').forEach(btn => btn.classList.remove('selected'));
  document.querySelectorAll('.amount-container').forEach(el => el.style.display = 'none');
  
  // リトライ時はタイマーをリセットして再度20秒与える
  startTimer();
}

function closeResultModal() {
  const modal = document.getElementById("result-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

function showResultModal(type, title, messageHtml, actionsHtml = "") {
  let modal = document.getElementById("result-modal");
  
  if (!modal) {
      modal = document.createElement("div");
      modal.id = "result-modal";
      modal.style.position = "fixed";
      modal.style.top = "0";
      modal.style.left = "0";
      modal.style.width = "100vw";
      modal.style.height = "100vh";
      modal.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
      modal.style.zIndex = "9999";
      modal.style.display = "flex";
      modal.style.justifyContent = "center";
      modal.style.alignItems = "center";

      modal.innerHTML = `
          <div class="modal-content" style="background-color: white; padding: 25px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 90%; width: 400px; max-height: 90vh; overflow-y: auto;">
              <h2 id="result-title" style="margin-top: 0; text-align: center;"></h2>
              <div id="result-message"></div>
              <div id="result-actions" style="margin-top: 20px; display: flex; justify-content: center; gap: 15px;"></div>
          </div>
      `;
      document.body.appendChild(modal);
  }

  modal.style.display = "flex";
  document.getElementById("result-title").textContent = title;
  document.getElementById("result-message").innerHTML = messageHtml;
  document.getElementById("result-actions").innerHTML = actionsHtml;
}

function getRecipeSummaryHtml(ans) {
  let liqueurHtml = "";
  if (ans.liqueurName) {
    const liqText = ans.liqueurAmount ? `${ans.liqueurName} ${ans.liqueurAmount}` : ans.liqueurName;
    liqueurHtml = `<dt style="font-weight: bold; float: left; width: 80px; color: #555;">材料:</dt><dd style="margin-left: 80px; margin-bottom: 8px;">${liqText}</dd>`;
  }

  const mixerText = ans.mixerAmount ? `${ans.mixerName} ${ans.mixerAmount}` : ans.mixerName;
  const subText = ans.subAmount ? `${ans.subName} ${ans.subAmount}` : ans.subName;

  return `
    <div class="recipe-summary" style="text-align: left; background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 15px; border: 1px solid #eee;">
      <h3 style="margin-top: 0; font-size: 16px; border-bottom: 2px solid #ddd; padding-bottom: 8px;">レシピまとめ</h3>
      <dl style="margin: 0; font-size: 14px; line-height: 1.6;">
        <dt style="font-weight: bold; float: left; width: 80px; color: #555;">ベース:</dt><dd style="margin-left: 80px; margin-bottom: 8px;">${ans.baseName} ${ans.baseAmount}</dd>
        ${liqueurHtml}
        <dt style="font-weight: bold; float: left; width: 80px; color: #555;">割材:</dt><dd style="margin-left: 80px; margin-bottom: 8px;">${mixerText}</dd>
        <dt style="font-weight: bold; float: left; width: 80px; color: #555;">副材料:</dt><dd style="margin-left: 80px; margin-bottom: 8px;">${subText}</dd>
        <dt style="font-weight: bold; float: left; width: 80px; color: #555;">グラス:</dt><dd style="margin-left: 80px; margin-bottom: 8px;">${ans.glass}</dd>
        <dt style="font-weight: bold; float: left; width: 80px; color: #555;">技法:</dt><dd style="margin-left: 80px; margin-bottom: 0;">${ans.technique}</dd>
      </dl>
    </div>
  `;
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
      let hasChoices = (currentCocktail.choices[child.category] || masterChoices[child.category] || []).length > 0;
      
      if (!hasChoices && child.category.includes('Amount') && child.category !== 'subAmount') {
          hasChoices = true; 
      }
      
      let shouldHideAmount = false;
      if (answer === "なし" || answer === "スノースタイル") shouldHideAmount = true;
      if (category === "subName" && noAmountSubs.includes(answer)) shouldHideAmount = true;

      if (shouldHideAmount) {
        document.getElementById(child.id).style.display = "none";
        selectedAnswers[child.category] = answer === "なし" ? "なし" : ""; 
      } else if (hasChoices) {
        document.getElementById(child.id).style.display = "block";
      }
    }
  }
}

function checkAnswer() {
  for (const key of categories) {
    if (key.startsWith('liqueur') && !currentCocktail.choices.liqueurName) continue;

    let choices = currentCocktail.choices[key] || masterChoices[key] || [];
    
    if (choices.length === 0 && key.includes('Amount') && key !== 'subAmount') {
        choices = masterChoices.mixerAmount;
    }

    const skipSubAmount = key === "subAmount" && noAmountSubs.includes(selectedAnswers.subName);

    if (choices.length > 0 && selectedAnswers[key] === "" && !skipSubAmount) {
        showResultModal(
            "warning", 
            "未選択があります", 
            "<div style='text-align: center; color: #d9534f; font-weight: bold;'>全ての項目を選択してください！</div>",
            "<button style='padding: 10px 20px; font-size: 16px; cursor: pointer; border-radius: 4px; border: none; background-color: #6c757d; color: white; font-weight: bold;' onclick='closeResultModal()'>入力に戻る</button>"
        );
        return;
    }
  }

  // 判定に入るのでタイマーを止める
  stopTimer();

  let isCorrect = true;
  for (const key of categories) {
    if (key.startsWith('liqueur') && !currentCocktail.choices.liqueurName) continue;

    let expected = currentCocktail[key] || "";
    let actual = selectedAnswers[key] || "";
    
    if (key.includes('Amount')) {
      if (expected === "") expected = "なし";
      if (actual === "") actual = "なし";
    }

    if (key === "subAmount" && noAmountSubs.includes(selectedAnswers.subName)) {
      expected = "なし";
      actual = "なし";
    }

    if (actual !== expected) {
      isCorrect = false;
      break;
    }
  }

  const primaryBtnStyle = "padding: 12px 20px; font-size: 16px; cursor: pointer; border-radius: 6px; border: none; background-color: #007bff; color: white; font-weight: bold; transition: 0.2s;";
  const secondaryBtnStyle = "padding: 12px 20px; font-size: 16px; cursor: pointer; border-radius: 6px; border: none; background-color: #6c757d; color: white; font-weight: bold; transition: 0.2s;";
  
  const actionsHtml = `
    <button style="${secondaryBtnStyle}" onclick='retryQuestion()'>もう一度</button>
    <button style="${primaryBtnStyle}" onclick='setRandomQuestion()'>次の問題へ</button>
  `;

  if (isCorrect) {
    // 初回1発正解の場合のみカウントアップ
    if (isFirstAttempt) {
        correctCount++;
    }
    showResultModal(
      "correct",
      "⭕ 正解！",
      `<div style="color: #28a745; font-size: 18px; font-weight: bold; margin-bottom: 15px; text-align: center;">完璧です！</div>${getRecipeSummaryHtml(currentCocktail)}`,
      actionsHtml
    );
  } else {
    // 間違えたら「初回正解フラグ」を折る
    isFirstAttempt = false;
    showResultModal(
      "wrong",
      "❌ 不正解...",
      `<div style="color: #dc3545; font-size: 18px; font-weight: bold; margin-bottom: 15px; text-align: center;">惜しい！正解はこちらです。</div>${getRecipeSummaryHtml(currentCocktail)}`,
      actionsHtml
    );
  }
}
