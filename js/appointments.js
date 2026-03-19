// ===== APPOINTMENT SCHEDULING PAGE FUNCTIONALITY =====

// Sample appointment data
let appointments = [
    {
        appointment_id: 'A001',
        patient_id: '1002',
        appointment_date: '2026-03-19',
        appointment_time: '09:00',
        purpose: 'Prenatal Checkup',
        status: 'Confirmed',
        priority: 'Prenatal Priority',
        remarks: 'Regular monthly checkup'
    },
    {
        appointment_id: 'A002',
        patient_id: '1011',
        appointment_date: '2026-03-19',
        appointment_time: '10:30',
        purpose: 'Child Immunization',
        status: 'Scheduled',
        priority: 'Normal',
        remarks: '1st dose DPT vaccine'
    },
    {
        appointment_id: 'A003',
        patient_id: '1003',
        appointment_date: '2026-03-19',
        appointment_time: '14:00',
        purpose: 'Senior Checkup',
        status: 'Scheduled',
        priority: 'Normal',
        remarks: 'Blood pressure monitoring'
    },
    {
        appointment_id: 'A004',
        patient_id: '1006',
        appointment_date: '2026-03-20',
        appointment_time: '09:30',
        purpose: 'Prenatal Checkup',
        status: 'Scheduled',
        priority: 'Prenatal Priority',
        remarks: '2nd trimester ultrasound'
    },
    {
        appointment_id: 'A005',
        patient_id: '1013',
        appointment_date: '2026-03-20',
        appointment_time: '11:00',
        purpose: 'Nutrition Counseling',
        status: 'Confirmed',
        priority: 'Normal',
        remarks: 'Follow-up for malnourished child'
    },
    {
        appointment_id: 'A006',
        patient_id: '1008',
        appointment_date: '2026-03-18',
        appointment_time: '13:30',
        purpose: 'Prenatal Checkup',
        status: 'Completed',
        priority: 'Prenatal Priority',
        remarks: 'Regular checkup - all normal'
    },
    {
        appointment_id: 'A007',
        patient_id: '1001',
        appointment_date: '2026-03-18',
        appointment_time: '15:00',
        purpose: 'Senior Checkup',
        status: 'No Show',
        priority: 'Normal',
        remarks: 'Patient did not arrive'
    },
    {
        appointment_id: 'A008',
        patient_id: '1014',
        appointment_date: '2026-03-21',
        appointment_time: '08:30',
        purpose: 'Child Immunization',
        status: 'Scheduled',
        priority: 'Normal',
        remarks: 'BCG vaccine'
    },
    {
        appointment_id: 'A009',
        patient_id: '1007',
        appointment_date: '2026-03-21',
        appointment_time: '10:00',
        purpose: 'Prenatal Checkup',
        status: 'Confirmed',
        priority: 'Prenatal Priority',
        remarks: 'Glucose screening'
    },
    {
        appointment_id: 'A010',
        patient_id: '1005',
        appointment_date: '2026-03-22',
        appointment_time: '09:15',
        purpose: 'General Consultation',
        status: 'Scheduled',
        priority: 'Normal',
        remarks: 'Medication refill'
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

// Get status badge class
function getStatusBadgeClass(status) {
    switch(status) {
        case 'Scheduled': return 'status-scheduled';
        case 'Confirmed': return 'status-confirmed';
        case 'Completed': return 'status-completed';
        case 'Cancelled': return 'status-cancelled';
        case 'No Show': return 'status-no-show';
        default: return '';
    }
}

// Get priority badge class
function getPriorityBadgeClass(priority) {
    switch(priority) {
        case 'Prenatal Priority': return 'priority-prenatal';
        case 'Emergency': return 'priority-emergency';
        default: return '';
    }
}

// Load appointments into table
function loadAppointments() {
    const tableBody = document.getElementById('appointmentsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    appointments.forEach(app => {
        const row = document.createElement('tr');
        
        // Create status badge
        const statusBadge = `<span class="status-badge ${getStatusBadgeClass(app.status)}">${app.status}</span>`;
        
        // Create priority badge if exists
        const priorityBadge = app.priority && app.priority !== 'Normal' 
            ? `<span class="priority-badge ${getPriorityBadgeClass(app.priority)}">${app.priority}</span>` 
            : '';
        
        row.innerHTML = `
            <td>${app.appointment_id}</td>
            <td>${app.patient_id}</td>
            <td>${app.appointment_date}</td>
            <td>${app.appointment_time}</td>
            <td>${app.purpose} ${priorityBadge}</td>
            <td>${statusBadge}</td>
            <td>${app.remarks || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewAppointment('${app.appointment_id}')">View</button>
                    <button class="edit-btn" onclick="editAppointment('${app.appointment_id}')">Edit</button>
                    ${app.status !== 'Completed' && app.status !== 'Cancelled' ? 
                        `<button class="cancel-appointment-btn" onclick="cancelAppointment('${app.appointment_id}')">Cancel</button>` : ''}
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Search appointments
function searchAppointments() {
    const searchTerm = document.getElementById('appointmentSearch').value.toLowerCase();
    const filteredAppointments = appointments.filter(app => 
        app.appointment_id.toLowerCase().includes(searchTerm) ||
        app.patient_id.toLowerCase().includes(searchTerm) ||
        app.purpose.toLowerCase().includes(searchTerm) ||
        app.status.toLowerCase().includes(searchTerm) ||
        (app.remarks && app.remarks.toLowerCase().includes(searchTerm))
    );
    
    displayFilteredAppointments(filteredAppointments);
}

// Sort appointments
function sortAppointments() {
    const sortBy = document.getElementById('sortBy').value;
    const sortedAppointments = [...appointments].sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        
        if (sortBy === 'appointment_id' || sortBy === 'patient_id') {
            return valA.localeCompare(valB);
        }
        if (sortBy === 'appointment_date') {
            return new Date(valA) - new Date(valB);
        }
        if (sortBy === 'appointment_time') {
            return valA.localeCompare(valB);
        }
        return String(valA).localeCompare(String(valB));
    });
    
    displayFilteredAppointments(sortedAppointments);
}

// Display filtered/sorted appointments
function displayFilteredAppointments(appList) {
    const tableBody = document.getElementById('appointmentsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    appList.forEach(app => {
        const row = document.createElement('tr');
        
        const statusBadge = `<span class="status-badge ${getStatusBadgeClass(app.status)}">${app.status}</span>`;
        const priorityBadge = app.priority && app.priority !== 'Normal' 
            ? `<span class="priority-badge ${getPriorityBadgeClass(app.priority)}">${app.priority}</span>` 
            : '';
        
        row.innerHTML = `
            <td>${app.appointment_id}</td>
            <td>${app.patient_id}</td>
            <td>${app.appointment_date}</td>
            <td>${app.appointment_time}</td>
            <td>${app.purpose} ${priorityBadge}</td>
            <td>${statusBadge}</td>
            <td>${app.remarks || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewAppointment('${app.appointment_id}')">View</button>
                    <button class="edit-btn" onclick="editAppointment('${app.appointment_id}')">Edit</button>
                    ${app.status !== 'Completed' && app.status !== 'Cancelled' ? 
                        `<button class="cancel-appointment-btn" onclick="cancelAppointment('${app.appointment_id}')">Cancel</button>` : ''}
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Show add appointment modal
function showAddAppointmentModal() {
    document.getElementById('addAppointmentModal').classList.add('show');
}

// Hide add appointment modal
function hideAddAppointmentModal() {
    document.getElementById('addAppointmentModal').classList.remove('show');
    clearAppointmentForm();
}

// Clear appointment form
function clearAppointmentForm() {
    document.getElementById('appointmentForm').reset();
}

// Generate new appointment ID
function generateAppointmentId() {
    const lastId = appointments[appointments.length - 1].appointment_id;
    const num = parseInt(lastId.substring(1)) + 1;
    return 'A' + String(num).padStart(3, '0');
}

// Save new appointment
function saveAppointment() {
    // Get form values
    const patientId = document.getElementById('patientId').value.trim();
    const appointmentDate = document.getElementById('appointmentDate').value;
    const appointmentTime = document.getElementById('appointmentTime').value;
    const purpose = document.getElementById('purpose').value;
    const status = document.getElementById('status').value;
    const priority = document.getElementById('priority').value;
    const remarks = document.getElementById('remarks').value.trim();
    
    // Validate required fields
    if (!patientId || !appointmentDate || !appointmentTime || !purpose || !status) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create new appointment object
    const newAppointment = {
        appointment_id: generateAppointmentId(),
        patient_id: patientId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        purpose: purpose,
        status: status,
        priority: priority || 'Normal',
        remarks: remarks || null
    };
    
    // Add to appointments array
    appointments.push(newAppointment);
    
    // Reload table
    loadAppointments();
    
    // Hide modal
    hideAddAppointmentModal();
    
    alert(`Appointment ${newAppointment.appointment_id} scheduled successfully for Patient ${patientId}`);
}

// View appointment
function viewAppointment(appointmentId) {
    const appointment = appointments.find(a => a.appointment_id === appointmentId);
    if (appointment) {
        alert(`Appointment Details:
ID: ${appointment.appointment_id}
Patient ID: ${appointment.patient_id}
Date: ${appointment.appointment_date}
Time: ${appointment.appointment_time}
Purpose: ${appointment.purpose}
Status: ${appointment.status}
Priority: ${appointment.priority || 'Normal'}
Remarks: ${appointment.remarks || 'N/A'}`);
    }
}

// Edit appointment
function editAppointment(appointmentId) {
    const appointment = appointments.find(a => a.appointment_id === appointmentId);
    if (appointment) {
        alert(`Edit appointment ${appointmentId}\n\nThis feature will be implemented in the next phase.`);
    }
}

// Cancel appointment
function cancelAppointment(appointmentId) {
    const appointment = appointments.find(a => a.appointment_id === appointmentId);
    if (appointment) {
        if (confirm(`Cancel appointment ${appointmentId} for Patient ${appointment.patient_id}?`)) {
            appointment.status = 'Cancelled';
            loadAppointments();
            alert(`Appointment ${appointmentId} has been cancelled.`);
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadAppointments();
    
    // Add search on enter key
    document.getElementById('appointmentSearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchAppointments();
        }
    });
});