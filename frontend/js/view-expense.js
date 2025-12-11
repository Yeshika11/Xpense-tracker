// Require authentication
requireAuth();

let currentImageIndex = 0;
let totalImages = 0;

// Load Expense Details
async function loadExpenseDetails() {
    const expenseId = getUrlParameter('id');
    if (!expenseId) {
        showToast('No expense ID provided', 'error');
        setTimeout(() => window.location.href = 'expenses.html', 2000);
        return;
    }

    const result = await apiRequest(`${API_BASE}/expenses.php?id=${expenseId}`);

    if (result.success) {
        renderExpenseDetails(result.expense);
    } else {
        showToast('Failed to load expense details', 'error');
        setTimeout(() => window.location.href = 'expenses.html', 2000);
    }
}

// Render Expense Details
function renderExpenseDetails(expense) {
    const loader = document.getElementById('loader');
    const container = document.getElementById('expenseDetails');

    totalImages = expense.images ? expense.images.length : 0;

    let imagesHTML = '';
    if (totalImages > 0) {
        imagesHTML = `
            <div style="margin-bottom: 2rem;">
                <div style="position: relative; border-radius: var(--radius-lg); overflow: hidden; background: var(--bg-secondary);">
                    <img id="carouselImage" src="../uploads/expenses/${expense.images[0].image_path}" 
                         alt="Expense" 
                         style="width: 100%; max-height: 400px; object-fit: contain;">
                    ${totalImages > 1 ? `
                        <button class="carousel-btn carousel-prev" onclick="changeImage(-1)">❮</button>
                        <button class="carousel-btn carousel-next" onclick="changeImage(1)">❯</button>
                        <div style="position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%); background: rgba(15, 23, 42, 0.8); padding: 0.5rem 1rem; border-radius: var(--radius-md); color: white;">
                            <span id="imageCounter">1 / ${totalImages}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="card-header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2 class="card-title">Expense Details</h2>
                <div style="display: flex; gap: 0.5rem;">
                    <a href="edit-expense.html?id=${expense.id}" class="btn btn-primary btn-sm">✏️ Edit</a>
                    <button class="btn btn-danger btn-sm" onclick="deleteExpense(${expense.id})">🗑️ Delete</button>
                </div>
            </div>
        </div>
        <div class="card-body">
            ${imagesHTML}
            
            <div class="grid grid-cols-2 mb-3">
                <div>
                    <label class="form-label text-muted">Amount</label>
                    <div style="font-size: 2rem; font-weight: 700; color: var(--primary-light);">
                        ${formatCurrency(expense.amount)}
                    </div>
                </div>
                
                <div>
                    <label class="form-label text-muted">Category</label>
                    <div>
                        <span class="badge" style="background-color: ${expense.color}20; color: ${expense.color}; font-size: 1rem; padding: 0.5rem 1rem;">
                            ${expense.icon} ${expense.category_name}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-2 mb-3">
                <div>
                    <label class="form-label text-muted">Date</label>
                    <div style="font-size: 1.125rem; color: var(--text-primary);">
                        📅 ${formatDate(expense.date)}
                    </div>
                </div>
                
                <div>
                    <label class="form-label text-muted">Created At</label>
                    <div style="font-size: 1.125rem; color: var(--text-primary);">
                        🕐 ${formatDate(expense.created_at)}
                    </div>
                </div>
            </div>
            
            ${expense.notes ? `
                <div>
                    <label class="form-label text-muted">Notes</label>
                    <div class="card" style="padding: 1rem; background: var(--bg-tertiary);">
                        <p style="margin: 0; white-space: pre-wrap;">${expense.notes}</p>
                    </div>
                </div>
            ` : ''}
            
            <div style="margin-top: 2rem; text-align: center;">
                <a href="expenses.html" class="btn btn-secondary">← Back to Expenses</a>
            </div>
        </div>
    `;

    // Store images for carousel
    if (expense.images) {
        window.expenseImages = expense.images;
    }

    loader.classList.add('hidden');
    container.classList.remove('hidden');
}

// Change carousel image
function changeImage(direction) {
    if (!window.expenseImages || totalImages <= 1) return;

    currentImageIndex += direction;

    if (currentImageIndex < 0) {
        currentImageIndex = totalImages - 1;
    } else if (currentImageIndex >= totalImages) {
        currentImageIndex = 0;
    }

    const img = document.getElementById('carouselImage');
    const counter = document.getElementById('imageCounter');

    img.src = `../uploads/expenses/${window.expenseImages[currentImageIndex].image_path}`;
    counter.textContent = `${currentImageIndex + 1} / ${totalImages}`;
}

// Delete expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    const result = await apiRequest(`${API_BASE}/expenses.php?id=${id}`, {
        method: 'DELETE'
    });

    if (result.success) {
        showToast('Expense deleted successfully', 'success');
        setTimeout(() => window.location.href = 'expenses.html', 1500);
    } else {
        showToast(result.message || 'Failed to delete expense', 'error');
    }
}

// Add carousel button styles
const style = document.createElement('style');
style.textContent = `
    .carousel-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(15, 23, 42, 0.7);
        color: white;
        border: none;
        padding: 1rem;
        font-size: 1.5rem;
        cursor: pointer;
        transition: var(--transition);
        border-radius: var(--radius-md);
    }
    .carousel-btn:hover {
        background: rgba(15, 23, 42, 0.9);
    }
    .carousel-prev { left: 1rem; }
    .carousel-next { right: 1rem; }
`;
document.head.appendChild(style);

// Initialize
document.addEventListener('DOMContentLoaded', loadExpenseDetails);
