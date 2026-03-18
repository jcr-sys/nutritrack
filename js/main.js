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
    if (submenu) submenu.classList.toggle('show');
}

// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}