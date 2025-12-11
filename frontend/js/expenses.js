// Require authentication
requireAuth();

let currentPage = 1;
let currentFilters = {};
let currentView = 'table'; // 'table' or 'card'

// Load Categories for Filter
async function loadCategories() {
    const result = await apiRequest(`${API_BASE}/categories.php`);
    if (result.success) {
        const select = document.getElementById('categoryFilter');
        result.categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = `${cat.icon} ${cat.name}`;
            select.appendChild(option);
        });
    }
}

// Load Expenses
async function loadExpenses() {
    const search = document.getElementById('searchInput').value.trim();
    const category = document.getElementById('categoryFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const sortBy = document.getElementById('sortBy').value;
    const sortOrder = document.getElementById('sortOrder').value;

    const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(search && { search }),
        ...(category && { category }),
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
        sort_by: sortBy,
        sort_order: sortOrder
    });

    const result = await apiRequest(`${API_BASE}/expenses.php?${params}`);

    if (result.success) {
        if (currentView === 'table') {
            renderExpensesTable(result.expenses);
        } else {
            renderExpensesCards(result.expenses);
        }
        renderPagination(result.pagination);
    } else {
        showToast('Failed to load expenses', 'error');
    }
}

// Render Expenses Table
function renderExpensesTable(expenses) {
    const tbody = document.getElementById('expensesTableBody');
    if (!tbody) return;

    if (expenses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center" style="padding: 3rem;">
                    <p class="text-muted">No expenses found</p>
                    <a href="add-expense.html" class="btn btn-primary btn-sm mt-2">Add New Expense</a>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = expenses.map(expense => `
        <tr>
            <td data-label="Date">${formatDate(expense.date)}</td>
            <td data-label="Category">
                <span class="badge" style="background-color: ${expense.color}20; color: ${expense.color};">
                    ${expense.icon} ${expense.category_name}
                </span>
            </td>
            <td data-label="Amount"><strong>${formatCurrency(expense.amount)}</strong></td>
            <td data-label="Notes">${expense.notes || '<em class="text-muted">No notes</em>'}</td>
            <td data-label="Images">
                ${expense.image_count > 0 ? `<span class="badge badge-info">${expense.image_count} Images</span>` : '-'}
            </td>
            <td data-label="Actions">
                <div style="display: flex; gap: 0.5rem;">
                    <a href="view-expense.html?id=${expense.id}" class="btn btn-secondary btn-sm">View</a>
                    <a href="edit-expense.html?id=${expense.id}" class="btn btn-primary btn-sm">Edit</a>
                    <button class="btn btn-danger btn-sm" onclick="confirmDelete(${expense.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Render Expenses Cards
function renderExpensesCards(expenses) {
    const container = document.getElementById('expensesCardContainer');
    if (!container) return;

    if (expenses.length === 0) {
        container.innerHTML = `
            <div class="text-center" style="grid-column: 1 / -1; padding: 3rem;">
                <p class="text-muted">No expenses found</p>
                <a href="add-expense.html" class="btn btn-primary btn-sm mt-2">Add New Expense</a>
            </div>
        `;
        return;
    }

    container.innerHTML = expenses.map(expense => `
        <div class="card">
            <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <span class="badge" style="background-color: ${expense.color}20; color: ${expense.color};">
                        ${expense.icon} ${expense.category_name}
                    </span>
                </div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">
                    ${formatCurrency(expense.amount)}
                </div>
            </div>
            <div class="text-muted" style="font-size: 0.875rem; margin-bottom: 0.5rem;">
                ${formatDate(expense.date)}
            </div>
            <div style="margin-bottom: 1rem; color: var(--text-secondary);">
                ${expense.notes || '<em class="text-muted">No notes</em>'}
            </div>
            ${expense.image_count > 0 ? `<div class="badge badge-info" style="margin-bottom: 1rem;">${expense.image_count} Images</div>` : ''}
            <div style="display: flex; gap: 0.5rem;">
                <a href="view-expense.html?id=${expense.id}" class="btn btn-secondary btn-sm">View</a>
                <a href="edit-expense.html?id=${expense.id}" class="btn btn-primary btn-sm">Edit</a>
                <button class="btn btn-danger btn-sm" onclick="confirmDelete(${expense.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Render Pagination
function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    if (!container) return;

    const { current_page, total_pages } = pagination;

    let html = '';

    // Previous button
    html += `<button class="page-btn" ${current_page === 1 ? 'disabled' : ''} onclick="changePage(${current_page - 1})">← Prev</button>`;

    // Page numbers
    for (let i = 1; i <= total_pages; i++) {
        if (i === 1 || i === total_pages || (i >= current_page - 1 && i <= current_page + 1)) {
            html += `<button class="page-btn ${i === current_page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === current_page - 2 || i === current_page + 2) {
            html += `<span style="color: var(--text-muted);">...</span>`;
        }
    }

    // Next button
    html += `<button class="page-btn" ${current_page === total_pages ? 'disabled' : ''} onclick="changePage(${current_page + 1})">Next →</button>`;

    container.innerHTML = html;
}

// Change Page
function changePage(page) {
    currentPage = page;
    loadExpenses();
}

// Toggle View
document.getElementById('toggleView')?.addEventListener('click', () => {
    const tableView = document.getElementById('tableView');
    const cardView = document.getElementById('cardView');
    const toggleBtn = document.getElementById('toggleView');

    if (currentView === 'table') {
        currentView = 'card';
        tableView.classList.add('hidden');
        cardView.classList.remove('hidden');
        toggleBtn.textContent = '📋 Switch to Table';
    } else {
        currentView = 'table';
        cardView.classList.add('hidden');
        tableView.classList.remove('hidden');
        toggleBtn.textContent = '📋 Switch to Cards';
    }

    loadExpenses();
});

// Search and Filter
document.getElementById('searchInput')?.addEventListener('input', () => {
    currentPage = 1;
    loadExpenses();
});

document.getElementById('categoryFilter')?.addEventListener('change', () => {
    currentPage = 1;
    loadExpenses();
});

document.getElementById('startDate')?.addEventListener('change', () => {
    currentPage = 1;
    loadExpenses();
});

document.getElementById('endDate')?.addEventListener('change', () => {
    currentPage = 1;
    loadExpenses();
});

document.getElementById('sortBy')?.addEventListener('change', loadExpenses);
document.getElementById('sortOrder')?.addEventListener('change', loadExpenses);

// Delete Modal
let deleteExpenseId = null;

function confirmDelete(id) {
    deleteExpenseId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deleteExpenseId = null;
}

document.getElementById('confirmDeleteBtn')?.addEventListener('click', async () => {
    if (!deleteExpenseId) return;

    const result = await apiRequest(`${API_BASE}/expenses.php?id=${deleteExpenseId}`, {
        method: 'DELETE'
    });

    if (result.success) {
        showToast('Expense deleted successfully', 'success');
        closeDeleteModal();
        loadExpenses();
    } else {
        showToast(result.message || 'Failed to delete expense', 'error');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadExpenses();
});
