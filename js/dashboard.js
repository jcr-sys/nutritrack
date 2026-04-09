// dashboard.js
// ===== DASHBOARD FUNCTIONALITY WITH FIREBASE =====

let totalPatientsCount = 0;
let childrenCount = 0;
let pregnantCount = 0;
let seniorCount = 0;
let generalCount = 0;
let pieChart = null;

// Calendar variables
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedDate = null;
let allAppointments = [];

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.querySelector('.content-area');
    
    if (sidebar) sidebar.classList.toggle('collapsed');
    if (contentArea) contentArea.classList.toggle('expanded');
}

// Toggle submenus
function toggleSubmenu(menuId) {
    const submenu = document.getElementById(menuId);
    if (submenu) submenu.classList.toggle('show');
}

// Load user info from session storage
function loadUserInfo() {
    const userInfo = sessionStorage.getItem('currentUser');
    const userNameElement = document.getElementById('userName');
    
    if (userInfo && userNameElement) {
        try {
            const user = JSON.parse(userInfo);
            userNameElement.textContent = user.name || 'Roxanne Pagaduan';
        } catch (e) {
            userNameElement.textContent = 'Roxanne Pagaduan';
        }
    } else if (userNameElement) {
        userNameElement.textContent = 'Roxanne Pagaduan';
    }
}

// Load all appointments from Firebase
async function loadAllAppointments() {
    try {
        const snapshot = await db.collection('appointments').get();
        allAppointments = [];
        snapshot.forEach(doc => {
            allAppointments.push(doc.data());
        });
        console.log("Appointments loaded:", allAppointments.length);
    } catch (error) {
        console.error("Error loading appointments:", error);
        allAppointments = [];
    }
}

// Render calendar
function renderCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    const monthYearDisplay = document.getElementById('calendarMonthYear');
    
    if (!calendarDays) return;
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    let daysHtml = '';
    
    // Previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const prevDay = daysInPrevMonth - i;
        const prevDate = new Date(currentYear, currentMonth - 1, prevDay);
        const dateStr = formatDate(prevDate);
        daysHtml += `<div class="day other-month" data-date="${dateStr}" onclick="selectDate('${dateStr}')">${prevDay}</div>`;
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = (i === new Date().getDate() && 
                        currentMonth === new Date().getMonth() && 
                        currentYear === new Date().getFullYear());
        const currentDate = new Date(currentYear, currentMonth, i);
        const dateStr = formatDate(currentDate);
        const hasAppointment = hasAppointmentOnDate(dateStr);
        daysHtml += `<div class="day ${isToday ? 'today' : ''} ${hasAppointment ? 'has-appointment' : ''}" 
                           data-date="${dateStr}" 
                           onclick="selectDate('${dateStr}')">
                        ${i}
                        ${hasAppointment ? '<span class="appointment-dot"></span>' : ''}
                    </div>`;
    }
    
    // Next month's days (to fill 42 days - 6 rows)
    const totalDaysDisplayed = startingDayOfWeek + daysInMonth;
    const remainingDays = 42 - totalDaysDisplayed;
    
    for (let i = 1; i <= remainingDays; i++) {
        const nextDate = new Date(currentYear, currentMonth + 1, i);
        const dateStr = formatDate(nextDate);
        daysHtml += `<div class="day other-month" data-date="${dateStr}" onclick="selectDate('${dateStr}')">${i}</div>`;
    }
    
    calendarDays.innerHTML = daysHtml;
}

// Format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Check if there are appointments on a specific date
function hasAppointmentOnDate(dateStr) {
    return allAppointments.some(app => app.appointment_date === dateStr);
}

// Get appointments for a specific date
function getAppointmentsForDate(dateStr) {
    return allAppointments.filter(app => app.appointment_date === dateStr);
}

// Select a date and show appointments
async function selectDate(dateStr) {
    selectedDate = dateStr;
    
    // Remove selected class from all days
    document.querySelectorAll('.day').forEach(day => {
        day.classList.remove('selected');
    });
    
    // Add selected class to clicked day
    const selectedDay = document.querySelector(`.day[data-date="${dateStr}"]`);
    if (selectedDay) {
        selectedDay.classList.add('selected');
    }
    
    // Display appointments for selected date
    await displayAppointmentsForDate(dateStr);
}

// Display appointments for selected date
async function displayAppointmentsForDate(dateStr) {
    const calendarEvents = document.getElementById('calendarEvents');
    if (!calendarEvents) return;
    
    const appointments = getAppointmentsForDate(dateStr);
    
    if (appointments.length === 0) {
        // Try to load from Firebase if not in local array
        try {
            const snapshot = await db.collection('appointments').where('appointment_date', '==', dateStr).get();
            
            if (snapshot.empty) {
                calendarEvents.innerHTML = '<div class="event-item">📅 No appointments scheduled for this date</div>';
                return;
            }
            
            calendarEvents.innerHTML = '';
            snapshot.forEach(doc => {
                const app = doc.data();
                calendarEvents.innerHTML += `
                    <div class="event-item">
                        🕐 ${app.appointment_time || '00:00'} - <strong>${app.purpose || 'Appointment'}</strong><br>
                        <span style="font-size: 11px; color: #888;">Patient ID: ${app.patient_id}</span>
                    </div>
                `;
            });
        } catch (error) {
            console.error("Error loading appointments for date:", error);
            calendarEvents.innerHTML = '<div class="event-item">❌ Error loading appointments</div>';
        }
    } else {
        calendarEvents.innerHTML = '';
        appointments.forEach(app => {
            calendarEvents.innerHTML += `
                <div class="event-item">
                    🕐 ${app.appointment_time || '00:00'} - <strong>${app.purpose || 'Appointment'}</strong><br>
                    <span style="font-size: 11px; color: #888;">Patient ID: ${app.patient_id} | Status: ${app.status || 'Scheduled'}</span>
                </div>
            `;
        });
    }
}

// Change month
async function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
    
    // Refresh appointments for the new month
    await loadAllAppointments();
    renderCalendar();
    
    // If there was a selected date, try to reselect
    if (selectedDate) {
        const dateObj = new Date(selectedDate);
        if (dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear) {
            await selectDate(selectedDate);
        } else {
            // Clear selected date and events
            const calendarEvents = document.getElementById('calendarEvents');
            if (calendarEvents) {
                calendarEvents.innerHTML = '<div class="event-item">📅 Select a date to see appointments</div>';
            }
        }
    }
}

// Load dashboard statistics from Firebase
async function loadDashboardStats() {
    console.log("Loading dashboard stats from Firebase...");
    
    if (typeof db === 'undefined') {
        console.error("Firestore db is not defined!");
        document.getElementById('totalPatients').textContent = 'Error';
        document.getElementById('totalChildren').textContent = 'Error';
        document.getElementById('totalPregnant').textContent = 'Error';
        document.getElementById('totalSenior').textContent = 'Error';
        return;
    }
    
    try {
        const patientsSnapshot = await db.collection('patients').get();
        totalPatientsCount = patientsSnapshot.size;
        
        childrenCount = 0;
        pregnantCount = 0;
        seniorCount = 0;
        generalCount = 0;
        
        patientsSnapshot.forEach(doc => {
            const patient = doc.data();
            const patientType = patient.patient_type;
            
            if (patientType === 'Child') {
                childrenCount++;
            } else if (patientType === 'Pregnant') {
                pregnantCount++;
            } else if (patientType === 'Senior') {
                seniorCount++;
            } else {
                generalCount++;
            }
        });
        
        document.getElementById('totalPatients').textContent = totalPatientsCount.toLocaleString();
        document.getElementById('totalChildren').textContent = childrenCount.toLocaleString();
        document.getElementById('totalPregnant').textContent = pregnantCount.toLocaleString();
        document.getElementById('totalSenior').textContent = seniorCount.toLocaleString();
        
        updatePieChart();
        loadRecentPatients();
        await loadAllAppointments();
        renderCalendar();
        
    } catch (error) {
        console.error("Error loading dashboard stats:", error);
        document.getElementById('totalPatients').textContent = '0';
        document.getElementById('totalChildren').textContent = '0';
        document.getElementById('totalPregnant').textContent = '0';
        document.getElementById('totalSenior').textContent = '0';
    }
}

// Load recent patients for overview table
async function loadRecentPatients() {
    const tableBody = document.querySelector('.patient-table tbody');
    if (!tableBody) return;
    
    try {
        const snapshot = await db.collection('patients').orderBy('patient_id', 'desc').limit(5).get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="8">No patients found</div></div>';
            return;
        }
        
        tableBody.innerHTML = '';
        
        snapshot.forEach(doc => {
            const patient = doc.data();
            const row = document.createElement('tr');
            const statuses = ['Completed', 'Pending', 'Scheduled'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const statusClass = randomStatus === 'Completed' ? 'completed' : 'pending';
            
            row.innerHTML = `
                <td>${patient.patient_id || '-'}</div>
                <td>${patient.first_name || ''} ${patient.last_name || ''}</div>
                <td>${patient.age || '-'}</div>
                <td>${patient.gender || '-'}</div>
                <td>${patient.patient_type || '-'}</div>
                <td>${new Date().toISOString().split('T')[0]}</div>
                <td><span class="status ${statusClass}">${randomStatus}</span></div>
                <td><button class="view-btn" onclick="viewPatient('${patient.patient_id}')">View</button></div>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading recent patients:", error);
    }
}

// Update patient statistics pie chart
function updatePieChart() {
    const ctx = document.getElementById('patientPieChart');
    if (!ctx) return;
    
    const total = childrenCount + pregnantCount + seniorCount + generalCount;
    
    const childrenPercent = total > 0 ? Math.round((childrenCount / total) * 100) : 0;
    const pregnantPercent = total > 0 ? Math.round((pregnantCount / total) * 100) : 0;
    const seniorPercent = total > 0 ? Math.round((seniorCount / total) * 100) : 0;
    const generalPercent = total > 0 ? Math.round((generalCount / total) * 100) : 0;
    
    const legendItems = document.querySelectorAll('.legend-item');
    if (legendItems.length >= 4) {
        legendItems[0].innerHTML = `<span class="legend-color" style="background: #2B6896;"></span><span>Children: ${childrenCount} (${childrenPercent}%)</span>`;
        legendItems[1].innerHTML = `<span class="legend-color" style="background: #4A90E2;"></span><span>Pregnant: ${pregnantCount} (${pregnantPercent}%)</span>`;
        legendItems[2].innerHTML = `<span class="legend-color" style="background: #6C8EB2;"></span><span>Senior: ${seniorCount} (${seniorPercent}%)</span>`;
        legendItems[3].innerHTML = `<span class="legend-color" style="background: #95B8D1;"></span><span>General: ${generalCount} (${generalPercent}%)</span>`;
    }
    
    const data = {
        labels: ['Children', 'Pregnant', 'Senior', 'General'],
        datasets: [{
            data: [childrenCount, pregnantCount, seniorCount, generalCount],
            backgroundColor: ['#2B6896', '#4A90E2', '#6C8EB2', '#95B8D1'],
            borderColor: 'white',
            borderWidth: 2,
        }]
    };
    
    if (pieChart) {
        pieChart.destroy();
    }
    
    if (typeof Chart !== 'undefined') {
        pieChart = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Update month display
function updateMonthDisplay() {
    const monthDisplay = document.querySelector('.month-display');
    if (monthDisplay) {
        const today = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        monthDisplay.textContent = `Month of ${monthNames[today.getMonth()]} ${today.getFullYear()}`;
    }
}

function viewPatient(patientId) {
    alert(`Viewing patient: ${patientId}`);
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    console.log("Dashboard loaded");
    
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }
    
    loadUserInfo();
    updateMonthDisplay();
    
    setTimeout(async () => {
        await loadDashboardStats();
    }, 500);
    
    document.addEventListener('click', function(event) {
        const isClickInsideSubmenu = event.target.closest('.has-submenu');
        if (!isClickInsideSubmenu) {
            const submenus = document.querySelectorAll('.submenu.show');
            submenus.forEach(submenu => {
                submenu.classList.remove('show');
            });
        }
    });
});

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}