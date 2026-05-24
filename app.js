// --- マスタデータ（全カクテル共通の選択肢） ---
const masterChoices = {
  glass: ["コリンズグラス", "ロックグラス", "カクテルグラス", "ゾンビグラス", "専用グラス"],
  technique: ["ビルド", "ステア", "シェイク"],
  mixerAmount: ["1tsp", "10ml", "15ml", "20ml", "30ml", "45ml", "UP"]
};

// --- カクテルデータ ---
let cocktailData = [];

// --- レシピデータ読み込み ---
async function loadCocktailData() {
  try {
    const response = await fetch("recipes.json");

    if (!response.ok) {
      throw new Error(`recipes.json の読み込みに失敗しました: ${response.status}`);
    }

    cocktailData = await response.json();

    if (!Array.isArray(cocktailData) || cocktailData.length === 0) {
      throw new Error("recipes.json の中身が空、または配列ではありません。");
    }
  } catch (error) {
    console.error(error);

    alert(
      "レシピデータの読み込みに失敗しました。\n" +
      "GitHub PagesのURL、またはローカルサーバーから開いてください。"
    );
  }
}

function isCocktailDataReady() {
  return Array.isArray(cocktailData) && cocktailData.length > 0;
}

// --- ゲーム進行用の変数 ---
const QUESTION_LIMIT = 10;
const TIME_LIMIT = 20;

let currentCocktail = null;
let selectedAnswers = {};
let unusedCocktails = [];
let selectedCourse = "";
let selectedDifficulty = "beginner";
let currentMode = "normal";

let currentQuestionNumber = 0;
let correctCount = 0;
let quizHistory = [];
let totalStartTime = 0;
let timerInterval = null;
let timeRemaining = TIME_LIMIT;
let elapsedMilliseconds = 0;
let activeStartTime = 0;
let isFirstAttempt = true;
let isPaused = false;

const categories = [
  "baseName",
  "baseAmount",
  "liqueurName",
  "liqueurAmount",
  "mixerName",
  "mixerAmount",
  "subName",
  "subAmount",
  "glass",
  "technique"
];

const childContainers = {
  baseName: { category: "baseAmount", id: "baseAmount-container" },
  liqueurName: { category: "liqueurAmount", id: "liqueurAmount-container" },
  subName: { category: "subAmount", id: "subAmount-container" },
  mixerName: { category: "mixerAmount", id: "mixerAmount-container" }
};

const noShuffleCategories = ["baseAmount", "liqueurAmount", "mixerAmount", "subAmount", "technique"];
const noAmountSubs = ["なし", "スノースタイル", "ライムカット", "レモンカット", "オリーブ", "レモンピール", "ライムスライス"];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

window.onload = async function() {
  await loadCocktailData();
};

// --- 画面制御 ---

function hideAllScreens() {
  document.getElementById("start-container").style.display = "none";
  document.getElementById("difficulty-select-container").style.display = "none";
  document.getElementById("mode-select-container").style.display = "none";
  document.getElementById("recipe-list-container").style.display = "none";
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("final-result-container").style.display = "none";

  closePauseModal();
}

function getCourseLabel(courseName) {
  if (courseName === "spirits") {
    return "スピリッツベース";
  }

  if (courseName === "liqueur") {
    return "リキュールベース";
  }

  return courseName;
}

function getDifficultyLabel(difficulty) {
  if (difficulty === "beginner") {
    return "初級";
  }

  if (difficulty === "intermediate") {
    return "中級";
  }

  if (difficulty === "advanced") {
    return "上級";
  }

  return difficulty;
}

function getCocktailDifficulty(cocktail) {
  return cocktail.difficulty || "beginner";
}

function showDifficultySelect(courseName) {
  if (!isCocktailDataReady()) {
    alert("レシピデータを読み込み中です。少し待ってからもう一度押してください。");
    return;
  }

  stopTimer(false);

  selectedCourse = courseName;
  selectedDifficulty = "beginner";

  hideAllScreens();

  const label = document.getElementById("difficulty-course-label");
  if (label) {
    label.textContent = getCourseLabel(courseName);
  }

  document.getElementById("difficulty-select-container").style.display = "block";
}

function showModeSelect(courseName, difficulty = "beginner") {
  if (!isCocktailDataReady()) {
    alert("レシピデータを読み込み中です。少し待ってからもう一度押してください。");
    return;
  }

  stopTimer(false);

  selectedCourse = courseName;
  selectedDifficulty = difficulty;

  hideAllScreens();

  const label = document.getElementById("selected-course-label");
  if (label) {
    label.textContent = `${getCourseLabel(courseName)} / ${getDifficultyLabel(difficulty)}`;
  }

  document.getElementById("mode-select-container").style.display = "block";
}

function returnToTitle() {
  stopTimer(false);
  resetTimeAttackTimerState();

  hideAllScreens();

  document.getElementById("start-container").style.display = "flex";
}

// --- ポーズ処理 ---

function pauseQuiz() {
  if (document.getElementById("quiz-container").style.display === "none") return;
  if (document.getElementById("result-modal") && document.getElementById("result-modal").style.display === "flex") return;

  stopTimer(true);
  isPaused = true;

  document.body.classList.add("quiz-paused");

  const pauseModal = document.getElementById("pause-modal");
  if (pauseModal) {
    pauseModal.style.display = "flex";
  }
}

function resumeQuiz() {
  if (!isPaused) return;

  isPaused = false;

  closePauseModal();

  if (currentMode === "normal") {
    startTimer();
  } else {
    activeStartTime = Date.now();
    startTimeAttackTimer();
  }
}

function closePauseModal() {
  isPaused = false;

  document.body.classList.remove("quiz-paused");

  const pauseModal = document.getElementById("pause-modal");
  if (pauseModal) {
    pauseModal.style.display = "none";
  }
}

function resetTimeAttackTimerState() {
  elapsedMilliseconds = 0;
  activeStartTime = 0;

  const timerDisplay = document.getElementById("timer-display");
  if (timerDisplay) {
    timerDisplay.textContent = currentMode === "timeAttack" ? "0.0" : TIME_LIMIT;
  }
}

// --- レシピ一覧・検索 ---

function showRecipeList() {
  if (!isCocktailDataReady()) {
    alert("レシピデータを読み込み中です。少し待ってからもう一度押してください。");
    return;
  }

  stopTimer(false);

  hideAllScreens();

  document.getElementById("recipe-list-container").style.display = "block";

  const searchInput = document.getElementById("recipe-search-input");
  if (searchInput) {
    searchInput.value = "";
  }

  renderRecipeList();
}

function formatRecipeLine(cocktail) {
  const parts = [`${cocktail.baseName} ${cocktail.baseAmount}`];

  if (cocktail.liqueurName) {
    parts.push(`${cocktail.liqueurName} ${cocktail.liqueurAmount}`);
  }

  if (cocktail.mixerName) {
    parts.push(`${cocktail.mixerName} ${cocktail.mixerAmount}`);
  }

  if (cocktail.subName && cocktail.subName !== "なし") {
    const subText = cocktail.subAmount
      ? `${cocktail.subName} ${cocktail.subAmount}`
      : cocktail.subName;

    parts.push(subText);
  }

  return parts.join(" + ");
}

function getRecipeSearchText(cocktail) {
  return [
    cocktail.name,
    cocktail.course,
    getCocktailDifficulty(cocktail),
    cocktail.baseName,
    cocktail.baseAmount,
    cocktail.liqueurName,
    cocktail.liqueurAmount,
    cocktail.mixerName,
    cocktail.mixerAmount,
    cocktail.subName,
    cocktail.subAmount,
    cocktail.glass,
    cocktail.technique
  ].filter(Boolean).join(" ").toLowerCase();
}

function renderRecipeList() {
  const listEl = document.getElementById("recipe-list-view");
  const countEl = document.getElementById("recipe-count");
  const searchInput = document.getElementById("recipe-search-input");

  if (!listEl || !countEl) return;

  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

  const filteredRecipes = cocktailData.filter(cocktail => {
    return getRecipeSearchText(cocktail).includes(keyword);
  });

  countEl.textContent = `${filteredRecipes.length} / ${cocktailData.length} 件`;

  if (filteredRecipes.length === 0) {
    listEl.innerHTML = '<div class="empty-message">該当するレシピがありません。</div>';
    return;
  }

  listEl.innerHTML = filteredRecipes.map(cocktail => `
    <article class="recipe-card">
      <div class="recipe-card__top">
        <h3>${cocktail.name}</h3>
        <span class="recipe-card__badge">${cocktail.technique}</span>
      </div>

      <p class="recipe-card__line">${formatRecipeLine(cocktail)}</p>

      <div class="recipe-card__meta">
        <span>グラス：${cocktail.glass}</span>
        <span>難易度：${getDifficultyLabel(getCocktailDifficulty(cocktail))}</span>
      </div>
    </article>
  `).join("");
}

// --- ゲーム制御 ---

function startQuiz(courseName, difficulty = "beginner", mode = "normal") {
  if (!isCocktailDataReady()) {
    alert("レシピデータを読み込み中です。少し待ってからもう一度押してください。");
    return;
  }

  selectedCourse = courseName;
  selectedDifficulty = difficulty;
  currentMode = mode;

  hideAllScreens();

  document.getElementById("quiz-container").style.display = "block";

  currentQuestionNumber = 0;
  correctCount = 0;
  quizHistory = [];
  totalStartTime = Date.now();
  elapsedMilliseconds = 0;
  activeStartTime = Date.now();
  timeRemaining = TIME_LIMIT;
  isPaused = false;

  unusedCocktails = cocktailData.filter(cocktail => {
    return cocktail.course === courseName && getCocktailDifficulty(cocktail) === difficulty;
  });

  if (unusedCocktails.length === 0) {
    alert("この難易度のレシピはまだありません。");
    showDifficultySelect(courseName);
    return;
  }

  setupTimerForMode();
  setRandomQuestion();
}

function setupTimerForMode() {
  const timerIndicator = document.getElementById("timer-indicator");
  const timerLabelPrefix = document.getElementById("timer-label-prefix");
  const timerLabelSuffix = document.getElementById("timer-label-suffix");
  const timerBar = document.getElementById("timer-bar");
  const timerTrack = document.querySelector(".timer-indicator__track");
  const timerDisplay = document.getElementById("timer-display");

  if (timerIndicator) {
    timerIndicator.classList.remove("warning", "danger", "elapsed");
    timerIndicator.style.display = "block";
  }

  if (currentMode === "timeAttack") {
    if (timerLabelPrefix) timerLabelPrefix.textContent = "経過";
    if (timerLabelSuffix) timerLabelSuffix.textContent = "秒";
    if (timerDisplay) timerDisplay.textContent = "0.0";

    if (timerTrack) {
      timerTrack.style.display = "none";
    }

    if (timerIndicator) {
      timerIndicator.style.width = "auto";
      timerIndicator.style.minWidth = "120px";
    }

    if (timerBar) {
      timerBar.style.width = "100%";
    }
  } else {
    if (timerLabelPrefix) timerLabelPrefix.textContent = "残り";
    if (timerLabelSuffix) timerLabelSuffix.textContent = "秒";
    if (timerDisplay) timerDisplay.textContent = TIME_LIMIT;

    if (timerTrack) {
      timerTrack.style.display = "block";
    }

    if (timerIndicator) {
      timerIndicator.style.width = "";
      timerIndicator.style.minWidth = "";
    }

    if (timerBar) {
      timerBar.style.width = "100%";
    }
  }
}

function scrollToQuizTop() {
  setTimeout(() => {
    const quizContainer = document.getElementById("quiz-container");

    if (quizContainer && quizContainer.style.display !== "none") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto"
      });

      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, 0);
}

function setRandomQuestion() {
  if (currentQuestionNumber >= QUESTION_LIMIT || unusedCocktails.length === 0) {
    showFinalResult();
    return;
  }

  currentQuestionNumber++;
  isFirstAttempt = true;

  document.getElementById("progress-display").textContent = `第 ${currentQuestionNumber} 問 / 全 ${QUESTION_LIMIT} 問`;

  selectedAnswers = {};
  categories.forEach(cat => selectedAnswers[cat] = "");

  closeResultModal();

  document.querySelectorAll(".amount-container").forEach(el => el.style.display = "none");
  document.querySelectorAll(".choice-btn").forEach(btn => btn.classList.remove("selected"));

  const randomIndex = Math.floor(Math.random() * unusedCocktails.length);
  currentCocktail = unusedCocktails[randomIndex];
  unusedCocktails.splice(randomIndex, 1);

  document.getElementById("question-title").textContent = `問題：${currentCocktail.name} のレシピは？`;

  const liqSection = document.getElementById("liqueur-section");
  if (currentCocktail.choices.liqueurName) {
    liqSection.style.display = "block";
  } else {
    liqSection.style.display = "none";
  }

  categories.forEach(category => {
    if (category.startsWith("liqueur") && !currentCocktail.choices.liqueurName) return;

    const container = document.getElementById(`${category}-buttons`);
    if (!container) return;

    container.innerHTML = "";

    let choices = currentCocktail.choices[category] || masterChoices[category] || [];

    if (choices.length === 0 && category.includes("Amount") && category !== "subAmount") {
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
        btn.onclick = function() {
          selectOption(this, category, choiceText);
        };

        container.appendChild(btn);
      });
    }
  });

  if (currentMode === "normal") {
    timeRemaining = TIME_LIMIT;
    startTimer();
  } else {
    startTimeAttackTimer();
  }

  scrollToQuizTop();
}

// --- タイマー処理 ---

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = null;

  timeRemaining = Math.max(timeRemaining, 0);

  updateTimerUI();

  timerInterval = setInterval(() => {
    timeRemaining--;

    updateTimerUI();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      handleTimeUp();
    }
  }, 1000);
}

function startTimeAttackTimer() {
  if (timerInterval) return;

  activeStartTime = Date.now();

  updateTimeAttackTimerDisplay();

  timerInterval = setInterval(() => {
    updateTimeAttackTimerDisplay();
  }, 100);
}

function updateTimeAttackTimerDisplay() {
  const timerEl = document.getElementById("timer-display");

  if (!timerEl) return;

  const currentActiveTime = Date.now() - activeStartTime;
  const totalTime = elapsedMilliseconds + currentActiveTime;
  const displaySeconds = Math.floor(totalTime / 100) / 10;

  timerEl.textContent = displaySeconds.toFixed(1);
}

function getTimeAttackElapsedMilliseconds() {
  if (currentMode !== "timeAttack") {
    return Date.now() - totalStartTime;
  }

  if (timerInterval) {
    return elapsedMilliseconds + (Date.now() - activeStartTime);
  }

  return elapsedMilliseconds;
}

function updateTimerUI() {
  const timerEl = document.getElementById("timer-display");
  const timerBar = document.getElementById("timer-bar");
  const timerIndicator = document.getElementById("timer-indicator");
  const safeRemaining = Math.max(timeRemaining, 0);
  const remainingRate = (safeRemaining / TIME_LIMIT) * 100;

  if (timerEl) {
    timerEl.textContent = safeRemaining;
  }

  if (timerBar) {
    timerBar.style.width = `${remainingRate}%`;
  }

  if (timerIndicator) {
    timerIndicator.classList.remove("elapsed");
    timerIndicator.classList.toggle("warning", safeRemaining <= 10 && safeRemaining > 5);
    timerIndicator.classList.toggle("danger", safeRemaining <= 5);
  }
}

function stopTimer(saveTimeAttackElapsed = true) {
  if (currentMode === "timeAttack" && timerInterval && saveTimeAttackElapsed) {
    elapsedMilliseconds += Date.now() - activeStartTime;
  }

  clearInterval(timerInterval);
  timerInterval = null;
}

function handleTimeUp() {
  isFirstAttempt = false;

  const isLastQuestion = currentQuestionNumber >= QUESTION_LIMIT;
  const buttonText = isLastQuestion ? "結果へ" : "次の問題へ";
  const buttonAction = isLastQuestion ? "showFinalResult()" : "setRandomQuestion()";

  showResultModal(
    "wrong",
    "⏳ タイムアップ！",
    `<div style="color: #dc3545; font-size: 18px; font-weight: bold; margin-bottom: 15px; text-align: center;">時間切れです。正解はこちら。</div>${getRecipeSummaryHtml(currentCocktail)}`,
    `<button style="padding: 12px 20px; font-size: 16px; cursor: pointer; border-radius: 6px; border: none; background-color: #007bff; color: white; font-weight: bold; transition: 0.2s;" onclick="${buttonAction}">${buttonText}</button>`
  );
}

// --- 判定用 ---

function getExpectedAnswerValue(cocktail, key) {
  let expected = cocktail[key] || "";

  if (key.includes("Amount") && expected === "") {
    expected = "なし";
  }

  return expected;
}

function getActualAnswerValue(answerObject, key) {
  let actual = answerObject[key] || "";

  if (key.includes("Amount") && actual === "") {
    actual = "なし";
  }

  return actual;
}

function shouldSkipCategory(cocktail, key, answerObject = selectedAnswers) {
  if (key.startsWith("liqueur") && !cocktail.choices.liqueurName) {
    return true;
  }

  if (key === "subAmount" && noAmountSubs.includes(answerObject.subName)) {
    return true;
  }

  return false;
}

function getAvailableChoices(cocktail, key) {
  let choices = cocktail.choices[key] || masterChoices[key] || [];

  if (choices.length === 0 && key.includes("Amount") && key !== "subAmount") {
    choices = masterChoices.mixerAmount;
  }

  return choices;
}

function hasUnselectedRequiredAnswer() {
  for (const key of categories) {
    if (shouldSkipCategory(currentCocktail, key)) continue;

    const choices = getAvailableChoices(currentCocktail, key);

    if (choices.length > 0 && selectedAnswers[key] === "") {
      return true;
    }
  }

  return false;
}

function judgeCurrentAnswer(answerObject = selectedAnswers) {
  for (const key of categories) {
    if (shouldSkipCategory(currentCocktail, key, answerObject)) continue;

    let expected = getExpectedAnswerValue(currentCocktail, key);
    let actual = getActualAnswerValue(answerObject, key);

    if (key === "subAmount" && noAmountSubs.includes(answerObject.subName)) {
      expected = "なし";
      actual = "なし";
    }

    if (actual !== expected) {
      return false;
    }
  }

  return true;
}

function cloneSelectedAnswers() {
  const cloned = {};

  categories.forEach(key => {
    cloned[key] = selectedAnswers[key] || "";
  });

  return cloned;
}

// --- リザルト処理 ---

function showFinalResult() {
  closeResultModal();

  const finalElapsedMilliseconds = currentMode === "timeAttack"
    ? getTimeAttackElapsedMilliseconds()
    : Date.now() - totalStartTime;

  stopTimer(true);

  hideAllScreens();

  const finalContainer = document.getElementById("final-result-container");
  finalContainer.style.display = "block";

  const totalTimeSec = currentMode === "timeAttack"
    ? finalElapsedMilliseconds / 1000
    : Math.floor(finalElapsedMilliseconds / 1000);

  const timeStr = formatTime(totalTimeSec);

  const accuracy = Math.round((correctCount / QUESTION_LIMIT) * 100);
  const accuracyColor = accuracy >= 80 ? "#28a745" : "#d9534f";

  const finalTitle = document.getElementById("final-title");
  const finalListTitle = document.getElementById("final-list-title");

  if (currentMode === "timeAttack") {
    if (finalTitle) finalTitle.textContent = "タイムアタック終了！";
    if (finalListTitle) finalListTitle.textContent = "回答結果一覧";
  } else {
    if (finalTitle) finalTitle.textContent = "テスト終了！";
    if (finalListTitle) finalListTitle.textContent = "出題レシピのおさらい";
  }

  document.getElementById("final-score").innerHTML = `正答数：${correctCount} / ${QUESTION_LIMIT} 問 <span style="color: ${accuracyColor};">（正答率 ${accuracy}％）</span>`;
  document.getElementById("final-time").textContent = `所要時間：${timeStr}`;

  if (currentMode === "timeAttack") {
    document.getElementById("recipe-list").innerHTML = buildTimeAttackResultHtml();
  } else {
    document.getElementById("recipe-list").innerHTML = buildNormalResultHtml();
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto"
  });
}

function formatTime(totalTimeSec) {
  if (currentMode === "timeAttack") {
    const rounded = Math.floor(totalTimeSec * 10) / 10;
    const minutes = Math.floor(rounded / 60);
    const seconds = rounded - minutes * 60;

    if (minutes > 0) {
      return `${minutes}分${seconds.toFixed(1)}秒`;
    }

    return `${seconds.toFixed(1)}秒`;
  }

  const total = Math.floor(totalTimeSec);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  if (minutes > 0) {
    return `${minutes}分${seconds}秒`;
  }

  return `${seconds}秒`;
}

function buildNormalResultHtml() {
  let historyHtml = "";

  quizHistory.forEach((item, index) => {
    const cocktail = item.cocktail || item;

    let recipeLine = `${cocktail.baseName}(${cocktail.baseAmount})`;

    if (cocktail.liqueurName) {
      recipeLine += ` + ${cocktail.liqueurName}(${cocktail.liqueurAmount})`;
    }

    recipeLine += ` + ${cocktail.mixerName}(${cocktail.mixerAmount})`;

    if (cocktail.subName !== "なし" && cocktail.subName !== "スノースタイル") {
      let sub = cocktail.subName;

      if (cocktail.subAmount && cocktail.subAmount !== "なし") {
        sub += `(${cocktail.subAmount})`;
      }

      recipeLine += ` + ${sub}`;
    } else if (cocktail.subName === "スノースタイル") {
      recipeLine += " + スノースタイル";
    }

    recipeLine += ` [${cocktail.glass} / ${cocktail.technique}]`;

    historyHtml += `
      <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #ddd;">
        <strong style="color: #333; font-size: 15px;">Q${index + 1}. ${cocktail.name}</strong><br>
        <span style="font-size: 13px; color: #666; display: block; margin-top: 4px;">${recipeLine}</span>
      </div>
    `;
  });

  return historyHtml;
}

function buildTimeAttackResultHtml() {
  return quizHistory.map((item, index) => {
    const badgeClass = item.isCorrect ? "correct" : "wrong";
    const badgeText = item.isCorrect ? "正解" : "不正解";

    return `
      <div class="time-attack-row">
        <div class="time-attack-row__title">
          <strong>Q${index + 1}. ${item.cocktail.name}</strong>
          <span class="result-badge ${badgeClass}">${badgeText}</span>
        </div>

        <p class="answer-line">あなたの回答：${formatAnswerSummary(item.userAnswer)}</p>
        <p class="answer-line correct-answer">正解：${formatRecipeLine(item.cocktail)} / ${item.cocktail.glass} / ${item.cocktail.technique}</p>
      </div>
    `;
  }).join("");
}

function formatAnswerSummary(answerObject) {
  const base = `${answerObject.baseName || "未選択"} ${answerObject.baseAmount || "未選択"}`;

  const parts = [base];

  if (answerObject.liqueurName) {
    parts.push(`${answerObject.liqueurName} ${answerObject.liqueurAmount || "未選択"}`);
  }

  if (answerObject.mixerName) {
    parts.push(`${answerObject.mixerName} ${answerObject.mixerAmount || "未選択"}`);
  }

  if (answerObject.subName && answerObject.subName !== "なし") {
    const subText = answerObject.subAmount
      ? `${answerObject.subName} ${answerObject.subAmount}`
      : answerObject.subName;

    parts.push(subText);
  } else if (answerObject.subName === "なし") {
    parts.push("副材料なし");
  } else {
    parts.push("副材料未選択");
  }

  parts.push(`グラス：${answerObject.glass || "未選択"}`);
  parts.push(`技法：${answerObject.technique || "未選択"}`);

  return parts.join(" + ");
}

function retryQuestion() {
  closeResultModal();

  selectedAnswers = {};
  categories.forEach(cat => selectedAnswers[cat] = "");

  document.querySelectorAll(".choice-btn").forEach(btn => btn.classList.remove("selected"));
  document.querySelectorAll(".amount-container").forEach(el => el.style.display = "none");

  timeRemaining = TIME_LIMIT;
  startTimer();
  scrollToQuizTop();
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
    const liqText = ans.liqueurAmount
      ? `${ans.liqueurName} ${ans.liqueurAmount}`
      : ans.liqueurName;

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
  if (isPaused) return;

  if (btnElement.classList.contains("selected")) {
    selectedAnswers[category] = "";
    btnElement.classList.remove("selected");

    if (childContainers[category]) {
      const child = childContainers[category];

      selectedAnswers[child.category] = "";

      document.getElementById(child.id).style.display = "none";

      const childButtons = document.querySelectorAll(`#${child.category}-buttons .choice-btn`);
      childButtons.forEach(btn => btn.classList.remove("selected"));
    }
  } else {
    selectedAnswers[category] = answer;

    const buttons = document.querySelectorAll(`#${category}-buttons .choice-btn`);
    buttons.forEach(btn => btn.classList.remove("selected"));

    btnElement.classList.add("selected");

    if (childContainers[category]) {
      const child = childContainers[category];

      let hasChoices = (currentCocktail.choices[child.category] || masterChoices[child.category] || []).length > 0;

      if (!hasChoices && child.category.includes("Amount") && child.category !== "subAmount") {
        hasChoices = true;
      }

      let shouldHideAmount = false;

      if (answer === "なし" || answer === "スノースタイル") {
        shouldHideAmount = true;
      }

      if (category === "subName" && noAmountSubs.includes(answer)) {
        shouldHideAmount = true;
      }

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
  if (isPaused) return;

  if (hasUnselectedRequiredAnswer()) {
    showResultModal(
      "warning",
      "未選択があります",
      "<div style='text-align: center; color: #d9534f; font-weight: bold;'>全ての項目を選択してください！</div>",
      "<button style='padding: 10px 20px; font-size: 16px; cursor: pointer; border-radius: 4px; border: none; background-color: #6c757d; color: white; font-weight: bold;' onclick='closeResultModal()'>入力に戻る</button>"
    );

    return;
  }

  if (currentMode === "timeAttack") {
    handleTimeAttackAnswer();
    return;
  }

  handleNormalAnswer();
}

function handleNormalAnswer() {
  stopTimer();

  const isCorrect = judgeCurrentAnswer(selectedAnswers);

  const primaryBtnStyle = "padding: 12px 20px; font-size: 16px; cursor: pointer; border-radius: 6px; border: none; background-color: #007bff; color: white; font-weight: bold; transition: 0.2s;";
  const secondaryBtnStyle = "padding: 12px 20px; font-size: 16px; cursor: pointer; border-radius: 6px; border: none; background-color: #6c757d; color: white; font-weight: bold; transition: 0.2s;";

  const isLastQuestion = currentQuestionNumber >= QUESTION_LIMIT;
  const nextButtonText = isLastQuestion ? "結果へ" : "次の問題へ";
  const nextButtonAction = isLastQuestion ? "showFinalResult()" : "setRandomQuestion()";

  const actionsHtml = `
    <button style="${secondaryBtnStyle}" onclick="retryQuestion()">もう一度</button>
    <button style="${primaryBtnStyle}" onclick="${nextButtonAction}">${nextButtonText}</button>
  `;

  quizHistory.push({
    cocktail: currentCocktail,
    userAnswer: cloneSelectedAnswers(),
    isCorrect
  });

  if (isCorrect) {
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
    isFirstAttempt = false;

    showResultModal(
      "wrong",
      "❌ 不正解...",
      `<div style="color: #dc3545; font-size: 18px; font-weight: bold; margin-bottom: 15px; text-align: center;">惜しい！正解はこちらです。</div>${getRecipeSummaryHtml(currentCocktail)}`,
      actionsHtml
    );
  }
}

function handleTimeAttackAnswer() {
  const userAnswer = cloneSelectedAnswers();
  const isCorrect = judgeCurrentAnswer(userAnswer);

  if (isCorrect) {
    correctCount++;
  }

  quizHistory.push({
    cocktail: currentCocktail,
    userAnswer,
    isCorrect
  });

  setRandomQuestion();
}
// --- 難易度表示とランダム出題の上書き実装 ---

getDifficultyLabel = function(difficulty) {
  if (difficulty === "beginner") {
    return "初級";
  }

  if (difficulty === "intermediate") {
    return "中級";
  }

  if (difficulty === "advanced") {
    return "上級";
  }

  if (difficulty === "random") {
    return "ランダム";
  }

  return difficulty;
};

showModeSelect = function(courseName, difficulty = "beginner") {
  if (!isCocktailDataReady()) {
    alert("レシピデータを読み込み中です。少し待ってからもう一度押してください。");
    return;
  }

  stopTimer(false);

  selectedCourse = courseName;
  selectedDifficulty = difficulty;

  hideAllScreens();

  const label = document.getElementById("selected-course-label");
  if (label) {
    label.textContent = `${getCourseLabel(courseName)} / ${getDifficultyLabel(difficulty)}`;
  }

  document.getElementById("mode-select-container").style.display = "block";
};

startQuiz = function(courseName, difficulty = "beginner", mode = "normal") {
  if (!isCocktailDataReady()) {
    alert("レシピデータを読み込み中です。少し待ってからもう一度押してください。");
    return;
  }

  selectedCourse = courseName;
  selectedDifficulty = difficulty;
  currentMode = mode;

  hideAllScreens();

  document.getElementById("quiz-container").style.display = "block";

  currentQuestionNumber = 0;
  correctCount = 0;
  quizHistory = [];
  totalStartTime = Date.now();
  elapsedMilliseconds = 0;
  activeStartTime = Date.now();
  timeRemaining = TIME_LIMIT;
  isPaused = false;

  if (difficulty === "random") {
    unusedCocktails = cocktailData.filter(cocktail => {
      return cocktail.course === courseName;
    });
  } else {
    unusedCocktails = cocktailData.filter(cocktail => {
      return cocktail.course === courseName && getCocktailDifficulty(cocktail) === difficulty;
    });
  }

  if (unusedCocktails.length === 0) {
    alert("この難易度のレシピはまだありません。");
    showDifficultySelect(courseName);
    return;
  }

  setupTimerForMode();
  setRandomQuestion();
};
// --- ver1.7: ノーマル制限時間30秒化・ゲージ色変更・タイムアタックスコア追加 ---

const NORMAL_MODE_TIME_LIMIT = 30;

function getTimeAttackRank(totalTimeSec) {
  if (totalTimeSec < 60) {
    return "SS";
  }

  if (totalTimeSec <= 75) {
    return "S";
  }

  if (totalTimeSec <= 90) {
    return "A";
  }

  if (totalTimeSec <= 110) {
    return "B";
  }

  return "C";
}

function getTimeAttackRankClass(rank) {
  if (rank === "SS") return "rank-ss";
  if (rank === "S") return "rank-s";
  if (rank === "A") return "rank-a";
  if (rank === "B") return "rank-b";
  return "rank-c";
}

startTimer = function() {
  clearInterval(timerInterval);
  timerInterval = null;

  timeRemaining = NORMAL_MODE_TIME_LIMIT;

  updateTimerUI();

  timerInterval = setInterval(() => {
    timeRemaining--;

    updateTimerUI();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      handleTimeUp();
    }
  }, 1000);
};

updateTimerUI = function() {
  const timerEl = document.getElementById("timer-display");
  const timerBar = document.getElementById("timer-bar");
  const timerIndicator = document.getElementById("timer-indicator");
  const safeRemaining = Math.max(timeRemaining, 0);
  const remainingRate = (safeRemaining / NORMAL_MODE_TIME_LIMIT) * 100;

  if (timerEl) {
    timerEl.textContent = safeRemaining;
  }

  if (timerBar) {
    timerBar.style.width = `${remainingRate}%`;
  }

  if (timerIndicator) {
    timerIndicator.classList.remove("elapsed");
    timerIndicator.classList.toggle("warning", safeRemaining <= 15 && safeRemaining > 5);
    timerIndicator.classList.toggle("danger", safeRemaining <= 5);
  }
};

setupTimerForMode = function() {
  const timerIndicator = document.getElementById("timer-indicator");
  const timerLabelPrefix = document.getElementById("timer-label-prefix");
  const timerLabelSuffix = document.getElementById("timer-label-suffix");
  const timerBar = document.getElementById("timer-bar");
  const timerTrack = document.querySelector(".timer-indicator__track");
  const timerDisplay = document.getElementById("timer-display");

  if (timerIndicator) {
    timerIndicator.classList.remove("warning", "danger", "elapsed");
    timerIndicator.style.display = "block";
  }

  if (currentMode === "timeAttack") {
    if (timerLabelPrefix) timerLabelPrefix.textContent = "経過";
    if (timerLabelSuffix) timerLabelSuffix.textContent = "秒";
    if (timerDisplay) timerDisplay.textContent = "0.0";

    if (timerTrack) {
      timerTrack.style.display = "none";
    }

    if (timerIndicator) {
      timerIndicator.style.width = "auto";
      timerIndicator.style.minWidth = "120px";
    }

    if (timerBar) {
      timerBar.style.width = "100%";
    }
  } else {
    if (timerLabelPrefix) timerLabelPrefix.textContent = "残り";
    if (timerLabelSuffix) timerLabelSuffix.textContent = "秒";
    if (timerDisplay) timerDisplay.textContent = NORMAL_MODE_TIME_LIMIT;

    if (timerTrack) {
      timerTrack.style.display = "block";
    }

    if (timerIndicator) {
      timerIndicator.style.width = "";
      timerIndicator.style.minWidth = "";
    }

    if (timerBar) {
      timerBar.style.width = "100%";
    }
  }
};

retryQuestion = function() {
  closeResultModal();

  selectedAnswers = {};
  categories.forEach(cat => selectedAnswers[cat] = "");

  document.querySelectorAll(".choice-btn").forEach(btn => btn.classList.remove("selected"));
  document.querySelectorAll(".amount-container").forEach(el => el.style.display = "none");

  timeRemaining = NORMAL_MODE_TIME_LIMIT;
  startTimer();
  scrollToQuizTop();
};

resetTimeAttackTimerState = function() {
  elapsedMilliseconds = 0;
  activeStartTime = 0;

  const timerDisplay = document.getElementById("timer-display");
  if (timerDisplay) {
    timerDisplay.textContent = currentMode === "timeAttack" ? "0.0" : NORMAL_MODE_TIME_LIMIT;
  }
};

showFinalResult = function() {
  closeResultModal();

  const finalElapsedMilliseconds = currentMode === "timeAttack"
    ? getTimeAttackElapsedMilliseconds()
    : Date.now() - totalStartTime;

  stopTimer(true);

  hideAllScreens();

  const finalContainer = document.getElementById("final-result-container");
  finalContainer.style.display = "block";

  const totalTimeSec = currentMode === "timeAttack"
    ? finalElapsedMilliseconds / 1000
    : Math.floor(finalElapsedMilliseconds / 1000);

  const timeStr = formatTime(totalTimeSec);

  const accuracy = Math.round((correctCount / QUESTION_LIMIT) * 100);
  const accuracyColor = accuracy >= 80 ? "#28a745" : "#d9534f";

  const finalTitle = document.getElementById("final-title");
  const finalListTitle = document.getElementById("final-list-title");
  const finalScore = document.getElementById("final-score");
  const finalTime = document.getElementById("final-time");

  if (currentMode === "timeAttack") {
    const rank = getTimeAttackRank(totalTimeSec);
    const rankClass = getTimeAttackRankClass(rank);

    if (finalTitle) finalTitle.textContent = "タイムアタック終了！";
    if (finalListTitle) finalListTitle.textContent = "回答結果一覧";

    finalScore.innerHTML = `
      正答数：${correctCount} / ${QUESTION_LIMIT} 問
      <span style="color: ${accuracyColor};">（正答率 ${accuracy}％）</span>
    `;

    finalTime.innerHTML = `
      <div>所要時間：${timeStr}</div>
      <div class="time-attack-rank ${rankClass}">
        SCORE ${rank}
      </div>
      <div class="time-attack-rank-note">
        SS：60秒未満 / S：75秒以内 / A：90秒以内 / B：110秒以内 / C：それ以降
      </div>
    `;

    document.getElementById("recipe-list").innerHTML = buildTimeAttackResultHtml();
  } else {
    if (finalTitle) finalTitle.textContent = "テスト終了！";
    if (finalListTitle) finalListTitle.textContent = "出題レシピのおさらい";

    finalScore.innerHTML = `
      正答数：${correctCount} / ${QUESTION_LIMIT} 問
      <span style="color: ${accuracyColor};">（正答率 ${accuracy}％）</span>
    `;

    finalTime.textContent = `所要時間：${timeStr}`;

    document.getElementById("recipe-list").innerHTML = buildNormalResultHtml();
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto"
  });
};
// --- ver1.8: タイムアタックスコアに正答率補正を追加 ---

function getBaseTimeAttackRank(totalTimeSec) {
  if (totalTimeSec < 60) {
    return "SS";
  }

  if (totalTimeSec <= 75) {
    return "S";
  }

  if (totalTimeSec <= 90) {
    return "A";
  }

  if (totalTimeSec <= 110) {
    return "B";
  }

  return "C";
}

function applyAccuracyPenaltyToRank(baseRank, accuracy) {
  const ranks = ["SS", "S", "A", "B", "C"];
  const baseIndex = ranks.indexOf(baseRank);

  if (baseIndex === -1) {
    return "C";
  }

  let penalty = 0;

  if (accuracy >= 90) {
    penalty = 0;
  } else if (accuracy >= 80) {
    penalty = 1;
  } else if (accuracy >= 60) {
    penalty = 2;
  } else {
    return "C";
  }

  const finalIndex = Math.min(baseIndex + penalty, ranks.length - 1);

  return ranks[finalIndex];
}

getTimeAttackRank = function(totalTimeSec, accuracy = 100) {
  const baseRank = getBaseTimeAttackRank(totalTimeSec);

  return applyAccuracyPenaltyToRank(baseRank, accuracy);
};

showFinalResult = function() {
  closeResultModal();

  const finalElapsedMilliseconds = currentMode === "timeAttack"
    ? getTimeAttackElapsedMilliseconds()
    : Date.now() - totalStartTime;

  stopTimer(true);

  hideAllScreens();

  const finalContainer = document.getElementById("final-result-container");
  finalContainer.style.display = "block";

  const totalTimeSec = currentMode === "timeAttack"
    ? finalElapsedMilliseconds / 1000
    : Math.floor(finalElapsedMilliseconds / 1000);

  const timeStr = formatTime(totalTimeSec);

  const accuracy = Math.round((correctCount / QUESTION_LIMIT) * 100);
  const accuracyColor = accuracy >= 80 ? "#28a745" : "#d9534f";

  const finalTitle = document.getElementById("final-title");
  const finalListTitle = document.getElementById("final-list-title");
  const finalScore = document.getElementById("final-score");
  const finalTime = document.getElementById("final-time");

  if (currentMode === "timeAttack") {
    const baseRank = getBaseTimeAttackRank(totalTimeSec);
    const rank = getTimeAttackRank(totalTimeSec, accuracy);
    const rankClass = getTimeAttackRankClass(rank);

    if (finalTitle) finalTitle.textContent = "タイムアタック終了！";
    if (finalListTitle) finalListTitle.textContent = "回答結果一覧";

    finalScore.innerHTML = `
      正答数：${correctCount} / ${QUESTION_LIMIT} 問
      <span style="color: ${accuracyColor};">（正答率 ${accuracy}％）</span>
    `;

    finalTime.innerHTML = `
      <div>所要時間：${timeStr}</div>
      <div class="time-attack-rank ${rankClass}">
        SCORE ${rank}
      </div>
      <div class="time-attack-rank-note">
        タイム基準：${baseRank} / 正答率補正後：${rank}<br>
        SS：60秒未満 / S：75秒以内 / A：90秒以内 / B：110秒以内 / C：それ以降<br>
        正答率90％以上：変動なし / 80％以上：1段階ダウン / 60％以上：2段階ダウン / 60％未満：C固定
      </div>
    `;

    document.getElementById("recipe-list").innerHTML = buildTimeAttackResultHtml();
  } else {
    if (finalTitle) finalTitle.textContent = "テスト終了！";
    if (finalListTitle) finalListTitle.textContent = "出題レシピのおさらい";

    finalScore.innerHTML = `
      正答数：${correctCount} / ${QUESTION_LIMIT} 問
      <span style="color: ${accuracyColor};">（正答率 ${accuracy}％）</span>
    `;

    finalTime.textContent = `所要時間：${timeStr}`;

    document.getElementById("recipe-list").innerHTML = buildNormalResultHtml();
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto"
  });
};
// --- ver1.9: グラス選択肢統合・コリンズ/ゾンビ同一判定 ---

if (masterChoices && Array.isArray(masterChoices.glass)) {
  masterChoices.glass = ["コリンズグラス/ゾンビグラス", "ロックグラス", "カクテルグラス", "専用グラス"];
}

function normalizeGlassValue(value) {
  if (value === "コリンズグラス" || value === "ゾンビグラス" || value === "コリンズグラス/ゾンビグラス") {
    return "コリンズグラス/ゾンビグラス";
  }

  return value;
}

const originalJudgeCurrentAnswerForGlass = judgeCurrentAnswer;

judgeCurrentAnswer = function(answerObject = selectedAnswers) {
  for (const key of categories) {
    if (shouldSkipCategory(currentCocktail, key, answerObject)) continue;

    let expected = getExpectedAnswerValue(currentCocktail, key);
    let actual = getActualAnswerValue(answerObject, key);

    if (key === "glass") {
      expected = normalizeGlassValue(expected);
      actual = normalizeGlassValue(actual);
    }

    if (key === "subAmount" && noAmountSubs.includes(answerObject.subName)) {
      expected = "なし";
      actual = "なし";
    }

    if (actual !== expected) {
      return false;
    }
  }

  return true;
};

const originalFormatRecipeLineForGlass = formatRecipeLine;

formatRecipeLine = function(cocktail) {
  const parts = [`${cocktail.baseName} ${cocktail.baseAmount}`];

  if (cocktail.liqueurName) {
    parts.push(`${cocktail.liqueurName} ${cocktail.liqueurAmount}`);
  }

  if (cocktail.mixerName) {
    parts.push(`${cocktail.mixerName} ${cocktail.mixerAmount}`);
  }

  if (cocktail.subName && cocktail.subName !== "なし") {
    const subText = cocktail.subAmount
      ? `${cocktail.subName} ${cocktail.subAmount}`
      : cocktail.subName;

    parts.push(subText);
  }

  return parts.join(" + ");
};

const originalBuildNormalResultHtmlForGlass = buildNormalResultHtml;

buildNormalResultHtml = function() {
  let historyHtml = "";

  quizHistory.forEach((item, index) => {
    const cocktail = item.cocktail || item;

    let recipeLine = `${cocktail.baseName}(${cocktail.baseAmount})`;

    if (cocktail.liqueurName) {
      recipeLine += ` + ${cocktail.liqueurName}(${cocktail.liqueurAmount})`;
    }

    recipeLine += ` + ${cocktail.mixerName}(${cocktail.mixerAmount})`;

    if (cocktail.subName !== "なし" && cocktail.subName !== "スノースタイル") {
      let sub = cocktail.subName;

      if (cocktail.subAmount && cocktail.subAmount !== "なし") {
        sub += `(${cocktail.subAmount})`;
      }

      recipeLine += ` + ${sub}`;
    } else if (cocktail.subName === "スノースタイル") {
      recipeLine += " + スノースタイル";
    }

    recipeLine += ` [${normalizeGlassValue(cocktail.glass)} / ${cocktail.technique}]`;

    historyHtml += `
      <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #ddd;">
        <strong style="color: #333; font-size: 15px;">Q${index + 1}. ${cocktail.name}</strong><br>
        <span style="font-size: 13px; color: #666; display: block; margin-top: 4px;">${recipeLine}</span>
      </div>
    `;
  });

  return historyHtml;
};

const originalBuildTimeAttackResultHtmlForGlass = buildTimeAttackResultHtml;

buildTimeAttackResultHtml = function() {
  return quizHistory.map((item, index) => {
    const badgeClass = item.isCorrect ? "correct" : "wrong";
    const badgeText = item.isCorrect ? "正解" : "不正解";

    return `
      <div class="time-attack-row">
        <div class="time-attack-row__title">
          <strong>Q${index + 1}. ${item.cocktail.name}</strong>
          <span class="result-badge ${badgeClass}">${badgeText}</span>
        </div>

        <p class="answer-line">あなたの回答：${formatAnswerSummary(item.userAnswer)}</p>
        <p class="answer-line correct-answer">正解：${formatRecipeLine(item.cocktail)} / ${normalizeGlassValue(item.cocktail.glass)} / ${item.cocktail.technique}</p>
      </div>
    `;
  }).join("");
};

const originalGetRecipeSummaryHtmlForGlass = getRecipeSummaryHtml;

getRecipeSummaryHtml = function(ans) {
  let liqueurHtml = "";

  if (ans.liqueurName) {
    const liqText = ans.liqueurAmount
      ? `${ans.liqueurName} ${ans.liqueurAmount}`
      : ans.liqueurName;

    liqueurHtml = `<dt style="font-weight: bold; float: left; width: 80px; color: #555;">材料:</dt><dd style="margin-left: 80px; margin-bottom: 8px;">${liqText}</dd>`;
  }

  const mixerText = ans.mixerAmount ? `${ans.mixerName} ${ans.mixerAmount}` : ans.mixerName;
  const subText = ans.subAmount ? `${ans.subName} ${ans.subAmount}` : ans.subName;
  const glassText = normalizeGlassValue(ans.glass);

  return `
    <div class="recipe-summary" style="text-align: left; background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 15px; border: 1px solid #eee;">
      <h3 style="margin-top: 0; font-size: 16px; border-bottom: 2px solid #ddd; padding-bottom: 8px;">レシピまとめ</h3>
      <dl style="margin: 0; font-size: 14px; line-height: 1.6;">
        <dt style="font-weight: bold; float: left; width: 80px; color: #555;">ベース:</dt><dd style="margin-left: 80px; margin-bottom: 8px;">${ans.baseName} ${ans.baseAmount}</dd>
        ${liqueurHtml}
        <dt style="font-weight: bold; float: left; width: 80px; color: #555;">割材:</dt><dd style="margin-left: 80px; margin-bottom: 8px;">${mixerText}</dd>
        <dt style="font-weight: bold; float: left; width: 80px; color: #555;">副材料:</dt><dd style="margin-left: 80px; margin-bottom: 8px;">${subText}</dd>
        <dt style="font-weight: bold; float: left; width: 80px; color: #555;">グラス:</dt><dd style="margin-left: 80px; margin-bottom: 8px;">${glassText}</dd>
        <dt style="font-weight: bold; float: left; width: 80px; color: #555;">技法:</dt><dd style="margin-left: 80px; margin-bottom: 0;">${ans.technique}</dd>
      </dl>
    </div>
  `;
};

const originalRenderRecipeListForGlass = renderRecipeList;

renderRecipeList = function() {
  const listEl = document.getElementById("recipe-list-view");
  const countEl = document.getElementById("recipe-count");
  const searchInput = document.getElementById("recipe-search-input");

  if (!listEl || !countEl) return;

  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

  const filteredRecipes = cocktailData.filter(cocktail => {
    return getRecipeSearchText(cocktail).includes(keyword);
  });

  countEl.textContent = `${filteredRecipes.length} / ${cocktailData.length} 件`;

  if (filteredRecipes.length === 0) {
    listEl.innerHTML = '<div class="empty-message">該当するレシピがありません。</div>';
    return;
  }

  listEl.innerHTML = filteredRecipes.map(cocktail => `
    <article class="recipe-card">
      <div class="recipe-card__top">
        <h3>${cocktail.name}</h3>
        <span class="recipe-card__badge">${cocktail.technique}</span>
      </div>

      <p class="recipe-card__line">${formatRecipeLine(cocktail)}</p>

      <div class="recipe-card__meta">
        <span>グラス：${normalizeGlassValue(cocktail.glass)}</span>
        <span>難易度：${getDifficultyLabel(getCocktailDifficulty(cocktail))}</span>
      </div>
    </article>
  `).join("");
};