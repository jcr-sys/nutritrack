// ===== SENIOR RECORDS PAGE FUNCTIONALITY =====

// Sample senior records data
let seniorRecords = [
    {
        patient_id: '1001',
        doctor_id: '1',
        medicine_id: '202',
        medication_history: 'Hypertension Maintenance History - Taking Losartan for 2 years',
        physical_activity: 'Light Walking',
        vision_status: 'Normal',
        hearing_status: 'Mild hearing loss',
        emergency_contact_name: 'Geri Louise Hernia',
        emergency_contact_number: '09760908363',
        remarks: 'Take after meals'
    },
    {
        patient_id: '1003',
        doctor_id: '1',
        medicine_id: '203',
        medication_history: 'Diabetes Maintenance - On Metformin since 2022',
        physical_activity: 'Yoga',
        vision_status: 'Blurred',
        hearing_status: 'Normal',
        emergency_contact_name: 'Maria Reyes',
        emergency_contact_number: '09123456789',
        remarks: 'Monitor blood sugar regularly'
    },
    {
        patient_id: '1004',
        doctor_id: '2',
        medicine_id: '204',
        medication_history: 'Cholesterol Management - Started Simvastatin 6 months ago',
        physical_activity: 'None',
        vision_status: 'Impaired',
        hearing_status: 'Moderate hearing loss',
        emergency_contact_name: 'Josefa Mendoza',
        emergency_contact_number: '09234567890',
        remarks: 'Needs assistance for mobility'
    },
    {
        patient_id: '1005',
        doctor_id: '2',
        medicine_id: '205',
        medication_history: 'Calcium supplements taken every morning',
        physical_activity: 'Brisk Walking',
        vision_status: 'Normal',
        hearing_status: 'Normal',
        emergency_contact_name: 'Anita Fernandez',
        emergency_contact_number: '09345678901',
        remarks: 'Good health condition'
    },
    {
        patient_id: '1015',
        doctor_id: '1',
        medicine_id: '206',
        medication_history: 'Arthritis maintenance - Pain relievers as needed',
        physical_activity: 'Stretching exercises',
        vision_status: 'Blurred',
        hearing_status: 'Mild hearing loss',
        emergency_contact_name: 'Luis Fernando',
        emergency_contact_number: '09456789012',
        remarks: 'Regular checkup every 3 months'
    },
    {
        patient_id: '1016',
        doctor_id: '3',
        medicine_id: null,
        medication_history: 'No maintenance medication',
        physical_activity: 'Walking daily',
        vision_status: 'Normal',
        hearing_status: 'Normal',
        emergency_contact_name: 'Rosa Villanueva',
        emergency_contact_number: '09567890123',
        remarks: 'Healthy senior'
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

// Get vision status class
function getVisionClass(vision) {
    if (vision === 'Normal') return 'vision-normal';
    if (vision === 'Blurred') return 'vision-blurred';
    if (vision === 'Impaired') return 'vision-impaired';
    return '';
}

// Get hearing status class
function getHearingClass(hearing) {
    if (hearing === 'Normal') return 'hearing-normal';
    if (hearing === 'Mild hearing loss') return 'hearing-mild';
    if (hearing === 'Moderate hearing loss') return 'hearing-moderate';
    if (hearing === 'Severe hearing loss') return 'hearing-severe';
    return '';
}

// Load records into table
function loadRecords() {
    const tableBody = document.getElementById('recordsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    seniorRecords.forEach(record => {
        const row = document.createElement('tr');
        const visionClass = getVisionClass(record.vision_status);
        const hearingClass = getHearingClass(record.hearing_status);
        
        row.innerHTML = `
            <td>${record.patient_id}</td>
            <td>${record.doctor_id}</td>
            <td>${record.medicine_id || '-'}</td>
            <td>${record.medication_history || '-'}</td>
            <td>${record.physical_activity || '-'}</td>
            <td class="${visionClass}">${record.vision_status || '-'}</td>
            <td class="${hearingClass}">${record.hearing_status || '-'}</td>
            <td>${record.emergency_contact_name || '-'}</td>
            <td>${record.emergency_contact_number || '-'}</td>
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
    const filteredRecords = seniorRecords.filter(record => 
        record.patient_id.toLowerCase().includes(searchTerm) ||
        (record.medication_history && record.medication_history.toLowerCase().includes(searchTerm)) ||
        (record.emergency_contact_name && record.emergency_contact_name.toLowerCase().includes(searchTerm)) ||
        (record.remarks && record.remarks.toLowerCase().includes(searchTerm))
    );
    displayFilteredRecords(filteredRecords);
}

// Sort records
function sortRecords() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedRecords = [...seniorRecords].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'patient_id') {
            return String(valA).localeCompare(String(valB), undefined, {numeric: true});
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
        const visionClass = getVisionClass(record.vision_status);
        const hearingClass = getHearingClass(record.hearing_status);
        
        row.innerHTML = `
            <td>${record.patient_id}</td>
            <td>${record.doctor_id}</td>
            <td>${record.medicine_id || '-'}</td>
            <td>${record.medication_history || '-'}</td>
            <td>${record.physical_activity || '-'}</td>
            <td class="${visionClass}">${record.vision_status || '-'}</td>
            <td class="${hearingClass}">${record.hearing_status || '-'}</td>
            <td>${record.emergency_contact_name || '-'}</td>
            <td>${record.emergency_contact_number || '-'}</td>
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
    const doctorId = document.getElementById('doctorId').value.trim();
    const medicineId = document.getElementById('medicineId').value.trim();
    const medicationHistory = document.getElementById('medicationHistory').value.trim();
    const physicalActivity = document.getElementById('physicalActivity').value.trim();
    const visionStatus = document.getElementById('visionStatus').value;
    const hearingStatus = document.getElementById('hearingStatus').value;
    const emergencyContactName = document.getElementById('emergencyContactName').value.trim();
    const emergencyContactNumber = document.getElementById('emergencyContactNumber').value.trim();
    const remarks = document.getElementById('remarks').value.trim();
    
    // Validate required fields
    if (!patientId || !doctorId) {
        alert('Please fill in all required fields (Patient ID and Doctor ID)');
        return;
    }
    
    // Check if record already exists
    if (seniorRecords.some(r => r.patient_id === patientId)) {
        alert('A senior record for this patient already exists');
        return;
    }
    
    // Create new record object
    const newRecord = {
        patient_id: patientId,
        doctor_id: doctorId,
        medicine_id: medicineId || null,
        medication_history: medicationHistory || null,
        physical_activity: physicalActivity || null,
        vision_status: visionStatus || null,
        hearing_status: hearingStatus || null,
        emergency_contact_name: emergencyContactName || null,
        emergency_contact_number: emergencyContactNumber || null,
        remarks: remarks || null
    };
    
    // Add to array
    seniorRecords.push(newRecord);
    
    // Reload table
    loadRecords();
    
    // Hide modal
    hideAddRecordModal();
    
    alert(`Senior record for Patient ${patientId} saved successfully`);
}

// View record
function viewRecord(patientId) {
    const record = seniorRecords.find(r => r.patient_id === patientId);
    if (record) {
        alert(`Senior Record Details:
Patient ID: ${record.patient_id}
Doctor ID: ${record.doctor_id}
Medicine ID: ${record.medicine_id || 'N/A'}
Medication History: ${record.medication_history || 'N/A'}
Physical Activity: ${record.physical_activity || 'N/A'}
Vision Status: ${record.vision_status || 'N/A'}
Hearing Status: ${record.hearing_status || 'N/A'}
Emergency Contact: ${record.emergency_contact_name || 'N/A'}
Emergency Contact Number: ${record.emergency_contact_number || 'N/A'}
Remarks: ${record.remarks || 'N/A'}`);
    }
}

// Edit record
function editRecord(patientId) {
    alert(`Edit senior record for Patient ${patientId}\n\nThis feature will be implemented in the next phase.`);
}

// Delete record
function deleteRecord(patientId) {
    if (confirm(`Delete senior record for Patient ${patientId}?`)) {
        const index = seniorRecords.findIndex(r => r.patient_id === patientId);
        if (index !== -1) {
            seniorRecords.splice(index, 1);
            loadRecords();
            alert(`Senior record for Patient ${patientId} has been deleted.`);
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