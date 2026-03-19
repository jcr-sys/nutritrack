// ===== PREGNANCY CHECKUPS PAGE FUNCTIONALITY =====

// Sample pregnancy checkup data
let checkups = [
    {
        patient_id: '1002',
        doctor_id: '3',
        checkup_date: '2025-03-12',
        trimester: 2,
        gestational_age: 24,
        blood_pressure: '120/80 mmHg',
        weight: 65.5,
        ultrasound_result: 'Normal fetal growth, active movement',
        blood_test_result: 'Hemoglobin: 12.5 g/dL, Blood sugar: normal',
        doctor_notes: 'Patient is doing well. Iron supplements prescribed.',
        next_checkup_date: '2025-04-09'
    },
    {
        patient_id: '1006',
        doctor_id: '3',
        checkup_date: '2025-03-05',
        trimester: 1,
        gestational_age: 10,
        blood_pressure: '110/70 mmHg',
        weight: 58.2,
        ultrasound_result: 'Fetal heartbeat detected, normal development',
        blood_test_result: 'All tests normal. Blood type: O+',
        doctor_notes: 'First trimester screening completed. No complications.',
        next_checkup_date: '2025-04-02'
    },
    {
        patient_id: '1007',
        doctor_id: '4',
        checkup_date: '2025-03-15',
        trimester: 2,
        gestational_age: 20,
        blood_pressure: '118/75 mmHg',
        weight: 62.8,
        ultrasound_result: 'Anatomy scan normal. Baby is active.',
        blood_test_result: 'Glucose screening normal',
        doctor_notes: 'Patient reports feeling well. Follow up in 4 weeks.',
        next_checkup_date: '2025-04-12'
    },
    {
        patient_id: '1008',
        doctor_id: '3',
        checkup_date: '2025-03-08',
        trimester: 3,
        gestational_age: 32,
        blood_pressure: '122/82 mmHg',
        weight: 71.3,
        ultrasound_result: 'Baby in head-down position. Estimated weight: 1.8kg',
        blood_test_result: 'Hemoglobin: 11.8 g/dL - slight anemia',
        doctor_notes: 'Iron supplements increased. Monitor blood pressure.',
        next_checkup_date: '2025-03-29'
    },
    {
        patient_id: '1009',
        doctor_id: '4',
        checkup_date: '2025-03-18',
        trimester: 2,
        gestational_age: 18,
        blood_pressure: '115/72 mmHg',
        weight: 60.5,
        ultrasound_result: 'Normal fetal anatomy',
        blood_test_result: 'All results normal',
        doctor_notes: 'Routine checkup. Everything looks good.',
        next_checkup_date: '2025-04-15'
    },
    {
        patient_id: '1010',
        doctor_id: '3',
        checkup_date: '2025-03-10',
        trimester: 1,
        gestational_age: 8,
        blood_pressure: '112/68 mmHg',
        weight: 55.7,
        ultrasound_result: 'Confirmed intrauterine pregnancy',
        blood_test_result: 'Blood work sent to lab. Pending results.',
        doctor_notes: 'First prenatal visit. Schedule next checkup in 4 weeks.',
        next_checkup_date: '2025-04-07'
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

// Load checkups into table
function loadCheckups() {
    const tableBody = document.getElementById('checkupsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    checkups.forEach(checkup => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${checkup.patient_id}</td>
            <td>${checkup.doctor_id}</td>
            <td>${checkup.checkup_date}</td>
            <td>${checkup.trimester}</td>
            <td>${checkup.gestational_age} weeks</td>
            <td>${checkup.blood_pressure || '-'}</td>
            <td>${checkup.weight ? checkup.weight + ' kg' : '-'}</td>
            <td>${checkup.ultrasound_result || '-'}</td>
            <td>${checkup.blood_test_result || '-'}</td>
            <td>${checkup.doctor_notes || '-'}</td>
            <td>${checkup.next_checkup_date || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewCheckup('${checkup.patient_id}', '${checkup.checkup_date}')">View</button>
                    <button class="edit-btn" onclick="editCheckup('${checkup.patient_id}', '${checkup.checkup_date}')">Edit</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Search checkups
function searchCheckups() {
    const searchTerm = document.getElementById('checkupSearch').value.toLowerCase();
    const filteredCheckups = checkups.filter(checkup => 
        checkup.patient_id.toLowerCase().includes(searchTerm) ||
        checkup.doctor_id.toLowerCase().includes(searchTerm) ||
        (checkup.blood_pressure && checkup.blood_pressure.toLowerCase().includes(searchTerm))
    );
    
    displayFilteredCheckups(filteredCheckups);
}

// Sort checkups
function sortCheckups() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedCheckups = [...checkups].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'gestational_age' || sortBy === 'trimester') {
            return parseInt(valA) - parseInt(valB);
        }
        if (sortBy === 'checkup_date') {
            return new Date(valA) - new Date(valB);
        }
        return String(valA).localeCompare(String(valB));
    });
    
    displayFilteredCheckups(sortedCheckups);
}

// Display filtered/sorted checkups
function displayFilteredCheckups(checkupList) {
    const tableBody = document.getElementById('checkupsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    checkupList.forEach(checkup => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${checkup.patient_id}</td>
            <td>${checkup.doctor_id}</td>
            <td>${checkup.checkup_date}</td>
            <td>${checkup.trimester}</td>
            <td>${checkup.gestational_age} weeks</td>
            <td>${checkup.blood_pressure || '-'}</td>
            <td>${checkup.weight ? checkup.weight + ' kg' : '-'}</td>
            <td>${checkup.ultrasound_result || '-'}</td>
            <td>${checkup.blood_test_result || '-'}</td>
            <td>${checkup.doctor_notes || '-'}</td>
            <td>${checkup.next_checkup_date || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewCheckup('${checkup.patient_id}', '${checkup.checkup_date}')">View</button>
                    <button class="edit-btn" onclick="editCheckup('${checkup.patient_id}', '${checkup.checkup_date}')">Edit</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Show add checkup modal
function showAddCheckupModal() {
    document.getElementById('addCheckupModal').classList.add('show');
}

// Hide add checkup modal
function hideAddCheckupModal() {
    document.getElementById('addCheckupModal').classList.remove('show');
    clearCheckupForm();
}

// Clear checkup form
function clearCheckupForm() {
    document.getElementById('checkupForm').reset();
}

// Save new checkup
function saveCheckup() {
    // Get form values
    const patientId = document.getElementById('patientId').value.trim();
    const doctorId = document.getElementById('doctorId').value.trim();
    const checkupDate = document.getElementById('checkupDate').value;
    const trimester = document.getElementById('trimester').value;
    const gestationalAge = document.getElementById('gestationalAge').value;
    const bloodPressure = document.getElementById('bloodPressure').value.trim();
    const weight = document.getElementById('weight').value;
    const ultrasoundResult = document.getElementById('ultrasoundResult').value.trim();
    const bloodTestResult = document.getElementById('bloodTestResult').value.trim();
    const doctorNotes = document.getElementById('doctorNotes').value.trim();
    const nextCheckupDate = document.getElementById('nextCheckupDate').value;
    
    // Validate required fields
    if (!patientId || !doctorId || !checkupDate || !trimester || !gestationalAge) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create new checkup object
    const newCheckup = {
        patient_id: patientId,
        doctor_id: doctorId,
        checkup_date: checkupDate,
        trimester: parseInt(trimester),
        gestational_age: parseInt(gestationalAge),
        blood_pressure: bloodPressure || null,
        weight: weight ? parseFloat(weight) : null,
        ultrasound_result: ultrasoundResult || null,
        blood_test_result: bloodTestResult || null,
        doctor_notes: doctorNotes || null,
        next_checkup_date: nextCheckupDate || null
    };
    
    // Add to checkups array
    checkups.push(newCheckup);
    
    // Reload table
    loadCheckups();
    
    // Hide modal
    hideAddCheckupModal();
    
    alert(`Pregnancy checkup for Patient ${patientId} saved successfully`);
}

// View checkup
function viewCheckup(patientId, checkupDate) {
    const checkup = checkups.find(c => c.patient_id === patientId && c.checkup_date === checkupDate);
    if (checkup) {
        alert(`Checkup Details:
Patient ID: ${checkup.patient_id}
Doctor ID: ${checkup.doctor_id}
Date: ${checkup.checkup_date}
Trimester: ${checkup.trimester}
Gestational Age: ${checkup.gestational_age} weeks
Blood Pressure: ${checkup.blood_pressure || 'N/A'}
Weight: ${checkup.weight ? checkup.weight + ' kg' : 'N/A'}
Next Checkup: ${checkup.next_checkup_date || 'N/A'}`);
    }
}

// Edit checkup
function editCheckup(patientId, checkupDate) {
    const checkup = checkups.find(c => c.patient_id === patientId && c.checkup_date === checkupDate);
    if (checkup) {
        alert(`Edit checkup for Patient ${patientId} on ${checkupDate}`);
        // You can implement edit functionality here later
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadCheckups();
    
    // Add search on enter key
    document.getElementById('checkupSearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchCheckups();
        }
    });
});