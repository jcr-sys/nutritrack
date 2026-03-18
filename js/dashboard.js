// ===== DASHBOARD FUNCTIONALITY =====

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

// Load user info from session storage
function loadUserInfo() {
    const userInfo = sessionStorage.getItem('currentUser');
    const userNameElement = document.getElementById('userName');
    
    if (userInfo && userNameElement) {
        try {
            const user = JSON.parse(userInfo);
            userNameElement.textContent = user.name || 'Maria Santos';
        } catch (e) {
            userNameElement.textContent = 'Maria Santos';
        }
    } else if (userNameElement) {
        userNameElement.textContent = 'Maria Santos';
    }
}

// Load dashboard statistics
function loadDashboardStats() {
    const elements = {
        totalPatients: document.getElementById('totalPatients'),
        totalChildren: document.getElementById('totalChildren'),
        totalPregnant: document.getElementById('totalPregnant'),
        totalSenior: document.getElementById('totalSenior')
    };
    
    if (elements.totalPatients) elements.totalPatients.textContent = '1,234';
    if (elements.totalChildren) elements.totalChildren.textContent = '567';
    if (elements.totalPregnant) elements.totalPregnant.textContent = '89';
    if (elements.totalSenior) elements.totalSenior.textContent = '210';
}

// Create pie chart
function createPieChart() {
    const ctx = document.getElementById('patientPieChart');
    if (!ctx) return;
    
    // Sample data
    const data = {
        labels: ['Children', 'Pregnant', 'Senior', 'General'],
        datasets: [{
            data: [567, 89, 210, 368],
            backgroundColor: [
                '#2B6896',  // Primary color for Children
                '#4A90E2',  // Lighter blue for Pregnant
                '#6C8EB2',  // Medium blue for Senior
                '#95B8D1'   // Lightest blue for General
            ],
            borderColor: 'white',
            borderWidth: 2,
        }]
    };
    
    // Create pie chart using Chart.js
    if (typeof Chart !== 'undefined') {
        new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false, // Hide default legend, we'll use custom legend
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } else {
        console.log('Chart.js not loaded');
    }
}

// Handle sidebar toggle button
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }
    
    // Load user info and stats
    loadUserInfo();
    loadDashboardStats();
    
    // Create pie chart
    createPieChart();
    
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