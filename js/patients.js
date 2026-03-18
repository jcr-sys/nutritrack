// ===== PATIENTS PAGE FUNCTIONALITY =====

// Sample patient data - 15 records (5 Children, 5 Pregnant, 5 Senior)
let patients = [
    // ===== 5 SENIOR PATIENTS =====
    {
        patient_id: '1001',
        last_name: 'Dela Cruz',
        first_name: 'Juan',
        middle_name: 'Santos',
        suffix: 'Sr.',
        age: 68,
        gender: 'Male',
        birthdate: '1958-03-12',
        religion: 'Roman Catholic',
        occupation: 'Retired Teacher',
        address: '123 Rizal St, Brgy. Dalig, Teresa, Rizal',
        mobile_number: '09123456789',
        blood_type: 'O',
        allergy: 'Penicillin',
        primary_doctor_id: '1',
        patient_type: 'Senior'
    },
    {
        patient_id: '1002',
        last_name: 'Reyes',
        first_name: 'Maria',
        middle_name: 'Villanueva',
        suffix: '',
        age: 72,
        gender: 'Female',
        birthdate: '1954-07-25',
        religion: 'Roman Catholic',
        occupation: 'Retired Nurse',
        address: '456 Mabini St, Brgy. Dalig, Teresa, Rizal',
        mobile_number: '09187654321',
        blood_type: 'A',
        allergy: 'Seafood',
        primary_doctor_id: '1',
        patient_type: 'Senior'
    },
    {
        patient_id: '1003',
        last_name: 'Santos',
        first_name: 'Pedro',
        middle_name: 'Garcia',
        suffix: '',
        age: 70,
        gender: 'Male',
        birthdate: '1956-11-02',
        religion: 'Iglesia Ni Cristo',
        occupation: 'Retired Farmer',
        address: '789 Quezon Ave, Brgy. Dalig, Teresa, Rizal',
        mobile_number: '09234567890',
        blood_type: 'B',
        allergy: 'None',
        primary_doctor_id: '2',
        patient_type: 'Senior'
    },
    {
        patient_id: '1004',
        last_name: 'Mendoza',
        first_name: 'Josefa',
        middle_name: 'Cruz',
        suffix: '',
        age: 65,
        gender: 'Female',
        birthdate: '1961-09-18',
        religion: 'Roman Catholic',
        occupation: 'Retired Vendor',
        address: '321 Bonifacio St, Brgy. Dalig, Teresa, Rizal',
        mobile_number: '09345678901',
        blood_type: 'AB',
        allergy: 'Dust',
        primary_doctor_id: '1',
        patient_type: 'Senior'
    },
    {
        patient_id: '1005',
        last_name: 'Fernandez',
        first_name: 'Anita',
        middle_name: 'Lopez',
        suffix: '',
        age: 74,
        gender: 'Female',
        birthdate: '1952-04-30',
        religion: 'Roman Catholic',
        occupation: 'Retired Seamstress',
        address: '654 P. Gomez St, Brgy. Dalig, Teresa, Rizal',
        mobile_number: '09456789012',
        blood_type: 'O',
        allergy: 'NSAIDs',
        primary_doctor_id: '2',
        patient_type: 'Senior'
    },

    // ===== 5 PREGNANT PATIENTS =====
    {
        patient_id: '1006',
        last_name: 'Santos',
        first_name: 'Maria',
        middle_name: 'Reyes',
        suffix: '',
        age: 28,
        gender: 'Female',
        birthdate: '1998-03-15',
        religion: 'Roman Catholic',
        occupation: 'Teacher',
        address: '456 Mabini St, Brgy. Dalig, Teresa, Rizal',
        mobile_number: '09567890123',
        blood_type: 'O',
        allergy: 'None',
        primary_doctor_id: '3',
        patient_type: 'Pregnant'
    },
    {
        patient_id: '1007',
        last_name: 'Villanueva',
        first_name: 'Rosa',
        middle_name: 'Dimagiba',
        suffix: '',
        age: 26,
        gender: 'Female',
        birthdate: '2000-05-18',
        religion: 'Roman Catholic',
        occupation: 'OFW',
        address: '987 P. Gomez St, Brgy. Dalig, Teresa, Rizal',
        mobile_number: '09678901234',
        blood_type: 'AB',
        allergy: 'None',
        primary_doctor_id: '3',
        patient_type: 'Pregnant'
    },
    {
        patient_id: '1008',
        last_name: 'Garcia',
        first_name: 'Lisa',
        middle_name: 'Mendoza',
        suffix: '',
        age: 24,
        gender: 'Female',
        birthdate: '2002-08-22',
        religion: 'Roman Catholic',
        occupation: 'Sales Clerk',
        address: '147 Rizal St, Brgy. Dalig, Teresa, Rizal',
        mobile_number: '09789012345',
        blood_type: 'A',
        allergy: 'Penicillin',
        primary_doctor_id: '4',
        patient_type: 'Pregnant'
    },
    {
        patient_id: '1009',
        last_name: 'Torres',
        first_name: 'Jennifer',
        middle_name: 'Aquino',
        suffix: '',
        age: 31,
        gender: 'Female',
        birthdate: '1995-11-11',
        religion: 'Born Again',
        occupation: 'Call Center Agent',
        address: '258 Quezon Ave, Brgy. Dalig, Teresa, Rizal',
        mobile_number: '09890123456',
        blood_type: 'B',
        allergy: 'Latex',
        primary_doctor_id: '3',
        patient_type: 'Pregnant'
    },
    {
        patient_id: '1010',
        last_name: 'Rivera',
        first_name: 'Cynthia',
        middle_name: 'Cruz',
        suffix: '',
        age: 29,
        gender: 'Female',
        birthdate: '1997-02-28',
        religion: 'Roman Catholic',
        occupation: 'Barangay Health Worker',
        address: '369 Bonifacio St, Brgy. Dalig, Teresa, Rizal',
        mobile_number: '09901234567',
        blood_type: 'O',
        allergy: 'None',
        primary_doctor_id: '4',
        patient_type: 'Pregnant'
    },

    // ===== 5 CHILDREN PATIENTS =====
    {
        patient_id: '1011',
        last_name: 'Dela Cruz',
        first_name: 'Jose',
        middle_name: 'Santos',
        suffix: 'Jr.',
        age: 4,
        gender: 'Male',
        birthdate: '2022-01-10',
        religion: 'Roman Catholic',
        occupation: '',
        address: '123 Rizal St, Brgy. Dalig, Teresa, Rizal',
        mobile_number: '09123456789',
        blood_type: 'O',
        allergy: 'None',
        primary_doctor_id: '5',
        patient_type: 'Child'
    },
    {
        patient_id: '1012',
        last_name: 'Santos',
        first_name: 'Ana',
        middle_name: 'Reyes',
        suffix: '',
        age: 2,
        gender: 'Female',
        birthdate: '2024-06-15',
        religion: 'Roman Catholic',
        occupation: '',
        address: '456 Mabini St, Brgy. Dalig, Teresa, Rizal',
        mobile_number: '09187654321',
        blood_type: 'A',
        allergy: 'None',
        primary_doctor_id: '5',
        patient_type: 'Child'
    },
    {
        patient_id: '1013',
        last_name: 'Reyes',
        first_name: 'Carlos',
        middle_name: 'Garcia',
        suffix: '',
        age: 5,
        gender: 'Male',
        birthdate: '2021-03-22',
        religion: 'Iglesia Ni Cristo',
        occupation: '',
        address: '789 Quezon Ave, Brgy. Dalig, Teresa, Rizal',
        mobile_number: '09234567890',
        blood_type: 'B',
        allergy: 'Peanuts',
        primary_doctor_id: '6',
        patient_type: 'Child'
    },
    {
        patient_id: '1014',
        last_name: 'Mendoza',
        first_name: 'Elena',
        middle_name: 'Cruz',
        suffix: '',
        age: 1,
        gender: 'Female',
        birthdate: '2025-07-30',
        religion: 'Roman Catholic',
        occupation: '',
        address: '321 Bonifacio St, Brgy. Dalig, Teresa, Rizal',
        mobile_number: '09345678901',
        blood_type: 'AB',
        allergy: 'None',
        primary_doctor_id: '5',
        patient_type: 'Child'
    },
    {
        patient_id: '1015',
        last_name: 'Fernandez',
        first_name: 'Luis',
        middle_name: 'Lopez',
        suffix: '',
        age: 3,
        gender: 'Male',
        birthdate: '2023-09-18',
        religion: 'Roman Catholic',
        occupation: '',
        address: '654 P. Gomez St, Brgy. Dalig, Teresa, Rizal',
        mobile_number: '09456789012',
        blood_type: 'O',
        allergy: 'Milk',
        primary_doctor_id: '6',
        patient_type: 'Child'
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

// Load patients into table
function loadPatients() {
    const tableBody = document.getElementById('patientsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    patients.forEach(patient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.patient_id}</td>
            <td>${patient.last_name}</td>
            <td>${patient.first_name}</td>
            <td>${patient.middle_name || '-'}</td>
            <td>${patient.suffix || '-'}</td>
            <td>${patient.age}</td>
            <td>${patient.gender}</td>
            <td>${patient.birthdate}</td>
            <td>${patient.religion || '-'}</td>
            <td>${patient.occupation || '-'}</td>
            <td>${patient.address}</td>
            <td>${patient.mobile_number || '-'}</td>
            <td>${patient.blood_type || '-'}</td>
            <td>${patient.allergy || '-'}</td>
            <td>${patient.primary_doctor_id}</td>
            <td>${patient.patient_type}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewPatient('${patient.patient_id}')">View</button>
                    <button class="edit-btn" onclick="editPatient('${patient.patient_id}')">Edit</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Search patients
function searchPatients() {
    const searchTerm = document.getElementById('patientSearch').value.toLowerCase();
    const filteredPatients = patients.filter(patient => 
        patient.patient_id.toLowerCase().includes(searchTerm) ||
        patient.last_name.toLowerCase().includes(searchTerm) ||
        patient.first_name.toLowerCase().includes(searchTerm) ||
        patient.middle_name?.toLowerCase().includes(searchTerm) ||
        patient.address.toLowerCase().includes(searchTerm) ||
        patient.patient_type.toLowerCase().includes(searchTerm)
    );
    
    displayFilteredPatients(filteredPatients);
}

// Sort patients
function sortPatients() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedPatients = [...patients].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'age' || sortBy === 'patient_id') {
            return parseInt(valA) - parseInt(valB);
        }
        return String(valA).localeCompare(String(valB));
    });
    
    displayFilteredPatients(sortedPatients);
}

// Display filtered/sorted patients
function displayFilteredPatients(patientList) {
    const tableBody = document.getElementById('patientsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    patientList.forEach(patient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.patient_id}</td>
            <td>${patient.last_name}</td>
            <td>${patient.first_name}</td>
            <td>${patient.middle_name || '-'}</td>
            <td>${patient.suffix || '-'}</td>
            <td>${patient.age}</td>
            <td>${patient.gender}</td>
            <td>${patient.birthdate}</td>
            <td>${patient.religion || '-'}</td>
            <td>${patient.occupation || '-'}</td>
            <td>${patient.address}</td>
            <td>${patient.mobile_number || '-'}</td>
            <td>${patient.blood_type || '-'}</td>
            <td>${patient.allergy || '-'}</td>
            <td>${patient.primary_doctor_id}</td>
            <td>${patient.patient_type}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewPatient('${patient.patient_id}')">View</button>
                    <button class="edit-btn" onclick="editPatient('${patient.patient_id}')">Edit</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Show add patient modal
function showAddPatientModal() {
    document.getElementById('addPatientModal').classList.add('show');
}

// Hide add patient modal
function hideAddPatientModal() {
    document.getElementById('addPatientModal').classList.remove('show');
    clearPatientForm();
}

// Clear patient form
function clearPatientForm() {
    document.getElementById('patientForm').reset();
}

// Save new patient
function savePatient() {
    // Get form values
    const lastName = document.getElementById('lastName').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const middleName = document.getElementById('middleName').value.trim();
    const suffix = document.getElementById('suffix').value.trim();
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const birthdate = document.getElementById('birthdate').value;
    const religion = document.getElementById('religion').value.trim();
    const occupation = document.getElementById('occupation').value.trim();
    const address = document.getElementById('address').value.trim();
    const mobileNumber = document.getElementById('mobileNumber').value.trim();
    const bloodType = document.getElementById('bloodType').value;
    const allergy = document.getElementById('allergy').value.trim();
    const primaryDoctorId = document.getElementById('primaryDoctorId').value.trim() || '1';
    const patientType = document.getElementById('patientType').value;
    
    // Validate required fields
    if (!lastName || !firstName || !age || !gender || !birthdate || !address || !patientType) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Generate new patient ID
    const newId = (parseInt(patients[patients.length - 1].patient_id) + 1).toString();
    
    // Create new patient object
    const newPatient = {
        patient_id: newId,
        last_name: lastName,
        first_name: firstName,
        middle_name: middleName || '',
        suffix: suffix || '',
        age: parseInt(age),
        gender: gender,
        birthdate: birthdate,
        religion: religion || '',
        occupation: occupation || '',
        address: address,
        mobile_number: mobileNumber || '',
        blood_type: bloodType || '',
        allergy: allergy || '',
        primary_doctor_id: primaryDoctorId,
        patient_type: patientType
    };
    
    // Add to patients array
    patients.push(newPatient);
    
    // Reload table
    loadPatients();
    
    // Hide modal
    hideAddPatientModal();
    
    alert(`Patient ${firstName} ${lastName} saved successfully with ID: ${newId}`);
}

// View patient
function viewPatient(patientId) {
    const patient = patients.find(p => p.patient_id === patientId);
    if (patient) {
        alert(`Patient Details:\n\nID: ${patient.patient_id}\nName: ${patient.first_name} ${patient.last_name}\nType: ${patient.patient_type}\nAge: ${patient.age}\nGender: ${patient.gender}\nAddress: ${patient.address}\nContact: ${patient.mobile_number || 'N/A'}`);
        // You can implement a detailed view modal here later
    }
}

// Edit patient
function editPatient(patientId) {
    const patient = patients.find(p => p.patient_id === patientId);
    if (patient) {
        alert(`Edit patient: ${patient.first_name} ${patient.last_name}\n\nThis feature will be implemented in the next phase.`);
        // You can implement edit functionality here later
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadPatients();
    
    // Add search on enter key
    document.getElementById('patientSearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchPatients();
        }
    });
});