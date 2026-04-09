// main.js - Global functions for all pages

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.querySelector('.content-area');
    
    if (sidebar) sidebar.classList.toggle('collapsed');
    if (contentArea) contentArea.classList.toggle('expanded');
}

// Toggle submenus
function toggleSubmenu(menuId) {
    const submenu = document.getElementById(menuId);
    
    // Close all other submenus first
    const allSubmenus = document.querySelectorAll('.submenu');
    allSubmenus.forEach(menu => {
        if (menu.id !== menuId) {
            menu.classList.remove('show');
        }
    });
    
    // Toggle the clicked submenu
    if (submenu) {
        submenu.classList.toggle('show');
    }
}

// Load user info from session storage (from User Maintenance)
function loadUserInfo() {
    const userInfo = sessionStorage.getItem('currentUser');
    const userNameElement = document.getElementById('userName');
    
    if (userInfo && userNameElement) {
        try {
            const user = JSON.parse(userInfo);
            // Display the name from User Maintenance
            // Format: "First Name Last Name" or whatever is stored in the name field
            userNameElement.textContent = user.name || user.username || 'User';
            console.log("User loaded:", user.name);
        } catch (e) {
            console.error("Error parsing user info:", e);
            userNameElement.textContent = 'User';
        }
    } else if (userNameElement) {
        // Default if no session
        userNameElement.textContent = 'Guest User';
    }
}

// Check if user is logged in (redirect to login if not)
function checkAuth() {
    const userInfo = sessionStorage.getItem('currentUser');
    const currentPage = window.location.pathname.split('/').pop();
    
    // List of pages that don't require authentication
    const publicPages = ['login.html', 'index.html'];
    
    if (!userInfo && !publicPages.includes(currentPage)) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize common elements on all pages
document.addEventListener('DOMContentLoaded', function() {
    // Load user info in the header
    loadUserInfo();
    
    // Check authentication (skip on login page)
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'login.html') {
        checkAuth();
    }
    
    // Setup sidebar toggle
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }
    
    // Close submenus when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideSubmenu = event.target.closest('.has-submenu');
        if (!isClickInsideSubmenu) {
            const submenus = document.querySelectorAll('.submenu.show');
            submenus.forEach(submenu => {
                submenu.classList.remove('show');
            });
        }
    });
});

// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}