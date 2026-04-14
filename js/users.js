// users.js - Complete with Working Edit and Sync

let allUsers = [];
let allDoctors = [];
let allBNS = [];
let allNurses = [];
let allITStaff = [];
let currentStaffList = [];

let currentUserRole = null;
let isEditMode = false;
let editingUserId = null;

// ========== TOAST NOTIFICATION ==========
function showToast(message, type = 'success') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    let bgColor = '#4caf50';
    if (type === 'error') bgColor = '#f44336';
    if (type === 'warning') bgColor = '#ff9800';
    if (type === 'info') bgColor = '#2B6896';
    
    toast.style.cssText = `
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        font-size: 14px;
        animation: slideIn 0.3s ease;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        min-width: 250px;
        text-align: center;
        font-family: 'Segoe UI', Arial, sans-serif;
    `;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animation styles
if (!document.querySelector('#toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Display current date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Get current user role
function getCurrentUserRole() {
    const userInfo = sessionStorage.getItem('currentUser');
    if (userInfo) {
        try {
            const user = JSON.parse(userInfo);
            currentUserRole = user.access_level || user.role;
        } catch (e) {
            console.error("Error parsing user info:", e);
        }
    }
}

function canEditDelete() {
    return currentUserRole === 'Admin' || currentUserRole === 'IT';
}

// ========== GENERATE USERNAME ==========
function generateUsername(firstName, middleName, lastName) {
    let username = 'n';
    if (firstName && firstName.length > 0) {
        username += firstName.charAt(0).toLowerCase();
    }
    if (middleName && middleName.length > 0) {
        username += middleName.charAt(0).toLowerCase();
    }
    if (lastName && lastName.length > 0) {
        username += lastName.toLowerCase();
    }
    username = username.replace(/[^a-z0-9]/g, '');
    return username;
}

// ========== LOAD STAFF BY TYPE ==========
async function loadStaffByType() {
    const staffType = document.getElementById('staffType').value;
    const staffSelect = document.getElementById('staffId');
    
    if (!staffType) {
        staffSelect.innerHTML = '<option value="">Select Staff Type First</option>';
        return;
    }
    
    staffSelect.innerHTML = '<option value="">Loading...</option>';
    
    try {
        if (staffType === 'doctor') {
            const snapshot = await db.collection('staff').orderBy('doctor_id').get();
            allDoctors = [];
            staffSelect.innerHTML = '<option value="">Select Doctor</option>';
            snapshot.forEach(doc => {
                const staff = doc.data();
                allDoctors.push(staff);
                const option = document.createElement('option');
                option.value = staff.doc_id;
                option.textContent = `${staff.doctor_id} - Dr. ${staff.first_name} ${staff.last_name} (${staff.specialty})`;
                staffSelect.appendChild(option);
            });
            currentStaffList = allDoctors;
        } 
        else if (staffType === 'bns') {
            const snapshot = await db.collection('bns_workers').orderBy('bns_id').get();
            allBNS = [];
            staffSelect.innerHTML = '<option value="">Select BNS Worker</option>';
            snapshot.forEach(doc => {
                const staff = doc.data();
                allBNS.push(staff);
                const option = document.createElement('option');
                option.value = staff.doc_id;
                option.textContent = `${staff.bns_id} - ${staff.first_name} ${staff.last_name} (${staff.barangay_assigned || 'No Barangay'})`;
                staffSelect.appendChild(option);
            });
            currentStaffList = allBNS;
        }
        else if (staffType === 'nurse') {
            const snapshot = await db.collection('nurses').orderBy('nurse_id').get();
            allNurses = [];
            staffSelect.innerHTML = '<option value="">Select Nurse</option>';
            snapshot.forEach(doc => {
                const staff = doc.data();
                allNurses.push(staff);
                const option = document.createElement('option');
                option.value = staff.doc_id;
                option.textContent = `${staff.nurse_id} - ${staff.first_name} ${staff.last_name} (${staff.specialty || 'General Nursing'})`;
                staffSelect.appendChild(option);
            });
            currentStaffList = allNurses;
        }
        else if (staffType === 'it') {
            const snapshot = await db.collection('it_staff').orderBy('it_id').get();
            allITStaff = [];
            staffSelect.innerHTML = '<option value="">Select IT Staff</option>';
            snapshot.forEach(doc => {
                const staff = doc.data();
                allITStaff.push(staff);
                const option = document.createElement('option');
                option.value = staff.doc_id;
                option.textContent = `${staff.it_id} - ${staff.first_name} ${staff.last_name} (${staff.position || 'IT Staff'})`;
                staffSelect.appendChild(option);
            });
            currentStaffList = allITStaff;
        }
        
        if (staffSelect.options.length === 1) {
            staffSelect.innerHTML = '<option value="">No staff found in this category</option>';
        }
        
    } catch (error) {
        console.error("Error loading staff:", error);
        staffSelect.innerHTML = '<option value="">Error loading staff</option>';
        showToast('Error loading staff data. Please try again.', 'error');
    }
}

// Update staff info when selected
function updateStaffInfo() {
    const staffType = document.getElementById('staffType').value;
    const staffId = document.getElementById('staffId').value;
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const positionInput = document.getElementById('position');
    const departmentInput = document.getElementById('department');
    const usernameInput = document.getElementById('username');
    
    if (!staffId || !currentStaffList.length) {
        clearStaffFields();
        return;
    }
    
    const staff = currentStaffList.find(s => s.doc_id === staffId);
    if (staff) {
        const fullName = `${staff.first_name} ${staff.middle_name ? staff.middle_name + ' ' : ''}${staff.last_name}`;
        nameInput.value = fullName;
        emailInput.value = staff.email || 'Not Provided';
        
        if (staffType === 'doctor') {
            positionInput.value = staff.specialty || 'Doctor';
            departmentInput.value = staff.department || getDepartmentFromType('doctor', staff.specialty);
        } else if (staffType === 'bns') {
            positionInput.value = 'BNS Worker';
            departmentInput.value = 'Barangay Nutrition';
        } else if (staffType === 'nurse') {
            positionInput.value = staff.specialty || 'Nurse';
            departmentInput.value = 'Nursing Department';
        } else if (staffType === 'it') {
            positionInput.value = staff.position || 'IT Staff';
            departmentInput.value = 'Information Technology Department';
        }
        
        const generatedUsername = generateUsername(staff.first_name, staff.middle_name, staff.last_name);
        usernameInput.value = generatedUsername;
    } else {
        clearStaffFields();
    }
}

function getDepartmentFromType(type, specialty) {
    if (type === 'doctor') {
        const deptMap = {
            'Pediatrics': 'Pediatrics Department',
            'Obstetrics and Gynecology': 'Obstetrics Department',
            'Geriatrics': 'Geriatrics Department',
            'General Medicine': 'Medical Department',
            'Cardiology': 'Cardiology Department'
        };
        return deptMap[specialty] || 'Medical Department';
    }
    return 'Health Center';
}

function clearStaffFields() {
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('position').value = '';
    document.getElementById('department').value = '';
}

// Get access level badge class
function getAccessBadgeClass(accessLevel) {
    const classMap = {
        'Admin': 'access-admin',
        'Doctor': 'access-doctor',
        'BNS Worker': 'access-bns',
        'Nurse': 'access-nurse',
        'IT': 'access-it',
        'Nutritionist': 'access-nutritionist',
        'Staff': 'access-staff',
        'View Only': 'access-view'
    };
    return classMap[accessLevel] || 'access-default';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function maskPassword(password) {
    return '•'.repeat(Math.min(password.length, 8));
}

// ========== LOAD USERS ==========
async function loadUsers() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Loading users...<\/div>';

    try {
        const snapshot = await db.collection('users').orderBy('user_id').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">No users found. Click "+ Add User" to add.<\/div>';
            allUsers = [];
            return;
        }
        
        allUsers = [];
        tableBody.innerHTML = '';
        const isAdmin = canEditDelete();
        
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
                <td>${user.email || '-'}<\/div>
                <td>${user.position || '-'}<\/div>
                <td>${user.department || '-'}<\/div>
                <td>${formatDate(user.date_created)}<\/div>
                <td><span class="access-badge ${accessBadgeClass}">${user.access_level}</span><\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewUser('${user.user_id}')">View</button>
                        ${isAdmin ? `<button class="edit-btn" onclick="editUser('${user.user_id}')">Edit</button>` : ''}
                        ${isAdmin ? `<button class="reset-password-btn" onclick="showResetPasswordConfirmation('${user.user_id}', '${escapeHtml(user.username)}')">Reset</button>` : ''}
                        ${isAdmin ? `<button class="delete-btn" onclick="showDeleteUserConfirmation('${user.user_id}', '${escapeHtml(user.username)}')">Delete</button>` : ''}
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading users:", error);
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
    }
}

// Search users
function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const filteredUsers = allUsers.filter(user => 
        user.user_id?.toLowerCase().includes(searchTerm) ||
        user.username?.toLowerCase().includes(searchTerm) ||
        user.name?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        user.position?.toLowerCase().includes(searchTerm) ||
        user.department?.toLowerCase().includes(searchTerm) ||
        user.access_level?.toLowerCase().includes(searchTerm)
    );
    displayFilteredUsers(filteredUsers);
}

// Sort users
function sortUsers() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedUsers = [...allUsers].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        if (sortBy === 'user_id') return parseInt(valA) - parseInt(valB);
        if (sortBy === 'date_created') return new Date(valA) - new Date(valB);
        return String(valA).localeCompare(String(valB));
    });
    displayFilteredUsers(sortedUsers);
}

function displayFilteredUsers(userList) {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const isAdmin = canEditDelete();
    
    userList.forEach(user => {
        const accessBadgeClass = getAccessBadgeClass(user.access_level);
        const maskedPassword = maskPassword(user.password);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.user_id || '-'}<\/div>
            <td>${user.username || '-'}<\/div>
            <td><span class="password-mask" title="${user.password}">${maskedPassword}</span><\/div>
            <td>${user.name || '-'}<\/div>
            <td>${user.email || '-'}<\/div>
            <td>${user.position || '-'}<\/div>
            <td>${user.department || '-'}<\/div>
            <td>${formatDate(user.date_created)}<\/div>
            <td><span class="access-badge ${accessBadgeClass}">${user.access_level}</span><\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewUser('${user.user_id}')">View</button>
                    ${isAdmin ? `<button class="edit-btn" onclick="editUser('${user.user_id}')">Edit</button>` : ''}
                    ${isAdmin ? `<button class="reset-password-btn" onclick="showResetPasswordConfirmation('${user.user_id}', '${escapeHtml(user.username)}')">Reset</button>` : ''}
                    ${isAdmin ? `<button class="delete-btn" onclick="showDeleteUserConfirmation('${user.user_id}', '${escapeHtml(user.username)}')">Delete</button>` : ''}
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// ========== VIEW USER ==========
function viewUser(userId) {
    const user = allUsers.find(u => u.user_id === userId);
    if (user) {
        const content = `
            <div style="line-height: 1.8; font-family: 'Segoe UI', Arial, sans-serif;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; width: 35%; font-weight: 600; color: #2B6896;">User ID:<\/td><td style="padding: 8px 0;">${user.user_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Username:<\/td><td style="padding: 8px 0;">${user.username}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Full Name:<\/td><td style="padding: 8px 0;">${user.name}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Email Address:<\/td><td style="padding: 8px 0;">${user.email || 'Not Provided'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Position:<\/td><td style="padding: 8px 0;">${user.position}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Department:<\/td><td style="padding: 8px 0;">${user.department}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Access Level:<\/td><td style="padding: 8px 0;"><span class="access-badge ${getAccessBadgeClass(user.access_level)}">${user.access_level}</span><\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Date Created:<\/td><td style="padding: 8px 0;">${formatDate(user.date_created)}<\/td><\/tr>
                </table>
            </div>
        `;
        
        const modal = document.getElementById('viewUserModal');
        if (modal) {
            document.getElementById('viewUserModalBody').innerHTML = content;
            modal.classList.add('show');
        }
    }
}

function closeViewUserModal() {
    const modal = document.getElementById('viewUserModal');
    if (modal) modal.classList.remove('show');
}

// ========== SHOW ADD USER MODAL ==========
function showAddUserModal() {
    if (!canEditDelete()) {
        showToast('Access restricted. Only administrators can add new users.', 'warning');
        return;
    }
    isEditMode = false;
    editingUserId = null;
    
    document.getElementById('addUserModal').classList.add('show');
    document.getElementById('staffType').value = '';
    document.getElementById('staffId').innerHTML = '<option value="">Select Staff Type First</option>';
    clearStaffFields();
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('accessLevel').value = '';
    
    // Enable password fields for add mode
    document.getElementById('password').disabled = false;
    document.getElementById('confirmPassword').disabled = false;
    
    const modalTitle = document.querySelector('#addUserModal .modal-header h2');
    const saveBtn = document.querySelector('#addUserModal .save-btn');
    modalTitle.textContent = 'Add New User';
    saveBtn.textContent = 'Save User';
    saveBtn.setAttribute('onclick', 'saveUser()');
}

function hideAddUserModal() {
    document.getElementById('addUserModal').classList.remove('show');
    clearUserForm();
}

function clearUserForm() {
    document.getElementById('userForm').reset();
    document.getElementById('staffId').innerHTML = '<option value="">Select Staff Type First</option>';
    document.getElementById('staffType').value = '';
    clearStaffFields();
}

// ========== EDIT USER ==========
async function editUser(userId) {
    if (!canEditDelete()) {
        showToast('Access restricted. Only administrators can edit users.', 'warning');
        return;
    }
    
    const user = allUsers.find(u => u.user_id === userId);
    if (!user) {
        showToast('User not found.', 'error');
        return;
    }
    
    isEditMode = true;
    editingUserId = userId;
    
    // Populate form with user data
    document.getElementById('staffType').value = user.staff_type || '';
    document.getElementById('username').value = user.username || '';
    document.getElementById('name').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('position').value = user.position || '';
    document.getElementById('department').value = user.department || '';
    document.getElementById('accessLevel').value = user.access_level || '';
    
    // Disable password fields in edit mode (use reset password instead)
    document.getElementById('password').disabled = true;
    document.getElementById('confirmPassword').disabled = true;
    document.getElementById('password').placeholder = 'Use Reset Password to change';
    document.getElementById('confirmPassword').placeholder = 'Use Reset Password to change';
    document.getElementById('password').value = '';
    document.getElementById('confirmPassword').value = '';
    
    // Load staff dropdown based on type
    if (user.staff_type) {
        await loadStaffByTypeForEdit(user.staff_type, user.staff_id);
    }
    
    // Change modal to edit mode
    const modalTitle = document.querySelector('#addUserModal .modal-header h2');
    const saveBtn = document.querySelector('#addUserModal .save-btn');
    modalTitle.textContent = 'Edit User';
    saveBtn.textContent = 'Update User';
    saveBtn.setAttribute('onclick', 'updateUser()');
    
    document.getElementById('addUserModal').classList.add('show');
}

// Helper function to load staff for edit
async function loadStaffByTypeForEdit(staffType, selectedStaffId) {
    const staffSelect = document.getElementById('staffId');
    
    try {
        if (staffType === 'doctor') {
            const snapshot = await db.collection('staff').orderBy('doctor_id').get();
            staffSelect.innerHTML = '<option value="">Select Doctor</option>';
            snapshot.forEach(doc => {
                const staff = doc.data();
                allDoctors.push(staff);
                const option = document.createElement('option');
                option.value = staff.doc_id;
                option.textContent = `${staff.doctor_id} - Dr. ${staff.first_name} ${staff.last_name} (${staff.specialty})`;
                if (staff.doc_id === selectedStaffId) option.selected = true;
                staffSelect.appendChild(option);
            });
            currentStaffList = allDoctors;
        } 
        else if (staffType === 'bns') {
            const snapshot = await db.collection('bns_workers').orderBy('bns_id').get();
            staffSelect.innerHTML = '<option value="">Select BNS Worker</option>';
            snapshot.forEach(doc => {
                const staff = doc.data();
                allBNS.push(staff);
                const option = document.createElement('option');
                option.value = staff.doc_id;
                option.textContent = `${staff.bns_id} - ${staff.first_name} ${staff.last_name}`;
                if (staff.doc_id === selectedStaffId) option.selected = true;
                staffSelect.appendChild(option);
            });
            currentStaffList = allBNS;
        }
        else if (staffType === 'nurse') {
            const snapshot = await db.collection('nurses').orderBy('nurse_id').get();
            staffSelect.innerHTML = '<option value="">Select Nurse</option>';
            snapshot.forEach(doc => {
                const staff = doc.data();
                allNurses.push(staff);
                const option = document.createElement('option');
                option.value = staff.doc_id;
                option.textContent = `${staff.nurse_id} - ${staff.first_name} ${staff.last_name}`;
                if (staff.doc_id === selectedStaffId) option.selected = true;
                staffSelect.appendChild(option);
            });
            currentStaffList = allNurses;
        }
        else if (staffType === 'it') {
            const snapshot = await db.collection('it_staff').orderBy('it_id').get();
            staffSelect.innerHTML = '<option value="">Select IT Staff</option>';
            snapshot.forEach(doc => {
                const staff = doc.data();
                allITStaff.push(staff);
                const option = document.createElement('option');
                option.value = staff.doc_id;
                option.textContent = `${staff.it_id} - ${staff.first_name} ${staff.last_name}`;
                if (staff.doc_id === selectedStaffId) option.selected = true;
                staffSelect.appendChild(option);
            });
            currentStaffList = allITStaff;
        }
        
        // Update staff info to populate name/email/position/department
        if (selectedStaffId) {
            const staff = currentStaffList.find(s => s.doc_id === selectedStaffId);
            if (staff) {
                const fullName = `${staff.first_name} ${staff.middle_name ? staff.middle_name + ' ' : ''}${staff.last_name}`;
                document.getElementById('name').value = fullName;
                document.getElementById('email').value = staff.email || '';
                
                if (staffType === 'doctor') {
                    document.getElementById('position').value = staff.specialty || 'Doctor';
                    document.getElementById('department').value = staff.department || getDepartmentFromType('doctor', staff.specialty);
                } else if (staffType === 'bns') {
                    document.getElementById('position').value = 'BNS Worker';
                    document.getElementById('department').value = 'Barangay Nutrition';
                } else if (staffType === 'nurse') {
                    document.getElementById('position').value = staff.specialty || 'Nurse';
                    document.getElementById('department').value = 'Nursing Department';
                } else if (staffType === 'it') {
                    document.getElementById('position').value = staff.position || 'IT Staff';
                    document.getElementById('department').value = 'Information Technology Department';
                }
            }
        }
        
    } catch (error) {
        console.error("Error loading staff for edit:", error);
    }
}

// ========== UPDATE USER ==========
async function updateUser() {
    const staffType = document.getElementById('staffType').value;
    const staffId = document.getElementById('staffId').value;
    const username = document.getElementById('username').value.trim();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const position = document.getElementById('position').value;
    const department = document.getElementById('department').value;
    const accessLevel = document.getElementById('accessLevel').value;
    
    if (!staffType || !staffId) {
        showToast('Please select a staff type and staff member.', 'warning');
        return;
    }
    
    if (!username) {
        showToast('Please enter a username.', 'warning');
        return;
    }
    
    if (!accessLevel) {
        showToast('Please select an access level.', 'warning');
        return;
    }
    
    try {
        await db.collection('users').doc(editingUserId).update({
            staff_type: staffType,
            staff_id: staffId,
            username: username,
            name: name,
            email: email,
            position: position,
            department: department,
            access_level: accessLevel,
            updated_at: new Date().toISOString()
        });
        
        showToast(`User ${username} has been updated successfully.`, 'success');
        
        // Reset and reload
        isEditMode = false;
        editingUserId = null;
        await loadUsers();
        hideAddUserModal();
        
    } catch (error) {
        console.error("Error updating user:", error);
        showToast('An error occurred while updating user.', 'error');
    }
}

// ========== SAVE NEW USER ==========
async function saveUser() {
    const staffType = document.getElementById('staffType').value;
    const staffId = document.getElementById('staffId').value;
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const position = document.getElementById('position').value;
    const department = document.getElementById('department').value;
    const accessLevel = document.getElementById('accessLevel').value;
    
    if (!staffType || !staffId) {
        showToast('Please select a staff type and staff member.', 'warning');
        return;
    }
    
    if (!username) {
        showToast('Please enter a username.', 'warning');
        return;
    }
    
    if (!password) {
        showToast('Please enter a password.', 'warning');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'warning');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters.', 'warning');
        return;
    }
    
    if (!accessLevel) {
        showToast('Please select an access level.', 'warning');
        return;
    }
    
    // Check if username already exists
    if (allUsers.some(u => u.username === username)) {
        showToast('Username already exists. Please choose another username.', 'warning');
        return;
    }
    
    const newUserId = await getNextUserId();
    const today = new Date();
    const dateCreated = today.toISOString().split('T')[0];
    
    const newUser = {
        user_id: newUserId,
        staff_type: staffType,
        staff_id: staffId,
        username: username,
        password: password,
        name: name,
        email: email,
        position: position,
        department: department,
        date_created: dateCreated,
        access_level: accessLevel,
        created_at: new Date().toISOString()
    };
    
    try {
        await db.collection('users').doc(newUserId).set(newUser);
        showToast(`User ${username} created successfully with ID: ${newUserId}`, 'success');
        await loadUsers();
        hideAddUserModal();
    } catch (error) {
        console.error("Error saving user:", error);
        showToast('An error occurred while saving. Please try again.', 'error');
    }
}

// Get next user ID
async function getNextUserId() {
    try {
        const snapshot = await db.collection('users').orderBy('user_id', 'desc').limit(1).get();
        if (snapshot.empty) return '1';
        const lastUser = snapshot.docs[0].data();
        const lastId = parseInt(lastUser.user_id);
        return (lastId + 1).toString();
    } catch (error) {
        return (allUsers.length + 1).toString();
    }
}

// ========== DELETE USER CONFIRMATION MODAL ==========
function showDeleteUserConfirmation(userId, username) {
    if (!canEditDelete()) return;
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('deleteUserConfirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'deleteUserConfirmModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div class="modal-header" style="background: #f44336;">
                    <h2 style="color: white;">⚠️ Confirm Delete</h2>
                    <button class="close-modal" onclick="closeDeleteUserModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="font-size: 48px; margin-bottom: 15px;">🗑️</div>
                    <p>Are you sure you want to delete user <strong>${escapeHtml(username)}</strong>?</p>
                    <p style="color: #f44336; font-size: 13px;">⚠️ This action cannot be undone!</p>
                </div>
                <div class="modal-footer" style="justify-content: center;">
                    <button class="cancel-btn" onclick="closeDeleteUserModal()">Cancel</button>
                    <button class="save-btn" id="confirmDeleteUserBtn" style="background: #f44336;">Delete Permanently</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        // Update the username in the modal
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 15px;">🗑️</div>
                <p>Are you sure you want to delete user <strong>${escapeHtml(username)}</strong>?</p>
                <p style="color: #f44336; font-size: 13px;">⚠️ This action cannot be undone!</p>
            `;
        }
    }
    
    modal.classList.add('show');
    
    const confirmBtn = document.getElementById('confirmDeleteUserBtn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener('click', async () => {
        try {
            await db.collection('users').doc(userId).delete();
            showToast(`User ${username} has been deleted successfully.`, 'success');
            await loadUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            showToast('An error occurred while deleting user.', 'error');
        }
        closeDeleteUserModal();
    });
}

function closeDeleteUserModal() {
    const modal = document.getElementById('deleteUserConfirmModal');
    if (modal) modal.classList.remove('show');
}

// ========== RESET PASSWORD CONFIRMATION MODAL ==========
function showResetPasswordConfirmation(userId, username) {
    if (!canEditDelete()) return;
    
    let modal = document.getElementById('resetPasswordConfirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'resetPasswordConfirmModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div class="modal-header" style="background: #ff9800;">
                    <h2 style="color: white;">🔄 Reset Password</h2>
                    <button class="close-modal" onclick="closeResetPasswordModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="font-size: 48px; margin-bottom: 15px;">🔑</div>
                    <p>Reset password for user <strong>${escapeHtml(username)}</strong>?</p>
                    <p>A temporary password will be generated: <strong>temp123</strong></p>
                    <p style="color: #ff9800; font-size: 13px;">⚠️ User will need to change this on next login.</p>
                </div>
                <div class="modal-footer" style="justify-content: center;">
                    <button class="cancel-btn" onclick="closeResetPasswordModal()">Cancel</button>
                    <button class="save-btn" id="confirmResetUserBtn" style="background: #ff9800;">Reset Password</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 15px;">🔑</div>
                <p>Reset password for user <strong>${escapeHtml(username)}</strong>?</p>
                <p>A temporary password will be generated: <strong>temp123</strong></p>
                <p style="color: #ff9800; font-size: 13px;">⚠️ User will need to change this on next login.</p>
            `;
        }
    }
    
    modal.classList.add('show');
    
    const confirmBtn = document.getElementById('confirmResetUserBtn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener('click', async () => {
        const tempPassword = 'temp123';
        try {
            await db.collection('users').doc(userId).update({
                password: tempPassword,
                updated_at: new Date().toISOString()
            });
            showToast(`Password for ${username} has been reset to: ${tempPassword}`, 'success');
            await loadUsers();
        } catch (error) {
            console.error("Error resetting password:", error);
            showToast('An error occurred while resetting password.', 'error');
        }
        closeResetPasswordModal();
    });
}

function closeResetPasswordModal() {
    const modal = document.getElementById('resetPasswordConfirmModal');
    if (modal) modal.classList.remove('show');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    getCurrentUserRole();
    loadUsers();
    
    document.getElementById('userSearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchUsers();
    });
});