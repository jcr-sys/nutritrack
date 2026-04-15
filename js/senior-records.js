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

// ========== TOAST NOTIFICATION ==========
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
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Helper function to get doctor name by ID
async function getDoctorNameById(doctorId) {
    if (!doctorId) return '-';
    const doctor = allStaff.find(s => s.doctor_id?.toString() === doctorId.toString());
    if (doctor) {
        return `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }
    // Fetch from Firebase if not in array
    try {
        const snapshot = await db.collection('staff').where('doctor_id', '==', parseInt(doctorId)).get();
        if (!snapshot.empty) {
            const doctorData = snapshot.docs[0].data();
            allStaff.push(doctorData);
            return `Dr. ${doctorData.first_name} ${doctorData.last_name}`;
        }
    } catch (error) {
        console.error("Error fetching doctor name:", error);
    }
    return '-';
}

// Helper function to get medicine name by ID
function getMedicineNameById(medicineId) {
    if (!medicineId) return '-';
    const medicine = allMedicines.find(m => m.no?.toString() === medicineId.toString());
    if (medicine) {
        return medicine.name;
    }
    return '-';
}

// Load ONLY SENIOR patients for dropdown
async function loadPatientsForDropdown() {
    try {
        const patientSelect = document.getElementById('patientId');
        const editPatientSelect = document.getElementById('editPatientId');
        
        if (patientSelect) patientSelect.innerHTML = '<option value="">Loading...</option>';
        if (editPatientSelect) editPatientSelect.innerHTML = '<option value="">Loading...</option>';
        allSeniorPatients = [];
        
        const snapshot = await db.collection('patients').where('patient_type', '==', 'Senior').orderBy('patient_id').get();
        
        if (patientSelect) {
            patientSelect.innerHTML = '<option value="">Select Patient ID</option>';
        }
        if (editPatientSelect) {
            editPatientSelect.innerHTML = '<option value="">Select Patient ID</option>';
        }
        
        if (snapshot.empty) {
            if (patientSelect) patientSelect.innerHTML = '<option value="">No senior patients found</option>';
            if (editPatientSelect) editPatientSelect.innerHTML = '<option value="">No senior patients found</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const patient = doc.data();
            allSeniorPatients.push(patient);
            
            if (patientSelect) {
                const option = document.createElement('option');
                option.value = patient.patient_id;
                option.textContent = patient.patient_id;
                patientSelect.appendChild(option);
            }
            if (editPatientSelect) {
                const editOption = document.createElement('option');
                editOption.value = patient.patient_id;
                editOption.textContent = patient.patient_id;
                editPatientSelect.appendChild(editOption);
            }
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
        const editDoctorSelect = document.getElementById('editDoctorId');
        
        if (doctorSelect) doctorSelect.innerHTML = '<option value="">Loading doctors...</option>';
        if (editDoctorSelect) editDoctorSelect.innerHTML = '<option value="">Loading doctors...</option>';
        allStaff = [];
        
        const snapshot = await db.collection('staff').orderBy('doctor_id').get();
        
        if (doctorSelect) {
            doctorSelect.innerHTML = '<option value="">Select Doctor ID</option>';
        }
        if (editDoctorSelect) {
            editDoctorSelect.innerHTML = '<option value="">Select Doctor ID</option>';
        }
        
        if (snapshot.empty) {
            if (doctorSelect) doctorSelect.innerHTML = '<option value="">No doctors found</option>';
            if (editDoctorSelect) editDoctorSelect.innerHTML = '<option value="">No doctors found</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const staff = doc.data();
            allStaff.push(staff);
            
            const optionText = `Dr. ${staff.first_name} ${staff.last_name} (${staff.specialty}) - ID: ${staff.doctor_id}`;
            
            if (doctorSelect) {
                const option = document.createElement('option');
                option.value = staff.doctor_id;
                option.textContent = optionText;
                doctorSelect.appendChild(option);
            }
            if (editDoctorSelect) {
                const editOption = document.createElement('option');
                editOption.value = staff.doctor_id;
                editOption.textContent = optionText;
                editDoctorSelect.appendChild(editOption);
            }
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
        const editMedicineSelect = document.getElementById('editMedicineId');
        
        if (medicineSelect) medicineSelect.innerHTML = '<option value="">Loading medicines...</option>';
        if (editMedicineSelect) editMedicineSelect.innerHTML = '<option value="">Loading medicines...</option>';
        allMedicines = [];
        
        const snapshot = await db.collection('medicines_inventory').orderBy('no').get();
        
        if (medicineSelect) {
            medicineSelect.innerHTML = '<option value="">Select Medicine</option>';
        }
        if (editMedicineSelect) {
            editMedicineSelect.innerHTML = '<option value="">Select Medicine</option>';
        }
        
        if (snapshot.empty) {
            if (medicineSelect) medicineSelect.innerHTML = '<option value="">No medicines found</option>';
            if (editMedicineSelect) editMedicineSelect.innerHTML = '<option value="">No medicines found</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const medicine = doc.data();
            allMedicines.push(medicine);
            
            const stockStatus = medicine.quantity > 0 ? `Stock: ${medicine.quantity}` : 'OUT OF STOCK';
            
            if (medicineSelect) {
                const option = document.createElement('option');
                option.value = medicine.no;
                option.textContent = `${medicine.name} (${stockStatus})`;
                medicineSelect.appendChild(option);
            }
            if (editMedicineSelect) {
                const editOption = document.createElement('option');
                editOption.value = medicine.no;
                editOption.textContent = `${medicine.name} (${stockStatus})`;
                editMedicineSelect.appendChild(editOption);
            }
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
    const selectedValue = patientSelect?.value;
    
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

// Update edit patient name display
function updateEditPatientNameDisplay() {
    const patientSelect = document.getElementById('editPatientId');
    const patientNameDisplay = document.getElementById('editPatientNameDisplay');
    const selectedValue = patientSelect?.value;
    
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
    const selectedValue = doctorSelect?.value;
    
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

// Update edit doctor name display
function updateEditDoctorNameDisplay() {
    const doctorSelect = document.getElementById('editDoctorId');
    const doctorNameDisplay = document.getElementById('editDoctorNameDisplay');
    const selectedValue = doctorSelect?.value;
    
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
    const selectedValue = medicineSelect?.value;
    
    if (selectedValue && allMedicines.length > 0) {
        const medicine = allMedicines.find(m => m.no.toString() === selectedValue);
        if (medicine) {
            medicineNameDisplay.value = medicine.name;
            availableStockDisplay.value = `${medicine.quantity} pieces available`;
            availableStockDisplay.style.color = medicine.quantity > 0 ? '#2e7d32' : '#f44336';
            quantityInput.max = medicine.quantity;
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

// Update edit medicine name display
function updateEditMedicineNameDisplay() {
    const medicineSelect = document.getElementById('editMedicineId');
    const medicineNameDisplay = document.getElementById('editMedicineNameDisplay');
    const availableStockDisplay = document.getElementById('editAvailableStockDisplay');
    const quantityInput = document.getElementById('editQuantity');
    const selectedValue = medicineSelect?.value;
    
    if (selectedValue && allMedicines.length > 0) {
        const medicine = allMedicines.find(m => m.no.toString() === selectedValue);
        if (medicine) {
            medicineNameDisplay.value = medicine.name;
            availableStockDisplay.value = `${medicine.quantity} pieces available`;
            availableStockDisplay.style.color = medicine.quantity > 0 ? '#2e7d32' : '#f44336';
            quantityInput.max = medicine.quantity;
        } else {
            medicineNameDisplay.value = '';
            availableStockDisplay.value = '';
        }
    } else {
        medicineNameDisplay.value = '';
        availableStockDisplay.value = '';
    }
}

// Validate quantity against available stock
function validateQuantity() {
    const quantityInput = document.getElementById('quantity');
    const availableStockDisplay = document.getElementById('availableStockDisplay');
    const medicineSelect = document.getElementById('medicineId');
    
    if (!medicineSelect?.value) return;
    
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
        // First load staff and medicines to ensure we have data
        await loadStaffForDropdown();
        await loadMedicinesForDropdown();
        
        const snapshot = await db.collection('senior_records').orderBy('patient_id').get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="15" style="text-align: center;">No senior records found. Click "+ Add Record" to add.<\/div>';
            allSeniorRecords = [];
            return;
        }
        
        allSeniorRecords = [];
        tableBody.innerHTML = '';
        
        for (const doc of snapshot.docs) {
            const record = doc.data();
            allSeniorRecords.push(record);
            
            // Get patient name
            let patientName = '';
            const patient = allSeniorPatients.find(p => p.patient_id === record.patient_id);
            if (patient) {
                patientName = `${patient.first_name} ${patient.last_name}`;
            } else {
                try {
                    const patientDoc = await db.collection('patients').doc(record.patient_id).get();
                    if (patientDoc.exists) {
                        const patientData = patientDoc.data();
                        patientName = `${patientData.first_name} ${patientData.last_name}`;
                        allSeniorPatients.push(patientData);
                    }
                } catch (err) {
                    console.error("Error fetching patient:", err);
                }
            }
            
            // Get doctor name from allStaff array
            let doctorIdNum = record.doctor_id || '-';
            let doctorName = await getDoctorNameById(doctorIdNum);
            
            // Get medicine name
            let medicineIdNum = record.medicine_id || '-';
            let medicineName = getMedicineName(medicineIdNum);
            
            const visionClass = getVisionClass(record.vision_status);
            const hearingClass = getHearingClass(record.hearing_status);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.patient_id || '-'}<\/div>
                <td>${patientName || '-'}<\/div>
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
                        <button class="view-btn" onclick="viewRecordModal('${record.record_id}')">View</button>
                        <button class="edit-btn" onclick="editRecordModal('${record.record_id}')">Edit</button>
                        <button class="delete-btn" onclick="showDeleteRecordConfirmation('${record.record_id}', '${record.patient_id}')">Delete</button>
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        }
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
async function displayFilteredRecords(recordsList) {
    const tableBody = document.getElementById('recordsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    for (const record of recordsList) {
        let patientName = '';
        const patient = allSeniorPatients.find(p => p.patient_id === record.patient_id);
        if (patient) {
            patientName = `${patient.first_name} ${patient.last_name}`;
        } else {
            patientName = '-';
        }
        
        let doctorIdNum = record.doctor_id || '-';
        let doctorName = await getDoctorNameById(doctorIdNum);
        
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
                    <button class="view-btn" onclick="viewRecordModal('${record.record_id}')">View</button>
                    <button class="edit-btn" onclick="editRecordModal('${record.record_id}')">Edit</button>
                    <button class="delete-btn" onclick="showDeleteRecordConfirmation('${record.record_id}', '${record.patient_id}')">Delete</button>
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    }
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
        showToast('Please fill in all required fields (Patient ID and Doctor ID)', 'warning');
        return;
    }
    
    if (allSeniorRecords.some(r => r.patient_id === patientId)) {
        showToast('A senior record for this patient already exists', 'warning');
        return;
    }
    
    if (medicineId) {
        if (isNaN(quantity) || quantity < 1) {
            showToast('Please enter a valid quantity (minimum 1)', 'warning');
            return;
        }
        
        const stockCheck = checkMedicineStock(medicineId, quantity);
        if (!stockCheck.available) {
            showToast(stockCheck.message, 'warning');
            return;
        }
    }
    
    const recordId = generateRecordId();
    
    let patientName = '';
    const patient = allSeniorPatients.find(p => p.patient_id === patientId);
    if (patient) {
        patientName = `${patient.first_name} ${patient.last_name}`;
    }
    
    let doctorName = '';
    const doctor = allStaff.find(s => s.doctor_id.toString() === doctorId);
    if (doctor) {
        doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }
    
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
        await db.collection('senior_records').doc(recordId).set(newRecord);
        
        if (medicineId && medicineObj) {
            const stockUpdated = await updateMedicineStock(medicineId, medicineObj.quantity, quantity);
            if (stockUpdated) {
                showToast(`Senior record saved! ${quantity} piece(s) of ${medicineObj.name} dispensed. Remaining stock: ${medicineObj.quantity - quantity}`, 'success');
                await loadMedicinesForDropdown();
            } else {
                showToast(`Senior record saved but failed to update medicine stock. Please check inventory manually.`, 'warning');
            }
        } else {
            showToast(`Senior record for Patient ${patientId} saved successfully!`, 'success');
        }
        
        await loadRecords();
        hideAddRecordModal();
    } catch (error) {
        console.error("Error saving senior record:", error);
        showToast("Error saving senior record. Please try again.", 'error');
    }
}

// ========== VIEW RECORD MODAL ==========
function viewRecordModal(recordId) {
    const record = allSeniorRecords.find(r => r.record_id === recordId);
    if (record) {
        const visionClass = getVisionClass(record.vision_status);
        const hearingClass = getHearingClass(record.hearing_status);
        
        const content = `
            <div style="line-height: 1.8; font-family: 'Segoe UI', Arial, sans-serif;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; width: 40%; font-weight: 600; color: #2B6896;">Patient ID:<\/td><td style="padding: 8px 0;">${record.patient_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Patient Name:<\/td><td style="padding: 8px 0;">${record.patient_name || '-'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Doctor ID:<\/td><td style="padding: 8px 0;">${record.doctor_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Doctor Name:<\/td><td style="padding: 8px 0;">${record.doctor_name || '-'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Medicine ID:<\/td><td style="padding: 8px 0;">${record.medicine_id || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Medicine Name:<\/td><td style="padding: 8px 0;">${getMedicineName(record.medicine_id)}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Quantity:<\/td><td style="padding: 8px 0;">${record.quantity || 1}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Medication History:<\/td><td style="padding: 8px 0;">${record.medication_history || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Physical Activity:<\/td><td style="padding: 8px 0;">${record.physical_activity || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Vision Status:<\/td><td style="padding: 8px 0;" class="${visionClass}">${record.vision_status || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Hearing Status:<\/td><td style="padding: 8px 0;" class="${hearingClass}">${record.hearing_status || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Emergency Contact:<\/td><td style="padding: 8px 0;">${record.emergency_contact_name || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Emergency Contact Number:<\/td><td style="padding: 8px 0;">${record.emergency_contact_number || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Remarks:<\/td><td style="padding: 8px 0;">${record.remarks || 'N/A'}<\/td><\/tr>
                </table>
            </div>
        `;
        
        const modal = document.getElementById('viewRecordModal');
        if (modal) {
            document.getElementById('viewRecordModalBody').innerHTML = content;
            modal.classList.add('show');
        }
    }
}

function closeViewRecordModal() {
    const modal = document.getElementById('viewRecordModal');
    if (modal) modal.classList.remove('show');
}

// ========== EDIT RECORD MODAL ==========
function editRecordModal(recordId) {
    const record = allSeniorRecords.find(r => r.record_id === recordId);
    if (!record) {
        showToast('Senior record not found.', 'error');
        return;
    }
    
    document.getElementById('editRecordId').value = record.record_id;
    
    // Patient ID is read-only - display only
    document.getElementById('editPatientId').value = record.patient_id;
    
    // Doctor ID - make it disabled (read-only) so it cannot be changed
    const doctorSelect = document.getElementById('editDoctorId');
    if (doctorSelect) {
        doctorSelect.value = record.doctor_id;
        doctorSelect.disabled = true;
    }
    
    document.getElementById('editMedicineId').value = record.medicine_id || '';
    document.getElementById('editQuantity').value = record.quantity || 1;
    document.getElementById('editMedicationHistory').value = record.medication_history || '';
    document.getElementById('editPhysicalActivity').value = record.physical_activity || '';
    document.getElementById('editVisionStatus').value = record.vision_status || '';
    document.getElementById('editHearingStatus').value = record.hearing_status || '';
    document.getElementById('editEmergencyContactName').value = record.emergency_contact_name || '';
    document.getElementById('editEmergencyContactNumber').value = record.emergency_contact_number || '';
    document.getElementById('editRemarks').value = record.remarks || '';
    
    // Get patient name for display
    let patientName = '';
    const patient = allSeniorPatients.find(p => p.patient_id === record.patient_id);
    if (patient) {
        patientName = `${patient.first_name} ${patient.last_name}`;
    } else {
        (async () => {
            try {
                const patientDoc = await db.collection('patients').doc(record.patient_id).get();
                if (patientDoc.exists) {
                    const patientData = patientDoc.data();
                    patientName = `${patientData.first_name} ${patientData.last_name}`;
                    allSeniorPatients.push(patientData);
                    document.getElementById('editPatientNameDisplay').value = patientName;
                }
            } catch (err) {
                console.error("Error fetching patient:", err);
                document.getElementById('editPatientNameDisplay').value = '';
            }
        })();
    }
    document.getElementById('editPatientNameDisplay').value = patientName;
    
    // Get doctor name for display
    const doctor = allStaff.find(s => s.doctor_id.toString() === record.doctor_id.toString());
    if (doctor) {
        document.getElementById('editDoctorNameDisplay').value = `Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialty})`;
    } else {
        document.getElementById('editDoctorNameDisplay').value = '';
    }
    
    updateEditMedicineNameDisplay();
    
    loadMedicinesForDropdown();
    
    document.getElementById('editRecordModal').classList.add('show');
}

function closeEditRecordModal() {
    document.getElementById('editRecordModal').classList.remove('show');
    // Re-enable doctor select for next time
    const doctorSelect = document.getElementById('editDoctorId');
    if (doctorSelect) {
        doctorSelect.disabled = false;
    }
}

async function updateRecord() {
    const recordId = document.getElementById('editRecordId').value;
    const patientId = document.getElementById('editPatientId').value;
    const doctorId = document.getElementById('editDoctorId').value;
    const medicineId = document.getElementById('editMedicineId').value;
    const quantity = parseInt(document.getElementById('editQuantity').value);
    const medicationHistory = document.getElementById('editMedicationHistory').value.trim();
    const physicalActivity = document.getElementById('editPhysicalActivity').value.trim();
    const visionStatus = document.getElementById('editVisionStatus').value;
    const hearingStatus = document.getElementById('editHearingStatus').value;
    const emergencyContactName = document.getElementById('editEmergencyContactName').value.trim();
    const emergencyContactNumber = document.getElementById('editEmergencyContactNumber').value.trim();
    const remarks = document.getElementById('editRemarks').value.trim();
    
    if (!patientId || !doctorId) {
        showToast('Please fill in all required fields (Patient ID and Doctor ID)', 'warning');
        return;
    }
    
    let patientName = '';
    const patient = allSeniorPatients.find(p => p.patient_id === patientId);
    if (patient) {
        patientName = `${patient.first_name} ${patient.last_name}`;
    }
    
    let doctorName = '';
    const doctor = allStaff.find(s => s.doctor_id.toString() === doctorId);
    if (doctor) {
        doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }
    
    try {
        await db.collection('senior_records').doc(recordId).update({
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
            updated_at: new Date().toISOString()
        });
        
        showToast(`Senior record updated successfully!`, 'success');
        await loadRecords();
        closeEditRecordModal();
    } catch (error) {
        console.error("Error updating senior record:", error);
        showToast("Error updating senior record. Please try again.", 'error');
    }
}

// ========== DELETE RECORD CONFIRMATION MODAL ==========
let pendingDeleteRecordId = null;

function showDeleteRecordConfirmation(recordId, patientId) {
    pendingDeleteRecordId = recordId;
    
    let modal = document.getElementById('deleteRecordConfirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'deleteRecordConfirmModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div class="modal-header" style="background: #f44336;">
                    <h2 style="color: white;">⚠️ Confirm Delete</h2>
                    <button class="close-modal" onclick="closeDeleteRecordModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="font-size: 48px; margin-bottom: 15px;">🗑️</div>
                    <p>Are you sure you want to delete this senior record?</p>
                    <p><strong id="deleteRecordInfo"></strong></p>
                    <p style="color: #f44336; font-size: 13px;">⚠️ This action cannot be undone!</p>
                </div>
                <div class="modal-footer" style="justify-content: center;">
                    <button class="cancel-btn" onclick="closeDeleteRecordModal()">Cancel</button>
                    <button class="save-btn" id="confirmDeleteRecordBtn" style="background: #f44336;">Delete Permanently</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const deleteInfo = document.getElementById('deleteRecordInfo');
    if (deleteInfo) {
        deleteInfo.innerHTML = `Patient ID: ${escapeHtml(patientId)}`;
    }
    
    modal.classList.add('show');
    
    const confirmBtn = document.getElementById('confirmDeleteRecordBtn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener('click', async () => {
        if (pendingDeleteRecordId) {
            try {
                await db.collection('senior_records').doc(pendingDeleteRecordId).delete();
                showToast(`Senior record deleted successfully.`, 'success');
                await loadRecords();
            } catch (error) {
                console.error("Error deleting senior record:", error);
                showToast("Error deleting senior record. Please try again.", 'error');
            }
        }
        closeDeleteRecordModal();
    });
}

function closeDeleteRecordModal() {
    const modal = document.getElementById('deleteRecordConfirmModal');
    if (modal) modal.classList.remove('show');
    pendingDeleteRecordId = null;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    
    // Load all required data first
    Promise.all([
        loadPatientsForDropdown(),
        loadStaffForDropdown(),
        loadMedicinesForDropdown()
    ]).then(() => {
        loadRecords();
    });
    
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