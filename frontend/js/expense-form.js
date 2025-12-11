// Require authentication
requireAuth();

let categories = [];
let expenseId = null;
let imagesToDelete = [];

// Load Categories
async function loadCategories() {
    const result = await apiRequest(`${API_BASE}/categories.php`);
    if (result.success) {
        categories = result.categories;
        const select = document.getElementById('category');
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = `${cat.icon} ${cat.name}`;
            select.appendChild(option);
        });
    }
}

// Set today's date 
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    if (dateInput && !expenseId) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    loadCategories();

    // Check if editing
    const urlExpenseId = getUrlParameter('id');
    if (urlExpenseId && window.location.pathname.includes('edit-expense')) {
        expenseId = urlExpenseId;
        loadExpenseForEdit();
    }
});

// Image Preview
const imagesInput = document.getElementById('images');
const newImagesInput = document.getElementById('newImages');

if (imagesInput) {
    imagesInput.addEventListener('change', (e) => {
        handleImagePreview(e.target, document.getElementById('imagePreview'));
    });
}

if (newImagesInput) {
    newImagesInput.addEventListener('change', (e) => {
        handleImagePreview(e.target, document.getElementById('newImagePreview'));
    });
}

// Load Expense for Edit
async function loadExpenseForEdit() {
    const loader = document.getElementById('loader');
    const form = document.getElementById('editExpenseForm');

    const result = await apiRequest(`${API_BASE}/expenses.php?id=${expenseId}`);

    if (result.success) {
        const expense = result.expense;

        // Populate form
        document.getElementById('amount').value = expense.amount;
        document.getElementById('category').value = expense.category_id;
        document.getElementById('date').value = expense.date;
        document.getElementById('notes').value = expense.notes || '';

        // Show existing images
        const existingImagesContainer = document.getElementById('existingImages');
        if (expense.images && expense.images.length > 0) {
            existingImagesContainer.innerHTML = expense.images.map(img => `
                <div class="preview-item">
                    <img src="../uploads/expenses/${img.image_path}" alt="Expense image">
                    <button type="button" class="preview-remove" onclick="markImageForDeletion(${img.id}, this)">×</button>
                </div>
            `).join('');
        } else {
            existingImagesContainer.innerHTML = '<p class="text-muted">No images</p>';
        }

        loader.classList.add('hidden');
        form.classList.remove('hidden');
    } else {
        showToast('Failed to load expense', 'error');
        setTimeout(() => window.location.href = 'expenses.html', 2000);
    }
}

// Mark image for deletion
function markImageForDeletion(imageId, button) {
    imagesToDelete.push(imageId);
    button.parentElement.remove();
    showToast('Image marked for deletion', 'info');
}

// Add Expense Form
const expenseForm = document.getElementById('expenseForm');
if (expenseForm) {
    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('amount', document.getElementById('amount').value);
        formData.append('category_id', document.getElementById('category').value);
        formData.append('date', document.getElementById('date').value);
        formData.append('notes', document.getElementById('notes').value);

        // Add images
        const images = document.getElementById('images').files;
        for (let i = 0; i < images.length; i++) {
            formData.append('images[]', images[i]);
        }

        setLoading('expenseForm', 'submitText', 'submitSpinner', true);

        const result = await apiRequest(`${API_BASE}/expenses.php`, {
            method: 'POST',
            body: formData
        });

        setLoading('expenseForm', 'submitText', 'submitSpinner', false);

        if (result.success) {
            showToast('Expense added successfully!', 'success');
            setTimeout(() => window.location.href = 'expenses.html', 1500);
        } else {
            showToast(result.message || 'Failed to add expense', 'error');
        }
    });
}

// Edit Expense Form
const editExpenseForm = document.getElementById('editExpenseForm');
if (editExpenseForm) {
    editExpenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('amount', document.getElementById('amount').value);
        formData.append('category_id', document.getElementById('category').value);
        formData.append('date', document.getElementById('date').value);
        formData.append('notes', document.getElementById('notes').value);

        // Add new images
        const newImages = document.getElementById('newImages').files;
        for (let i = 0; i < newImages.length; i++) {
            formData.append('images[]', newImages[i]);
        }

        // Add images to delete
        if (imagesToDelete.length > 0) {
            formData.append('delete_images', JSON.stringify(imagesToDelete));
        }

        setLoading('editExpenseForm', 'submitText', 'submitSpinner', true);

        const result = await apiRequest(`${API_BASE}/upload.php?id=${expenseId}`, {
            method: 'POST',
            body: formData
        });

        setLoading('editExpenseForm', 'submitText', 'submitSpinner', false);

        if (result.success) {
            showToast('Expense updated successfully!', 'success');
            setTimeout(() => window.location.href = 'expenses.html', 1500);
        } else {
            showToast(result.message || 'Failed to update expense', 'error');
        }
    });
}
