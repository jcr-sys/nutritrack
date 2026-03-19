// ===== REPORTS PAGE FUNCTIONALITY =====

// Sample data for reports - Brgy. Dalig only
const reportData = {
    nutrition: {
        title: 'Monthly Nutrition Status Report',
        summary: {
            totalChildren: 156,  // Based on your patients data for Brgy. Dalig
            normal: 112,
            malnourished: 44,
            mild: 24,
            moderate: 14,
            severe: 6
        },
        data: [
            { purok: 'Purok 1', total: 28, normal: 20, mild: 4, moderate: 3, severe: 1 },
            { purok: 'Purok 2', total: 32, normal: 24, mild: 5, moderate: 2, severe: 1 },
            { purok: 'Purok 3', total: 25, normal: 18, mild: 4, moderate: 2, severe: 1 },
            { purok: 'Purok 4', total: 30, normal: 22, mild: 4, moderate: 3, severe: 1 },
            { purok: 'Purok 5', total: 22, normal: 16, mild: 3, moderate: 2, severe: 1 },
            { purok: 'Purok 6', total: 19, normal: 12, mild: 4, moderate: 2, severe: 1 }
        ]
    },
    immunization: {
        title: 'Immunization Coverage Report',
        summary: {
            totalChildren: 156,
            fullyImmunized: 112,
            partiallyImmunized: 32,
            notImmunized: 12,
            coverage: '71.8%'
        },
        data: [
            { vaccine: 'BCG', target: 156, administered: 148, coverage: '94.9%' },
            { vaccine: 'Hepatitis B', target: 156, administered: 145, coverage: '92.9%' },
            { vaccine: 'DPT 1', target: 156, administered: 142, coverage: '91.0%' },
            { vaccine: 'DPT 2', target: 142, administered: 135, coverage: '95.1%' },
            { vaccine: 'DPT 3', target: 135, administered: 128, coverage: '94.8%' },
            { vaccine: 'OPV 1', target: 156, administered: 144, coverage: '92.3%' },
            { vaccine: 'OPV 2', target: 144, administered: 136, coverage: '94.4%' },
            { vaccine: 'OPV 3', target: 136, administered: 128, coverage: '94.1%' },
            { vaccine: 'MMR', target: 112, administered: 108, coverage: '96.4%' }
        ]
    },
    maternal: {
        title: 'Maternal Health Report',
        summary: {
            totalPregnant: 23,  // Based on your patients data for Brgy. Dalig
            firstTrimester: 6,
            secondTrimester: 9,
            thirdTrimester: 8,
            completedCheckups: 42,
            highRisk: 3
        },
        data: [
            { patientId: '1002', name: 'Maria Santos', age: 28, trimester: 2, checkups: 4, risk: 'Normal' },
            { patientId: '1006', name: 'Rosa Villanueva', age: 26, trimester: 1, checkups: 2, risk: 'Normal' },
            { patientId: '1007', name: 'Lisa Garcia', age: 24, trimester: 2, checkups: 3, risk: 'Normal' },
            { patientId: '1008', name: 'Jennifer Torres', age: 31, trimester: 3, checkups: 6, risk: 'High' },
            { patientId: '1009', name: 'Cynthia Rivera', age: 29, trimester: 2, checkups: 3, risk: 'Normal' },
            { patientId: '1010', name: 'Patricia Mendoza', age: 27, trimester: 1, checkups: 1, risk: 'Normal' }
        ]
    },
    senior: {
        title: 'Senior Health Report',
        summary: {
            totalSenior: 45,  // Based on your patients data for Brgy. Dalig
            withMaintenance: 38,
            regularCheckups: 42,
            withComorbidities: 28,
            homeVisits: 15
        },
        data: [
            { patientId: '1001', name: 'Juan Dela Cruz', age: 68, condition: 'Hypertension', lastVisit: '2026-03-15' },
            { patientId: '1003', name: 'Pedro Reyes', age: 70, condition: 'Diabetes', lastVisit: '2026-03-10' },
            { patientId: '1004', name: 'Josefa Mendoza', age: 65, condition: 'Arthritis', lastVisit: '2026-03-12' },
            { patientId: '1005', name: 'Anita Fernandez', age: 74, condition: 'Hypertension', lastVisit: '2026-03-08' },
            { patientId: '1015', name: 'Luis Fernando', age: 69, condition: 'Asthma', lastVisit: '2026-03-05' }
        ]
    },
    inventory: {
        title: 'Inventory Summary Report',
        summary: {
            totalMedicines: 10,
            totalVaccines: 8,
            lowStock: 3,
            expiringSoon: 4
        },
        medicines: [
            { name: 'Paracetamol', dosage: '500mg', stock: 100, expiry: '2026-05-10', status: 'Good' },
            { name: 'Amoxicillin', dosage: '250mg', stock: 50, expiry: '2025-12-20', status: 'Expiring Soon' },
            { name: 'Ibuprofen', dosage: '200mg', stock: 75, expiry: '2026-03-15', status: 'Good' },
            { name: 'Cefalexin', dosage: '500mg', stock: 60, expiry: '2025-10-30', status: 'Expiring Soon' },
            { name: 'Vitamin C', dosage: '1000mg', stock: 120, expiry: '2027-01-01', status: 'Good' },
            { name: 'Metformin', dosage: '500mg', stock: 90, expiry: '2026-12-10', status: 'Good' },
            { name: 'Insulin', dosage: '100IU/mL', stock: 25, expiry: '2025-11-30', status: 'Low Stock' }
        ],
        vaccines: [
            { name: 'BCG', stock: 120, expiry: '2026-08-10', status: 'Good' },
            { name: 'Hepatitis B', stock: 80, expiry: '2026-05-15', status: 'Good' },
            { name: 'DPT', stock: 95, expiry: '2026-12-20', status: 'Good' },
            { name: 'Oral Polio', stock: 200, expiry: '2027-03-10', status: 'Good' },
            { name: 'IPV', stock: 70, expiry: '2026-09-30', status: 'Good' },
            { name: 'MMR', stock: 150, expiry: '2026-11-01', status: 'Good' },
            { name: 'Influenza', stock: 45, expiry: '2026-10-15', status: 'Low Stock' }
        ]
    },
    appointment: {
        title: 'Appointment Summary Report',
        summary: {
            totalAppointments: 32,
            completed: 20,
            pending: 8,
            cancelled: 3,
            noShow: 1
        },
        data: [
            { date: '2026-03-15', total: 6, completed: 5, pending: 1, cancelled: 0 },
            { date: '2026-03-16', total: 5, completed: 3, pending: 1, cancelled: 1 },
            { date: '2026-03-17', total: 4, completed: 2, pending: 2, cancelled: 0 },
            { date: '2026-03-18', total: 7, completed: 4, pending: 2, cancelled: 1 },
            { date: '2026-03-19', total: 5, completed: 3, pending: 1, cancelled: 1 },
            { date: '2026-03-20', total: 5, completed: 3, pending: 1, cancelled: 0 }
        ]
    }
};

// Display current date
function displayCurrentDate() {
    const dateElement = document.getElementById('reportDate');
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Update report preview based on filters
function updateReportPreview() {
    const reportType = document.getElementById('reportType').value;
    const month = document.getElementById('month').value;
    const year = document.getElementById('year').value;
    
    // Update report title and period
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[month - 1];
    document.getElementById('reportTitle').textContent = reportData[reportType].title;
    document.getElementById('reportPeriod').textContent = `${monthName} ${year}`;
    
    // Fixed location - Brgy. Dalig only
    document.getElementById('reportLocation').textContent = 'Brgy. Dalig, Teresa, Rizal';
    
    // Generate report content based on type
    generateReportContent(reportType);
}

// Generate report content
function generateReportContent(reportType) {
    const contentDiv = document.getElementById('reportContent');
    const data = reportData[reportType];
    
    let html = '';
    
    switch(reportType) {
        case 'nutrition':
            html = generateNutritionReport(data);
            break;
        case 'immunization':
            html = generateImmunizationReport(data);
            break;
        case 'maternal':
            html = generateMaternalReport(data);
            break;
        case 'senior':
            html = generateSeniorReport(data);
            break;
        case 'inventory':
            html = generateInventoryReport(data);
            break;
        case 'appointment':
            html = generateAppointmentReport(data);
            break;
    }
    
    contentDiv.innerHTML = html;
}

// Generate Nutrition Report
function generateNutritionReport(data) {
    const normalPercent = ((data.summary.normal / data.summary.totalChildren) * 100).toFixed(1);
    const malnourishedPercent = ((data.summary.malnourished / data.summary.totalChildren) * 100).toFixed(1);
    
    return `
        <div class="summary-cards">
            <div class="summary-card">
                <h4>Total Children</h4>
                <div class="value">${data.summary.totalChildren}</div>
            </div>
            <div class="summary-card">
                <h4>Normal</h4>
                <div class="value" style="color: #4caf50;">${data.summary.normal} (${normalPercent}%)</div>
            </div>
            <div class="summary-card">
                <h4>Malnourished</h4>
                <div class="value" style="color: #f44336;">${data.summary.malnourished} (${malnourishedPercent}%)</div>
            </div>
        </div>
        
        <div class="summary-cards">
            <div class="summary-card">
                <h4>Mild Malnutrition</h4>
                <div class="value" style="color: #ff9800;">${data.summary.mild}</div>
            </div>
            <div class="summary-card">
                <h4>Moderate Malnutrition</h4>
                <div class="value" style="color: #f44336;">${data.summary.moderate}</div>
            </div>
            <div class="summary-card">
                <h4>Severe Malnutrition</h4>
                <div class="value" style="color: #9c27b0;">${data.summary.severe}</div>
            </div>
        </div>
        
        <h4 style="margin: 20px 0 10px;">Nutrition Status by Barangay</h4>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Barangay</th>
                    <th>Total Children</th>
                    <th>Normal</th>
                    <th>Mild</th>
                    <th>Moderate</th>
                    <th>Severe</th>
                </tr>
            </thead>
            <tbody>
                ${data.data.map(row => `
                    <tr>
                        <td>${row.barangay}</td>
                        <td>${row.total}</td>
                        <td class="nutrition-normal">${row.normal}</td>
                        <td class="nutrition-mild">${row.mild}</td>
                        <td class="nutrition-moderate">${row.moderate}</td>
                        <td class="nutrition-severe">${row.severe}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td><strong>TOTAL</strong></td>
                    <td><strong>${data.summary.totalChildren}</strong></td>
                    <td><strong>${data.summary.normal}</strong></td>
                    <td><strong>${data.summary.mild}</strong></td>
                    <td><strong>${data.summary.moderate}</strong></td>
                    <td><strong>${data.summary.severe}</strong></td>
                </tr>
            </tbody>
        </table>
    `;
}

// Generate Immunization Report
function generateImmunizationReport(data) {
    return `
        <div class="summary-cards">
            <div class="summary-card">
                <h4>Total Children</h4>
                <div class="value">${data.summary.totalChildren}</div>
            </div>
            <div class="summary-card">
                <h4>Fully Immunized</h4>
                <div class="value" style="color: #4caf50;">${data.summary.fullyImmunized}</div>
            </div>
            <div class="summary-card">
                <h4>Coverage Rate</h4>
                <div class="value">${data.summary.coverage}</div>
            </div>
        </div>
        
        <div class="summary-cards">
            <div class="summary-card">
                <h4>Partially Immunized</h4>
                <div class="value" style="color: #ff9800;">${data.summary.partiallyImmunized}</div>
            </div>
            <div class="summary-card">
                <h4>Not Immunized</h4>
                <div class="value" style="color: #f44336;">${data.summary.notImmunized}</div>
            </div>
        </div>
        
        <h4 style="margin: 20px 0 10px;">Vaccine Coverage Details</h4>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Vaccine</th>
                    <th>Target Population</th>
                    <th>Administered</th>
                    <th>Coverage</th>
                </tr>
            </thead>
            <tbody>
                ${data.data.map(row => `
                    <tr>
                        <td>${row.vaccine}</td>
                        <td>${row.target}</td>
                        <td>${row.administered}</td>
                        <td>${row.coverage}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Generate Maternal Report
function generateMaternalReport(data) {
    return `
        <div class="summary-cards">
            <div class="summary-card">
                <h4>Total Pregnant Women</h4>
                <div class="value">${data.summary.totalPregnant}</div>
            </div>
            <div class="summary-card">
                <h4>1st Trimester</h4>
                <div class="value">${data.summary.firstTrimester}</div>
            </div>
            <div class="summary-card">
                <h4>2nd Trimester</h4>
                <div class="value">${data.summary.secondTrimester}</div>
            </div>
        </div>
        
        <div class="summary-cards">
            <div class="summary-card">
                <h4>3rd Trimester</h4>
                <div class="value">${data.summary.thirdTrimester}</div>
            </div>
            <div class="summary-card">
                <h4>Total Checkups</h4>
                <div class="value">${data.summary.completedCheckups}</div>
            </div>
            <div class="summary-card">
                <h4>High Risk Cases</h4>
                <div class="value" style="color: #f44336;">${data.summary.highRisk}</div>
            </div>
        </div>
        
        <h4 style="margin: 20px 0 10px;">Prenatal Checkup Summary</h4>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Trimester</th>
                    <th>Checkups</th>
                    <th>Risk Status</th>
                </tr>
            </thead>
            <tbody>
                ${data.data.map(row => `
                    <tr>
                        <td>${row.patientId}</td>
                        <td>${row.name}</td>
                        <td>${row.age}</td>
                        <td>${row.trimester}</td>
                        <td>${row.checkups}</td>
                        <td class="${row.risk === 'High' ? 'nutrition-severe' : 'nutrition-normal'}">${row.risk}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Generate Senior Report
function generateSeniorReport(data) {
    return `
        <div class="summary-cards">
            <div class="summary-card">
                <h4>Total Senior Citizens</h4>
                <div class="value">${data.summary.totalSenior}</div>
            </div>
            <div class="summary-card">
                <h4>With Maintenance</h4>
                <div class="value">${data.summary.withMaintenance}</div>
            </div>
            <div class="summary-card">
                <h4>Regular Checkups</h4>
                <div class="value">${data.summary.regularCheckups}</div>
            </div>
        </div>
        
        <div class="summary-cards">
            <div class="summary-card">
                <h4>With Comorbidities</h4>
                <div class="value">${data.summary.withComorbidities}</div>
            </div>
            <div class="summary-card">
                <h4>Home Visits</h4>
                <div class="value">${data.summary.homeVisits}</div>
            </div>
        </div>
        
        <h4 style="margin: 20px 0 10px;">Senior Health Summary</h4>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Condition</th>
                    <th>Last Visit</th>
                </tr>
            </thead>
            <tbody>
                ${data.data.map(row => `
                    <tr>
                        <td>${row.patientId}</td>
                        <td>${row.name}</td>
                        <td>${row.age}</td>
                        <td>${row.condition}</td>
                        <td>${row.lastVisit}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Generate Inventory Report
function generateInventoryReport(data) {
    return `
        <div class="summary-cards">
            <div class="summary-card">
                <h4>Total Medicines</h4>
                <div class="value">${data.summary.totalMedicines}</div>
            </div>
            <div class="summary-card">
                <h4>Total Vaccines</h4>
                <div class="value">${data.summary.totalVaccines}</div>
            </div>
            <div class="summary-card">
                <h4>Low Stock Items</h4>
                <div class="value" style="color: #ff9800;">${data.summary.lowStock}</div>
            </div>
        </div>
        
        <div class="summary-cards">
            <div class="summary-card">
                <h4>Expiring Soon</h4>
                <div class="value" style="color: #f44336;">${data.summary.expiringSoon}</div>
            </div>
        </div>
        
        <h4 style="margin: 20px 0 10px;">Medicine Inventory</h4>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Stock</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${data.medicines.map(row => `
                    <tr>
                        <td>${row.name}</td>
                        <td>${row.dosage}</td>
                        <td>${row.stock}</td>
                        <td>${row.expiry}</td>
                        <td class="${row.status === 'Expiring Soon' ? 'nutrition-mild' : (row.status === 'Low Stock' ? 'nutrition-moderate' : 'nutrition-normal')}">${row.status}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h4 style="margin: 20px 0 10px;">Vaccine Inventory</h4>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Vaccine</th>
                    <th>Stock</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${data.vaccines.map(row => `
                    <tr>
                        <td>${row.name}</td>
                        <td>${row.stock}</td>
                        <td>${row.expiry}</td>
                        <td class="${row.status === 'Expiring Soon' ? 'nutrition-mild' : (row.status === 'Low Stock' ? 'nutrition-moderate' : 'nutrition-normal')}">${row.status}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Generate Appointment Report
function generateAppointmentReport(data) {
    return `
        <div class="summary-cards">
            <div class="summary-card">
                <h4>Total Appointments</h4>
                <div class="value">${data.summary.totalAppointments}</div>
            </div>
            <div class="summary-card">
                <h4>Completed</h4>
                <div class="value" style="color: #4caf50;">${data.summary.completed}</div>
            </div>
            <div class="summary-card">
                <h4>Pending</h4>
                <div class="value" style="color: #ff9800;">${data.summary.pending}</div>
            </div>
        </div>
        
        <div class="summary-cards">
            <div class="summary-card">
                <h4>Cancelled</h4>
                <div class="value" style="color: #9e9e9e;">${data.summary.cancelled}</div>
            </div>
            <div class="summary-card">
                <h4>No Show</h4>
                <div class="value" style="color: #f44336;">${data.summary.noShow}</div>
            </div>
        </div>
        
        <h4 style="margin: 20px 0 10px;">Daily Appointment Summary</h4>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Completed</th>
                    <th>Pending</th>
                    <th>Cancelled</th>
                </tr>
            </thead>
            <tbody>
                ${data.data.map(row => `
                    <tr>
                        <td>${row.date}</td>
                        <td>${row.total}</td>
                        <td>${row.completed}</td>
                        <td>${row.pending}</td>
                        <td>${row.cancelled}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td><strong>TOTAL</strong></td>
                    <td><strong>${data.summary.totalAppointments}</strong></td>
                    <td><strong>${data.summary.completed}</strong></td>
                    <td><strong>${data.summary.pending}</strong></td>
                    <td><strong>${data.summary.cancelled + data.summary.noShow}</strong></td>
                </tr>
            </tbody>
        </table>
    `;
}

// Generate monthly report (quick action)
function generateMonthlyReport() {
    // Set to current month
    const today = new Date();
    document.getElementById('month').value = today.getMonth() + 1;
    document.getElementById('year').value = today.getFullYear();
    
    // Update preview
    updateReportPreview();
    
    alert('Monthly report generated! You can now export to PDF or Excel.');
}

// Export to PDF
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');
    
    // Get report title and content
    const title = document.getElementById('reportTitle').textContent;
    const period = document.getElementById('reportPeriod').textContent;
    const location = document.getElementById('reportLocation').textContent;
    
    // Add title
    doc.setFontSize(16);
    doc.setTextColor(43, 104, 150);
    doc.text(title, 40, 40);
    
    // Add period and location
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Period: ${period}`, 40, 60);
    doc.text(`Location: ${location}`, 40, 75);
    
    // Add date generated
    const today = new Date();
    doc.text(`Generated: ${today.toLocaleDateString()}`, 40, 90);
    
    // Get table data based on current report type
    const reportType = document.getElementById('reportType').value;
    const data = reportData[reportType];
    
    let tableData = [];
    let headers = [];
    
    switch(reportType) {
        case 'nutrition':
            headers = [['Barangay', 'Total', 'Normal', 'Mild', 'Moderate', 'Severe']];
            tableData = data.data.map(row => [row.barangay, row.total, row.normal, row.mild, row.moderate, row.severe]);
            // Add summary row
            tableData.push(['TOTAL', data.summary.totalChildren, data.summary.normal, data.summary.mild, data.summary.moderate, data.summary.severe]);
            break;
            
        case 'immunization':
            headers = [['Vaccine', 'Target', 'Administered', 'Coverage']];
            tableData = data.data.map(row => [row.vaccine, row.target, row.administered, row.coverage]);
            break;
            
        case 'maternal':
            headers = [['Patient ID', 'Name', 'Age', 'Trimester', 'Checkups', 'Risk']];
            tableData = data.data.map(row => [row.patientId, row.name, row.age, row.trimester, row.checkups, row.risk]);
            break;
            
        case 'senior':
            headers = [['Patient ID', 'Name', 'Age', 'Condition', 'Last Visit']];
            tableData = data.data.map(row => [row.patientId, row.name, row.age, row.condition, row.lastVisit]);
            break;
            
        case 'inventory':
            headers = [['Medicine', 'Dosage', 'Stock', 'Expiry', 'Status']];
            tableData = data.medicines.map(row => [row.name, row.dosage, row.stock, row.expiry, row.status]);
            break;
            
        case 'appointment':
            headers = [['Date', 'Total', 'Completed', 'Pending', 'Cancelled']];
            tableData = data.data.map(row => [row.date, row.total, row.completed, row.pending, row.cancelled]);
            tableData.push(['TOTAL', data.summary.totalAppointments, data.summary.completed, data.summary.pending, data.summary.cancelled + data.summary.noShow]);
            break;
    }
    
    // Add table
    doc.autoTable({
        head: headers,
        body: tableData,
        startY: 110,
        theme: 'striped',
        headStyles: {
            fillColor: [43, 104, 150],
            textColor: [255, 255, 255],
            fontSize: 10
        },
        styles: {
            fontSize: 9,
            cellPadding: 5
        }
    });
    
    // Save PDF
    doc.save(`NutriTrack_Report_${reportType}_${period.replace(/ /g, '_')}.pdf`);
    
    alert('PDF downloaded successfully!');
}

// Export to Excel (simulated - would need SheetJS or similar)
function exportToExcel() {
    alert('Excel export will be available in the full version.\n\nFor now, you can print or save as PDF.');
}

// Print report
function printReport() {
    const reportContent = document.querySelector('.report-preview-container').innerHTML;
    const originalTitle = document.title;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>NutriTrack PH Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 30px; }
                    h2 { color: #2B6896; text-align: center; }
                    .report-meta { text-align: center; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th { background: #2B6896; color: white; padding: 10px; text-align: left; }
                    td { padding: 8px; border-bottom: 1px solid #ddd; }
                    .summary-cards { display: flex; gap: 15px; margin: 20px 0; }
                    .summary-card { background: #f5f5f5; padding: 15px; flex: 1; border-radius: 5px; }
                    .report-footer { margin-top: 50px; display: flex; justify-content: space-between; }
                    @media print {
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                ${reportContent}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    
    // Set prepared by name from session if available
    const userInfo = sessionStorage.getItem('currentUser');
    if (userInfo) {
        try {
            const user = JSON.parse(userInfo);
            document.getElementById('preparedBy').textContent = `${user.name}, ${user.role}`;
        } catch (e) {
            // Use default
        }
    }
    
    // Generate initial report
    updateReportPreview();
});