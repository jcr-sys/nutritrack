// ===== STAFF PAGE FUNCTIONALITY =====

// Sample staff data based on Doctors table
let staff = [
    {
        doctor_id: 1,
        last_name: 'Filio',
        first_name: 'Mary',
        middle_name: 'Lauriano',
        specialty: 'Pediatrics',
        license_number: 'FILIO123',
        phone_number: '09123456789',
        address: 'Teresa, Rizal',
        date_joined: '2012-11-19',
        salary: 70000
    },
    {
        doctor_id: 2,
        last_name: 'Santos',
        first_name: 'John',
        middle_name: 'Reyes',
        specialty: 'General Medicine',
        license_number: 'SANTOS456',
        phone_number: '09234567890',
        address: 'Antipolo, Rizal',
        date_joined: '2015-03-10',
        salary: 65000
    },
    {
        doctor_id: 3,
        last_name: 'Cruz',
        first_name: 'Maria',
        middle_name: 'Dela',
        specialty: 'Nutrition',
        license_number: 'CRUZ789',
        phone_number: '09345678901',
        address: 'Tanay, Rizal',
        date_joined: '2018-06-22',
        salary: 60000
    },
    {
        doctor_id: 4,
        last_name: 'Reyes',
        first_name: 'Jose',
        middle_name: 'Mendoza',
        specialty: 'Family Medicine',
        license_number: 'REYES234',
        phone_number: '09456789012',
        address: 'Morong, Rizal',
        date_joined: '2020-01-15',
        salary: 55000
    },
    {
        doctor_id: 5,
        last_name: 'Garcia',
        first_name: 'Ana',
        middle_name: 'Lopez',
        specialty: 'Pediatrics',
        license_number: 'GARCIA567',
        phone_number: '09567890123',
        address: 'Binangonan, Rizal',
        date_joined: '2019-09-05',
        salary: 62000
    },
    {
        doctor_id: 6,
        last_name: 'Villanueva',
        first_name: 'Carlos',
        middle_name: 'Torres',
        specialty: 'Internal Medicine',
        license_number: 'VILLA890',
        phone_number: '09678901234',
        address: 'Angono, Rizal',
        date_joined: '2016-11-30',
        salary: 72000
    },
    {
        doctor_id: 7,
        last_name: 'Mendoza',
        first_name: 'Lisa',
        middle_name: 'Fernandez',
        specialty: 'Nutrition',
        license_number: 'MENDOZA123',
        phone_number: '09789012345',
        address: 'Cainta, Rizal',
        date_joined: '2021-04-18',
        salary: 58000
    },
    {
        doctor_id: 8,
        last_name: 'Torres',
        first_name: 'Miguel',
        middle_name: 'Ramos',
        specialty: 'General Medicine',
        license_number: 'TORRES456',
        phone_number: '09890123456',
        address: 'Taytay, Rizal',
        date_joined: '2017-08-12',
        salary: 64000
    },
    {
        doctor_id: 9,
        last_name: 'Rivera',
        first_name: 'Sofia',
        middle_name: 'Cruz',
        specialty: 'Pediatrics',
        license_number: 'RIVERA789',
        phone_number: '09901234567',
        address: 'San Mateo, Rizal',
        date_joined: '2022-02-25',
        salary: 59000
    },
    {
        doctor_id: 10,
        last_name: 'Dimagiba',
        first_name: 'Paulo',
        middle_name: 'Santos',
        specialty: 'Nutrition',
        license_number: 'DIMA234',
        phone_number: '09012345678',
        address: 'Rodriguez, Rizal',
        date_joined: '2014-07-08',
        salary: 68000
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

// Load staff into table
function loadStaff() {
    const tableBody = document.getElementById('staffTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    staff.forEach(person => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${person.doctor_id}</td>
            <td>${person.last_name}</td>
            <td>${person.first_name}</td>
            <td>${person.middle_name || '-'}</td>
            <td><span class="specialty-badge">${person.specialty}</span></td>
            <td>${person.license_number}</td>
            <td>${person.phone_number || '-'}</td>
            <td>${person.address}</td>
            <td>${formatDate(person.date_joined)}</td>
            <td>${person.salary ? formatCurrency(person.salary) : '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewStaff(${person.doctor_id})">View</button>
                    <button class="edit-btn" onclick="editStaff(${person.doctor_id})">Edit</button>
                    <button class="delete-btn" onclick="deleteStaff(${person.doctor_id})">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Search staff
function searchStaff() {
    const searchTerm = document.getElementById('staffSearch').value.toLowerCase();
    const filteredStaff = staff.filter(person => 
        person.last_name.toLowerCase().includes(searchTerm) ||
        person.first_name.toLowerCase().includes(searchTerm) ||
        (person.middle_name || '').toLowerCase().includes(searchTerm) ||
        person.specialty.toLowerCase().includes(searchTerm) ||
        person.license_number.toLowerCase().includes(searchTerm) ||
        person.address.toLowerCase().includes(searchTerm)
    );
    
    displayFilteredStaff(filteredStaff);
}

// Sort staff
function sortStaff() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedStaff = [...staff].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'doctor_id' || sortBy === 'salary') {
            return valA - valB;
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
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${person.doctor_id}</td>
            <td>${person.last_name}</td>
            <td>${person.first_name}</td>
            <td>${person.middle_name || '-'}</td>
            <td><span class="specialty-badge">${person.specialty}</span></td>
            <td>${person.license_number}</td>
            <td>${person.phone_number || '-'}</td>
            <td>${person.address}</td>
            <td>${formatDate(person.date_joined)}</td>
            <td>${person.salary ? formatCurrency(person.salary) : '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewStaff(${person.doctor_id})">View</button>
                    <button class="edit-btn" onclick="editStaff(${person.doctor_id})">Edit</button>
                    <button class="delete-btn" onclick="deleteStaff(${person.doctor_id})">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
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

// Generate new doctor ID
function generateDoctorId() {
    const lastId = Math.max(...staff.map(s => s.doctor_id));
    return lastId + 1;
}

// Save new staff
function saveStaff() {
    // Get form values
    const lastName = document.getElementById('lastName').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const middleName = document.getElementById('middleName').value.trim();
    const specialty = document.getElementById('specialty').value.trim();
    const licenseNumber = document.getElementById('licenseNumber').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const address = document.getElementById('address').value.trim();
    const dateJoined = document.getElementById('dateJoined').value;
    const salary = document.getElementById('salary').value;
    
    // Validate required fields
    if (!lastName || !firstName || !specialty || !licenseNumber || !address) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create new staff object
    const newStaff = {
        doctor_id: generateDoctorId(),
        last_name: lastName,
        first_name: firstName,
        middle_name: middleName || '',
        specialty: specialty,
        license_number: licenseNumber,
        phone_number: phoneNumber || '',
        address: address,
        date_joined: dateJoined || null,
        salary: salary ? parseFloat(salary) : null
    };
    
    // Add to staff array
    staff.push(newStaff);
    
    // Reload table
    loadStaff();
    
    // Hide modal
    hideAddStaffModal();
    
    alert(`Staff member ${firstName} ${lastName} added successfully`);
}

// View staff
function viewStaff(doctorId) {
    const person = staff.find(s => s.doctor_id === doctorId);
    if (person) {
        alert(`Staff Details:
ID: ${person.doctor_id}
Name: ${person.first_name} ${person.middle_name} ${person.last_name}
Specialty: ${person.specialty}
License: ${person.license_number}
Phone: ${person.phone_number || 'N/A'}
Address: ${person.address}
Date Joined: ${formatDate(person.date_joined)}
Salary: ${person.salary ? formatCurrency(person.salary) : 'N/A'}`);
    }
}

// Edit staff
function editStaff(doctorId) {
    const person = staff.find(s => s.doctor_id === doctorId);
    if (person) {
        alert(`Edit staff member ${person.first_name} ${person.last_name}\n\nThis feature will be implemented in the next phase.`);
    }
}

// Delete staff
function deleteStaff(doctorId) {
    const person = staff.find(s => s.doctor_id === doctorId);
    if (person) {
        if (confirm(`Delete staff member ${person.first_name} ${person.last_name}?`)) {
            const index = staff.findIndex(s => s.doctor_id === doctorId);
            if (index !== -1) {
                staff.splice(index, 1);
                loadStaff();
                alert(`Staff member ${person.first_name} ${person.last_name} has been deleted.`);
            }
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadStaff();
    
    // Add search on enter key
    document.getElementById('staffSearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchStaff();
        }
    });
});