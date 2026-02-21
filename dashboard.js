// PROFILE UPLOAD
profilePicInput.addEventListener("change", () => {
    const file = profilePicInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            const b64 = e.target.result;
            profileDisplay.src = b64;

            // Save to currentUser
            if (currentUser) {
                currentUser.profilePic = b64;
                localStorage.setItem('currentQuizUser', JSON.stringify(currentUser));

                // Update in users array
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex].profilePic = b64;
                    localStorage.setItem('quizAppUsers', JSON.stringify(users));
                }
            }
        }
        reader.readAsDataURL(file);
    }
});

// SETTINGS LOGIC
settingsBtn.addEventListener("click", showSettings);
cancelSettingsBtn.addEventListener("click", () => {
    settingsBox.style.display = "none";
    filterBox.style.display = "block";
});

saveProfileBtn.addEventListener("click", saveProfileChanges);

function showSettings() {
    // Hide other views
    filterBox.style.display = "none";
    subjectBox.style.display = "none";
    startBox.style.display = "none";
    quizBox.style.display = "none";

    // Show settings
    settingsBox.style.display = "block";

    // Pre-fill
    if (currentUser) {
        editUsername.value = currentUser.username;
        editPassword.value = currentUser.password;
    }
}

function saveProfileChanges() {
    if (!currentUser) return;

    const newName = editUsername.value.trim();
    const newPass = editPassword.value.trim();

    if (!newName || !newPass) {
        alert("Please fill all fields");
        return;
    }

    // Update currentUser
    currentUser.username = newName;
    currentUser.password = newPass;

    // Update in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].username = newName;
        users[userIndex].password = newPass;
        localStorage.setItem('quizAppUsers', JSON.stringify(users));
    }

    // Update session
    localStorage.setItem('currentQuizUser', JSON.stringify(currentUser));

    // Update UI
    userDisplay.textContent = "Name: " + newName;
    emailDisplay.textContent = "Email: " + currentUser.email;

    alert("Profile updated successfully!");
    settingsBox.style.display = "none";
    filterBox.style.display = "block";
}

// LOGOUT
logoutBtn.addEventListener("click", () => {
    // Save user data before logout
    if (currentUser) {
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].testHistory = testHistory;
            localStorage.setItem('quizAppUsers', JSON.stringify(users));
        }
    }
    localStorage.removeItem('currentQuizUser');
    location.reload();
});

// TABS SWITCHING
btnHistory.addEventListener("click", () => {
    btnHistory.classList.add("active");
    btnLeaderboard.classList.remove("active");
    testHistoryEl.classList.add("active");
    leaderboardEl.classList.remove("active");
});

btnLeaderboard.addEventListener("click", () => {
    btnLeaderboard.classList.add("active");
    btnHistory.classList.remove("active");
    leaderboardEl.classList.add("active");
    testHistoryEl.classList.remove("active");
});

// DASHBOARD UPDATE
function updateDashboard() {
    totalTestsEl.textContent = testHistory.length;

    // 1. Render History
    testHistoryEl.innerHTML = "";
    testHistory.slice().reverse().forEach((t, i) => {
        const card = document.createElement("div");
        card.className = "test-card";
        card.innerHTML = `
      <div style="font-weight:600; color:#a78bfa;">${t.subject.toUpperCase()}</div>
      <div style="font-size:12px; opacity:0.7;">${t.date} | ${t.difficulty}</div>
      <div style="font-size:15px; margin-top:5px;">Score: <span style="color:#23d5ab; font-weight:bold;">${t.score}/${t.total}</span></div>
    `;
        testHistoryEl.appendChild(card);
    });

    // 2. Render Leaderboard
    renderLeaderboard();
}

function renderLeaderboard() {
    // Calculate stats for all users
    const leaderboardData = users.map(u => {
        const totalPoints = (u.testHistory || []).reduce((sum, test) => sum + (test.score || 0), 0);
        const testsCount = (u.testHistory || []).length;
        return {
            id: u.id,
            name: u.username,
            points: totalPoints,
            tests: testsCount
        };
    });

    // Sort by points
    leaderboardData.sort((a, b) => b.points - a.points);

    leaderboardEl.innerHTML = "";
    leaderboardData.forEach((u, i) => {
        const isCurrent = currentUser && u.id === currentUser.id;
        const rank = i + 1;

        // Update current user rank badge
        if (isCurrent) {
            userRankEl.textContent = getRankString(rank);
        }

        const item = document.createElement("div");
        item.className = `leaderboard-item ${isCurrent ? 'current-user' : ''} rank-${rank}`;

        let rankDisplay = rank;
        if (rank === 1) rankDisplay = '<i class="fas fa-medal"></i>';
        else if (rank === 2) rankDisplay = '<i class="fas fa-medal"></i>';
        else if (rank === 3) rankDisplay = '<i class="fas fa-medal"></i>';

        item.innerHTML = `
            <div class="lb-rank">${rankDisplay}</div>
            <div class="lb-info">
                <span class="lb-name">${u.name} ${isCurrent ? '(You)' : ''}</span>
                <span class="lb-score">${u.tests} tests taken</span>
            </div>
            <div class="lb-points">${u.points} pts</div>
        `;
        leaderboardEl.appendChild(item);
    });
}

function getRankString(n) {
    const s = ["th", "st", "nd", "rd"],
        v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

//FILTER / STREAM
nextFilterBtn.addEventListener("click", () => {
    const type = userTypeSelect.value;
    if (!type) { alert("Select user type"); return; }
    filterBox.style.display = "none";
    subjectBox.style.display = "block";

    let streams = [];
    if (type === "school") streams = ["Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
    if (type === "college") streams = ["Class 11", "Class 12", "IIT", "Arts", "Science", "Commerce"];
    if (type === "professional") streams = ["IT", "Management", "Finance"];

    streamContainer.innerHTML = `
    <label>Choose Class/Stream:</label>
    <select id="stream">
      ${streams.map(s => `<option value="${s.toLowerCase()}">${s}</option>`).join("")}
    </select>
  `;

    document.getElementById("stream").addEventListener("change", loadSubjects);
    loadSubjects();
});

//SUBJECT
function loadSubjects() {
    const stream = document.getElementById("stream").value;
    let subjects = [];
    if (["class 5", "class 6"].includes(stream)) subjects = ["Maths", "Science", "GK", "English", "Social Studies", "Computer"];
    if (["class 7", "class 8"].includes(stream)) subjects = ["Maths", "Science", "History", "Geography", "English", "Computer"];
    if (["class 9", "class 10"].includes(stream)) subjects = ["Maths", "Physics", "Chemistry", "Biology", "English", "Computer"];
    if (["class 11", "class 12"].includes(stream)) subjects = ["Physics", "Chemistry", "Biology", "Maths", "English", "Computer Science"];
    if (stream === "iit") subjects = ["Programming", "DSA", "DBMS", "Mathematics", "Physics", "Chemistry"];
    if (stream === "arts") subjects = ["History", "Civics", "Literature", "Psychology", "Sociology", "Political Science"];
    if (stream === "science") subjects = ["Physics", "Chemistry", "Biology", "Mathematics", "Statistics", "Computer Science"];
    if (stream === "commerce") subjects = ["Economics", "Business", "Accountancy", "Statistics", "Mathematics", "Finance"];
    if (stream === "it") subjects = ["Web Dev", "AI/ML", "Cloud", "Cyber Security", "Data Science", "Networking"];
    if (stream === "management") subjects = ["Business", "Marketing", "HR", "Finance", "Operations", "Strategy"];
    if (stream === "finance") subjects = ["Banking", "Investment", "Economics", "Accounting", "Taxation", "Insurance"];

    subjectContainer.innerHTML = `
    <label>Choose Subject:</label>
    <select id="subject">
      ${subjects.map(s => `<option value="${s.toLowerCase()}">${s}</option>`).join("")}
    </select>
  `;
}

// GO TO QUIZ
goQuizBtn.addEventListener("click", () => {
    const subj = document.getElementById("subject");
    if (!subj || !subj.value) { alert("Select a subject"); return; }
    subjectBox.style.display = "none";
    startBox.style.display = "block";
});
