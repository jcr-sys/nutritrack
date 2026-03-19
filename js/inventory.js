// ===== INVENTORY PAGE FUNCTIONALITY =====

// Sample inventory data
let inventory = [
    {
        no: 1,
        name: "Paracetamol",
        description: "Pain reliever and fever reducer",
        dosage: "500mg",
        form: "Tablet",
        expiry: "2026-05-10",
        quantity: 100
    },
    {
        no: 2,
        name: "Amoxicillin",
        description: "Antibiotic for bacterial infections",
        dosage: "250mg",
        form: "Capsule",
        expiry: "2025-12-20",
        quantity: 50
    },
    {
        no: 3,
        name: "Ibuprofen",
        description: "Reduces inflammation and pain",
        dosage: "200mg",
        form: "Tablet",
        expiry: "2026-03-15",
        quantity: 75
    },
    {
        no: 4,
        name: "Cefalexin",
        description: "Antibiotic for bacterial infections",
        dosage: "500mg",
        form: "Capsule",
        expiry: "2025-10-30",
        quantity: 60
    },
    {
        no: 5,
        name: "Vitamin C",
        description: "Immune system support",
        dosage: "1000mg",
        form: "Tablet",
        expiry: "2027-01-01",
        quantity: 120
    },
    {
        no: 6,
        name: "Diphenhydramine",
        description: "Allergy relief",
        dosage: "25mg",
        form: "Tablet",
        expiry: "2026-06-20",
        quantity: 80
    },
    {
        no: 7,
        name: "Azithromycin",
        description: "Antibiotic for bacterial infections",
        dosage: "250mg",
        form: "Tablet",
        expiry: "2025-09-15",
        quantity: 40
    },
    {
        no: 8,
        name: "Metformin",
        description: "Used for type 2 diabetes",
        dosage: "500mg",
        form: "Tablet",
        expiry: "2026-12-10",
        quantity: 90
    },
    {
        no: 9,
        name: "Omeprazole",
        description: "Reduces stomach acid",
        dosage: "20mg",
        form: "Capsule",
        expiry: "2026-04-05",
        quantity: 70
    },
    {
        no: 10,
        name: "Insulin",
        description: "Blood sugar control",
        dosage: "100IU/mL",
        form: "Injection",
        expiry: "2025-11-30",
        quantity: 25
    }
];

// Display current date
function displaycurrentdate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        dateElement.textContent = today.toLocaleDateString();
    }
}

// Load inventory into table
function loadinventory() {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    inventory.forEach(item => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${item.no}</td>
            <td>${item.name}</td>
            <td>${item.description || '-'}</td>
            <td>${item.dosage}</td>
            <td>${item.form}</td>
            <td>${item.expiry}</td>
            <td>${item.quantity}</td>
        `;

        tableBody.appendChild(row);
    });
}

// Search inventory
function searchinventory() {
    const searchTerm = (document.getElementById('inventorySearch').value || '').toLowerCase();

    const filtered = inventory.filter(item =>
        (item.name || '').toLowerCase().includes(searchTerm) ||
        (item.description || '').toLowerCase().includes(searchTerm) ||
        (item.form || '').toLowerCase().includes(searchTerm)
    );

    displayinventory(filtered);
}

// Sort inventory
function sortinventory() {
    const sortBy = document.getElementById('sortBy').value;

    const sorted = [...inventory].sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === 'no' || sortBy === 'quantity') {
            return valA - valB;
        }

        return String(valA).localeCompare(String(valB));
    });

    displayinventory(sorted);
}

// Display filtered/sorted inventory
function displayinventory(list) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    list.forEach(item => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${item.no}</td>
            <td>${item.name}</td>
            <td>${item.description || '-'}</td>
            <td>${item.dosage}</td>
            <td>${item.form}</td>
            <td>${item.expiry}</td>
            <td>${item.quantity}</td>
        `;

        tableBody.appendChild(row);
    });
}

// Show modal
function showaddinventorymodal() {
    document.getElementById('addinventoryModal').classList.add('show');
}

// Hide modal
function hideaddinventorymodal() {
    document.getElementById('addinventoryModal').classList.remove('show');
    document.getElementById('inventoryForm').reset();
}

// Save inventory
function saveinventory() {
    const name = document.getElementById('medicineName').value.trim();
    const description = document.getElementById('description').value.trim();
    const dosage = document.getElementById('dosage').value.trim();
    const form = document.getElementById('form').value;
    const expiry = document.getElementById('expiryDate').value;
    const quantity = document.getElementById('quantity').value;

    if (!name || !dosage || !form || !expiry || !quantity) {
        alert("Please fill in all required fields");
        return;
    }

    const newItem = {
        no: inventory.length + 1,
        name,
        description,
        dosage,
        form,
        expiry,
        quantity: parseInt(quantity)
    };

    inventory.push(newItem);

    loadinventory();
    hideaddinventorymodal();

    alert("Medicine added successfully!");
}

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
    displaycurrentdate();
    loadinventory();

    document.getElementById('inventorySearch')?.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchinventory();
        }
    });
});
