let questions = [];
let currentQ = 0, score = 0, timer, timeLeft = 30;

const startBox = document.querySelector(".start-box");
const quizBox = document.querySelector(".quiz-box");
const startBtn = document.getElementById("start-btn");
const categorySelect = document.getElementById("category");
const difficultySelect = document.getElementById("difficulty");

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const timerEl = document.getElementById("timer");
const resultEl = document.getElementById("result");

//  Open Trivia DB
async function fetchQuestions(category, difficulty) {
  const url = `https://opentdb.com/api.php?amount=5&category=${category}&difficulty=${difficulty}&type=multiple`;
  const res = await fetch(url);
  const data = await res.json();
  
  questions = data.results.map(q => {
    let options = [...q.incorrect_answers, q.correct_answer];
    options.sort(() => Math.random() - 0.5); // shuffle
    return {
      question: decodeHTML(q.question),
      options: options.map(o => decodeHTML(o)),
      answer: decodeHTML(q.correct_answer)
    };
  });

  startQuiz();
}

// Decode HTML entities
function decodeHTML(str) {
  let txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

function startQuiz() {
  currentQ = 0;
  score = 0;
  resultEl.style.display = "none";
  restartBtn.style.display = "none";
  nextBtn.style.display = "none";
  questionEl.style.display = "block";
  optionsEl.style.display = "block";
  timerEl.style.display = "block";

  startBox.style.display = "none";
  quizBox.style.display = "block";

  showQuestion();
  startTimer();
}

function showQuestion() {
  resetState();
  let q = questions[currentQ];
  questionEl.textContent = q.question;
  q.options.forEach(opt => {
    const btn = document.createElement("div");
    btn.classList.add("option");
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(btn, q.answer);
    optionsEl.appendChild(btn);
  });
}

function resetState() {
  optionsEl.innerHTML = "";
  nextBtn.style.display = "none";
  clearInterval(timer);
  timeLeft = 30;
  timerEl.textContent = `Time: ${timeLeft}s`;
  startTimer();
}

function selectAnswer(selected, correct) {
  const options = document.querySelectorAll(".option");
  options.forEach(opt => opt.style.pointerEvents = "none");
  if (selected.textContent === correct) {
    selected.classList.add("correct");
    score++;
  } else {
    selected.classList.add("wrong");
    options.forEach(opt => {
      if (opt.textContent === correct) opt.classList.add("correct");
    });
  }
  nextBtn.style.display = "inline-block";
  clearInterval(timer);
}

function showResult() {
  questionEl.style.display = "none";
  optionsEl.style.display = "none";
  timerEl.style.display = "none";
  nextBtn.style.display = "none";
  resultEl.style.display = "block";
  restartBtn.style.display = "inline-block";
  resultEl.textContent = `🎉 Your Score: ${score} / ${questions.length}`;
}

function nextQuestion() {
  currentQ++;
  if (currentQ < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      nextBtn.style.display = "inline-block";
      const options = document.querySelectorAll(".option");
      options.forEach(opt => opt.style.pointerEvents = "none");
    }
  }, 1000);
}

// Event Listener
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", () => {
  quizBox.style.display = "none";
  startBox.style.display = "block";
});
startBtn.addEventListener("click", () => {
  let category = categorySelect.value;
  let difficulty = difficultySelect.value;
  fetchQuestions(category, difficulty);
});