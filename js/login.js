// ===== LOGIN PAGE FUNCTIONALITY =====

// Display current date when page loads (exact date)
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        
        // Format: Thursday, March 19, 2026
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Handle form submission - NO RESTRICTIONS, DIRECT TO DASHBOARD
function handleLogin(event) {
    // Prevent the form from actually submitting
    event.preventDefault();
    
    // Get input values (optional - we don't need them for now)
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const remember = document.getElementById('remember').checked;
    
    // Create a default user (you can change this later)
    const userData = {
        username: username || 'bns_worker',
        role: 'BNS Worker',
        name: 'Maria Santos',
        loginTime: new Date().toISOString(),
        remember: remember
    };
    
    // Store in session storage
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
    
    // If remember me is checked, store username
    if (remember) {
        localStorage.setItem('rememberedUser', username);
    } else {
        localStorage.removeItem('rememberedUser');
    }
    
    // DIRECT REDIRECT TO DASHBOARD - NO DELAY, NO VALIDATION
    window.location.href = 'dashboard.html';
}

// Check for remembered username
function checkRememberedUser() {
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
        document.getElementById('username').value = remembered;
        document.getElementById('remember').checked = true;
    }
}

// Add input animations (just for visual effect)
function addInputAnimations() {
    const inputs = document.querySelectorAll('.form-group input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    checkRememberedUser();
    addInputAnimations();
    
    // Add form submit event listener
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Also add direct click event to button as backup
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'dashboard.html';
        });
    }
    
    // Add enter key support
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            window.location.href = 'dashboard.html';
        }
    });
});