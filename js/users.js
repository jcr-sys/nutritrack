// users.js
// ===== USER MAINTENANCE PAGE WITH FIREBASE =====

let allUsers = [];
let allStaff = [];

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

// Load staff for dropdown
async function loadStaffForDropdown() {
    try {
        const staffSelect = document.getElementById('staffId');
        if (!staffSelect) return;
        
        staffSelect.innerHTML = '<option value="">Loading staff...</option>';
        allStaff = [];
        
        const snapshot = await db.collection('staff').orderBy('doctor_id').get();
        
        staffSelect.innerHTML = '<option value="">Select Staff Member</option>';
        
        if (snapshot.empty) {
            staffSelect.innerHTML = '<option value="">No staff found. Please add staff first.</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const staff = doc.data();
            allStaff.push(staff);
            const option = document.createElement('option');
            option.value = staff.doc_id;
            option.textContent = `${staff.doctor_id} - ${staff.first_name} ${staff.last_name} (${staff.specialty})`;
            staffSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error("Error loading staff:", error);
        const staffSelect = document.getElementById('staffId');
        if (staffSelect) {
            staffSelect.innerHTML = '<option value="">Error loading staff</option>';
        }
    }
}

// Update staff info when selected
function updateStaffInfo() {
    const staffSelect = document.getElementById('staffId');
    const selectedValue = staffSelect.value;
    const nameInput = document.getElementById('name');
    const positionInput = document.getElementById('position');
    const departmentInput = document.getElementById('department');
    const usernameInput = document.getElementById('username');
    
    if (selectedValue && allStaff.length > 0) {
        const staff = allStaff.find(s => s.doc_id === selectedValue);
        if (staff) {
            // Set name
            nameInput.value = `${staff.first_name} ${staff.middle_name ? staff.middle_name + ' ' : ''}${staff.last_name}`;
            // Set position from specialty
            positionInput.value = staff.specialty;
            // Set department
            departmentInput.value = staff.department || getDepartmentFromSpecialty(staff.specialty);
            // Auto-generate username from name
            const generatedUsername = `${staff.first_name.toLowerCase()}.${staff.last_name.toLowerCase()}`;
            usernameInput.value = generatedUsername;
        } else {
            clearStaffFields();
        }
    } else {
        clearStaffFields();
    }
}

// Get department based on specialty
function getDepartmentFromSpecialty(specialty) {
    switch(specialty) {
        case 'Pediatrics':
            return 'Pediatrics Department';
        case 'Obstetrics and Gynecology':
            return 'Obstetrics Department';
        case 'Geriatrics':
            return 'Geriatrics Department';
        case 'BNS Worker':
            return 'BNS';
        case 'Nurse':
            return 'Nursing';
        case 'IT':
            return 'IT Department';
        default:
            return 'Health Center';
    }
}

// Clear staff fields
function clearStaffFields() {
    document.getElementById('name').value = '';
    document.getElementById('position').value = '';
    document.getElementById('department').value = '';
}

// Get access level badge class
function getAccessBadgeClass(accessLevel) {
    switch(accessLevel) {
        case 'Admin': return 'access-admin';
        case 'BNS Worker': return 'access-bns';
        case 'Nurse': return 'access-nurse';
        case 'Nutritionist': return 'access-nutritionist';
        case 'Doctor': return 'access-nurse';
        case 'Staff': return 'access-staff';
        case 'View Only': return 'access-view';
        default: return '';
    }
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Mask password for display
function maskPassword(password) {
    return '•'.repeat(Math.min(password.length, 8));
}

// Load users from Firestore
async function loadUsers() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Loading users...<\/div>';

    try {
        const snapshot = await db.collection('users').orderBy('user_id').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<td><td colspan="9" style="text-align: center;">No users found. Click "+ Add User" to add.<\/div>';
            allUsers = [];
            return;
        }
        
        allUsers = [];
        tableBody.innerHTML = '';
        
        snapshot.forEach(doc => {
            const user = doc.data();
            allUsers.push(user);
            const accessBadgeClass = getAccessBadgeClass(user.access_level);
            const maskedPassword = maskPassword(user.password);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.user_id || '-'}<\/div>
                <td>${user.username || '-'}<\/div>
                <td><span class="password-mask" title="${user.password}">${maskedPassword}</span><\/div>
                <td>${user.name || '-'}<\/div>
                <td>${user.position || '-'}<\/div>
                <td>${user.department || '-'}<\/div>
                <td>${formatDate(user.date_created)}<\/div>
                <td><span class="access-badge ${accessBadgeClass}">${user.access_level}</span><\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewUser('${user.user_id}')">View</button>
                        <button class="edit-btn" onclick="editUser('${user.user_id}')">Edit</button>
                        <button class="reset-password-btn" onclick="resetPassword('${user.user_id}')">Reset</button>
                        <button class="delete-btn" onclick="deleteUser('${user.user_id}')">Delete</button>
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading users:", error);
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
    }
}

// Search users
function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const filteredUsers = allUsers.filter(user => 
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
    const sortedUsers = [...allUsers].sort((a, b) => {
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
        const accessBadgeClass = getAccessBadgeClass(user.access_level);
        const maskedPassword = maskPassword(user.password);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.user_id || '-'}<\/div>
            <td>${user.username || '-'}<\/div>
            <td><span class="password-mask" title="${user.password}">${maskedPassword}</span><\/div>
            <td>${user.name || '-'}<\/div>
            <td>${user.position || '-'}<\/div>
            <td>${user.department || '-'}<\/div>
            <td>${formatDate(user.date_created)}<\/div>
            <td><span class="access-badge ${accessBadgeClass}">${user.access_level}</span><\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewUser('${user.user_id}')">View</button>
                    <button class="edit-btn" onclick="editUser('${user.user_id}')">Edit</button>
                    <button class="reset-password-btn" onclick="resetPassword('${user.user_id}')">Reset</button>
                    <button class="delete-btn" onclick="deleteUser('${user.user_id}')">Delete</button>
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// Show add user modal
function showAddUserModal() {
    document.getElementById('addUserModal').classList.add('show');
    loadStaffForDropdown(); // Load staff when modal opens
}

// Hide add user modal
function hideAddUserModal() {
    document.getElementById('addUserModal').classList.remove('show');
    clearUserForm();
}

// Clear user form
function clearUserForm() {
    document.getElementById('userForm').reset();
    document.getElementById('staffId').innerHTML = '<option value="">Select Staff Member</option>';
}

// Generate new user ID
async function getNextUserId() {
    try {
        const snapshot = await db.collection('users').orderBy('user_id', 'desc').limit(1).get();
        if (snapshot.empty) {
            return '1';
        }
        const lastUser = snapshot.docs[0].data();
        const lastId = parseInt(lastUser.user_id);
        return (lastId + 1).toString();
    } catch (error) {
        console.error("Error getting next user ID:", error);
        return (allUsers.length + 1).toString();
    }
}

// Save new user to Firestore
async function saveUser() {
    const staffId = document.getElementById('staffId').value;
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const name = document.getElementById('name').value;
    const position = document.getElementById('position').value;
    const department = document.getElementById('department').value;
    const accessLevel = document.getElementById('accessLevel').value;
    
    // Validate staff selection
    if (!staffId) {
        alert('Please select a staff member');
        return;
    }
    
    // Validate username
    if (!username) {
        alert('Please enter a username');
        return;
    }
    
    // Validate password
    if (!password) {
        alert('Please enter a password');
        return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Validate access level
    if (!accessLevel) {
        alert('Please select an access level');
        return;
    }
    
    // Check if username already exists
    if (allUsers.some(u => u.username === username)) {
        alert('Username already exists. Please choose another username.');
        return;
    }
    
    const newUserId = await getNextUserId();
    const today = new Date();
    const dateCreated = today.toISOString().split('T')[0];
    
    const newUser = {
        user_id: newUserId,
        staff_id: staffId,
        username: username,
        password: password,
        name: name,
        position: position,
        department: department,
        date_created: dateCreated,
        access_level: accessLevel,
        created_at: new Date().toISOString()
    };
    
    try {
        await db.collection('users').doc(newUserId).set(newUser);
        alert(`User ${username} created successfully with ID: ${newUserId}`);
        await loadUsers();
        hideAddUserModal();
    } catch (error) {
        console.error("Error saving user:", error);
        alert("Error saving user. Please try again.");
    }
}

// View user
function viewUser(userId) {
    const user = allUsers.find(u => u.user_id === userId);
    if (user) {
        alert(`USER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID: ${user.user_id}
Username: ${user.username}
Name: ${user.name}
Position: ${user.position}
Department: ${user.department}
Date Created: ${formatDate(user.date_created)}
Access Level: ${user.access_level}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }
}

// Edit user
function editUser(userId) {
    alert(`Edit user ${userId}\n\nThis feature will be implemented in the next phase.`);
}

// Reset password
async function resetPassword(userId) {
    const user = allUsers.find(u => u.user_id === userId);
    if (user) {
        if (confirm(`Reset password for user ${user.username}?`)) {
            const tempPassword = 'temp123';
            try {
                await db.collection('users').doc(userId).update({
                    password: tempPassword,
                    updated_at: new Date().toISOString()
                });
                alert(`Password for ${user.username} has been reset to: ${tempPassword}`);
                await loadUsers();
            } catch (error) {
                console.error("Error resetting password:", error);
                alert("Error resetting password. Please try again.");
            }
        }
    }
}

// Delete user from Firestore
async function deleteUser(userId) {
    const user = allUsers.find(u => u.user_id === userId);
    if (user) {
        if (confirm(`Delete user ${user.username}? This action cannot be undone.`)) {
            try {
                await db.collection('users').doc(userId).delete();
                alert(`User ${user.username} has been deleted.`);
                await loadUsers();
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Error deleting user. Please try again.");
            }
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadUsers();
    
    document.getElementById('userSearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchUsers();
        }
    });
});