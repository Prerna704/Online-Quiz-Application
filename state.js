let questions = [], currentQ = 0, score = 0, timer, timeLeft = 30;
let userAnswers = [];
let testHistory = [];
let users = JSON.parse(localStorage.getItem('quizAppUsers')) || [];
let currentUser = null;

// Elements
const authBox = document.getElementById("auth-box");
const mainContainer = document.querySelector(".main-container");

// Auth Tabs
const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const goToSignup = document.getElementById("go-to-signup");
const goToLogin = document.getElementById("go-to-login");

// Login Form
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");

// Signup Form
const signupUsername = document.getElementById("signup-username");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const signupBtn = document.getElementById("signup-btn");

// Dashboard
const profilePicInput = document.getElementById("profile-pic");
const userDisplay = document.getElementById("user-display");
const emailDisplay = document.getElementById("email-display");
const profileDisplay = document.getElementById("profile-display");
const totalTestsEl = document.getElementById("total-tests");
const testHistoryEl = document.getElementById("test-history");
const leaderboardEl = document.getElementById("leaderboard");
const userRankEl = document.getElementById("user-rank");
const btnHistory = document.getElementById("btn-history");
const btnLeaderboard = document.getElementById("btn-leaderboard");
const logoutBtn = document.getElementById("logout-btn");

// Filter & Subject
const filterBox = document.querySelector(".filter-box");
const userTypeSelect = document.getElementById("user-type");
const nextFilterBtn = document.getElementById("next-filter-btn");
const subjectBox = document.querySelector(".subject-box");
const streamContainer = document.getElementById("stream-container");
const subjectContainer = document.getElementById("subject-container");
const goQuizBtn = document.getElementById("go-quiz-btn");
const startBox = document.querySelector(".start-box");
const startBtn = document.getElementById("start-btn");
const difficultySelect = document.getElementById("difficulty");

// Quiz
const quizBox = document.querySelector(".quiz-box");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const saveNextBtn = document.getElementById("save-next-btn");
const submitBtn = document.getElementById("submit-btn");
const restartBtn = document.getElementById("restart-btn");
const timerEl = document.getElementById("timer");
const resultEl = document.getElementById("result");
const prevBtn = document.getElementById("prev-btn");
const detailedFeedbackEl = document.getElementById("detailed-feedback");
const paletteEl = document.getElementById("question-palette");
const loadingOverlay = document.getElementById("loading-overlay");

// Settings
const settingsBox = document.querySelector(".settings-box");
const settingsBtn = document.getElementById("settings-btn");
const saveProfileBtn = document.getElementById("save-profile-btn");
const cancelSettingsBtn = document.getElementById("cancel-settings-btn");
const editUsername = document.getElementById("edit-username");
const editPassword = document.getElementById("edit-password");
