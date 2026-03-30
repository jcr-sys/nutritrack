// ===== CHILDREN RECORDS PAGE FUNCTIONALITY =====

// Sample children records data based on your patients
let childrenRecords = [
    {
        patient_id: '1011',
        mother_name: 'Maria Dela Cruz',
        father_name: 'Juan Dela Cruz',
        birth_weight: 3.5,
        birth_height: 50.0,
        birth_place: 'Quezon City',
        guardian: 'Lina Dela Cruz',
        guardian_contact: '09766343115',
        relationship: 'Aunt',
        remarks: 'No adverse reactions'
    },
    {
        patient_id: '1012',
        mother_name: 'Laura Gayundato',
        father_name: 'Fred Gayundato',
        birth_weight: 2.8,
        birth_height: 48.5,
        birth_place: 'Teresa, Rizal',
        guardian: 'Laura Gayundato',
        guardian_contact: '09123456789',
        relationship: 'Mother',
        remarks: 'Healthy newborn'
    },
    {
        patient_id: '1013',
        mother_name: 'Michaela Jacobs',
        father_name: 'Rick Jacobs',
        birth_weight: 3.2,
        birth_height: 52.0,
        birth_place: 'Antipolo, Rizal',
        guardian: 'Michaela Jacobs',
        guardian_contact: '09234567890',
        relationship: 'Mother',
        remarks: 'Normal delivery'
    },
    {
        patient_id: '1014',
        mother_name: 'Josie Rentoy',
        father_name: 'Roderick Rentoy',
        birth_weight: 3.8,
        birth_height: 54.0,
        birth_place: 'Tanay, Rizal',
        guardian: 'Josie Rentoy',
        guardian_contact: '09345678901',
        relationship: 'Mother',
        remarks: 'Breastfeeding well'
    },
    {
        patient_id: '1015',
        mother_name: 'Marie Bautista',
        father_name: 'Mario Bautista',
        birth_weight: 2.9,
        birth_height: 49.0,
        birth_place: 'Morong, Rizal',
        guardian: 'Lola Maria',
        guardian_contact: '09456789012',
        relationship: 'Grandmother',
        remarks: 'Underweight - needs monitoring'
    },
    {
        patient_id: '1016',
        mother_name: 'Cynthia Rivera',
        father_name: 'Ramon Rivera',
        birth_weight: 3.1,
        birth_height: 51.0,
        birth_place: 'Binangonan, Rizal',
        guardian: 'Cynthia Rivera',
        guardian_contact: '09567890123',
        relationship: 'Mother',
        remarks: 'Normal'
    }
];

// Display current date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Load records into table
function loadRecords() {
    const tableBody = document.getElementById('recordsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    childrenRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.patient_id}</td>
            <td>${record.mother_name}</td>
            <td>${record.father_name || '-'}</td>
            <td>${record.birth_weight}</td>
            <td>${record.birth_height}</td>
            <td>${record.birth_place}</td>
            <td>${record.guardian || '-'}</td>
            <td>${record.guardian_contact || '-'}</td>
            <td>${record.relationship || '-'}</td>
            <td>${record.remarks || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewRecord('${record.patient_id}')">View</button>
                    <button class="edit-btn" onclick="editRecord('${record.patient_id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteRecord('${record.patient_id}')">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Search records
function searchRecords() {
    const searchTerm = document.getElementById('recordSearch').value.toLowerCase();
    const filteredRecords = childrenRecords.filter(record => 
        record.patient_id.toLowerCase().includes(searchTerm) ||
        record.mother_name.toLowerCase().includes(searchTerm) ||
        (record.father_name && record.father_name.toLowerCase().includes(searchTerm)) ||
        (record.guardian && record.guardian.toLowerCase().includes(searchTerm)) ||
        (record.remarks && record.remarks.toLowerCase().includes(searchTerm))
    );
    displayFilteredRecords(filteredRecords);
}

// Sort records
function sortRecords() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedRecords = [...childrenRecords].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'patient_id') {
            return String(valA).localeCompare(String(valB), undefined, {numeric: true});
        }
        if (sortBy === 'birth_weight' || sortBy === 'birth_height') {
            return parseFloat(valA) - parseFloat(valB);
        }
        return String(valA).localeCompare(String(valB));
    });
    displayFilteredRecords(sortedRecords);
}

// Display filtered/sorted records
function displayFilteredRecords(recordsList) {
    const tableBody = document.getElementById('recordsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    recordsList.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.patient_id}</td>
            <td>${record.mother_name}</td>
            <td>${record.father_name || '-'}</td>
            <td>${record.birth_weight}</td>
            <td>${record.birth_height}</td>
            <td>${record.birth_place}</td>
            <td>${record.guardian || '-'}</td>
            <td>${record.guardian_contact || '-'}</td>
            <td>${record.relationship || '-'}</td>
            <td>${record.remarks || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewRecord('${record.patient_id}')">View</button>
                    <button class="edit-btn" onclick="editRecord('${record.patient_id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteRecord('${record.patient_id}')">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Show add record modal
function showAddRecordModal() {
    document.getElementById('addRecordModal').classList.add('show');
}

// Hide add record modal
function hideAddRecordModal() {
    document.getElementById('addRecordModal').classList.remove('show');
    clearRecordForm();
}

// Clear record form
function clearRecordForm() {
    document.getElementById('recordForm').reset();
}

// Save new record
function saveRecord() {
    // Get form values
    const patientId = document.getElementById('patientId').value.trim();
    const motherName = document.getElementById('motherName').value.trim();
    const fatherName = document.getElementById('fatherName').value.trim();
    const birthWeight = document.getElementById('birthWeight').value;
    const birthHeight = document.getElementById('birthHeight').value;
    const birthPlace = document.getElementById('birthPlace').value.trim();
    const guardian = document.getElementById('guardian').value.trim();
    const guardianContact = document.getElementById('guardianContact').value.trim();
    const relationship = document.getElementById('relationship').value.trim();
    const remarks = document.getElementById('remarks').value.trim();
    
    // Validate required fields
    if (!patientId || !motherName || !birthWeight || !birthHeight || !birthPlace) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Check if patient already exists
    if (childrenRecords.some(r => r.patient_id === patientId)) {
        alert('A record for this patient already exists');
        return;
    }
    
    // Create new record object
    const newRecord = {
        patient_id: patientId,
        mother_name: motherName,
        father_name: fatherName || null,
        birth_weight: parseFloat(birthWeight),
        birth_height: parseFloat(birthHeight),
        birth_place: birthPlace,
        guardian: guardian || null,
        guardian_contact: guardianContact || null,
        relationship: relationship || null,
        remarks: remarks || null
    };
    
    // Add to array
    childrenRecords.push(newRecord);
    
    // Reload table
    loadRecords();
    
    // Hide modal
    hideAddRecordModal();
    
    alert(`Children record for Patient ${patientId} saved successfully`);
}

// View record
function viewRecord(patientId) {
    const record = childrenRecords.find(r => r.patient_id === patientId);
    if (record) {
        alert(`Children Record Details:
Patient ID: ${record.patient_id}
Mother Name: ${record.mother_name}
Father Name: ${record.father_name || 'N/A'}
Birth Weight: ${record.birth_weight} kg
Birth Height: ${record.birth_height} cm
Birth Place: ${record.birth_place}
Guardian: ${record.guardian || 'N/A'}
Guardian Contact: ${record.guardian_contact || 'N/A'}
Relationship: ${record.relationship || 'N/A'}
Remarks: ${record.remarks || 'N/A'}`);
    }
}

// Edit record
function editRecord(patientId) {
    alert(`Edit children record for Patient ${patientId}\n\nThis feature will be implemented in the next phase.`);
}

// Delete record
function deleteRecord(patientId) {
    if (confirm(`Delete children record for Patient ${patientId}?`)) {
        const index = childrenRecords.findIndex(r => r.patient_id === patientId);
        if (index !== -1) {
            childrenRecords.splice(index, 1);
            loadRecords();
            alert(`Children record for Patient ${patientId} has been deleted.`);
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadRecords();
    
    document.getElementById('recordSearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchRecords();
        }
    });
});