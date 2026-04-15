// ===== MEDICINES INVENTORY PAGE WITH FIREBASE =====

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

// Load medicines from Firestore
async function loadInventory() {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Loading medicines...<\/div>';

    try {
        const snapshot = await db.collection('medicines_inventory').orderBy('no').get();

        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No medicines found. Click "+ Add Medicine" to add.<\/div>';
            allMedicines = [];
            return;
        }

        allMedicines = [];
        tableBody.innerHTML = '';

        snapshot.forEach(doc => {
            const item = doc.data();
            allMedicines.push(item);

            const quantityColor = item.quantity <= 5 ? '#f44336' : (item.quantity <= 10 ? '#ff9800' : '#2e7d32');

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.no || '-'}<\/div>
                <td><strong>${item.name || '-'}</strong><\/div>
                <td>${item.description || '-'}<\/div>
                <td>${item.dosage || '-'}<\/div>
                <td>${item.form || '-'}<\/div>
                <td>${item.expiry || '-'}<\/div>
                <td style="color: ${quantityColor}; font-weight: bold;">${item.quantity || 0}<\/div>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" onclick="viewItemModal('${item.doc_id}')">View</button>
                        <button class="edit-btn" onclick="editItemModal('${item.doc_id}')">Edit</button>
                        <button class="delete-btn" onclick="showDeleteItemConfirmation('${item.doc_id}', '${escapeHtml(item.name)}')">Delete</button>
                    </div>
                <\/div>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading medicines:", error);
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">Error loading data. Please check your connection.<\/div>';
    }
}

// Search inventory
function searchInventory() {
    const searchTerm = document.getElementById('inventorySearch')?.value.toLowerCase() || '';
    const filtered = allMedicines.filter(item =>
        (item.name && item.name.toLowerCase().includes(searchTerm)) ||
        (item.description && item.description.toLowerCase().includes(searchTerm)) ||
        (item.form && item.form.toLowerCase().includes(searchTerm)) ||
        (item.dosage && item.dosage.toLowerCase().includes(searchTerm))
    );
    displayFilteredInventory(filtered);
}

// Sort inventory
function sortInventory() {
    const sortBy = document.getElementById('sortBy').value;
    const sorted = [...allMedicines].sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (sortBy === 'no' || sortBy === 'quantity') {
            return (valA || 0) - (valB || 0);
        }
        if (sortBy === 'expiry') {
            return new Date(valA) - new Date(valB);
        }
        return String(valA || '').localeCompare(String(valB || ''));
    });
    displayFilteredInventory(sorted);
}

// Display filtered/sorted inventory
function displayFilteredInventory(list) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    list.forEach(item => {
        const quantityColor = item.quantity <= 5 ? '#f44336' : (item.quantity <= 10 ? '#ff9800' : '#2e7d32');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.no || '-'}<\/div>
            <td><strong>${item.name || '-'}</strong><\/div>
            <td>${item.description || '-'}<\/div>
            <td>${item.dosage || '-'}<\/div>
            <td>${item.form || '-'}<\/div>
            <td>${item.expiry || '-'}<\/div>
            <td style="color: ${quantityColor}; font-weight: bold;">${item.quantity || 0}<\/div>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewItemModal('${item.doc_id}')">View</button>
                    <button class="edit-btn" onclick="editItemModal('${item.doc_id}')">Edit</button>
                    <button class="delete-btn" onclick="showDeleteItemConfirmation('${item.doc_id}', '${escapeHtml(item.name)}')">Delete</button>
                </div>
            <\/div>
        `;
        tableBody.appendChild(row);
    });
}

// Get next sequential number
async function getNextNumber() {
    try {
        const snapshot = await db.collection('medicines_inventory').orderBy('no', 'desc').limit(1).get();
        if (snapshot.empty) {
            return 1;
        }
        const lastItem = snapshot.docs[0].data();
        return (lastItem.no || 0) + 1;
    } catch (error) {
        console.error("Error getting next number:", error);
        return allMedicines.length + 1;
    }
}

// Show add modal
function showAddInventoryModal() {
    document.getElementById('addInventoryModal').classList.add('show');
}

// Hide add modal
function hideAddInventoryModal() {
    document.getElementById('addInventoryModal').classList.remove('show');
    document.getElementById('inventoryForm').reset();
}

// Save inventory to Firestore
async function saveInventory() {
    const name = document.getElementById('medicineName')?.value.trim();
    const description = document.getElementById('description')?.value.trim();
    const dosage = document.getElementById('dosage')?.value.trim();
    const form = document.getElementById('form')?.value;
    const expiry = document.getElementById('expiryDate')?.value;
    const quantity = document.getElementById('quantity')?.value;

    if (!name || !dosage || !form || !expiry || !quantity) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }

    const nextNumber = await getNextNumber();
    const docId = nextNumber.toString();

    const newItem = {
        doc_id: docId,
        no: nextNumber,
        name: name,
        description: description || '',
        dosage: dosage,
        form: form,
        expiry: expiry,
        quantity: parseInt(quantity),
        created_at: new Date().toISOString()
    };

    try {
        await db.collection('medicines_inventory').doc(docId).set(newItem);
        showToast('Medicine added successfully!', 'success');
        await loadInventory();
        hideAddInventoryModal();
    } catch (error) {
        console.error("Error saving medicine:", error);
        showToast("Error saving medicine. Please try again.", 'error');
    }
}

// ========== VIEW ITEM MODAL ==========
function viewItemModal(docId) {
    const item = allMedicines.find(i => i.doc_id === docId);
    if (item) {
        const quantityColor = item.quantity <= 5 ? '#f44336' : (item.quantity <= 10 ? '#ff9800' : '#2e7d32');
        
        const content = `
            <div style="line-height: 1.8; font-family: 'Segoe UI', Arial, sans-serif;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; width: 35%; font-weight: 600; color: #2B6896;">No.:<\/td><td style="padding: 8px 0;">${item.no}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Medicine Name:<\/td><td style="padding: 8px 0;"><strong>${item.name}<\/strong><\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Dosage:<\/td><td style="padding: 8px 0;">${item.dosage}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Form:<\/td><td style="padding: 8px 0;">${item.form}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Description:<\/td><td style="padding: 8px 0;">${item.description || 'N/A'}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Expiry Date:<\/td><td style="padding: 8px 0;">${item.expiry}<\/td><\/tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; color: #2B6896;">Quantity:<\/td><td style="padding: 8px 0; color: ${quantityColor}; font-weight: bold;">${item.quantity}<\/td><\/tr>
                </table>
            </div>
        `;
        
        const modal = document.getElementById('viewItemModal');
        if (modal) {
            document.getElementById('viewItemModalBody').innerHTML = content;
            modal.classList.add('show');
        }
    }
}

function closeViewItemModal() {
    const modal = document.getElementById('viewItemModal');
    if (modal) modal.classList.remove('show');
}

// ========== EDIT ITEM MODAL ==========
function editItemModal(docId) {
    const item = allMedicines.find(i => i.doc_id === docId);
    if (!item) {
        showToast('Medicine not found.', 'error');
        return;
    }
    
    document.getElementById('editDocId').value = item.doc_id;
    document.getElementById('editMedicineName').value = item.name || '';
    document.getElementById('editDosage').value = item.dosage || '';
    document.getElementById('editForm').value = item.form || '';
    document.getElementById('editDescription').value = item.description || '';
    document.getElementById('editExpiryDate').value = item.expiry || '';
    document.getElementById('editQuantity').value = item.quantity || 0;
    
    document.getElementById('editItemModal').classList.add('show');
}

function closeEditItemModal() {
    document.getElementById('editItemModal').classList.remove('show');
}

async function updateItem() {
    const docId = document.getElementById('editDocId').value;
    const name = document.getElementById('editMedicineName').value.trim();
    const dosage = document.getElementById('editDosage').value.trim();
    const form = document.getElementById('editForm').value;
    const description = document.getElementById('editDescription').value.trim();
    const expiry = document.getElementById('editExpiryDate').value;
    const quantity = document.getElementById('editQuantity').value;
    
    if (!name || !dosage || !form || !expiry || !quantity) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    try {
        await db.collection('medicines_inventory').doc(docId).update({
            name: name,
            dosage: dosage,
            form: form,
            description: description || '',
            expiry: expiry,
            quantity: parseInt(quantity),
            updated_at: new Date().toISOString()
        });
        
        showToast(`Medicine "${name}" updated successfully!`, 'success');
        await loadInventory();
        closeEditItemModal();
    } catch (error) {
        console.error("Error updating medicine:", error);
        showToast("Error updating medicine. Please try again.", 'error');
    }
}

// ========== DELETE ITEM CONFIRMATION MODAL ==========
let pendingDeleteItemId = null;
let pendingDeleteItemName = null;

function showDeleteItemConfirmation(docId, itemName) {
    pendingDeleteItemId = docId;
    pendingDeleteItemName = itemName;
    
    let modal = document.getElementById('deleteItemConfirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'deleteItemConfirmModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div class="modal-header" style="background: #f44336;">
                    <h2 style="color: white;">⚠️ Confirm Delete</h2>
                    <button class="close-modal" onclick="closeDeleteItemModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="font-size: 48px; margin-bottom: 15px;">🗑️</div>
                    <p>Are you sure you want to delete this medicine?</p>
                    <p><strong id="deleteItemInfo"></strong></p>
                    <p style="color: #f44336; font-size: 13px;">⚠️ This action cannot be undone!</p>
                </div>
                <div class="modal-footer" style="justify-content: center;">
                    <button class="cancel-btn" onclick="closeDeleteItemModal()">Cancel</button>
                    <button class="save-btn" id="confirmDeleteItemBtn" style="background: #f44336;">Delete Permanently</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const deleteInfo = document.getElementById('deleteItemInfo');
    if (deleteInfo) {
        deleteInfo.innerHTML = escapeHtml(itemName);
    }
    
    modal.classList.add('show');
    
    const confirmBtn = document.getElementById('confirmDeleteItemBtn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener('click', async () => {
        if (pendingDeleteItemId) {
            try {
                await db.collection('medicines_inventory').doc(pendingDeleteItemId).delete();
                showToast(`Medicine "${pendingDeleteItemName}" deleted successfully.`, 'success');
                await loadInventory();
            } catch (error) {
                console.error("Error deleting medicine:", error);
                showToast("Error deleting medicine. Please try again.", 'error');
            }
        }
        closeDeleteItemModal();
    });
}

function closeDeleteItemModal() {
    const modal = document.getElementById('deleteItemConfirmModal');
    if (modal) modal.classList.remove('show');
    pendingDeleteItemId = null;
    pendingDeleteItemName = null;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadInventory();
    
    document.getElementById('inventorySearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchInventory();
    });
});