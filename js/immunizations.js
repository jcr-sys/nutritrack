// ===== CHILD IMMUNIZATIONS PAGE WITH FIREBASE =====

let allImmunizations = [];
let allChildPatients = [];
let allVaccines = [];
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

// Load ONLY CHILD patients for dropdown
async function loadPatientsForDropdown() {
    try {
        const patientSelect = document.getElementById('patientId');
        if (!patientSelect) return;
        
        patientSelect.innerHTML = '<option value="">Loading...</option>';
        allChildPatients = [];
        
        const snapshot = await db.collection('patients').where('patient_type', '==', 'Child').orderBy('patient_id').get();
        
        patientSelect.innerHTML = '<option value="">Select Patient ID</option>';
        
        if (snapshot.empty) {
            patientSelect.innerHTML = '<option value="">No child patients found</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const patient = doc.data();
            allChildPatients.push(patient);
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
            
            if (doctorSelect) {
                const option = document.createElement('option');
                option.value = staff.doctor_id;
                option.textContent = staff.doctor_id;
                doctorSelect.appendChild(option);
            }
            if (editDoctorSelect) {
                const editOption = document.createElement('option');
                editOption.value = staff.doctor_id;
                editOption.textContent = staff.doctor_id;
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

// Load VACCINES from inventory for dropdown with stock info
async function loadVaccinesForDropdown() {
    try {
        const vaccineSelect = document.getElementById('vaccineId');
        const editVaccineSelect = document.getElementById('editVaccineId');
        
        if (vaccineSelect) vaccineSelect.innerHTML = '<option value="">Loading vaccines...</option>';
        if (editVaccineSelect) editVaccineSelect.innerHTML = '<option value="">Loading vaccines...</option>';
        allVaccines = [];
        
        const snapshot = await db.collection('vaccines_inventory').orderBy('no').get();
        
        if (vaccineSelect) {
            vaccineSelect.innerHTML = '<option value="">Select Vaccine ID</option>';
        }
        if (editVaccineSelect) {
            editVaccineSelect.innerHTML = '<option value="">Select Vaccine ID</option>';
        }
        
        if (snapshot.empty) {
            if (vaccineSelect) vaccineSelect.innerHTML = '<option value="">No vaccines found in inventory</option>';
            if (editVaccineSelect) editVaccineSelect.innerHTML = '<option value="">No vaccines found in inventory</option>';
            return;
        }
        
        snapshot.forEach(doc => {
            const vaccine = doc.data();
            allVaccines.push(vaccine);
            
            const stockStatus = vaccine.quantity > 0 ? `Stock: ${vaccine.quantity}` : 'OUT OF STOCK';
            
            if (vaccineSelect) {
                const option = document.createElement('option');
                option.value = vaccine.no;
                option.textContent = `${vaccine.no} - ${vaccine.name} (${stockStatus})`;
                vaccineSelect.appendChild(option);
            }
            if (editVaccineSelect) {
                const editOption = document.createElement('option');
                editOption.value = vaccine.no;
                editOption.textContent = `${vaccine.no} - ${vaccine.name} (${stockStatus})`;
                editVaccineSelect.appendChild(editOption);
            }
        });
        
    } catch (error) {
        console.error("Error loading vaccines:", error);
        const vaccineSelect = document.getElementById('vaccineId');
        if (vaccineSelect) {
            vaccineSelect.innerHTML = '<option value="">Error loading vaccines</option>';
        }
    }
}

// Update patient name display when patient selected
function updatePatientNameDisplay() {
    const patientSelect = document.getElementById('patientId');
    const patientNameDisplay = document.getElementById('patientNameDisplay');
    const selectedValue = patientSelect?.value;
    
    if (selectedValue && allChildPatients.length > 0) {
        const patient = allChildPatients.find(p => p.patient_id === selectedValue);
        if (patient) {
            patientNameDisplay.value = `${patient.first_name} ${patient.last_name}`;
        } else {
            patientNameDisplay.value = '';
        }
    } else {
        patientNameDisplay.value = '';
    }
}

// Update vaccine name display when vaccine selected (with stock info)
function updateVaccineNameDisplay() {
    const vaccineSelect = document.getElementById('vaccineId');
    const vaccineNameDisplay = document.getElementById('vaccineNameDisplay');
    const availableStockDisplay = document.getElementById('availableStockDisplay');
    const quantityInput = document.getElementById('quantity');
    const selectedValue = vaccineSelect?.value;
    
    if (selectedValue && allVaccines.length > 0) {
        const vaccine = allVaccines.find(v => v.no.toString() === selectedValue);
        if (vaccine) {
            vaccineNameDisplay.value = vaccine.name;
            availableStockDisplay.value = `${vaccine.quantity} doses available`;
            availableStockDisplay.style.color = vaccine.quantity > 0 ? '#2e7d32' : '#f44336';
            quantityInput.max = vaccine.quantity;
            validateQuantity();
        } else {
            vaccineNameDisplay.value = '';
            availableStockDisplay.value = '';
        }
    } else {
        vaccineNameDisplay.value = '';
        availableStockDisplay.value = '';
        quantityInput.max = '';
    }
}

// Update edit vaccine name display
function updateEditVaccineNameDisplay() {
    const vaccineSelect = document.getElementById('editVaccineId');
    const vaccineNameDisplay = document.getElementById('editVaccineNameDisplay');
    const availableStockDisplay = document.getElementById('editAvailableStockDisplay');
    const quantityInput = document.getElementById('editQuantity');
    const selectedValue = vaccineSelect?.value;
    
    if (selectedValue && allVaccines.length > 0) {
        const vaccine = allVaccines.find(v => v.no.toString() === selectedValue);
        if (vaccine) {
            vaccineNameDisplay.value = vaccine.name;
            availableStockDisplay.value = `${vaccine.quantity} doses available`;
            availableStockDisplay.style.color = vaccine.quantity > 0 ? '#2e7d32' : '#f44336';
            quantityInput.max = vaccine.quantity;
        } else {
            vaccineNameDisplay.value = '';
            availableStockDisplay.value = '';
        }
    } else {
        vaccineNameDisplay.value = '';
        availableStockDisplay.value = '';
    }
}

// Validate quantity against available stock
function validateQuantity() {
    const quantityInput = document.getElementById('quantity');
    const availableStockDisplay = document.getElementById('availableStockDisplay');
    const vaccineSelect = document.getElementById('vaccineId');
    
    if (!vaccineSelect?.value) return;
    
    const vaccine = allVaccines.find(v => v.no.toString() === vaccineSelect.value);
    if (!vaccine) return;
    
    let quantity = parseInt(quantityInput.value);
    
    if (isNaN(quantity) || quantity < 1) {
        quantityInput.value = 1;
        quantity = 1;
    }
    
    if (quantity > vaccine.quantity) {
        quantityInput.value = vaccine.quantity;
        availableStockDisplay.style.color = '#f44336';
        availableStockDisplay.value = `⚠️ Only ${vaccine.quantity} doses available!`;
    } else {
        availableStockDisplay.style.color = '#2e7d32';
        availableStockDisplay.value = `${vaccine.quantity} doses available`;
    }
}

// Check vaccine stock before saving
function checkVaccineStock(vaccineId, requestedQuantity) {
    const vaccine = allVaccines.find(v => v.no.toString() === vaccineId);
    if (!vaccine) {
        return { available: false, message: 'Vaccine not found in inventory' };
    }
    if (vaccine.quantity <= 0) {
        return { available: false, message: 'Vaccine is out of stock!' };
    }
    if (requestedQuantity > vaccine.quantity) {
        return { available: false, message: `Insufficient stock! Only ${vaccine.quantity} doses available.` };
    }
    return { available: true, vaccine: vaccine };
}

// Update vaccine stock in Firestore
async function updateVaccineStock(vaccineId, currentStock, deductedQuantity) {
    try {
        const newStock = currentStock - deductedQuantity;
        await db.collection('vaccines_inventory').doc(vaccineId.toString()).update({
            quantity: newStock,
            updated_at: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error("Error updating vaccine stock:", error);
        return false;
    }
}

// Get vaccine name by ID
function getVaccineName(vaccineId) {
    const vaccine = allVaccines.find(v => v.no.toString() === vaccineId);
    return vaccine ? vaccine.name : 'Unknown Vaccine';
}

// Get doctor name by ID
function getDoctorName(doctorId) {
    const doctor = allStaff.find(s => s.doctor_id.toString() === doctorId);
    return doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : '-';
}

// Load immunizations from Firestore
async function loadImmunizations() {
    const tableBody = document.getElementById('immunizationsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Loading immunizations...<\/div>';

    try {
        // First, load staff data to ensure doctor names are available
        await loadStaffForDropdown();
        
        const snapshot = await db.collection('child_immunizations').orderBy('date_given', 'desc').get();

        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">No immunizations found. Click "+ Record Immunization" to add.<\/div>';
            allImmunizations = [];
            return;
        }

        allImmunizations = [];
        tableBody.innerHTML = '';

        for (const doc of snapshot.docs) {
            const record = doc.data();
            allImmunizations.push(record);
            
            // Get patient name from patients table
            let patientName = '';
            const patient = allChildPatients.find(p => p.patient_id === record.patient_id);
            if (patient) {
                patientName = `${patient.first_name} ${patient.last_name}`;
            } else {
                try {
                    const patientDoc = await db.collection('patients').doc(record.patient_id).get();
                    if (patientDoc.exists) {
                        const patientData = patientDoc.data();
                        patientName = `${patientData.first_name} ${patientData.last_name}`;
                        allChildPatients.push(patientData);
                    }
                } catch (err) {
                    console.error("Error fetching patient:", err);
                }
            }
            
            const vaccineName = getVaccineName(record.vaccine_id);
            
            // Get doctor name from allStaff array (which is now loaded)
            let doctorName = '';
            const doctor = allStaff.find(s => s.doctor_id.toString() === record.doctor_id?.toString());
            if (doctor) {
                doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
            } else if (record.doctor_name) {
                doctorName = record.doctor_name;
            } else {
                doctorName = '-';
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.patient_id || '-'}<\/div>
                <td>${patientName || '-'}<\/div>
                <td>${vaccineName}<\/div>
                <td>${record.quantity || 1}<\/div>
                <td>${record.dose_number || '-'}<\/div>
                <td>${record.date_given || '-'}<\/div>
                <td>${record.doctor_id || '-'}<\/div>
                <td>${doctorName}<\/div>
                <td>${record.remarks || '-'}<\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewImmunizationModal('${record.record_id}')">View</button>
                        <button class="edit-btn" onclick="editImmunizationModal('${record.record_id}')">Edit</button>
                        <button class="delete-btn" onclick="showDeleteImmunizationConfirmation('${record.record_id}', '${record.patient_id}')">Delete</button>
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        }
    } catch (error) {
        console.error("Error loading immunizations:", error);
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
    }
}

// Search immunizations
function searchImmunizations() {
    const searchTerm = document.getElementById('immunizationSearch').value.toLowerCase();
    const filteredImmunizations = allImmunizations.filter(record => 
        record.patient_id.toLowerCase().includes(searchTerm) ||
        (record.vaccine_id && getVaccineName(record.vaccine_id).toLowerCase().includes(searchTerm)) ||
        (record.doctor_id && record.doctor_id.toLowerCase().includes(searchTerm)) ||
        (record.remarks && record.remarks.toLowerCase().includes(searchTerm))
    );
    displayFilteredImmunizations(filteredImmunizations);
}

// Sort immunizations
function sortImmunizations() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedImmunizations = [...allImmunizations].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'patient_id' || sortBy === 'doctor_id') {
            return String(valA).localeCompare(String(valB));
        }
        if (sortBy === 'dose_number') {
            return (parseInt(valA) || 0) - (parseInt(valB) || 0);
        }
        if (sortBy === 'date_given') {
            return new Date(valA) - new Date(valB);
        }
        if (sortBy === 'vaccine_name') {
            return getVaccineName(valA).localeCompare(getVaccineName(valB));
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
    
    immList.forEach(record => {
        let patientName = '';
        const patient = allChildPatients.find(p => p.patient_id === record.patient_id);
        if (patient) {
            patientName = `${patient.first_name} ${patient.last_name}`;
        } else {
            patientName = '-';
        }
        
        const vaccineName = getVaccineName(record.vaccine_id);
        const doctorName = getDoctorName(record.doctor_id);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.patient_id || '-'}<\/div>
            <td>${patientName}<\/div>
            <td>${vaccineName}<\/div>
            <td>${record.quantity || 1}<\/div>
            <td>${record.dose_number || '-'}<\/div>
            <td>${record.date_given || '-'}<\/div>
            <td>${record.doctor_id || '-'}<\/div>
            <td>${doctorName}<\/div>
            <td>${record.remarks || '-'}<\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewImmunizationModal('${record.record_id}')">View</button>
                    <button class="edit-btn" onclick="editImmunizationModal('${record.record_id}')">Edit</button>
                    <button class="delete-btn" onclick="showDeleteImmunizationConfirmation('${record.record_id}', '${record.patient_id}')">Delete</button>
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// Generate unique record ID
function generateRecordId() {
    return 'imm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

// Show add immunization modal
function showAddImmunizationModal() {
    document.getElementById('addImmunizationModal').classList.add('show');
    loadPatientsForDropdown();
    loadVaccinesForDropdown();
    loadStaffForDropdown();
    document.getElementById('quantity').value = 1;
}

// Hide add immunization modal
function hideAddImmunizationModal() {
    document.getElementById('addImmunizationModal').classList.remove('show');
    clearImmunizationForm();
}

// Clear immunization form
function clearImmunizationForm() {
    document.getElementById('immunizationForm').reset();
    document.getElementById('patientNameDisplay').value = '';
    document.getElementById('vaccineNameDisplay').value = '';
    document.getElementById('doctorNameDisplay').value = '';
    document.getElementById('availableStockDisplay').value = '';
    document.getElementById('quantity').value = 1;
}

// Save new immunization to Firestore
async function saveImmunization() {
    const patientId = document.getElementById('patientId').value;
    const vaccineId = document.getElementById('vaccineId').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const doseNumber = document.getElementById('doseNumber').value;
    const dateGiven = document.getElementById('dateGiven').value;
    const doctorId = document.getElementById('doctorId').value;
    const remarks = document.getElementById('remarks').value.trim();
    
    if (!patientId || !vaccineId || !doseNumber || !dateGiven || !doctorId) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    if (parseInt(doseNumber) < 1) {
        showToast('Dose number must be greater than 0', 'warning');
        return;
    }
    
    const stockCheck = checkVaccineStock(vaccineId, quantity);
    if (!stockCheck.available) {
        showToast(stockCheck.message, 'warning');
        return;
    }
    
    const recordId = generateRecordId();
    
    let patientName = '';
    const patient = allChildPatients.find(p => p.patient_id === patientId);
    if (patient) {
        patientName = `${patient.first_name} ${patient.last_name}`;
    }
    
    const vaccineName = getVaccineName(vaccineId);
    
    let doctorName = '';
    const doctor = allStaff.find(s => s.doctor_id.toString() === doctorId);
    if (doctor) {
        doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }
    
    const newImmunization = {
        record_id: recordId,
        patient_id: patientId,
        patient_name: patientName,
        vaccine_id: vaccineId,
        vaccine_name: vaccineName,
        quantity: quantity,
        dose_number: parseInt(doseNumber),
        date_given: dateGiven,
        doctor_id: doctorId,
        doctor_name: doctorName,
        remarks: remarks || null,
        created_at: new Date().toISOString()
    };
    
    try {
        await db.collection('child_immunizations').doc(recordId).set(newImmunization);
        
        const stockUpdated = await updateVaccineStock(vaccineId, stockCheck.vaccine.quantity, quantity);
        if (stockUpdated) {
            showToast(`Immunization record saved! ${quantity} dose(s) of ${vaccineName} administered. Remaining stock: ${stockCheck.vaccine.quantity - quantity}`, 'success');
            await loadVaccinesForDropdown();
        } else {
            showToast(`Immunization record saved but failed to update vaccine stock. Please check inventory manually.`, 'warning');
        }
        
        await loadImmunizations();
        hideAddImmunizationModal();
    } catch (error) {
        console.error("Error saving immunization:", error);
        showToast("Error saving immunization. Please try again.", 'error');
    }
}

// ========== VIEW IMMUNIZATION MODAL ==========
function viewImmunizationModal(recordId) {
    const record = allImmunizations.find(r => r.record_id === recordId);
    if (record) {
        const patientName = (() => {
            const patient = allChildPatients.find(p => p.patient_id === record.patient_id);
            return patient ? `${patient.first_name} ${patient.last_name}` : record.patient_name || '-';
        })();
        
        const doctorName = getDoctorName(record.doctor_id);
        const vaccineName = getVaccineName(record.vaccine_id);
        
        const content = `
            <div style="line-height: 1.8; font-family: 'Segoe UI', Arial, sans-serif;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; width: 40%; font-weight: 600; color: #2B6896;">Patient ID:<\/td><td style="padding: 8px 0;">${record.patient_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Patient Name:<\/td><td style="padding: 8px 0;">${patientName}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Vaccine:<\/td><td style="padding: 8px 0;">${vaccineName}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Quantity:<\/td><td style="padding: 8px 0;">${record.quantity || 1} dose(s)<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Dose Number:<\/td><td style="padding: 8px 0;">${record.dose_number}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Date Given:<\/td><td style="padding: 8px 0;">${record.date_given}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Doctor ID:<\/td><td style="padding: 8px 0;">${record.doctor_id}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Doctor Name:<\/td><td style="padding: 8px 0;">${doctorName}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Remarks:<\/td><td style="padding: 8px 0;">${record.remarks || 'N/A'}<\/td><\/tr>
                </table>
            </div>
        `;
        
        const modal = document.getElementById('viewImmunizationModal');
        if (modal) {
            document.getElementById('viewImmunizationModalBody').innerHTML = content;
            modal.classList.add('show');
        }
    }
}

function closeViewImmunizationModal() {
    const modal = document.getElementById('viewImmunizationModal');
    if (modal) modal.classList.remove('show');
}

// ========== EDIT IMMUNIZATION MODAL ==========
function editImmunizationModal(recordId) {
    const record = allImmunizations.find(r => r.record_id === recordId);
    if (!record) {
        showToast('Immunization record not found.', 'error');
        return;
    }
    
    console.log("Editing record:", record); // Debug log
    
    document.getElementById('editRecordId').value = record.record_id;
    
    // Patient ID - READ ONLY
    const editPatientIdField = document.getElementById('editPatientId');
    if (editPatientIdField) {
        editPatientIdField.value = record.patient_id;
    }
    
    // Vaccine ID - READ ONLY (now a text input)
    const editVaccineIdField = document.getElementById('editVaccineId');
    if (editVaccineIdField) {
        editVaccineIdField.value = record.vaccine_id;
    }
    
    // Doctor ID - READ ONLY (now a text input)
    const editDoctorIdField = document.getElementById('editDoctorId');
    if (editDoctorIdField) {
        editDoctorIdField.value = record.doctor_id;
    }
    
    // Patient Name - display only
    let patientName = '';
    const patient = allChildPatients.find(p => p.patient_id === record.patient_id);
    if (patient) {
        patientName = `${patient.first_name} ${patient.last_name}`;
    } else {
        patientName = record.patient_name || '';
    }
    document.getElementById('editPatientNameDisplay').value = patientName;
    
    // Vaccine Name - display only
    let vaccineName = '';
    const vaccine = allVaccines.find(v => v.no.toString() === record.vaccine_id);
    if (vaccine) {
        vaccineName = vaccine.name;
        document.getElementById('editVaccineNameDisplay').value = vaccineName;
        // Also show available stock info
        document.getElementById('editAvailableStockDisplay').value = `${vaccine.quantity} doses available`;
    } else {
        document.getElementById('editVaccineNameDisplay').value = record.vaccine_name || '';
        document.getElementById('editAvailableStockDisplay').value = 'Stock info not available';
    }
    
    // Doctor Name - display only
    let doctorName = '';
    const doctor = allStaff.find(s => s.doctor_id.toString() === record.doctor_id);
    if (doctor) {
        doctorName = `Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialty})`;
    } else {
        doctorName = record.doctor_name || '';
    }
    document.getElementById('editDoctorNameDisplay').value = doctorName;
    
    // Set other editable fields
    document.getElementById('editQuantity').value = record.quantity || 1;
    document.getElementById('editDoseNumber').value = record.dose_number || '';
    document.getElementById('editDateGiven').value = record.date_given || '';
    document.getElementById('editRemarks').value = record.remarks || '';
    
    document.getElementById('editImmunizationModal').classList.add('show');
}

function closeEditImmunizationModal() {
    document.getElementById('editImmunizationModal').classList.remove('show');
}

function closeEditImmunizationModal() {
    document.getElementById('editImmunizationModal').classList.remove('show');
}

async function updateImmunization() {
    const recordId = document.getElementById('editRecordId').value;
    const patientId = document.getElementById('editPatientId').value;
    const vaccineId = document.getElementById('editVaccineId').value;
    const quantity = parseInt(document.getElementById('editQuantity').value);
    const doseNumber = document.getElementById('editDoseNumber').value;
    const dateGiven = document.getElementById('editDateGiven').value;
    const doctorId = document.getElementById('editDoctorId').value;
    const remarks = document.getElementById('editRemarks').value.trim();
    
    if (!patientId || !vaccineId || !doseNumber || !dateGiven || !doctorId) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    let patientName = '';
    const patient = allChildPatients.find(p => p.patient_id === patientId);
    if (patient) {
        patientName = `${patient.first_name} ${patient.last_name}`;
    }
    
    const vaccineName = getVaccineName(vaccineId);
    let doctorName = '';
    const doctor = allStaff.find(s => s.doctor_id.toString() === doctorId);
    if (doctor) {
        doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }
    
    try {
        await db.collection('child_immunizations').doc(recordId).update({
            patient_id: patientId,
            patient_name: patientName,
            vaccine_id: vaccineId,
            vaccine_name: vaccineName,
            quantity: quantity,
            dose_number: parseInt(doseNumber),
            date_given: dateGiven,
            doctor_id: doctorId,
            doctor_name: doctorName,
            remarks: remarks || null,
            updated_at: new Date().toISOString()
        });
        
        showToast(`Immunization record updated successfully!`, 'success');
        await loadImmunizations();
        closeEditImmunizationModal();
    } catch (error) {
        console.error("Error updating immunization:", error);
        showToast("Error updating immunization. Please try again.", 'error');
    }
}

// ========== DELETE IMMUNIZATION CONFIRMATION MODAL ==========
let pendingDeleteRecordId = null;

function showDeleteImmunizationConfirmation(recordId, patientId) {
    pendingDeleteRecordId = recordId;
    
    let modal = document.getElementById('deleteImmunizationConfirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'deleteImmunizationConfirmModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div class="modal-header" style="background: #f44336;">
                    <h2 style="color: white;">⚠️ Confirm Delete</h2>
                    <button class="close-modal" onclick="closeDeleteImmunizationModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="font-size: 48px; margin-bottom: 15px;">🗑️</div>
                    <p>Are you sure you want to delete this immunization record?</p>
                    <p><strong id="deleteImmunizationInfo"></strong></p>
                    <p style="color: #f44336; font-size: 13px;">⚠️ This action cannot be undone!</p>
                </div>
                <div class="modal-footer" style="justify-content: center;">
                    <button class="cancel-btn" onclick="closeDeleteImmunizationModal()">Cancel</button>
                    <button class="save-btn" id="confirmDeleteImmunizationBtn" style="background: #f44336;">Delete Permanently</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const deleteInfo = document.getElementById('deleteImmunizationInfo');
    if (deleteInfo) {
        deleteInfo.innerHTML = `Patient ID: ${escapeHtml(patientId)}`;
    }
    
    modal.classList.add('show');
    
    const confirmBtn = document.getElementById('confirmDeleteImmunizationBtn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener('click', async () => {
        if (pendingDeleteRecordId) {
            try {
                await db.collection('child_immunizations').doc(pendingDeleteRecordId).delete();
                showToast(`Immunization record deleted successfully.`, 'success');
                await loadImmunizations();
            } catch (error) {
                console.error("Error deleting immunization:", error);
                showToast("Error deleting immunization. Please try again.", 'error');
            }
        }
        closeDeleteImmunizationModal();
    });
}

function closeDeleteImmunizationModal() {
    const modal = document.getElementById('deleteImmunizationConfirmModal');
    if (modal) modal.classList.remove('show');
    pendingDeleteRecordId = null;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadImmunizations();
    
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', validateQuantity);
    }
    
    document.getElementById('immunizationSearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchImmunizations();
        }
    });
});