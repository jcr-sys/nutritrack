// ===== USER MAINTENANCE PAGE FUNCTIONALITY =====

// Sample user data
let users = [
    {
        user_id: '1',
        username: 'mmondejar',
        password: 'admin123',
        name: 'Mark Noe Mondejar',
        position: 'IT Manager',
        department: 'IT',
        date_created: '2025-11-12',
        access_level: 'Admin'
    },
    {
        user_id: '2',
        username: 'msantos',
        password: 'bns123',
        name: 'Maria Santos',
        position: 'BNS Worker',
        department: 'Health Center',
        date_created: '2025-10-15',
        access_level: 'BNS Worker'
    },
    {
        user_id: '3',
        username: 'jcruz',
        password: 'nurse123',
        name: 'Jane Cruz',
        position: 'Nurse',
        department: 'Health Center',
        date_created: '2025-09-20',
        access_level: 'Nurse'
    },
    {
        user_id: '4',
        username: 'dreyes',
        password: 'nutri123',
        name: 'Dr. Reyes',
        position: 'Nutritionist',
        department: 'Nutrition',
        date_created: '2025-08-05',
        access_level: 'Nutritionist'
    },
    {
        user_id: '5',
        username: 'jdela',
        password: 'staff123',
        name: 'Juan Dela Cruz',
        position: 'Staff',
        department: 'Administration',
        date_created: '2025-11-01',
        access_level: 'Staff'
    },
    {
        user_id: '6',
        username: 'alopez',
        password: 'view123',
        name: 'Ana Lopez',
        position: 'External Viewer',
        department: 'LGU',
        date_created: '2025-11-18',
        access_level: 'View Only'
    },
    {
        user_id: '7',
        username: 'rflores',
        password: 'bns456',
        name: 'Rosa Flores',
        position: 'BNS Worker',
        department: 'Health Center',
        date_created: '2025-10-22',
        access_level: 'BNS Worker'
    },
    {
        user_id: '8',
        username: 'psantos',
        password: 'nurse456',
        name: 'Pedro Santos',
        position: 'Nurse',
        department: 'Health Center',
        date_created: '2025-09-28',
        access_level: 'Nurse'
    },
    {
        user_id: '9',
        username: 'cgonzales',
        password: 'admin456',
        name: 'Carla Gonzales',
        position: 'System Administrator',
        department: 'IT',
        date_created: '2025-07-10',
        access_level: 'Admin'
    },
    {
        user_id: '10',
        username: 'lfernandez',
        password: 'staff456',
        name: 'Luis Fernandez',
        position: 'Staff',
        department: 'Records',
        date_created: '2025-11-05',
        access_level: 'Staff'
    }
];

// Display current date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Get access level badge class
function getAccessBadgeClass(accessLevel) {
    switch(accessLevel) {
        case 'Admin': return 'access-admin';
        case 'BNS Worker': return 'access-bns';
        case 'Nurse': return 'access-nurse';
        case 'Nutritionist': return 'access-nutritionist';
        case 'Staff': return 'access-staff';
        case 'View Only': return 'access-view';
        default: return '';
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Mask password for display
function maskPassword(password) {
    return '•'.repeat(Math.min(password.length, 8));
}

// Load users into table
function loadUsers() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        const accessBadgeClass = getAccessBadgeClass(user.access_level);
        const maskedPassword = maskPassword(user.password);
        
        row.innerHTML = `
            <td>${user.user_id}</td>
            <td>${user.username}</td>
            <td><span class="password-mask" title="${user.password}">${maskedPassword}</span></td>
            <td>${user.name}</td>
            <td>${user.position}</td>
            <td>${user.department}</td>
            <td>${formatDate(user.date_created)}</td>
            <td><span class="access-badge ${accessBadgeClass}">${user.access_level}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewUser('${user.user_id}')">View</button>
                    <button class="edit-btn" onclick="editUser('${user.user_id}')">Edit</button>
                    <button class="reset-password-btn" onclick="resetPassword('${user.user_id}')">Reset</button>
                    <button class="delete-btn" onclick="deleteUser('${user.user_id}')">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Search users
function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const filteredUsers = users.filter(user => 
        user.user_id.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm) ||
        user.name.toLowerCase().includes(searchTerm) ||
        user.position.toLowerCase().includes(searchTerm) ||
        user.department.toLowerCase().includes(searchTerm) ||
        user.access_level.toLowerCase().includes(searchTerm)
    );
    
    displayFilteredUsers(filteredUsers);
}

// Sort users
function sortUsers() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedUsers = [...users].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'user_id') {
            return parseInt(valA) - parseInt(valB);
        }
        if (sortBy === 'date_created') {
            return new Date(valA) - new Date(valB);
        }
        return String(valA).localeCompare(String(valB));
    });
    
    displayFilteredUsers(sortedUsers);
}

// Display filtered/sorted users
function displayFilteredUsers(userList) {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    userList.forEach(user => {
        const row = document.createElement('tr');
        const accessBadgeClass = getAccessBadgeClass(user.access_level);
        const maskedPassword = maskPassword(user.password);
        
        row.innerHTML = `
            <td>${user.user_id}</td>
            <td>${user.username}</td>
            <td><span class="password-mask" title="${user.password}">${maskedPassword}</span></td>
            <td>${user.name}</td>
            <td>${user.position}</td>
            <td>${user.department}</td>
            <td>${formatDate(user.date_created)}</td>
            <td><span class="access-badge ${accessBadgeClass}">${user.access_level}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewUser('${user.user_id}')">View</button>
                    <button class="edit-btn" onclick="editUser('${user.user_id}')">Edit</button>
                    <button class="reset-password-btn" onclick="resetPassword('${user.user_id}')">Reset</button>
                    <button class="delete-btn" onclick="deleteUser('${user.user_id}')">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Show add user modal
function showAddUserModal() {
    document.getElementById('addUserModal').classList.add('show');
}

// Hide add user modal
function hideAddUserModal() {
    document.getElementById('addUserModal').classList.remove('show');
    clearUserForm();
}

// Clear user form
function clearUserForm() {
    document.getElementById('userForm').reset();
}

// Generate new user ID
function generateUserId() {
    const lastId = Math.max(...users.map(u => parseInt(u.user_id)));
    return (lastId + 1).toString();
}

// Save new user
function saveUser() {
    // Get form values
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const name = document.getElementById('name').value.trim();
    const position = document.getElementById('position').value.trim();
    const department = document.getElementById('department').value.trim();
    const accessLevel = document.getElementById('accessLevel').value;
    
    // Validate required fields
    if (!username || !password || !name || !position || !department || !accessLevel) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const dateCreated = today.toISOString().split('T')[0];
    
    // Create new user object
    const newUser = {
        user_id: generateUserId(),
        username: username,
        password: password,
        name: name,
        position: position,
        department: department,
        date_created: dateCreated,
        access_level: accessLevel
    };
    
    // Add to users array
    users.push(newUser);
    
    // Reload table
    loadUsers();
    
    // Hide modal
    hideAddUserModal();
    
    alert(`User ${username} created successfully`);
}

// View user
function viewUser(userId) {
    const user = users.find(u => u.user_id === userId);
    if (user) {
        alert(`User Details:
ID: ${user.user_id}
Username: ${user.username}
Name: ${user.name}
Position: ${user.position}
Department: ${user.department}
Date Created: ${formatDate(user.date_created)}
Access Level: ${user.access_level}`);
    }
}

// Edit user
function editUser(userId) {
    const user = users.find(u => u.user_id === userId);
    if (user) {
        alert(`Edit user ${user.username}\n\nThis feature will be implemented in the next phase.`);
    }
}

// Reset password
function resetPassword(userId) {
    const user = users.find(u => u.user_id === userId);
    if (user) {
        if (confirm(`Reset password for user ${user.username}?`)) {
            // In a real app, you'd send a reset email or generate a temporary password
            const tempPassword = 'temp123';
            user.password = tempPassword;
            loadUsers();
            alert(`Password for ${user.username} has been reset to: ${tempPassword}`);
        }
    }
}

// Delete user
function deleteUser(userId) {
    const user = users.find(u => u.user_id === userId);
    if (user) {
        if (confirm(`Delete user ${user.username}? This action cannot be undone.`)) {
            const index = users.findIndex(u => u.user_id === userId);
            if (index !== -1) {
                users.splice(index, 1);
                loadUsers();
                alert(`User ${user.username} has been deleted.`);
            }
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadUsers();
    
    // Add search on enter key
    document.getElementById('userSearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchUsers();
        }
    });
});