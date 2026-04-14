// staff.js - Complete Version with Email Columns in All Tables

let allDoctors = [];
let allBNS = [];
let allNurses = [];
let allITStaff = [];

let currentUserRole = null;
let currentUserName = null;

// ========== TOAST NOTIFICATION FUNCTION ==========
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
        setTimeout(() => {
            toast.remove();
        }, 300);
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

// ========== VIEW MODAL FUNCTIONS ==========
function showViewModal(title, content) {
    let viewModal = document.getElementById('viewModal');
    if (!viewModal) {
        viewModal = document.createElement('div');
        viewModal.id = 'viewModal';
        viewModal.className = 'modal';
        viewModal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2 id="viewModalTitle">${title}</h2>
                    <button class="close-modal" onclick="closeViewModal()">&times;</button>
                </div>
                <div class="modal-body" id="viewModalBody"></div>
                <div class="modal-footer">
                    <button class="cancel-btn" onclick="closeViewModal()">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(viewModal);
    }
    
    document.getElementById('viewModalTitle').textContent = title;
    document.getElementById('viewModalBody').innerHTML = content;
    viewModal.classList.add('show');
}

// ========== DELETE CONFIRMATION MODAL ==========
let pendingDeleteCallback = null;
let pendingDeleteItemName = '';
let pendingDeleteItemType = '';

function showDeleteConfirmation(itemName, itemType, onConfirm) {
    // Store the callback function
    pendingDeleteCallback = onConfirm;
    pendingDeleteItemName = itemName;
    pendingDeleteItemType = itemType;
    
    // Check if modal already exists
    let deleteModal = document.getElementById('deleteConfirmModal');
    
    if (!deleteModal) {
        // Create the modal
        deleteModal = document.createElement('div');
        deleteModal.id = 'deleteConfirmModal';
        deleteModal.className = 'modal';
        deleteModal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div class="modal-header" style="background: #f44336;">
                    <h2 style="color: white; margin: 0;">⚠️ Confirm Delete</h2>
                    <button class="close-modal" onclick="closeDeleteModal()" style="color: white;">&times;</button>
                </div>
                <div class="modal-body" style="padding: 30px 20px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">🗑️</div>
                    <p style="font-size: 16px; color: #333; margin-bottom: 10px;">
                        Are you sure you want to delete this record?
                    </p>
                    <p id="deleteItemInfo" style="font-size: 14px; color: #666; margin-bottom: 20px; font-weight: 500;">
                        Loading...
                    </p>
                    <p style="font-size: 13px; color: #f44336; background: #ffebee; padding: 8px; border-radius: 5px;">
                        ⚠️ This action cannot be undone!
                    </p>
                </div>
                <div class="modal-footer" style="justify-content: center; gap: 15px;">
                    <button class="cancel-btn" onclick="closeDeleteModal()" style="padding: 10px 25px;">Cancel</button>
                    <button class="save-btn" id="confirmDeleteBtn" style="background: #f44336; padding: 10px 25px;">Delete Permanently</button>
                </div>
            </div>
        `;
        document.body.appendChild(deleteModal);
    }
    
    // Update the item info
    const itemInfoSpan = document.getElementById('deleteItemInfo');
    if (itemInfoSpan) {
        itemInfoSpan.innerHTML = `<strong>${escapeHtml(itemType)}:</strong> ${escapeHtml(itemName)}`;
    }
    
    // Show the modal
    deleteModal.classList.add('show');
    
    // Add event listener to confirm button
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) {
        // Remove previous event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        newConfirmBtn.addEventListener('click', function() {
            if (pendingDeleteCallback) {
                pendingDeleteCallback();
            }
            closeDeleteModal();
        });
    }
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) {
        modal.classList.remove('show');
    }
    pendingDeleteCallback = null;
    pendingDeleteItemName = '';
    pendingDeleteItemType = '';
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function closeViewModal() {
    const modal = document.getElementById('viewModal');
    if (modal) modal.classList.remove('show');
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

// Get current user role from session
function getCurrentUserRole() {
    const userInfo = sessionStorage.getItem('currentUser');
    if (userInfo) {
        try {
            const user = JSON.parse(userInfo);
            currentUserRole = user.access_level || user.role;
            currentUserName = user.name;
            console.log("Current user role:", currentUserRole);
        } catch (e) {
            console.error("Error parsing user info:", e);
        }
    }
}

// Replace the canEditDelete function
function canEditDelete() {
    // Only Admin and IT Staff can edit/delete
    return currentUserRole === 'Admin' || currentUserRole === 'IT';
}

// Replace the canViewDoctors function
function canViewDoctors() {
    // Everyone can view doctors (Admin, Doctor, BNS, Nurse, IT)
    // Return true for any logged-in user
    return currentUserRole !== null;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0
    }).format(amount);
}

function getDepartmentFromSpecialty(specialty) {
    const deptMap = {
        'Pediatrics': 'Pediatrics Department',
        'Obstetrics and Gynecology': 'Obstetrics Department',
        'Geriatrics': 'Geriatrics Department',
    };
    return deptMap[specialty] || 'Medical Department';
}

// ========== DOCTORS CRUD ==========

async function loadDoctors() {
    const tableBody = document.getElementById('doctorsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Loading doctors...<\/div>';
    
    if (!canViewDoctors()) {
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Access restricted. You do not have permission to view this section.<\/div>';
        return;
    }

    try {
        const snapshot = await db.collection('staff').orderBy('doctor_id').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No records found. Click "Add Doctor" to create a new entry.<\/div>';
            allDoctors = [];
            return;
        }
        
        allDoctors = [];
        tableBody.innerHTML = '';
        const isAdmin = canEditDelete();
        
        snapshot.forEach(doc => {
            const doctor = doc.data();
            allDoctors.push(doctor);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${doctor.doctor_id || '-'}<\/div>
                <td>${doctor.last_name || '-'}<\/div>
                <td>${doctor.first_name || '-'}<\/div>
                <td>${doctor.specialty || '-'}<\/div>
                <td>${doctor.email || '-'}<\/div>
                <td>${doctor.license_number || '-'}<\/div>
                <td>${doctor.phone_number || '-'}<\/div>
                <td>${doctor.salary ? formatCurrency(doctor.salary) : '-'}<\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewDoctor('${doctor.doc_id}')">View</button>
                        ${isAdmin ? `<button class="edit-btn" onclick="editDoctor('${doctor.doc_id}')">Edit</button>` : ''}
                        ${isAdmin ? `<button class="delete-btn" onclick="deleteDoctor('${doctor.doc_id}')">Delete</button>` : ''}
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading doctors:", error);
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: red;">Unable to load data. Please check your connection.<\/div>';
    }
}

function viewDoctor(docId) {
    const doctor = allDoctors.find(d => d.doc_id === docId);
    if (doctor) {
        const content = `
            <div style="line-height: 1.8; font-family: 'Segoe UI', Arial, sans-serif;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; width: 35%; font-weight: 600; color: #2B6896;">Doctor ID:<\/td><td style="padding: 8px 0;">${doctor.doctor_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Full Name:<\/td><td style="padding: 8px 0;">${doctor.first_name} ${doctor.middle_name ? doctor.middle_name + ' ' : ''}${doctor.last_name}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Specialty:<\/td><td style="padding: 8px 0;">${doctor.specialty}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Email Address:<\/td><td style="padding: 8px 0;">${doctor.email || 'Not Provided'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">License Number:<\/td><td style="padding: 8px 0;">${doctor.license_number}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Contact Number:<\/td><td style="padding: 8px 0;">${doctor.phone_number || 'Not Provided'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Residential Address:<\/td><td style="padding: 8px 0;">${doctor.address || 'Not Provided'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Monthly Salary:<\/td><td style="padding: 8px 0;">${doctor.salary ? formatCurrency(doctor.salary) : 'Not Specified'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Date of Employment:<\/td><td style="padding: 8px 0;">${doctor.date_joined || 'Not Recorded'}<\/td><\/tr>
                </table>
            </div>
        `;
        showViewModal('Doctor Information', content);
    }
}

function showAddDoctorModal() {
    if (!canEditDelete()) {
        showToast('Access restricted. Only administrators can add new doctor records.', 'warning');
        return;
    }
    document.getElementById('doctorModalTitle').textContent = 'Add New Doctor';
    document.getElementById('doctorForm').reset();
    document.getElementById('doctorDocId').value = '';
    document.getElementById('doctorModal').classList.add('show');
}

function hideDoctorModal() {
    document.getElementById('doctorModal').classList.remove('show');
}

async function getNextDoctorId() {
    try {
        const snapshot = await db.collection('staff').orderBy('doctor_id', 'desc').limit(1).get();
        if (snapshot.empty) return 1;
        const lastItem = snapshot.docs[0].data();
        return (lastItem.doctor_id || 0) + 1;
    } catch (error) {
        return allDoctors.length + 1;
    }
}

async function saveDoctor() {
    const lastName = document.getElementById('docLastName').value.trim();
    const firstName = document.getElementById('docFirstName').value.trim();
    const middleName = document.getElementById('docMiddleName').value.trim();
    const specialty = document.getElementById('docSpecialty').value;
    const licenseNumber = document.getElementById('docLicense').value.trim();
    const email = document.getElementById('docEmail').value.trim();
    const phoneNumber = document.getElementById('docPhone').value.trim();
    const address = document.getElementById('docAddress').value.trim();
    const dateJoined = document.getElementById('docDateJoined').value;
    const salary = document.getElementById('docSalary').value;
    const docId = document.getElementById('doctorDocId').value;
    
    if (!lastName || !firstName || !specialty || !licenseNumber || !email) {
        showToast('Please complete all required fields before submitting.', 'warning');
        return;
    }
    
    try {
        if (docId) {
            // UPDATE EXISTING DOCTOR
            await db.collection('staff').doc(docId).update({
                last_name: lastName, first_name: firstName, middle_name: middleName,
                specialty: specialty, license_number: licenseNumber, email: email,
                phone_number: phoneNumber, address: address,
                date_joined: dateJoined || null, salary: salary ? parseFloat(salary) : null,
                updated_at: new Date().toISOString()
            });
            
            // ALSO UPDATE THE CORRESPONDING USER ACCOUNT
            await updateUserFromStaff(docId, 'doctor', {
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                email: email,
                specialty: specialty,
                department: getDepartmentFromSpecialty(specialty)
            });
            
            showToast('Doctor record has been successfully updated.', 'success');
        } else {
            // ADD NEW DOCTOR
            const newDoctorId = await getNextDoctorId();
            const newDocId = `staff_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await db.collection('staff').doc(newDocId).set({
                doc_id: newDocId, doctor_id: newDoctorId,
                last_name: lastName, first_name: firstName, middle_name: middleName,
                specialty: specialty, department: getDepartmentFromSpecialty(specialty),
                license_number: licenseNumber, email: email,
                phone_number: phoneNumber, address: address,
                date_joined: dateJoined || null, salary: salary ? parseFloat(salary) : null,
                created_at: new Date().toISOString()
            });
            
            // AUTO-CREATE USER ACCOUNT
            await autoCreateUserAccount({
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                email: email,
                specialty: specialty,
                department: getDepartmentFromSpecialty(specialty)
            }, 'doctor', newDocId);
            
            showToast(`Doctor record for ${firstName} ${lastName} has been successfully added. A user account has been created.`, 'success');
        }
        await loadDoctors();
        hideDoctorModal();
    } catch (error) {
        console.error("Error saving doctor:", error);
        showToast('An error occurred while saving. Please try again.', 'error');
    }
}

function editDoctor(docId) {
    if (!canEditDelete()) {
        showToast('Access restricted. Only administrators can edit doctor records.', 'warning');
        return;
    }
    const doctor = allDoctors.find(d => d.doc_id === docId);
    if (doctor) {
        document.getElementById('doctorModalTitle').textContent = 'Edit Doctor';
        document.getElementById('doctorDocId').value = doctor.doc_id;
        document.getElementById('docLastName').value = doctor.last_name || '';
        document.getElementById('docFirstName').value = doctor.first_name || '';
        document.getElementById('docMiddleName').value = doctor.middle_name || '';
        document.getElementById('docSpecialty').value = doctor.specialty || '';
        document.getElementById('docLicense').value = doctor.license_number || '';
        document.getElementById('docEmail').value = doctor.email || '';
        document.getElementById('docPhone').value = doctor.phone_number || '';
        document.getElementById('docAddress').value = doctor.address || '';
        document.getElementById('docDateJoined').value = doctor.date_joined || '';
        document.getElementById('docSalary').value = doctor.salary || '';
        document.getElementById('doctorModal').classList.add('show');
    }
}

async function deleteDoctor(docId) {
    if (!canEditDelete()) {
        showToast('Access restricted. Only administrators can delete doctor records.', 'warning');
        return;
    }
    
    const doctor = allDoctors.find(d => d.doc_id === docId);
    if (!doctor) return;
    
    const itemName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    
    showDeleteConfirmation(itemName, 'Doctor', async () => {
        try {
            await db.collection('staff').doc(docId).delete();
            showToast('Doctor record has been permanently deleted.', 'success');
            await loadDoctors();
        } catch (error) {
            console.error("Error deleting doctor:", error);
            showToast('An error occurred while deleting. Please try again.', 'error');
        }
    });
}

function searchDoctors() {
    const searchTerm = document.getElementById('doctorSearch').value.toLowerCase();
    const filtered = allDoctors.filter(d => 
        (d.last_name && d.last_name.toLowerCase().includes(searchTerm)) ||
        (d.first_name && d.first_name.toLowerCase().includes(searchTerm)) ||
        (d.specialty && d.specialty.toLowerCase().includes(searchTerm)) ||
        (d.email && d.email.toLowerCase().includes(searchTerm)) ||
        (d.license_number && d.license_number.toLowerCase().includes(searchTerm))
    );
    displayFilteredDoctors(filtered);
}

function sortDoctors() {
    const sortBy = document.getElementById('doctorSortBy').value;
    const sorted = [...allDoctors].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        if (sortBy === 'doctor_id') return (valA || 0) - (valB || 0);
        return String(valA).localeCompare(String(valB));
    });
    displayFilteredDoctors(sorted);
}

function displayFilteredDoctors(doctors) {
    const tableBody = document.getElementById('doctorsTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const isAdmin = canEditDelete();
    
    doctors.forEach(doctor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${doctor.doctor_id || '-'}<\/div>
            <td>${doctor.last_name || '-'}<\/div>
            <td>${doctor.first_name || '-'}<\/div>
            <td>${doctor.specialty || '-'}<\/div>
            <td>${doctor.email || '-'}<\/div>
            <td>${doctor.license_number || '-'}<\/div>
            <td>${doctor.phone_number || '-'}<\/div>
            <td>${doctor.salary ? formatCurrency(doctor.salary) : '-'}<\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewDoctor('${doctor.doc_id}')">View</button>
                    ${isAdmin ? `<button class="edit-btn" onclick="editDoctor('${doctor.doc_id}')">Edit</button>` : ''}
                    ${isAdmin ? `<button class="delete-btn" onclick="deleteDoctor('${doctor.doc_id}')">Delete</button>` : ''}
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// ========== BNS WORKERS CRUD ==========

async function loadBNS() {
    const tableBody = document.getElementById('bnsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Loading BNS workers...<\/div>';

    try {
        const snapshot = await db.collection('bns_workers').orderBy('bns_id').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<td><td colspan="9" style="text-align: center;">No records found. Click "Add BNS Worker" to create a new entry.<\/div>';
            allBNS = [];
            return;
        }
        
        allBNS = [];
        tableBody.innerHTML = '';
        const isAdmin = canEditDelete();
        
        snapshot.forEach(doc => {
            const bns = doc.data();
            allBNS.push(bns);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bns.bns_id || '-'}<\/div>
                <td>${bns.last_name || '-'}<\/div>
                <td>${bns.first_name || '-'}<\/div>
                <td>${bns.email || '-'}<\/div>
                <td>${bns.barangay_assigned || '-'}<\/div>
                <td>${bns.contact_number || '-'}<\/div>
                <td>${bns.date_joined || '-'}<\/div>
                <td><span class="status-badge ${bns.status === 'Active' ? 'status-active' : 'status-inactive'}">${bns.status || 'Active'}</span><\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewBNS('${bns.doc_id}')">View</button>
                        ${isAdmin ? `<button class="edit-btn" onclick="editBNS('${bns.doc_id}')">Edit</button>` : ''}
                        ${isAdmin ? `<button class="delete-btn" onclick="deleteBNS('${bns.doc_id}')">Delete</button>` : ''}
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading BNS:", error);
        tableBody.innerHTML = '<td><td colspan="9" style="text-align: center; color: red;">Unable to load data. Please check your connection.<\/div>';
    }
}

function viewBNS(docId) {
    const bns = allBNS.find(b => b.doc_id === docId);
    if (bns) {
        const statusText = bns.status || 'Active';
        const statusColor = bns.status === 'Active' ? '#2e7d32' : '#c62828';
        
        const content = `
            <div style="line-height: 1.8; font-family: 'Segoe UI', Arial, sans-serif;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; width: 35%; font-weight: 600; color: #2B6896;">BNS ID:<\/td><td style="padding: 8px 0;">${bns.bns_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Full Name:<\/td><td style="padding: 8px 0;">${bns.first_name} ${bns.middle_name ? bns.middle_name + ' ' : ''}${bns.last_name}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Email Address:<\/td><td style="padding: 8px 0;">${bns.email || 'Not Provided'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Assigned Barangay:<\/td><td style="padding: 8px 0;">${bns.barangay_assigned || 'Not Assigned'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Contact Number:<\/td><td style="padding: 8px 0;">${bns.contact_number || 'Not Provided'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Date of Employment:<\/td><td style="padding: 8px 0;">${bns.date_joined || 'Not Recorded'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Employment Status:<\/td><td style="padding: 8px 0;"><span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px;">${statusText}</span><\/td><\/tr>
                </table>
            </div>
        `;
        showViewModal('Barangay Nutrition Scholar Information', content);
    }
}

function showAddBNSModal() {
    if (!canEditDelete()) {
        showToast('Access restricted. Only administrators can add new BNS worker records.', 'warning');
        return;
    }
    document.getElementById('bnsModalTitle').textContent = 'Add New BNS Worker';
    document.getElementById('bnsForm').reset();
    document.getElementById('bnsDocId').value = '';
    document.getElementById('bnsStatus').value = 'Active';
    document.getElementById('bnsModal').classList.add('show');
}

function hideBNSModal() {
    document.getElementById('bnsModal').classList.remove('show');
}

async function getNextBNSId() {
    try {
        const snapshot = await db.collection('bns_workers').orderBy('bns_id', 'desc').limit(1).get();
        if (snapshot.empty) return 1;
        const lastItem = snapshot.docs[0].data();
        return (lastItem.bns_id || 0) + 1;
    } catch (error) {
        return allBNS.length + 1;
    }
}

async function saveBNS() {
    const lastName = document.getElementById('bnsLastName').value.trim();
    const firstName = document.getElementById('bnsFirstName').value.trim();
    const middleName = document.getElementById('bnsMiddleName').value.trim();
    const email = document.getElementById('bnsEmail').value.trim();
    const barangay = document.getElementById('bnsBarangay').value.trim();
    const contact = document.getElementById('bnsContact').value.trim();
    const dateJoined = document.getElementById('bnsDateJoined').value;
    const status = document.getElementById('bnsStatus').value;
    const docId = document.getElementById('bnsDocId').value;
    
    if (!lastName || !firstName || !email || !barangay) {
        showToast('Please complete all required fields before submitting.', 'warning');
        return;
    }
    
    try {
        if (docId) {
            // UPDATE EXISTING BNS
            await db.collection('bns_workers').doc(docId).update({
                last_name: lastName, first_name: firstName, middle_name: middleName,
                email: email, barangay_assigned: barangay, contact_number: contact,
                date_joined: dateJoined || null, status: status,
                updated_at: new Date().toISOString()
            });
            
            // ALSO UPDATE THE CORRESPONDING USER ACCOUNT
            await updateUserFromStaff(docId, 'bns', {
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                email: email
            });
            
            showToast('BNS worker record has been successfully updated.', 'success');
        } else {
            // ADD NEW BNS
            const newBNSId = await getNextBNSId();
            const newDocId = `bns_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await db.collection('bns_workers').doc(newDocId).set({
                doc_id: newDocId, bns_id: newBNSId,
                last_name: lastName, first_name: firstName, middle_name: middleName,
                email: email, barangay_assigned: barangay, contact_number: contact,
                date_joined: dateJoined || null, status: status,
                created_at: new Date().toISOString()
            });
            
            // AUTO-CREATE USER ACCOUNT
            await autoCreateUserAccount({
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                email: email
            }, 'bns', newDocId);
            
            showToast(`BNS worker record for ${firstName} ${lastName} has been successfully added. A user account has been created.`, 'success');
        }
        await loadBNS();
        hideBNSModal();
    } catch (error) {
        console.error("Error saving BNS:", error);
        showToast('An error occurred while saving. Please try again.', 'error');
    }
}

function editBNS(docId) {
    if (!canEditDelete()) {
        showToast('Access restricted. Only administrators can edit BNS worker records.', 'warning');
        return;
    }
    const bns = allBNS.find(b => b.doc_id === docId);
    if (bns) {
        document.getElementById('bnsModalTitle').textContent = 'Edit BNS Worker';
        document.getElementById('bnsDocId').value = bns.doc_id;
        document.getElementById('bnsLastName').value = bns.last_name || '';
        document.getElementById('bnsFirstName').value = bns.first_name || '';
        document.getElementById('bnsMiddleName').value = bns.middle_name || '';
        document.getElementById('bnsEmail').value = bns.email || '';
        document.getElementById('bnsBarangay').value = bns.barangay_assigned || '';
        document.getElementById('bnsContact').value = bns.contact_number || '';
        document.getElementById('bnsDateJoined').value = bns.date_joined || '';
        document.getElementById('bnsStatus').value = bns.status || 'Active';
        document.getElementById('bnsModal').classList.add('show');
    }
}

async function deleteBNS(docId) {
    if (!canEditDelete()) {
        showToast('Access restricted. Only administrators can delete BNS worker records.', 'warning');
        return;
    }
    
    const bns = allBNS.find(b => b.doc_id === docId);
    if (!bns) return;
    
    const itemName = `${bns.first_name} ${bns.last_name}`;
    
    showDeleteConfirmation(itemName, 'BNS Worker', async () => {
        try {
            await db.collection('bns_workers').doc(docId).delete();
            showToast('BNS worker record has been permanently deleted.', 'success');
            await loadBNS();
        } catch (error) {
            console.error("Error deleting BNS:", error);
            showToast('An error occurred while deleting. Please try again.', 'error');
        }
    });
}

function searchBNS() {
    const searchTerm = document.getElementById('bnsSearch').value.toLowerCase();
    const filtered = allBNS.filter(b => 
        (b.last_name && b.last_name.toLowerCase().includes(searchTerm)) ||
        (b.first_name && b.first_name.toLowerCase().includes(searchTerm)) ||
        (b.email && b.email.toLowerCase().includes(searchTerm)) ||
        (b.barangay_assigned && b.barangay_assigned.toLowerCase().includes(searchTerm)) ||
        (b.contact_number && b.contact_number.toLowerCase().includes(searchTerm))
    );
    displayFilteredBNS(filtered);
}

function sortBNS() {
    const sortBy = document.getElementById('bnsSortBy').value;
    const sorted = [...allBNS].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        if (sortBy === 'bns_id') return (valA || 0) - (valB || 0);
        return String(valA).localeCompare(String(valB));
    });
    displayFilteredBNS(sorted);
}

function displayFilteredBNS(bnsList) {
    const tableBody = document.getElementById('bnsTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const isAdmin = canEditDelete();
    
    bnsList.forEach(bns => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${bns.bns_id || '-'}<\/div>
            <td>${bns.last_name || '-'}<\/div>
            <td>${bns.first_name || '-'}<\/div>
            <td>${bns.email || '-'}<\/div>
            <td>${bns.barangay_assigned || '-'}<\/div>
            <td>${bns.contact_number || '-'}<\/div>
            <td>${bns.date_joined || '-'}<\/div>
            <td><span class="status-badge ${bns.status === 'Active' ? 'status-active' : 'status-inactive'}">${bns.status || 'Active'}</span><\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewBNS('${bns.doc_id}')">View</button>
                    ${isAdmin ? `<button class="edit-btn" onclick="editBNS('${bns.doc_id}')">Edit</button>` : ''}
                    ${isAdmin ? `<button class="delete-btn" onclick="deleteBNS('${bns.doc_id}')">Delete</button>` : ''}
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// ========== NURSES CRUD ==========

async function loadNurses() {
    const tableBody = document.getElementById('nursesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Loading nurses...<\/div>';

    try {
        const snapshot = await db.collection('nurses').orderBy('nurse_id').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No records found. Click "Add Nurse" to create a new entry.<\/div>';
            allNurses = [];
            return;
        }
        
        allNurses = [];
        tableBody.innerHTML = '';
        const isAdmin = canEditDelete();
        
        snapshot.forEach(doc => {
            const nurse = doc.data();
            allNurses.push(nurse);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${nurse.nurse_id || '-'}<\/div>
                <td>${nurse.last_name || '-'}<\/div>
                <td>${nurse.first_name || '-'}<\/div>
                <td>${nurse.email || '-'}<\/div>
                <td>${nurse.license_number || '-'}<\/div>
                <td>${nurse.specialty || '-'}<\/div>
                <td>${nurse.phone_number || '-'}<\/div>
                <td>${nurse.date_joined || '-'}<\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewNurse('${nurse.doc_id}')">View</button>
                        ${isAdmin ? `<button class="edit-btn" onclick="editNurse('${nurse.doc_id}')">Edit</button>` : ''}
                        ${isAdmin ? `<button class="delete-btn" onclick="deleteNurse('${nurse.doc_id}')">Delete</button>` : ''}
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading nurses:", error);
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: red;">Unable to load data. Please check your connection.<\/div>';
    }
}

function viewNurse(docId) {
    const nurse = allNurses.find(n => n.doc_id === docId);
    if (nurse) {
        const content = `
            <div style="line-height: 1.8; font-family: 'Segoe UI', Arial, sans-serif;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; width: 35%; font-weight: 600; color: #2B6896;">Nurse ID:<\/td><td style="padding: 8px 0;">${nurse.nurse_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Full Name:<\/td><td style="padding: 8px 0;">${nurse.first_name} ${nurse.middle_name ? nurse.middle_name + ' ' : ''}${nurse.last_name}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Email Address:<\/td><td style="padding: 8px 0;">${nurse.email || 'Not Provided'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">License Number:<\/td><td style="padding: 8px 0;">${nurse.license_number || 'Not Provided'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Area of Specialty:<\/td><td style="padding: 8px 0;">${nurse.specialty || 'General Nursing'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Contact Number:<\/td><td style="padding: 8px 0;">${nurse.phone_number || 'Not Provided'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Date of Employment:<\/td><td style="padding: 8px 0;">${nurse.date_joined || 'Not Recorded'}<\/td><\/tr>
                </table>
            </div>
        `;
        showViewModal('Nurse Information', content);
    }
}

function showAddNurseModal() {
    if (!canEditDelete()) {
        showToast('Access restricted. Only administrators can add new nurse records.', 'warning');
        return;
    }
    document.getElementById('nurseModalTitle').textContent = 'Add New Nurse';
    document.getElementById('nurseForm').reset();
    document.getElementById('nurseDocId').value = '';
    document.getElementById('nurseModal').classList.add('show');
}

function hideNurseModal() {
    document.getElementById('nurseModal').classList.remove('show');
}

async function getNextNurseId() {
    try {
        const snapshot = await db.collection('nurses').orderBy('nurse_id', 'desc').limit(1).get();
        if (snapshot.empty) return 1;
        const lastItem = snapshot.docs[0].data();
        return (lastItem.nurse_id || 0) + 1;
    } catch (error) {
        return allNurses.length + 1;
    }
}

async function saveNurse() {
    const lastName = document.getElementById('nurseLastName').value.trim();
    const firstName = document.getElementById('nurseFirstName').value.trim();
    const middleName = document.getElementById('nurseMiddleName').value.trim();
    const email = document.getElementById('nurseEmail').value.trim();
    const licenseNumber = document.getElementById('nurseLicense').value.trim();
    const specialty = document.getElementById('nurseSpecialty').value;
    const phoneNumber = document.getElementById('nursePhone').value.trim();
    const dateJoined = document.getElementById('nurseDateJoined').value;
    const docId = document.getElementById('nurseDocId').value;
    
    if (!lastName || !firstName || !email || !licenseNumber) {
        showToast('Please complete all required fields before submitting.', 'warning');
        return;
    }
    
    try {
        if (docId) {
            // UPDATE EXISTING NURSE
            await db.collection('nurses').doc(docId).update({
                last_name: lastName, first_name: firstName, middle_name: middleName,
                email: email, license_number: licenseNumber, specialty: specialty,
                phone_number: phoneNumber, date_joined: dateJoined || null,
                updated_at: new Date().toISOString()
            });
            
            // ALSO UPDATE THE CORRESPONDING USER ACCOUNT
            await updateUserFromStaff(docId, 'nurse', {
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                email: email,
                specialty: specialty
            });
            
            showToast('Nurse record has been successfully updated.', 'success');
        } else {
            // ADD NEW NURSE
            const newNurseId = await getNextNurseId();
            const newDocId = `nurse_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await db.collection('nurses').doc(newDocId).set({
                doc_id: newDocId, nurse_id: newNurseId,
                last_name: lastName, first_name: firstName, middle_name: middleName,
                email: email, license_number: licenseNumber, specialty: specialty,
                phone_number: phoneNumber, date_joined: dateJoined || null,
                created_at: new Date().toISOString()
            });
            
            // AUTO-CREATE USER ACCOUNT
            await autoCreateUserAccount({
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                email: email,
                specialty: specialty
            }, 'nurse', newDocId);
            
            showToast(`Nurse record for ${firstName} ${lastName} has been successfully added. A user account has been created.`, 'success');
        }
        await loadNurses();
        hideNurseModal();
    } catch (error) {
        console.error("Error saving nurse:", error);
        showToast('An error occurred while saving. Please try again.', 'error');
    }
}

function editNurse(docId) {
    if (!canEditDelete()) {
        showToast('Access restricted. Only administrators can edit nurse records.', 'warning');
        return;
    }
    const nurse = allNurses.find(n => n.doc_id === docId);
    if (nurse) {
        document.getElementById('nurseModalTitle').textContent = 'Edit Nurse';
        document.getElementById('nurseDocId').value = nurse.doc_id;
        document.getElementById('nurseLastName').value = nurse.last_name || '';
        document.getElementById('nurseFirstName').value = nurse.first_name || '';
        document.getElementById('nurseMiddleName').value = nurse.middle_name || '';
        document.getElementById('nurseEmail').value = nurse.email || '';
        document.getElementById('nurseLicense').value = nurse.license_number || '';
        document.getElementById('nurseSpecialty').value = nurse.specialty || '';
        document.getElementById('nursePhone').value = nurse.phone_number || '';
        document.getElementById('nurseDateJoined').value = nurse.date_joined || '';
        document.getElementById('nurseModal').classList.add('show');
    }
}

async function deleteNurse(docId) {
    if (!canEditDelete()) {
        showToast('Access restricted. Only administrators can delete nurse records.', 'warning');
        return;
    }
    
    const nurse = allNurses.find(n => n.doc_id === docId);
    if (!nurse) return;
    
    const itemName = `${nurse.first_name} ${nurse.last_name}`;
    
    showDeleteConfirmation(itemName, 'Nurse', async () => {
        try {
            await db.collection('nurses').doc(docId).delete();
            showToast('Nurse record has been permanently deleted.', 'success');
            await loadNurses();
        } catch (error) {
            console.error("Error deleting nurse:", error);
            showToast('An error occurred while deleting. Please try again.', 'error');
        }
    });
}

function searchNurses() {
    const searchTerm = document.getElementById('nurseSearch').value.toLowerCase();
    const filtered = allNurses.filter(n => 
        (n.last_name && n.last_name.toLowerCase().includes(searchTerm)) ||
        (n.first_name && n.first_name.toLowerCase().includes(searchTerm)) ||
        (n.email && n.email.toLowerCase().includes(searchTerm)) ||
        (n.license_number && n.license_number.toLowerCase().includes(searchTerm)) ||
        (n.specialty && n.specialty.toLowerCase().includes(searchTerm))
    );
    displayFilteredNurses(filtered);
}

function sortNurses() {
    const sortBy = document.getElementById('nurseSortBy').value;
    const sorted = [...allNurses].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        if (sortBy === 'nurse_id') return (valA || 0) - (valB || 0);
        return String(valA).localeCompare(String(valB));
    });
    displayFilteredNurses(sorted);
}

function displayFilteredNurses(nursesList) {
    const tableBody = document.getElementById('nursesTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const isAdmin = canEditDelete();
    
    nursesList.forEach(nurse => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${nurse.nurse_id || '-'}<\/div>
            <td>${nurse.last_name || '-'}<\/div>
            <td>${nurse.first_name || '-'}<\/div>
            <td>${nurse.email || '-'}<\/div>
            <td>${nurse.license_number || '-'}<\/div>
            <td>${nurse.specialty || '-'}<\/div>
            <td>${nurse.phone_number || '-'}<\/div>
            <td>${nurse.date_joined || '-'}<\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewNurse('${nurse.doc_id}')">View</button>
                    ${isAdmin ? `<button class="edit-btn" onclick="editNurse('${nurse.doc_id}')">Edit</button>` : ''}
                    ${isAdmin ? `<button class="delete-btn" onclick="deleteNurse('${nurse.doc_id}')">Delete</button>` : ''}
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// ========== IT STAFF CRUD ==========

async function loadITStaff() {
    const tableBody = document.getElementById('itTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Loading IT staff...<\/div>';

    try {
        const snapshot = await db.collection('it_staff').orderBy('it_id').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No records found. Click "Add IT Staff" to create a new entry.<\/div>';
            allITStaff = [];
            return;
        }
        
        allITStaff = [];
        tableBody.innerHTML = '';
        const isAdmin = canEditDelete();
        
        snapshot.forEach(doc => {
            const staff = doc.data();
            allITStaff.push(staff);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${staff.it_id || '-'}<\/div>
                <td>${staff.last_name || '-'}<\/div>
                <td>${staff.first_name || '-'}<\/div>
                <td>${staff.email || '-'}<\/div>
                <td>${staff.position || '-'}<\/div>
                <td>${staff.phone_number || '-'}<\/div>
                <td>${staff.date_joined || '-'}<\/div>
                <td>${staff.salary ? formatCurrency(staff.salary) : '-'}<\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewITStaff('${staff.doc_id}')">View</button>
                        ${isAdmin ? `<button class="edit-btn" onclick="editITStaff('${staff.doc_id}')">Edit</button>` : ''}
                        ${isAdmin ? `<button class="delete-btn" onclick="deleteITStaff('${staff.doc_id}')">Delete</button>` : ''}
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading IT staff:", error);
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: red;">Unable to load data. Please check your connection.<\/div>';
    }
}

function viewITStaff(docId) {
    const staff = allITStaff.find(s => s.doc_id === docId);
    if (staff) {
        const content = `
            <div style="line-height: 1.8; font-family: 'Segoe UI', Arial, sans-serif;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; width: 35%; font-weight: 600; color: #2B6896;">Staff ID:<\/td><td style="padding: 8px 0;">${staff.it_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Full Name:<\/td><td style="padding: 8px 0;">${staff.first_name} ${staff.middle_name ? staff.middle_name + ' ' : ''}${staff.last_name}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Email Address:<\/td><td style="padding: 8px 0;">${staff.email || 'Not Provided'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Position:<\/td><td style="padding: 8px 0;">${staff.position || 'Not Specified'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Contact Number:<\/td><td style="padding: 8px 0;">${staff.phone_number || 'Not Provided'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Monthly Salary:<\/td><td style="padding: 8px 0;">${staff.salary ? formatCurrency(staff.salary) : 'Not Specified'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Date of Employment:<\/td><td style="padding: 8px 0;">${staff.date_joined || 'Not Recorded'}<\/td><\/tr>
                </table>
            </div>
        `;
        showViewModal('IT Staff Information', content);
    }
}

function showAddITModal() {
    if (!canEditDelete()) {
        showToast('Access restricted. Only administrators can add new IT staff records.', 'warning');
        return;
    }
    document.getElementById('itModalTitle').textContent = 'Add New IT Staff';
    document.getElementById('itForm').reset();
    document.getElementById('itDocId').value = '';
    document.getElementById('itModal').classList.add('show');
}

function hideITModal() {
    document.getElementById('itModal').classList.remove('show');
}

async function getNextITId() {
    try {
        const snapshot = await db.collection('it_staff').orderBy('it_id', 'desc').limit(1).get();
        if (snapshot.empty) return 1;
        const lastItem = snapshot.docs[0].data();
        return (lastItem.it_id || 0) + 1;
    } catch (error) {
        return allITStaff.length + 1;
    }
}

async function saveITStaff() {
    const lastName = document.getElementById('itLastName').value.trim();
    const firstName = document.getElementById('itFirstName').value.trim();
    const middleName = document.getElementById('itMiddleName').value.trim();
    const email = document.getElementById('itEmail').value.trim();
    const position = document.getElementById('itPosition').value;
    const phoneNumber = document.getElementById('itPhone').value.trim();
    const dateJoined = document.getElementById('itDateJoined').value;
    const salary = document.getElementById('itSalary').value;
    const docId = document.getElementById('itDocId').value;
    
    if (!lastName || !firstName || !email || !position) {
        showToast('Please complete all required fields before submitting.', 'warning');
        return;
    }
    
    try {
        if (docId) {
            // UPDATE EXISTING IT STAFF
            await db.collection('it_staff').doc(docId).update({
                last_name: lastName, first_name: firstName, middle_name: middleName,
                email: email, position: position, phone_number: phoneNumber,
                date_joined: dateJoined || null, salary: salary ? parseFloat(salary) : null,
                updated_at: new Date().toISOString()
            });
            
            // ALSO UPDATE THE CORRESPONDING USER ACCOUNT
            await updateUserFromStaff(docId, 'it', {
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                email: email,
                position: position
            });
            
            showToast('IT staff record has been successfully updated.', 'success');
        } else {
            // ADD NEW IT STAFF
            const newITId = await getNextITId();
            const newDocId = `it_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await db.collection('it_staff').doc(newDocId).set({
                doc_id: newDocId, it_id: newITId,
                last_name: lastName, first_name: firstName, middle_name: middleName,
                email: email, position: position, phone_number: phoneNumber,
                date_joined: dateJoined || null, salary: salary ? parseFloat(salary) : null,
                department: 'Information Technology Department',
                created_at: new Date().toISOString()
            });
            
            // AUTO-CREATE USER ACCOUNT
            await autoCreateUserAccount({
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                email: email,
                position: position
            }, 'it', newDocId);
            
            showToast(`IT staff record for ${firstName} ${lastName} has been successfully added. A user account has been created.`, 'success');
        }
        await loadITStaff();
        hideITModal();
    } catch (error) {
        console.error("Error saving IT staff:", error);
        showToast('An error occurred while saving. Please try again.', 'error');
    }
}

function editITStaff(docId) {
    if (!canEditDelete()) {
        showToast('Access restricted. Only administrators can edit IT staff records.', 'warning');
        return;
    }
    const staff = allITStaff.find(s => s.doc_id === docId);
    if (staff) {
        document.getElementById('itModalTitle').textContent = 'Edit IT Staff';
        document.getElementById('itDocId').value = staff.doc_id;
        document.getElementById('itLastName').value = staff.last_name || '';
        document.getElementById('itFirstName').value = staff.first_name || '';
        document.getElementById('itMiddleName').value = staff.middle_name || '';
        document.getElementById('itEmail').value = staff.email || '';
        document.getElementById('itPosition').value = staff.position || '';
        document.getElementById('itPhone').value = staff.phone_number || '';
        document.getElementById('itDateJoined').value = staff.date_joined || '';
        document.getElementById('itSalary').value = staff.salary || '';
        document.getElementById('itModal').classList.add('show');
    }
}

async function deleteITStaff(docId) {
    if (!canEditDelete()) {
        showToast('Access restricted. Only administrators can delete IT staff records.', 'warning');
        return;
    }
    
    const staff = allITStaff.find(s => s.doc_id === docId);
    if (!staff) return;
    
    const itemName = `${staff.first_name} ${staff.last_name}`;
    
    showDeleteConfirmation(itemName, 'IT Staff', async () => {
        try {
            await db.collection('it_staff').doc(docId).delete();
            showToast('IT staff record has been permanently deleted.', 'success');
            await loadITStaff();
        } catch (error) {
            console.error("Error deleting IT staff:", error);
            showToast('An error occurred while deleting. Please try again.', 'error');
        }
    });
}

// ========== AUTO-CREATE USER ACCOUNT WHEN STAFF IS ADDED ==========
async function autoCreateUserAccount(staffData, staffType, staffDocId) {
    try {
        // Generate username
        const username = generateUsernameForStaff(staffData.first_name, staffData.middle_name, staffData.last_name);
        
        // Check if username already exists
        const existingUser = await db.collection('users').where('username', '==', username).get();
        let finalUsername = username;
        let counter = 1;
        
        while (!existingUser.empty) {
            finalUsername = `${username}${counter}`;
            const checkAgain = await db.collection('users').where('username', '==', finalUsername).get();
            if (checkAgain.empty) break;
            counter++;
        }
        
        // Determine position and department based on staff type
        let position = '';
        let department = '';
        let accessLevel = '';
        
        if (staffType === 'doctor') {
            position = staffData.specialty || 'Doctor';
            department = staffData.department || getDepartmentFromSpecialty(staffData.specialty);
            accessLevel = 'Doctor';
        } else if (staffType === 'bns') {
            position = 'BNS Worker';
            department = 'Barangay Nutrition';
            accessLevel = 'BNS Worker';
        } else if (staffType === 'nurse') {
            position = staffData.specialty || 'Nurse';
            department = 'Nursing Department';
            accessLevel = 'Nurse';
        } else if (staffType === 'it') {
            position = staffData.position || 'IT Staff';
            department = 'Information Technology Department';
            accessLevel = 'IT';
        }
        
        // Get next user ID
        const usersSnapshot = await db.collection('users').get();
        const nextUserId = (usersSnapshot.size + 1).toString();
        const today = new Date();
        const dateCreated = today.toISOString().split('T')[0];
        
        const newUser = {
            user_id: nextUserId,
            staff_type: staffType,
            staff_id: staffDocId,
            username: finalUsername,
            password: 'password123', // Default password
            name: `${staffData.first_name} ${staffData.middle_name ? staffData.middle_name + ' ' : ''}${staffData.last_name}`,
            email: staffData.email || '',
            position: position,
            department: department,
            access_level: accessLevel,
            date_created: dateCreated,
            created_at: new Date().toISOString()
        };
        
        await db.collection('users').doc(nextUserId).set(newUser);
        console.log(`User account auto-created for ${staffData.first_name} ${staffData.last_name} with username: ${finalUsername}`);
        return { success: true, username: finalUsername, password: 'password123' };
        
    } catch (error) {
        console.error("Error auto-creating user account:", error);
        return { success: false, error: error.message };
    }
}

// Generate username for staff
function generateUsernameForStaff(firstName, middleName, lastName) {
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

// ========== UPDATE USER WHEN STAFF IS UPDATED ==========
async function updateUserFromStaff(staffId, staffType, updatedData) {
    try {
        // Find user with this staff_id
        const usersSnapshot = await db.collection('users').where('staff_id', '==', staffId).get();
        
        if (usersSnapshot.empty) {
            console.log("No user found for staff ID:", staffId);
            return;
        }
        
        let userDoc = null;
        let userId = null;
        usersSnapshot.forEach(doc => {
            userDoc = doc;
            userId = doc.id;
        });
        
        // Prepare update data
        const updateData = {
            name: `${updatedData.first_name} ${updatedData.middle_name ? updatedData.middle_name + ' ' : ''}${updatedData.last_name}`,
            email: updatedData.email || '',
            updated_at: new Date().toISOString()
        };
        
        // Update position and department based on staff type
        if (staffType === 'doctor') {
            updateData.position = updatedData.specialty || 'Doctor';
            updateData.department = updatedData.department || getDepartmentFromSpecialty(updatedData.specialty);
        } else if (staffType === 'bns') {
            updateData.position = 'BNS Worker';
            updateData.department = 'Barangay Nutrition';
        } else if (staffType === 'nurse') {
            updateData.position = updatedData.specialty || 'Nurse';
            updateData.department = 'Nursing Department';
        } else if (staffType === 'it') {
            updateData.position = updatedData.position || 'IT Staff';
            updateData.department = 'Information Technology Department';
        }
        
        await db.collection('users').doc(userId).update(updateData);
        console.log("User account updated from staff changes");
        
    } catch (error) {
        console.error("Error updating user from staff:", error);
    }
}

function searchITStaff() {
    const searchTerm = document.getElementById('itSearch').value.toLowerCase();
    const filtered = allITStaff.filter(s => 
        (s.last_name && s.last_name.toLowerCase().includes(searchTerm)) ||
        (s.first_name && s.first_name.toLowerCase().includes(searchTerm)) ||
        (s.email && s.email.toLowerCase().includes(searchTerm)) ||
        (s.position && s.position.toLowerCase().includes(searchTerm)) ||
        (s.phone_number && s.phone_number.toLowerCase().includes(searchTerm))
    );
    displayFilteredITStaff(filtered);
}

function sortITStaff() {
    const sortBy = document.getElementById('itSortBy').value;
    const sorted = [...allITStaff].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        if (sortBy === 'it_id') return (valA || 0) - (valB || 0);
        return String(valA).localeCompare(String(valB));
    });
    displayFilteredITStaff(sorted);
}

function displayFilteredITStaff(staffList) {
    const tableBody = document.getElementById('itTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const isAdmin = canEditDelete();
    
    staffList.forEach(staff => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${staff.it_id || '-'}<\/div>
            <td>${staff.last_name || '-'}<\/div>
            <td>${staff.first_name || '-'}<\/div>
            <td>${staff.email || '-'}<\/div>
            <td>${staff.position || '-'}<\/div>
            <td>${staff.phone_number || '-'}<\/div>
            <td>${staff.date_joined || '-'}<\/div>
            <td>${staff.salary ? formatCurrency(staff.salary) : '-'}<\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewITStaff('${staff.doc_id}')">View</button>
                    ${isAdmin ? `<button class="edit-btn" onclick="editITStaff('${staff.doc_id}')">Edit</button>` : ''}
                    ${isAdmin ? `<button class="delete-btn" onclick="deleteITStaff('${staff.doc_id}')">Delete</button>` : ''}
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    getCurrentUserRole();
    loadDoctors();
    loadBNS();
    loadNurses();
    loadITStaff();
});