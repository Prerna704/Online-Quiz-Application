// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('currentQuizUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        userDisplay.textContent = "Name: " + currentUser.username;
        emailDisplay.textContent = "Email: " + currentUser.email;
        testHistory = currentUser.testHistory || [];

        // Load profile photo
        if (currentUser.profilePic) {
            profileDisplay.src = currentUser.profilePic;
        }

        authBox.style.display = "none";
        mainContainer.style.display = "flex";
        filterBox.style.display = "block";
        updateDashboard();
    }
});
