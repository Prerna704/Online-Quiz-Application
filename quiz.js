//QUIZ MAPPING
const subjectToCategory = {
    maths: 19, science: 17, gk: 9, history: 23, civics: 23, literature: 10, english: 10,
    physics: 19, chemistry: 17, biology: 17, programming: 18, dsa: 18, dbms: 18,
    economics: 20, business: 20, accountancy: 20, "web dev": 18, "ai/ml": 18, cloud: 18,
    marketing: 20, hr: 20, banking: 20, investment: 20, geography: 22, computer: 18,
    "computer science": 18, "social studies": 24, psychology: 24, sociology: 24,
    "political science": 24, mathematics: 19, statistics: 19, finance: 20,
    "cyber security": 18, "data science": 18, networking: 18, operations: 20,
    strategy: 20, accounting: 20, taxation: 20, insurance: 20
};

//START QUIZ
startBtn.addEventListener("click", () => {
    const subj = document.getElementById("subject").value;
    const category = subjectToCategory[subj.toLowerCase()] || 9;
    const difficulty = difficultySelect.value;
    console.log(`Fetching quiz for Category: ${category}, Difficulty: ${difficulty}`);
    fetchQuestions(category, difficulty);
});

//FETCH QUESTIONS
async function fetchQuestions(category, difficulty) {
    loadingOverlay.style.display = "flex"; // Show Loading
    const url = `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (!data.results || data.results.length === 0) {
            loadingOverlay.style.display = "none";
            alert("No questions found for this subject/difficulty. Please try a different combination.");
            startBox.style.display = "block";
            return;
        }
        questions = data.results.map(q => {
            let options = [...q.incorrect_answers, q.correct_answer];
            options.sort(() => Math.random() - 0.5);
            return {
                question: decodeHTML(q.question),
                options: options.map(o => decodeHTML(o)),
                answer: decodeHTML(q.correct_answer)
            }
        });
        startQuiz();
    } catch (error) {
        loadingOverlay.style.display = "none"; // Hide on error
        alert("Failed to fetch questions. Please try again.");
    }
}

// QUIZ FLOW 
function startQuiz() {
    currentQ = 0; score = 0;
    userAnswers = new Array(questions.length).fill(null);

    // Initialize Palette
    paletteEl.innerHTML = "";
    questions.forEach((_, i) => {
        const item = document.createElement("div");
        item.className = "palette-item";
        item.textContent = i + 1;
        item.onclick = () => jumpToQuestion(i);
        paletteEl.appendChild(item);
    });

    resultEl.style.display = "none";
    detailedFeedbackEl.style.display = "none";
    restartBtn.style.display = "none";
    saveNextBtn.style.display = "inline-block";
    submitBtn.style.display = "none";
    questionEl.style.display = "block";
    optionsEl.style.display = "block";
    timerEl.style.display = "block";
    startBox.style.display = "none";
    quizBox.style.display = "block"; // Fix: Show the quiz box
    loadingOverlay.style.display = "none"; // Hide Loading

    showQuestion();
}

function showQuestion() {
    resetState();
    const q = questions[currentQ];
    questionEl.textContent = `${currentQ + 1}) ${q.question}`;

    // Update Palette styling
    document.querySelectorAll(".palette-item").forEach((item, i) => {
        item.classList.remove("current");
        if (i === currentQ) item.classList.add("current");

        item.classList.remove("answered");
        if (userAnswers[i] !== null) item.classList.add("answered");
    });

    // Navigation Buttons
    prevBtn.style.display = currentQ > 0 ? "inline-block" : "none";

    if (currentQ === questions.length - 1) {
        saveNextBtn.style.display = "none";
        submitBtn.style.display = "inline-block";
    } else {
        saveNextBtn.style.display = "inline-block";
        submitBtn.style.display = "none";
    }

    q.options.forEach((opt, index) => {
        const btn = document.createElement("div");
        btn.classList.add("option");

        // Alphabet prefix
        const prefix = String.fromCharCode(65 + index); // A, B, C, D
        btn.innerHTML = `<span class="option-prefix">${prefix}</span> <span class="option-text">${opt}</span>`;

        // Highlight if previously selected
        if (userAnswers[currentQ] === opt) {
            btn.classList.add("active-option");
        }

        btn.onclick = () => selectAnswer(btn, opt);
        optionsEl.appendChild(btn);
    });

    startTimer();
}

function resetState() {
    optionsEl.innerHTML = "";
    clearInterval(timer);
    timeLeft = 30;
    timerEl.textContent = `Time: ${timeLeft}s`;
}

function selectAnswer(selected) {
    document.querySelectorAll(".option").forEach(opt => {
        opt.classList.remove("active-option");
    });
    selected.classList.add("active-option");
    userAnswers[currentQ] = selected.querySelector(".option-text").textContent;

    // Update palette status immediately
    const paletteItems = document.querySelectorAll(".palette-item");
    paletteItems[currentQ].classList.add("answered");
}

function jumpToQuestion(index) {
    currentQ = index;
    showQuestion();
}

function saveAnswerAndNext() {
    currentQ++;
    if (currentQ < questions.length) showQuestion();
}

function showResult() {
    // Calculate final score
    score = 0;
    questions.forEach((q, i) => {
        if (userAnswers[i] === q.answer) score++;
    });

    questionEl.style.display = "none";
    optionsEl.style.display = "none";
    timerEl.style.display = "none";
    saveNextBtn.style.display = "none";
    submitBtn.style.display = "none";
    prevBtn.style.display = "none";
    paletteEl.style.display = "none";
    resultEl.style.display = "block";
    detailedFeedbackEl.style.display = "block";
    restartBtn.style.display = "inline-block";
    resultEl.textContent = `🎉 Your Final Score: ${score} / ${questions.length}`;

    // Detailed Feedback
    detailedFeedbackEl.innerHTML = "<h3>Detailed Review</h3>";
    questions.forEach((q, index) => {
        const feedbackItem = document.createElement("div");
        feedbackItem.className = "feedback-item";
        const isCorrect = userAnswers[index] === q.answer;
        feedbackItem.innerHTML = `
      <p><strong>Q${index + 1}: ${q.question}</strong></p>
      <p style="color: ${isCorrect ? '#23d5ab' : '#ef4444'}">Your Answer: ${userAnswers[index] || "Not Answered"}</p>
      ${!isCorrect ? `<p style="color: #a78bfa">Correct Answer: ${q.answer}</p>` : ''}
      <hr style="opacity: 0.1">
    `;
        detailedFeedbackEl.appendChild(feedbackItem);
    });

    // Save test result
    const subject = document.getElementById("subject").value;
    const difficulty = difficultySelect.value;
    testHistory.push({
        score: score,
        total: questions.length,
        subject: subject,
        difficulty: difficulty,
        date: new Date().toLocaleDateString()
    });

    // Update user data in localStorage
    if (currentUser) {
        currentUser.testHistory = testHistory; // Update in-memory user
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].testHistory = testHistory;
            localStorage.setItem('quizAppUsers', JSON.stringify(users));
        }
        // FIX: Update session storage so it persists on refresh
        localStorage.setItem('currentQuizUser', JSON.stringify(currentUser));
    }

    updateDashboard();
}

saveNextBtn.addEventListener("click", saveAnswerAndNext);
submitBtn.addEventListener("click", showResult);
prevBtn.addEventListener("click", () => {
    currentQ--;
    showQuestion();
});
restartBtn.addEventListener("click", () => {
    quizBox.style.display = "none";
    detailedFeedbackEl.style.display = "none";
    paletteEl.style.display = "flex"; // Ensure visible for next run
    subjectBox.style.display = "block"; // New: Redirect to subject selection
});

function startTimer() {
    timer = setInterval(() => {
        timeLeft--; timerEl.textContent = `Time: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            saveAnswerAndNext();
        }
    }, 1000);
}
