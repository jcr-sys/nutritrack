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