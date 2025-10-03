let questions=[], currentQ=0, score=0, timer, timeLeft=30;
let testHistory=[];
let users = JSON.parse(localStorage.getItem('quizAppUsers')) || [];
let currentUser = null;

// Elements
const authBox=document.getElementById("auth-box");
const mainContainer=document.querySelector(".main-container");

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
const profilePicInput=document.getElementById("profile-pic");
const userDisplay=document.getElementById("user-display");
const emailDisplay=document.getElementById("email-display");
const profileDisplay=document.getElementById("profile-display");
const totalTestsEl=document.getElementById("total-tests");
const testHistoryEl=document.getElementById("test-history");
const logoutBtn=document.getElementById("logout-btn");

// Filter & Subject
const filterBox=document.querySelector(".filter-box");
const userTypeSelect=document.getElementById("user-type");
const nextFilterBtn=document.getElementById("next-filter-btn");
const subjectBox=document.querySelector(".subject-box");
const streamContainer=document.getElementById("stream-container");
const subjectContainer=document.getElementById("subject-container");
const goQuizBtn=document.getElementById("go-quiz-btn");
const startBox=document.querySelector(".start-box");
const startBtn=document.getElementById("start-btn");
const difficultySelect=document.getElementById("difficulty");

// Quiz
const quizBox=document.querySelector(".quiz-box");
const questionEl=document.getElementById("question");
const optionsEl=document.getElementById("options");
const nextBtn=document.getElementById("next-btn");
const restartBtn=document.getElementById("restart-btn");
const timerEl=document.getElementById("timer");
const resultEl=document.getElementById("result");


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
signupBtn.addEventListener("click",()=>{
  let username=signupUsername.value;
  let email=signupEmail.value;
  let password=signupPassword.value;
  
  if(!username||!email||!password){ 
    showMessage("Please fill all fields", "error");
    return; 
  }
  
  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if(existingUser){
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
loginBtn.addEventListener("click",()=>{
  let email=loginEmail.value;
  let password=loginPassword.value;
  
  if(!email||!password){ 
    showMessage("Please enter email and password", "error");
    return; 
  }
  
  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  if(!user){
    showMessage("Invalid email or password", "error");
    return;
  }
  
  // Login successful
  currentUser = user;
  userDisplay.textContent=user.username;
  emailDisplay.textContent=user.email;
  
  // Load user data
  testHistory = user.testHistory || [];
  
  authBox.style.display="none";
  mainContainer.style.display="flex";
  filterBox.style.display="block";
  updateDashboard();
});

//  ENTER BUTTON LOGIN 
document.addEventListener("keydown",(e)=>{
  if(e.key==="Enter" && authBox.style.display!=="none"){
    if(loginForm.classList.contains("active")){
      loginBtn.click();
    } else {
      signupBtn.click();
    }
  }
});

// PROFILE UPLOAD
profilePicInput.addEventListener("change",()=>{
  const file=profilePicInput.files[0];
  if(file){
    const reader=new FileReader();
    reader.onload=e=>{ profileDisplay.src=e.target.result; }
    reader.readAsDataURL(file);
  }
});

//  LOGOUT
logoutBtn.addEventListener("click",()=>{ 
  // Save user data before logout
  if(currentUser){
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if(userIndex !== -1){
      users[userIndex].testHistory = testHistory;
      localStorage.setItem('quizAppUsers', JSON.stringify(users));
    }
  }
  location.reload(); 
});

// DASHBOARD UPDATE
function updateDashboard(){
  totalTestsEl.textContent=testHistory.length;
  testHistoryEl.innerHTML="";
  testHistory.forEach((t,i)=>{
    const p=document.createElement("p");
    p.textContent=`Test ${i+1}: ${t.score}/${t.total} - ${t.subject} (${t.difficulty})`;
    testHistoryEl.appendChild(p);
  });
}

//FILTER / STREAM
nextFilterBtn.addEventListener("click",()=>{
  const type=userTypeSelect.value;
  if(!type){ alert("Select user type"); return; }
  filterBox.style.display="none";
  subjectBox.style.display="block";

  let streams=[];
  if(type==="school") streams=["Class 5","Class 6","Class 7","Class 8","Class 9","Class 10"];
  if(type==="college") streams=["Class 11","Class 12","IIT","Arts","Science","Commerce"];
  if(type==="professional") streams=["IT","Management","Finance"];

  streamContainer.innerHTML=`
    <label>Choose Class/Stream:</label>
    <select id="stream">
      ${streams.map(s=>`<option value="${s.toLowerCase()}">${s}</option>`).join("")}
    </select>
  `;

  document.getElementById("stream").addEventListener("change",loadSubjects);
  loadSubjects();
});

//SUBJECT
function loadSubjects(){
  const stream=document.getElementById("stream").value;
  let subjects=[];
  if(["class 5","class 6"].includes(stream)) subjects=["Maths","Science","GK","English","Social Studies","Computer"];
  if(["class 7","class 8"].includes(stream)) subjects=["Maths","Science","History","Geography","English","Computer"];
  if(["class 9","class 10"].includes(stream)) subjects=["Maths","Physics","Chemistry","Biology","English","Computer"];
  if(["class 11","class 12"].includes(stream)) subjects=["Physics","Chemistry","Biology","Maths","English","Computer Science"];
  if(stream==="iit") subjects=["Programming","DSA","DBMS","Mathematics","Physics","Chemistry"];
  if(stream==="arts") subjects=["History","Civics","Literature","Psychology","Sociology","Political Science"];
  if(stream==="science") subjects=["Physics","Chemistry","Biology","Mathematics","Statistics","Computer Science"];
  if(stream==="commerce") subjects=["Economics","Business","Accountancy","Statistics","Mathematics","Finance"];
  if(stream==="it") subjects=["Web Dev","AI/ML","Cloud","Cyber Security","Data Science","Networking"];
  if(stream==="management") subjects=["Business","Marketing","HR","Finance","Operations","Strategy"];
  if(stream==="finance") subjects=["Banking","Investment","Economics","Accounting","Taxation","Insurance"];

  subjectContainer.innerHTML=`
    <label>Choose Subject:</label>
    <select id="subject">
      ${subjects.map(s=>`<option value="${s.toLowerCase()}">${s}</option>`).join("")}
    </select>
  `;
}

// GO TO QUIZ
goQuizBtn.addEventListener("click",()=>{
  const subj=document.getElementById("subject");
  if(!subj||!subj.value){ alert("Select a subject"); return; }
  subjectBox.style.display="none";
  startBox.style.display="block";
});

//QUIZ MAPPING
const subjectToCategory={
  maths:19,science:17,gk:9,history:23,civics:23,literature:10,english:10,
  physics:19,chemistry:17,biology:17,programming:18,dsa:18,dbms:18,
  economics:20,business:20,accountancy:20,"web dev":18,"ai/ml":18,cloud:18,
  marketing:20,hr:20,banking:20,investment:20,geography:22,computer:18,
  "computer science":18,"social studies":24,psychology:24,sociology:24,
  "political science":24,mathematics:19,statistics:19,finance:20,
  "cyber security":18,"data science":18,networking:18,operations:20,
  strategy:20,accounting:20,taxation:20,insurance:20
};

//START QUIZ
startBtn.addEventListener("click",()=>{
  const subj=document.getElementById("subject").value;
  const category=subjectToCategory[subj]||9;
  const difficulty=difficultySelect.value;
  fetchQuestions(category,difficulty);
});

//FETCH QUESTIONS
async function fetchQuestions(category,difficulty){
  const url=`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`;
  try {
    const res=await fetch(url);
    const data=await res.json();
    questions=data.results.map(q=>{
      let options=[...q.incorrect_answers,q.correct_answer];
      options.sort(()=>Math.random()-0.5);
      return{
        question:decodeHTML(q.question),
        options:options.map(o=>decodeHTML(o)),
        answer:decodeHTML(q.correct_answer)
      }
    });
    startQuiz();
  } catch(error) {
    alert("Failed to fetch questions. Please try again.");
  }
}

function decodeHTML(str){ let txt=document.createElement("textarea"); txt.innerHTML=str; return txt.value; }

// QUIZ FLOW 
function startQuiz(){
  currentQ=0; score=0;
  resultEl.style.display="none"; 
  restartBtn.style.display="none";
   nextBtn.style.display="none";
  questionEl.style.display="block";
   optionsEl.style.display="block"; 
   timerEl.style.display="block";
  startBox.style.display="none";
   quizBox.style.display="block";
  showQuestion(); startTimer();
}

function showQuestion(){
  resetState();
  const q=questions[currentQ];
  questionEl.textContent=q.question;
  q.options.forEach(opt=>{
    const btn=document.createElement("div");
    btn.classList.add("option"); btn.textContent=opt;
    btn.onclick=()=>selectAnswer(btn,q.answer);
    optionsEl.appendChild(btn);
  });
}

function resetState(){
  optionsEl.innerHTML=""; 
  nextBtn.style.display="none";
  clearInterval(timer);
   timeLeft=30;
   timerEl.textContent=`Time: ${timeLeft}s`;
}

function selectAnswer(selected,correct){
  document.querySelectorAll(".option").forEach(opt=>{
    opt.style.pointerEvents="none"; 
    opt.classList.remove("active-option");
  });
  selected.classList.add("active-option");
  if(selected.textContent===correct){ selected.classList.add("correct"); score++; }
  else{ selected.classList.add("wrong");
   document.querySelectorAll(".option").forEach(opt=>{ if(opt.textContent===correct) opt.classList.add("correct"); });
   }
  nextBtn.style.display="inline-block";
   clearInterval(timer);
}

function nextQuestion(){
  currentQ++; if(currentQ<questions.length) showQuestion();
  else showResult();
}

function showResult(){
  questionEl.style.display="none";
   optionsEl.style.display="none";
    timerEl.style.display="none";
     nextBtn.style.display="none";
  resultEl.style.display="block"; 
  restartBtn.style.display="inline-block";
  resultEl.textContent=`🎉 Your Score: ${score} / ${questions.length}`;
  
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
  if(currentUser){
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if(userIndex !== -1){
      users[userIndex].testHistory = testHistory;
      localStorage.setItem('quizAppUsers', JSON.stringify(users));
    }
  }
  
  updateDashboard();
}

nextBtn.addEventListener("click",nextQuestion);
restartBtn.addEventListener("click",()=>{
  quizBox.style.display="none"; 
  filterBox.style.display="block";
});

function startTimer(){
  timer=setInterval(()=>{
    timeLeft--; timerEl.textContent=`Time: ${timeLeft}s`;
    if(timeLeft<=0){ clearInterval(timer);
   nextBtn.style.display="inline-block"; document.querySelectorAll(".option").forEach(opt=>opt.style.pointerEvents="none"); }
  },1000);
}

// Utility function to show messages
function showMessage(message, type) {
  // Remove existing messages
  const existingMessages = document.querySelectorAll('.success-message, .error-message');
  existingMessages.forEach(msg => msg.remove());
  
  const messageDiv = document.createElement('div');
  messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
  messageDiv.textContent = message;
  
  const activeForm = document.querySelector('.auth-form.active');
  activeForm.insertBefore(messageDiv, activeForm.firstChild);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('currentQuizUser');
  if(savedUser){
    currentUser = JSON.parse(savedUser);
    userDisplay.textContent = currentUser.username;
    emailDisplay.textContent = currentUser.email;
    testHistory = currentUser.testHistory || [];
    
    authBox.style.display="none";
    mainContainer.style.display="flex";
    filterBox.style.display="block";
    updateDashboard();
  }
});