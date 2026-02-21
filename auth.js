// Switch between login and signup forms
loginTab.addEventListener("click", () => switchAuthTab("login"));
signupTab.addEventListener("click", () => switchAuthTab("signup"));
goToSignup.addEventListener("click", () => switchAuthTab("signup"));
goToLogin.addEventListener("click", () => switchAuthTab("login"));

function switchAuthTab(tab) {
    if (tab === "login") {
        loginTab.classList.add("active");
        signupTab.classList.remove("active");
        loginForm.classList.add("active");
        signupForm.classList.remove("active");
    } else {
        signupTab.classList.add("active");
        loginTab.classList.remove("active");
        signupForm.classList.add("active");
        loginForm.classList.remove("active");
    }
}

// SIGN UP 
signupBtn.addEventListener("click", () => {
    let username = signupUsername.value;
    let email = signupEmail.value;
    let password = signupPassword.value;

    if (!username || !email || !password) {
        showMessage("Please fill all fields", "error");
        return;
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        showMessage("User already exists with this email", "error");
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now(),
        username,
        email,
        password,
        createdAt: new Date().toISOString(),
        testHistory: []
    };

    users.push(newUser);
    localStorage.setItem('quizAppUsers', JSON.stringify(users));

    showMessage("Account created successfully! Please login.", "success");
    switchAuthTab("login");

    // Clear signup form
    signupUsername.value = "";
    signupEmail.value = "";
    signupPassword.value = "";
});

//  LOGIN 
loginBtn.addEventListener("click", () => {
    let email = loginEmail.value;
    let password = loginPassword.value;

    if (!email || !password) {
        showMessage("Please enter email and password", "error");
        return;
    }

    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        showMessage("Invalid email or password", "error");
        return;
    }

    // Login successful
    currentUser = user;
    userDisplay.textContent = "Name: " + user.username;
    emailDisplay.textContent = "Email: " + user.email;

    // Load user data
    testHistory = user.testHistory || [];

    // Save session
    localStorage.setItem('currentQuizUser', JSON.stringify(user));

    // Display profile photo if exists
    if (user.profilePic) {
        profileDisplay.src = user.profilePic;
    } else {
        profileDisplay.src = "https://via.placeholder.com/80";
    }

    authBox.style.display = "none";
    mainContainer.style.display = "flex";
    filterBox.style.display = "block";
    updateDashboard();
});

//  ENTER BUTTON LOGIN 
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && authBox.style.display !== "none") {
        if (loginForm.classList.contains("active")) {
            loginBtn.click();
        } else {
            signupBtn.click();
        }
    }
});
