// senior-records.js
// ===== SENIOR RECORDS PAGE WITH FIREBASE =====

let allSeniorRecords = [];
let allSeniorPatients = [];
let allStaff = [];
let allMedicines = [];

// Display current date
function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Load ONLY SENIOR patients for dropdown
async function loadPatientsForDropdown() {
    try {
        const patientSelect = document.getElementById('patientId');
        if (!patientSelect) return;
        
        patientSelect.innerHTML = '<option value="">Loading...</option>';
        allSeniorPatients = [];
        
        const snapshot = await db.collection('patients').where('patient_type', '==', 'Senior').orderBy('patient_id').get();
        
        patientSelect.innerHTML = '<option value="">Select Patient ID</option>';
        
        if (snapshot.empty) {
            patientSelect.innerHTML = '<option value="">No senior patients found</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const patient = doc.data();
            allSeniorPatients.push(patient);
            const option = document.createElement('option');
            option.value = patient.patient_id;
            option.textContent = patient.patient_id;
            patientSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error("Error loading patients:", error);
        const patientSelect = document.getElementById('patientId');
        if (patientSelect) {
            patientSelect.innerHTML = '<option value="">Error loading patients</option>';
        }
    }
}

// Load staff for doctor dropdown
async function loadStaffForDropdown() {
    try {
        const doctorSelect = document.getElementById('doctorId');
        if (!doctorSelect) return;
        
        doctorSelect.innerHTML = '<option value="">Loading doctors...</option>';
        allStaff = [];
        
        const snapshot = await db.collection('staff').orderBy('doctor_id').get();
        
        doctorSelect.innerHTML = '<option value="">Select Doctor ID</option>';
        
        if (snapshot.empty) {
            doctorSelect.innerHTML = '<option value="">No doctors found</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const staff = doc.data();
            allStaff.push(staff);
            const option = document.createElement('option');
            option.value = staff.doctor_id;
            option.textContent = staff.doctor_id;
            doctorSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error("Error loading staff:", error);
        const doctorSelect = document.getElementById('doctorId');
        if (doctorSelect) {
            doctorSelect.innerHTML = '<option value="">Error loading doctors</option>';
        }
    }
}

// Load medicines for medicine dropdown with stock info
async function loadMedicinesForDropdown() {
    try {
        const medicineSelect = document.getElementById('medicineId');
        if (!medicineSelect) return;
        
        medicineSelect.innerHTML = '<option value="">Loading medicines...</option>';
        allMedicines = [];
        
        const snapshot = await db.collection('medicines_inventory').orderBy('no').get();
        
        medicineSelect.innerHTML = '<option value="">Select Medicine ID</option>';
        
        if (snapshot.empty) {
            medicineSelect.innerHTML = '<option value="">No medicines found</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const medicine = doc.data();
            allMedicines.push(medicine);
            const option = document.createElement('option');
            option.value = medicine.no;
            const stockStatus = medicine.quantity > 0 ? `Stock: ${medicine.quantity}` : 'OUT OF STOCK';
            option.textContent = `${medicine.no} - ${medicine.name} (${stockStatus})`;
            medicineSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error("Error loading medicines:", error);
        const medicineSelect = document.getElementById('medicineId');
        if (medicineSelect) {
            medicineSelect.innerHTML = '<option value="">Error loading medicines</option>';
        }
    }
}

// Update patient name display when patient selected
function updatePatientNameDisplay() {
    const patientSelect = document.getElementById('patientId');
    const patientNameDisplay = document.getElementById('patientNameDisplay');
    const selectedValue = patientSelect.value;
    
    if (selectedValue && allSeniorPatients.length > 0) {
        const patient = allSeniorPatients.find(p => p.patient_id === selectedValue);
        if (patient) {
            patientNameDisplay.value = `${patient.first_name} ${patient.last_name}`;
        } else {
            patientNameDisplay.value = '';
        }
    } else {
        patientNameDisplay.value = '';
    }
}

// Update doctor name display when doctor selected
function updateDoctorNameDisplay() {
    const doctorSelect = document.getElementById('doctorId');
    const doctorNameDisplay = document.getElementById('doctorNameDisplay');
    const selectedValue = doctorSelect.value;
    
    if (selectedValue && allStaff.length > 0) {
        const doctor = allStaff.find(s => s.doctor_id.toString() === selectedValue);
        if (doctor) {
            doctorNameDisplay.value = `Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialty})`;
        } else {
            doctorNameDisplay.value = '';
        }
    } else {
        doctorNameDisplay.value = '';
    }
}

// Update medicine name display when medicine selected (with stock info)
function updateMedicineNameDisplay() {
    const medicineSelect = document.getElementById('medicineId');
    const medicineNameDisplay = document.getElementById('medicineNameDisplay');
    const availableStockDisplay = document.getElementById('availableStockDisplay');
    const quantityInput = document.getElementById('quantity');
    const selectedValue = medicineSelect.value;
    
    if (selectedValue && allMedicines.length > 0) {
        const medicine = allMedicines.find(m => m.no.toString() === selectedValue);
        if (medicine) {
            const stockStatus = medicine.quantity > 0 ? `In Stock: ${medicine.quantity}` : 'OUT OF STOCK';
            medicineNameDisplay.value = medicine.name;
            availableStockDisplay.value = `${medicine.quantity} pieces available`;
            availableStockDisplay.style.color = medicine.quantity > 0 ? '#2e7d32' : '#f44336';
            
            // Set max attribute on quantity input
            quantityInput.max = medicine.quantity;
            
            // Validate quantity on change
            validateQuantity();
        } else {
            medicineNameDisplay.value = '';
            availableStockDisplay.value = '';
        }
    } else {
        medicineNameDisplay.value = '';
        availableStockDisplay.value = '';
        quantityInput.max = '';
    }
}

// Validate quantity against available stock
function validateQuantity() {
    const quantityInput = document.getElementById('quantity');
    const availableStockDisplay = document.getElementById('availableStockDisplay');
    const medicineSelect = document.getElementById('medicineId');
    
    if (!medicineSelect.value) return;
    
    const medicine = allMedicines.find(m => m.no.toString() === medicineSelect.value);
    if (!medicine) return;
    
    let quantity = parseInt(quantityInput.value);
    
    if (isNaN(quantity) || quantity < 1) {
        quantityInput.value = 1;
        quantity = 1;
    }
    
    if (quantity > medicine.quantity) {
        quantityInput.value = medicine.quantity;
        availableStockDisplay.style.color = '#f44336';
        availableStockDisplay.value = `⚠️ Only ${medicine.quantity} pieces available!`;
    } else {
        availableStockDisplay.style.color = '#2e7d32';
        availableStockDisplay.value = `${medicine.quantity} pieces available`;
    }
}

// Check medicine stock before saving
function checkMedicineStock(medicineId, requestedQuantity) {
    const medicine = allMedicines.find(m => m.no.toString() === medicineId);
    if (!medicine) {
        return { available: false, message: 'Medicine not found in inventory' };
    }
    if (medicine.quantity <= 0) {
        return { available: false, message: 'Medicine is out of stock!' };
    }
    if (requestedQuantity > medicine.quantity) {
        return { available: false, message: `Insufficient stock! Only ${medicine.quantity} pieces available.` };
    }
    return { available: true, medicine: medicine };
}

// Update medicine stock in Firestore
async function updateMedicineStock(medicineId, currentStock, deductedQuantity) {
    try {
        const newStock = currentStock - deductedQuantity;
        await db.collection('medicines_inventory').doc(medicineId.toString()).update({
            quantity: newStock,
            updated_at: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error("Error updating medicine stock:", error);
        return false;
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

// Get medicine name by ID
function getMedicineName(medicineId) {
    if (!medicineId) return '-';
    const medicine = allMedicines.find(m => m.no.toString() === medicineId.toString());
    return medicine ? medicine.name : '-';
}

// Load senior records from Firestore
async function loadRecords() {
    const tableBody = document.getElementById('recordsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="15" style="text-align: center;">Loading senior records...<\/div>';

    try {
        const snapshot = await db.collection('senior_records').orderBy('patient_id').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="15" style="text-align: center;">No senior records found. Click "+ Add Record" to add.<\/div>';
            allSeniorRecords = [];
            return;
        }
        
        allSeniorRecords = [];
        tableBody.innerHTML = '';
        
        snapshot.forEach(doc => {
            const record = doc.data();
            allSeniorRecords.push(record);
            
            // Get patient name
            let patientName = '-';
            const patient = allSeniorPatients.find(p => p.patient_id === record.patient_id);
            if (patient) {
                patientName = `${patient.first_name} ${patient.last_name}`;
            }
            
            // Get doctor name
            let doctorIdNum = record.doctor_id || '-';
            let doctorName = '-';
            const doctor = allStaff.find(s => s.doctor_id.toString() === doctorIdNum.toString());
            if (doctor) {
                doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
            }
            
            // Get medicine name
            let medicineIdNum = record.medicine_id || '-';
            let medicineName = getMedicineName(medicineIdNum);
            
            const visionClass = getVisionClass(record.vision_status);
            const hearingClass = getHearingClass(record.hearing_status);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.patient_id || '-'}<\/div>
                <td>${patientName}<\/div>
                <td>${doctorIdNum}<\/div>
                <td>${doctorName}<\/div>
                <td>${medicineIdNum}<\/div>
                <td>${medicineName}<\/div>
                <td>${record.quantity || 1}<\/div>
                <td>${record.medication_history || '-'}<\/div>
                <td>${record.physical_activity || '-'}<\/div>
                <td class="${visionClass}">${record.vision_status || '-'}<\/div>
                <td class="${hearingClass}">${record.hearing_status || '-'}<\/div>
                <td>${record.emergency_contact_name || '-'}<\/div>
                <td>${record.emergency_contact_number || '-'}<\/div>
                <td>${record.remarks || '-'}<\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewRecord('${record.record_id}')">View</button>
                        <button class="edit-btn" onclick="editRecord('${record.record_id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteRecord('${record.record_id}')">Delete</button>
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading senior records:", error);
        tableBody.innerHTML = '<tr><td colspan="15" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
    }
}

// Search records
function searchRecords() {
    const searchTerm = document.getElementById('recordSearch').value.toLowerCase();
    const filteredRecords = allSeniorRecords.filter(record => 
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
    const sortedRecords = [...allSeniorRecords].sort((a, b) => {
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
        let patientName = '-';
        const patient = allSeniorPatients.find(p => p.patient_id === record.patient_id);
        if (patient) {
            patientName = `${patient.first_name} ${patient.last_name}`;
        }
        
        let doctorIdNum = record.doctor_id || '-';
        let doctorName = '-';
        const doctor = allStaff.find(s => s.doctor_id.toString() === doctorIdNum.toString());
        if (doctor) {
            doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
        }
        
        let medicineIdNum = record.medicine_id || '-';
        let medicineName = getMedicineName(medicineIdNum);
        
        const visionClass = getVisionClass(record.vision_status);
        const hearingClass = getHearingClass(record.hearing_status);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.patient_id || '-'}<\/div>
            <td>${patientName}<\/div>
            <td>${doctorIdNum}<\/div>
            <td>${doctorName}<\/div>
            <td>${medicineIdNum}<\/div>
            <td>${medicineName}<\/div>
            <td>${record.quantity || 1}<\/div>
            <td>${record.medication_history || '-'}<\/div>
            <td>${record.physical_activity || '-'}<\/div>
            <td class="${visionClass}">${record.vision_status || '-'}<\/div>
            <td class="${hearingClass}">${record.hearing_status || '-'}<\/div>
            <td>${record.emergency_contact_name || '-'}<\/div>
            <td>${record.emergency_contact_number || '-'}<\/div>
            <td>${record.remarks || '-'}<\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewRecord('${record.record_id}')">View</button>
                    <button class="edit-btn" onclick="editRecord('${record.record_id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteRecord('${record.record_id}')">Delete</button>
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// Generate unique record ID
function generateRecordId() {
    return 'senior_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

// Show add record modal
function showAddRecordModal() {
    document.getElementById('addRecordModal').classList.add('show');
    loadPatientsForDropdown();
    loadStaffForDropdown();
    loadMedicinesForDropdown();
    
    // Reset quantity to 1
    document.getElementById('quantity').value = 1;
}

// Hide add record modal
function hideAddRecordModal() {
    document.getElementById('addRecordModal').classList.remove('show');
    clearRecordForm();
}

// Clear record form
function clearRecordForm() {
    document.getElementById('recordForm').reset();
    document.getElementById('patientNameDisplay').value = '';
    document.getElementById('doctorNameDisplay').value = '';
    document.getElementById('medicineNameDisplay').value = '';
    document.getElementById('availableStockDisplay').value = '';
    document.getElementById('quantity').value = 1;
    document.getElementById('medicineNameDisplay').style.color = '';
}

// Save new record to Firestore
async function saveRecord() {
    const patientId = document.getElementById('patientId').value;
    const doctorId = document.getElementById('doctorId').value;
    const medicineId = document.getElementById('medicineId').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const medicationHistory = document.getElementById('medicationHistory').value.trim();
    const physicalActivity = document.getElementById('physicalActivity').value.trim();
    const visionStatus = document.getElementById('visionStatus').value;
    const hearingStatus = document.getElementById('hearingStatus').value;
    const emergencyContactName = document.getElementById('emergencyContactName').value.trim();
    const emergencyContactNumber = document.getElementById('emergencyContactNumber').value.trim();
    const remarks = document.getElementById('remarks').value.trim();
    
    if (!patientId || !doctorId) {
        alert('Please fill in all required fields (Patient ID and Doctor ID)');
        return;
    }
    
    // Check if record already exists
    if (allSeniorRecords.some(r => r.patient_id === patientId)) {
        alert('A senior record for this patient already exists');
        return;
    }
    
    // Check medicine stock if medicine is selected
    if (medicineId) {
        if (isNaN(quantity) || quantity < 1) {
            alert('Please enter a valid quantity (minimum 1)');
            return;
        }
        
        const stockCheck = checkMedicineStock(medicineId, quantity);
        if (!stockCheck.available) {
            alert(stockCheck.message);
            return;
        }
    }
    
    const recordId = generateRecordId();
    
    // Get patient name
    let patientName = '';
    const patient = allSeniorPatients.find(p => p.patient_id === patientId);
    if (patient) {
        patientName = `${patient.first_name} ${patient.last_name}`;
    }
    
    // Get doctor name
    let doctorName = '';
    const doctor = allStaff.find(s => s.doctor_id.toString() === doctorId);
    if (doctor) {
        doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }
    
    // Get medicine object
    let medicineObj = null;
    if (medicineId) {
        medicineObj = allMedicines.find(m => m.no.toString() === medicineId);
    }
    
    const newRecord = {
        record_id: recordId,
        patient_id: patientId,
        patient_name: patientName,
        doctor_id: doctorId,
        doctor_name: doctorName,
        medicine_id: medicineId || null,
        quantity: quantity || 1,
        medication_history: medicationHistory || null,
        physical_activity: physicalActivity || null,
        vision_status: visionStatus || null,
        hearing_status: hearingStatus || null,
        emergency_contact_name: emergencyContactName || null,
        emergency_contact_number: emergencyContactNumber || null,
        remarks: remarks || null,
        created_at: new Date().toISOString()
    };
    
    try {
        // First, save the senior record
        await db.collection('senior_records').doc(recordId).set(newRecord);
        
        // Then, deduct medicine stock if medicine was prescribed
        if (medicineId && medicineObj) {
            const stockUpdated = await updateMedicineStock(medicineId, medicineObj.quantity, quantity);
            if (stockUpdated) {
                alert(`Senior record saved! ${quantity} piece(s) of ${medicineObj.name} dispensed. Remaining stock: ${medicineObj.quantity - quantity}`);
                // Refresh medicines dropdown to show updated stock
                await loadMedicinesForDropdown();
            } else {
                alert(`Senior record saved but failed to update medicine stock. Please check inventory manually.`);
            }
        } else {
            alert(`Senior record for Patient ${patientId} saved successfully!`);
        }
        
        await loadRecords();
        hideAddRecordModal();
    } catch (error) {
        console.error("Error saving senior record:", error);
        alert("Error saving senior record. Please try again.");
    }
}

// View record
function viewRecord(recordId) {
    const record = allSeniorRecords.find(r => r.record_id === recordId);
    if (record) {
        alert(`SENIOR RECORD DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Patient ID: ${record.patient_id}
Doctor ID: ${record.doctor_id}
Medicine ID: ${record.medicine_id || 'N/A'}
Quantity: ${record.quantity || 1}
Medication History: ${record.medication_history || 'N/A'}
Physical Activity: ${record.physical_activity || 'N/A'}
Vision Status: ${record.vision_status || 'N/A'}
Hearing Status: ${record.hearing_status || 'N/A'}
Emergency Contact: ${record.emergency_contact_name || 'N/A'}
Emergency Contact Number: ${record.emergency_contact_number || 'N/A'}
Remarks: ${record.remarks || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }
}

// Edit record
function editRecord(recordId) {
    alert(`Edit senior record\n\nThis feature will be implemented in the next phase.`);
}

// Delete record from Firestore
async function deleteRecord(recordId) {
    if (confirm(`Delete this senior record?`)) {
        try {
            await db.collection('senior_records').doc(recordId).delete();
            alert(`Senior record deleted successfully.`);
            await loadRecords();
        } catch (error) {
            console.error("Error deleting senior record:", error);
            alert("Error deleting senior record. Please try again.");
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadRecords();
    
    // Add quantity validation on input change
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', validateQuantity);
    }
    
    const searchInput = document.getElementById('recordSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchRecords();
            }
        });
    }
});