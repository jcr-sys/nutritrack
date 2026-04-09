// login.js
// ===== LOGIN PAGE FUNCTIONALITY WITH FIREBASE =====
// Authenticates against existing User Maintenance records in Firestore

// Display current date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Handle login with Firebase using existing User Maintenance records
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const remember = document.getElementById('remember').checked;
    const loginBtn = document.querySelector('.login-btn');
    
    errorMessage.textContent = '';
    
    if (!username || !password) {
        errorMessage.textContent = 'Please enter both username and password';
        return;
    }
    
    // Show loading state
    const originalBtnText = loginBtn.textContent;
    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;
    
    try {
        // Query the users collection for matching username
        const usersSnapshot = await db.collection('users')
            .where('username', '==', username)
            .limit(1)
            .get();
        
        if (usersSnapshot.empty) {
            errorMessage.textContent = 'Invalid username or password';
            loginBtn.textContent = originalBtnText;
            loginBtn.disabled = false;
            return;
        }
        
        let userData = null;
        let docId = null;
        
        usersSnapshot.forEach(doc => {
            userData = doc.data();
            docId = doc.id;
        });
        
        // Check password
        if (userData.password !== password) {
            errorMessage.textContent = 'Invalid username or password';
            loginBtn.textContent = originalBtnText;
            loginBtn.disabled = false;
            return;
        }
        
        // Prepare session data from existing user record
        const sessionUser = {
            uid: docId,
            user_id: userData.user_id,
            username: userData.username,
            name: userData.name,
            position: userData.position,
            department: userData.department,
            access_level: userData.access_level,
            role: userData.access_level,
            staff_id: userData.staff_id,
            login_time: new Date().toISOString()
        };
        
        // Store in session storage
        sessionStorage.setItem('currentUser', JSON.stringify(sessionUser));
        
        // Handle remember me
        if (remember) {
            localStorage.setItem('rememberedUser', username);
        } else {
            localStorage.removeItem('rememberedUser');
        }
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        loginBtn.textContent = originalBtnText;
        loginBtn.disabled = false;
    }
}

// Check for remembered user
function checkRememberedUser() {
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
        document.getElementById('username').value = remembered;
        document.getElementById('remember').checked = true;
        document.getElementById('password').focus();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    checkRememberedUser();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});