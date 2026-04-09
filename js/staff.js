// staff.js
// ===== STAFF PAGE WITH FIREBASE =====

let allStaff = [];

// Display current date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Get specialty badge class (no background, just text color)
function getSpecialtyBadgeClass(specialty) {
    switch(specialty) {
        case 'Pediatrics':
            return 'specialty-pediatrics';
        case 'Obstetrics and Gynecology':
            return 'specialty-obgyn';
        case 'Geriatrics':
            return 'specialty-geriatrics';
        case 'BNS Worker':
            return 'specialty-bns';
        case 'Nurse':
            return 'specialty-nurse';
        case 'IT':
            return 'specialty-it';
        default:
            return 'specialty-default';
    }
}

// Get department badge class
function getDepartmentBadgeClass(department) {
    switch(department) {
        case 'Nursing':
            return 'dept-nursing';
        case 'BNS':
            return 'dept-bns';
        case 'Pediatrics Department':
            return 'dept-pediatrics';
        case 'Obstetrics Department':
            return 'dept-obstetrics';
        case 'Geriatrics Department':
            return 'dept-geriatrics';
        case 'IT Department':
            return 'dept-it';
        default:
            return 'dept-default';
    }
}

// Load staff from Firestore
async function loadStaff() {
    const tableBody = document.getElementById('staffTableBody');
    if (!tableBody) return;
    
    if (typeof db === 'undefined') {
        console.error("Firestore db is not defined!");
        tableBody.innerHTML = '<tr><td colspan="12" style="text-align: center; color: red;">Firebase not initialized.<\/div>';
        return;
    }
    
    tableBody.innerHTML = '<td><td colspan="12" style="text-align: center;">Loading staff...<\/div>';

    try {
        const snapshot = await db.collection('staff').orderBy('doctor_id').get();

        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="12" style="text-align: center;">No staff found. Click "+ Add Staff" to add.<\/div>';
            allStaff = [];
            return;
        }

        allStaff = [];
        tableBody.innerHTML = '';

        snapshot.forEach(doc => {
            const person = doc.data();
            allStaff.push(person);
            const specialtyClass = getSpecialtyBadgeClass(person.specialty);
            const departmentClass = getDepartmentBadgeClass(person.department);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${person.doctor_id || '-'}<\/div>
                <td>${person.last_name || '-'}<\/div>
                <td>${person.first_name || '-'}<\/div>
                <td>${person.middle_name || '-'}<\/div>
                <td><span class="specialty-badge ${specialtyClass}">${person.specialty || '-'}</span><\/div>
                <td><span class="dept-badge ${departmentClass}">${person.department || '-'}</span><\/div>
                <td>${person.license_number || '-'}<\/div>
                <td>${person.phone_number || '-'}<\/div>
                <td>${person.address || '-'}<\/div>
                <td>${formatDate(person.date_joined)}<\/div>
                <td>${person.salary ? formatCurrency(person.salary) : '-'}<\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewStaff('${person.doc_id}')">View</button>
                        <button class="edit-btn" onclick="editStaff('${person.doc_id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteStaff('${person.doc_id}')">Delete</button>
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading staff:", error);
        tableBody.innerHTML = `<tr><td colspan="12" style="text-align: center; color: red;">Error: ${error.message}<\/div><\/div>`;
    }
}

// Search staff
function searchStaff() {
    const searchTerm = document.getElementById('staffSearch').value.toLowerCase();
    const filteredStaff = allStaff.filter(person => 
        (person.last_name && person.last_name.toLowerCase().includes(searchTerm)) ||
        (person.first_name && person.first_name.toLowerCase().includes(searchTerm)) ||
        (person.middle_name && person.middle_name.toLowerCase().includes(searchTerm)) ||
        (person.specialty && person.specialty.toLowerCase().includes(searchTerm)) ||
        (person.department && person.department.toLowerCase().includes(searchTerm)) ||
        (person.license_number && person.license_number.toLowerCase().includes(searchTerm)) ||
        (person.address && person.address.toLowerCase().includes(searchTerm))
    );
    displayFilteredStaff(filteredStaff);
}

// Sort staff
function sortStaff() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedStaff = [...allStaff].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'doctor_id' || sortBy === 'salary') {
            return (valA || 0) - (valB || 0);
        }
        if (sortBy === 'date_joined') {
            return new Date(valA) - new Date(valB);
        }
        return String(valA).localeCompare(String(valB));
    });
    displayFilteredStaff(sortedStaff);
}

// Display filtered/sorted staff
function displayFilteredStaff(staffList) {
    const tableBody = document.getElementById('staffTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    staffList.forEach(person => {
        const specialtyClass = getSpecialtyBadgeClass(person.specialty);
        const departmentClass = getDepartmentBadgeClass(person.department);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${person.doctor_id || '-'}<\/div>
            <td>${person.last_name || '-'}<\/div>
            <td>${person.first_name || '-'}<\/div>
            <td>${person.middle_name || '-'}<\/div>
            <td><span class="specialty-badge ${specialtyClass}">${person.specialty || '-'}</span><\/div>
            <td><span class="dept-badge ${departmentClass}">${person.department || '-'}</span><\/div>
            <td>${person.license_number || '-'}<\/div>
            <td>${person.phone_number || '-'}<\/div>
            <td>${person.address || '-'}<\/div>
            <td>${formatDate(person.date_joined)}<\/div>
            <td>${person.salary ? formatCurrency(person.salary) : '-'}<\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewStaff('${person.doc_id}')">View</button>
                    <button class="edit-btn" onclick="editStaff('${person.doc_id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteStaff('${person.doc_id}')">Delete</button>
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// Generate unique document ID
function generateDocId() {
    return 'staff_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

// Get next sequential doctor ID
async function getNextDoctorId() {
    try {
        const snapshot = await db.collection('staff').orderBy('doctor_id', 'desc').limit(1).get();
        if (snapshot.empty) {
            return 1;
        }
        const lastItem = snapshot.docs[0].data();
        return (lastItem.doctor_id || 0) + 1;
    } catch (error) {
        console.error("Error getting next doctor ID:", error);
        return allStaff.length + 1;
    }
}

// Show add staff modal
function showAddStaffModal() {
    document.getElementById('addStaffModal').classList.add('show');
}

// Hide add staff modal
function hideAddStaffModal() {
    document.getElementById('addStaffModal').classList.remove('show');
    clearStaffForm();
}

// Clear staff form
function clearStaffForm() {
    document.getElementById('staffForm').reset();
}

// Save new staff to Firestore
async function saveStaff() {
    const lastName = document.getElementById('lastName').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const middleName = document.getElementById('middleName').value.trim();
    const specialty = document.getElementById('specialty').value;
    const licenseNumber = document.getElementById('licenseNumber').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const address = document.getElementById('address').value.trim();
    const department = document.getElementById('department').value;
    const dateJoined = document.getElementById('dateJoined').value;
    const salary = document.getElementById('salary').value;
    
    if (!lastName || !firstName || !specialty || !licenseNumber || !address || !department) {
        alert('Please fill in all required fields');
        return;
    }
    
    const docId = generateDocId();
    const nextDoctorId = await getNextDoctorId();
    
    const newStaff = {
        doc_id: docId,
        doctor_id: nextDoctorId,
        last_name: lastName,
        first_name: firstName,
        middle_name: middleName || '',
        specialty: specialty,
        department: department,
        license_number: licenseNumber,
        phone_number: phoneNumber || '',
        address: address,
        date_joined: dateJoined || null,
        salary: salary ? parseFloat(salary) : null,
        created_at: new Date().toISOString()
    };
    
    try {
        await db.collection('staff').doc(docId).set(newStaff);
        alert(`Staff member ${firstName} ${lastName} added successfully with ID: ${nextDoctorId}`);
        await loadStaff();
        hideAddStaffModal();
    } catch (error) {
        console.error("Error saving staff:", error);
        alert("Error saving staff: " + error.message);
    }
}

// View staff
function viewStaff(docId) {
    const person = allStaff.find(s => s.doc_id === docId);
    if (person) {
        alert(`STAFF DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID: ${person.doctor_id}
Name: ${person.first_name} ${person.middle_name} ${person.last_name}
Specialty: ${person.specialty}
Department: ${person.department}
License: ${person.license_number}
Phone: ${person.phone_number || 'N/A'}
Address: ${person.address}
Date Joined: ${formatDate(person.date_joined)}
Salary: ${person.salary ? formatCurrency(person.salary) : 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }
}

// Edit staff
function editStaff(docId) {
    alert(`Edit staff member\n\nThis feature will be implemented in the next phase.`);
}

// Delete staff from Firestore
async function deleteStaff(docId) {
    if (confirm(`Delete this staff member?`)) {
        try {
            await db.collection('staff').doc(docId).delete();
            alert(`Staff member deleted successfully.`);
            await loadStaff();
        } catch (error) {
            console.error("Error deleting staff:", error);
            alert("Error deleting staff. Please try again.");
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadStaff();
    
    document.getElementById('staffSearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchStaff();
        }
    });
});