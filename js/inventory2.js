// ===== VACCINE INVENTORY PAGE FUNCTIONALITY =====

// Sample vaccine inventory data
let inventory = [
    {
        no: 1,
        name: "MMR Vaccine",
        description: "Measles, Mumps, Rubella",
        dosage: "0.5 mL",
        form: "Injection",
        expiry: "2026-08-10",
        quantity: 120
    },
    {
        no: 2,
        name: "Hepatitis B Vaccine",
        description: "Protects against Hepatitis B",
        dosage: "1 mL",
        form: "Injection",
        expiry: "2026-05-15",
        quantity: 80
    },
    {
        no: 3,
        name: "DTaP Vaccine",
        description: "Diphtheria, Tetanus, Pertussis",
        dosage: "0.5 mL",
        form: "Injection",
        expiry: "2026-12-20",
        quantity: 95
    },
    {
        no: 4,
        name: "Polio Vaccine",
        description: "Protects against Polio",
        dosage: "0.5 mL",
        form: "Injection",
        expiry: "2027-03-10",
        quantity: 70
    },
    {
        no: 5,
        name: "Influenza Vaccine",
        description: "Seasonal flu protection",
        dosage: "0.5 mL",
        form: "Injection",
        expiry: "2026-11-01",
        quantity: 150
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
    const name = document.getElementById('vaccineName').value.trim();
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

    alert("Vaccine added successfully!");
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