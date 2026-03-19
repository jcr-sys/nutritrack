// Toggle sidebar (collapse/expand)
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

// ===== Sidebar Submenu Handling =====
document.addEventListener('DOMContentLoaded', () => {
    const submenus = document.querySelectorAll('.sidebar .submenu');

    submenus.forEach(menu => {
        // Collapse all submenus by default
        menu.classList.remove('show');

        // Check if this submenu contains an active link
        const hasActive = menu.querySelector('li.active');
        if (hasActive) {
            menu.classList.add('show'); // expand only active submenu
        }
    });
});
