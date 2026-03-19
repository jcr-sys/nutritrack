// ===== CHILD IMMUNIZATIONS PAGE FUNCTIONALITY =====

// Vaccine mapping for display
const vaccineMap = {
    '1': 'BCG',
    '2': 'Hepatitis B',
    '3': 'DPT',
    '4': 'Oral Polio',
    '5': 'IPV',
    '6': 'MMR'
};

// Sample immunization data
let immunizations = [
    {
        immunization_id: '1',
        patient_id: '1011',
        vaccine_id: '1',
        dose_number: 1,
        date_given: '2025-01-15',
        doctor_id: '5',
        remarks: 'No adverse reactions'
    },
    {
        immunization_id: '2',
        patient_id: '1011',
        vaccine_id: '2',
        dose_number: 1,
        date_given: '2025-01-15',
        doctor_id: '5',
        remarks: 'Hepatitis B birth dose'
    },
    {
        immunization_id: '3',
        patient_id: '1012',
        vaccine_id: '3',
        dose_number: 1,
        date_given: '2025-02-10',
        doctor_id: '6',
        remarks: 'First DPT shot, mild fever noted'
    },
    {
        immunization_id: '4',
        patient_id: '1012',
        vaccine_id: '4',
        dose_number: 1,
        date_given: '2025-02-10',
        doctor_id: '6',
        remarks: 'Oral Polio dose 1'
    },
    {
        immunization_id: '5',
        patient_id: '1013',
        vaccine_id: '1',
        dose_number: 1,
        date_given: '2024-11-20',
        doctor_id: '5',
        remarks: 'BCG given at birth'
    },
    {
        immunization_id: '6',
        patient_id: '1013',
        vaccine_id: '2',
        dose_number: 1,
        date_given: '2024-11-20',
        doctor_id: '5',
        remarks: 'Hepatitis B dose 1'
    },
    {
        immunization_id: '7',
        patient_id: '1013',
        vaccine_id: '2',
        dose_number: 2,
        date_given: '2024-12-20',
        doctor_id: '5',
        remarks: 'Hepatitis B dose 2'
    },
    {
        immunization_id: '8',
        patient_id: '1014',
        vaccine_id: '3',
        dose_number: 1,
        date_given: '2025-03-01',
        doctor_id: '6',
        remarks: 'DPT dose 1'
    },
    {
        immunization_id: '9',
        patient_id: '1014',
        vaccine_id: '4',
        dose_number: 1,
        date_given: '2025-03-01',
        doctor_id: '6',
        remarks: 'Oral Polio dose 1'
    },
    {
        immunization_id: '10',
        patient_id: '1015',
        vaccine_id: '6',
        dose_number: 1,
        date_given: '2025-02-25',
        doctor_id: '5',
        remarks: 'MMR vaccine'
    },
    {
        immunization_id: '11',
        patient_id: '1011',
        vaccine_id: '3',
        dose_number: 2,
        date_given: '2025-03-15',
        doctor_id: '5',
        remarks: 'DPT booster'
    },
    {
        immunization_id: '12',
        patient_id: '1012',
        vaccine_id: '5',
        dose_number: 1,
        date_given: '2025-03-18',
        doctor_id: '6',
        remarks: 'IPV dose 1'
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

// Get vaccine name from ID
function getVaccineName(vaccineId) {
    return vaccineMap[vaccineId] || 'Unknown Vaccine';
}

// Load immunizations into table
function loadImmunizations() {
    const tableBody = document.getElementById('immunizationsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    immunizations.forEach(imm => {
        const row = document.createElement('tr');
        const vaccineName = getVaccineName(imm.vaccine_id);
        
        row.innerHTML = `
            <td>${imm.immunization_id}</td>
            <td>${imm.patient_id}</td>
            <td>${imm.vaccine_id}<span class="vaccine-name">${vaccineName}</span></td>
            <td>${imm.dose_number}</td>
            <td>${imm.date_given}</td>
            <td>${imm.doctor_id}</td>
            <td>${imm.remarks || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewImmunization('${imm.immunization_id}')">View</button>
                    <button class="edit-btn" onclick="editImmunization('${imm.immunization_id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteImmunization('${imm.immunization_id}')">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Search immunizations
function searchImmunizations() {
    const searchTerm = document.getElementById('immunizationSearch').value.toLowerCase();
    const filteredImmunizations = immunizations.filter(imm => 
        imm.immunization_id.toLowerCase().includes(searchTerm) ||
        imm.patient_id.toLowerCase().includes(searchTerm) ||
        imm.vaccine_id.toLowerCase().includes(searchTerm) ||
        imm.doctor_id.toLowerCase().includes(searchTerm) ||
        (imm.remarks && imm.remarks.toLowerCase().includes(searchTerm)) ||
        getVaccineName(imm.vaccine_id).toLowerCase().includes(searchTerm)
    );
    
    displayFilteredImmunizations(filteredImmunizations);
}

// Sort immunizations
function sortImmunizations() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedImmunizations = [...immunizations].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'immunization_id' || sortBy === 'patient_id' || sortBy === 'doctor_id' || sortBy === 'vaccine_id') {
            return valA.localeCompare(valB, undefined, {numeric: true});
        }
        if (sortBy === 'dose_number') {
            return parseInt(valA) - parseInt(valB);
        }
        if (sortBy === 'date_given') {
            return new Date(valA) - new Date(valB);
        }
        return String(valA).localeCompare(String(valB));
    });
    
    displayFilteredImmunizations(sortedImmunizations);
}

// Display filtered/sorted immunizations
function displayFilteredImmunizations(immList) {
    const tableBody = document.getElementById('immunizationsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    immList.forEach(imm => {
        const row = document.createElement('tr');
        const vaccineName = getVaccineName(imm.vaccine_id);
        
        row.innerHTML = `
            <td>${imm.immunization_id}</td>
            <td>${imm.patient_id}</td>
            <td>${imm.vaccine_id}<span class="vaccine-name">${vaccineName}</span></td>
            <td>${imm.dose_number}</td>
            <td>${imm.date_given}</td>
            <td>${imm.doctor_id}</td>
            <td>${imm.remarks || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewImmunization('${imm.immunization_id}')">View</button>
                    <button class="edit-btn" onclick="editImmunization('${imm.immunization_id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteImmunization('${imm.immunization_id}')">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Show add immunization modal
function showAddImmunizationModal() {
    document.getElementById('addImmunizationModal').classList.add('show');
}

// Hide add immunization modal
function hideAddImmunizationModal() {
    document.getElementById('addImmunizationModal').classList.remove('show');
    clearImmunizationForm();
}

// Clear immunization form
function clearImmunizationForm() {
    document.getElementById('immunizationForm').reset();
}

// Generate new immunization ID
function generateImmunizationId() {
    const lastId = Math.max(...immunizations.map(i => parseInt(i.immunization_id)));
    return (lastId + 1).toString();
}

// Save new immunization
function saveImmunization() {
    // Get form values
    const patientId = document.getElementById('patientId').value.trim();
    const vaccineId = document.getElementById('vaccineId').value;
    const doseNumber = document.getElementById('doseNumber').value;
    const dateGiven = document.getElementById('dateGiven').value;
    const doctorId = document.getElementById('doctorId').value.trim();
    const remarks = document.getElementById('remarks').value.trim();
    
    // Validate required fields
    if (!patientId || !vaccineId || !doseNumber || !dateGiven || !doctorId) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Check if dose number is valid
    if (parseInt(doseNumber) < 1) {
        alert('Dose number must be greater than 0');
        return;
    }
    
    // Create new immunization object
    const newImmunization = {
        immunization_id: generateImmunizationId(),
        patient_id: patientId,
        vaccine_id: vaccineId,
        dose_number: parseInt(doseNumber),
        date_given: dateGiven,
        doctor_id: doctorId,
        remarks: remarks || null
    };
    
    // Add to immunizations array
    immunizations.push(newImmunization);
    
    // Reload table
    loadImmunizations();
    
    // Hide modal
    hideAddImmunizationModal();
    
    alert(`Immunization record saved successfully for Patient ${patientId}`);
}

// View immunization
function viewImmunization(immunizationId) {
    const immunization = immunizations.find(i => i.immunization_id === immunizationId);
    if (immunization) {
        const vaccineName = getVaccineName(immunization.vaccine_id);
        alert(`Immunization Details:
ID: ${immunization.immunization_id}
Patient ID: ${immunization.patient_id}
Vaccine: ${vaccineName} (ID: ${immunization.vaccine_id})
Dose Number: ${immunization.dose_number}
Date Given: ${immunization.date_given}
Doctor ID: ${immunization.doctor_id}
Remarks: ${immunization.remarks || 'N/A'}`);
    }
}

// Edit immunization
function editImmunization(immunizationId) {
    const immunization = immunizations.find(i => i.immunization_id === immunizationId);
    if (immunization) {
        alert(`Edit immunization record ${immunizationId}\n\nThis feature will be implemented in the next phase.`);
    }
}

// Delete immunization
function deleteImmunization(immunizationId) {
    const immunization = immunizations.find(i => i.immunization_id === immunizationId);
    if (immunization) {
        if (confirm(`Delete immunization record ${immunizationId} for Patient ${immunization.patient_id}?`)) {
            const index = immunizations.findIndex(i => i.immunization_id === immunizationId);
            if (index !== -1) {
                immunizations.splice(index, 1);
                loadImmunizations();
                alert(`Immunization record ${immunizationId} has been deleted.`);
            }
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadImmunizations();
    
    // Add search on enter key
    document.getElementById('immunizationSearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchImmunizations();
        }
    });
});