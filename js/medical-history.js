// ===== MEDICAL HISTORY PAGE FUNCTIONALITY =====

// Sample medical history data
let medicalHistory = [
    {
        patient_id: '1001',
        doctor_id: '1',
        condition: 'Hypertension',
        diagnosis_date: '2020-01-15',
        status: 'Ongoing',
        treatment_notes: 'Taking maintenance medicines',
        remarks: 'Monitored every 6 months'
    },
    {
        patient_id: '1001',
        doctor_id: '1',
        condition: 'COPD',
        diagnosis_date: '1995-03-15',
        status: 'Ongoing',
        treatment_notes: 'Prescribed bronchodilators and corticosteroids',
        remarks: 'Smoking cessation advised'
    },
    {
        patient_id: '1003',
        doctor_id: '1',
        condition: 'Type 2 Diabetes',
        diagnosis_date: '2010-10-08',
        status: 'Ongoing',
        treatment_notes: 'Metformin; dietary counseling',
        remarks: 'Routine labs every 3 months'
    },
    {
        patient_id: '1004',
        doctor_id: '2',
        condition: 'Asthma',
        diagnosis_date: '2008-08-09',
        status: 'Ongoing',
        treatment_notes: 'Inhaler prescribed; avoid allergens',
        remarks: 'Needs regular check-up'
    },
    {
        patient_id: '1005',
        doctor_id: '2',
        condition: 'Arthritis',
        diagnosis_date: '2015-11-20',
        status: 'Ongoing',
        treatment_notes: 'Pain relievers; physical therapy',
        remarks: 'Monitor mobility'
    },
    {
        patient_id: '1002',
        doctor_id: '3',
        condition: 'Anemia',
        diagnosis_date: '2025-02-10',
        status: 'Ongoing',
        treatment_notes: 'Iron supplements; dietary changes',
        remarks: 'Follow up in 1 month'
    },
    {
        patient_id: '1011',
        doctor_id: '5',
        condition: 'Chickenpox',
        diagnosis_date: '2024-08-15',
        status: 'Resolved',
        treatment_notes: 'Antiviral meds; calamine lotion',
        remarks: 'Fully recovered'
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

// Get status badge
function getStatusBadge(status) {
    if (status === 'Ongoing') {
        return '<span class="status-ongoing">Ongoing</span>';
    } else {
        return '<span class="status-resolved">Resolved</span>';
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Load medical history into table
function loadHistory() {
    const tableBody = document.getElementById('historyTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    medicalHistory.forEach(record => {
        const row = document.createElement('tr');
        const statusBadge = getStatusBadge(record.status);
        
        row.innerHTML = `
            <td>${record.patient_id}</td>
            <td>${record.doctor_id}</td>
            <td><strong>${record.condition}</strong></td>
            <td>${formatDate(record.diagnosis_date)}</td>
            <td>${statusBadge}</td>
            <td>${record.treatment_notes || '-'}</td>
            <td>${record.remarks || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewHistory('${record.patient_id}', '${record.condition}')">View</button>
                    <button class="edit-btn" onclick="editHistory('${record.patient_id}', '${record.condition}')">Edit</button>
                    <button class="delete-btn" onclick="deleteHistory('${record.patient_id}', '${record.condition}')">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Search history
function searchHistory() {
    const searchTerm = document.getElementById('historySearch').value.toLowerCase();
    const filteredHistory = medicalHistory.filter(record => 
        record.patient_id.toLowerCase().includes(searchTerm) ||
        record.condition.toLowerCase().includes(searchTerm) ||
        record.doctor_id.toLowerCase().includes(searchTerm) ||
        (record.treatment_notes && record.treatment_notes.toLowerCase().includes(searchTerm)) ||
        (record.remarks && record.remarks.toLowerCase().includes(searchTerm))
    );
    displayFilteredHistory(filteredHistory);
}

// Sort history
function sortHistory() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedHistory = [...medicalHistory].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'diagnosis_date') {
            return new Date(valA) - new Date(valB);
        }
        if (sortBy === 'patient_id' || sortBy === 'doctor_id') {
            return String(valA).localeCompare(String(valB));
        }
        return String(valA).localeCompare(String(valB));
    });
    displayFilteredHistory(sortedHistory);
}

// Display filtered/sorted history
function displayFilteredHistory(historyList) {
    const tableBody = document.getElementById('historyTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    historyList.forEach(record => {
        const row = document.createElement('tr');
        const statusBadge = getStatusBadge(record.status);
        
        row.innerHTML = `
            <td>${record.patient_id}</td>
            <td>${record.doctor_id}</td>
            <td><strong>${record.condition}</strong></td>
            <td>${formatDate(record.diagnosis_date)}</td>
            <td>${statusBadge}</td>
            <td>${record.treatment_notes || '-'}</td>
            <td>${record.remarks || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewHistory('${record.patient_id}', '${record.condition}')">View</button>
                    <button class="edit-btn" onclick="editHistory('${record.patient_id}', '${record.condition}')">Edit</button>
                    <button class="delete-btn" onclick="deleteHistory('${record.patient_id}', '${record.condition}')">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Show add history modal
function showAddHistoryModal() {
    document.getElementById('addHistoryModal').classList.add('show');
}

// Hide add history modal
function hideAddHistoryModal() {
    document.getElementById('addHistoryModal').classList.remove('show');
    clearHistoryForm();
}

// Clear history form
function clearHistoryForm() {
    document.getElementById('historyForm').reset();
}

// Save new medical history
function saveHistory() {
    // Get form values
    const patientId = document.getElementById('patientId').value.trim();
    const doctorId = document.getElementById('doctorId').value.trim();
    const condition = document.getElementById('condition').value.trim();
    const diagnosisDate = document.getElementById('diagnosisDate').value;
    const status = document.getElementById('status').value;
    const treatmentNotes = document.getElementById('treatmentNotes').value.trim();
    const remarks = document.getElementById('remarks').value.trim();
    
    // Validate required fields
    if (!patientId || !doctorId || !condition || !status) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create new history object
    const newHistory = {
        patient_id: patientId,
        doctor_id: doctorId,
        condition: condition,
        diagnosis_date: diagnosisDate || null,
        status: status,
        treatment_notes: treatmentNotes || null,
        remarks: remarks || null
    };
    
    // Add to array
    medicalHistory.push(newHistory);
    
    // Reload table
    loadHistory();
    
    // Hide modal
    hideAddHistoryModal();
    
    alert(`Medical history for Patient ${patientId} saved successfully`);
}

// View history
function viewHistory(patientId, condition) {
    const record = medicalHistory.find(r => r.patient_id === patientId && r.condition === condition);
    if (record) {
        alert(`Medical History Details:
Patient ID: ${record.patient_id}
Doctor ID: ${record.doctor_id}
Condition: ${record.condition}
Diagnosis Date: ${formatDate(record.diagnosis_date)}
Status: ${record.status}
Treatment Notes: ${record.treatment_notes || 'N/A'}
Remarks: ${record.remarks || 'N/A'}`);
    }
}

// Edit history
function editHistory(patientId, condition) {
    alert(`Edit medical history for Patient ${patientId} - ${condition}\n\nThis feature will be implemented in the next phase.`);
}

// Delete history
function deleteHistory(patientId, condition) {
    if (confirm(`Delete medical history for Patient ${patientId} - ${condition}?`)) {
        const index = medicalHistory.findIndex(r => r.patient_id === patientId && r.condition === condition);
        if (index !== -1) {
            medicalHistory.splice(index, 1);
            loadHistory();
            alert(`Medical history for Patient ${patientId} - ${condition} has been deleted.`);
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadHistory();
    
    document.getElementById('historySearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchHistory();
        }
    });
});