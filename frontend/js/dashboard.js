// Require authentication
requireAuth();

let trendChart = null;

// Load Dashboard Data
async function loadDashboard() {
    const result = await apiRequest(`${API_BASE}/expenses.php?action=dashboard`);

    if (result.success) {
        const stats = result.stats;

        // Update user name
        const userResult = await apiRequest(`${API_BASE}/auth.php?action=check`);
        if (userResult.logged_in) {
            document.getElementById('userName').textContent = userResult.user.username;
        }

        // Update stat cards
        document.getElementById('totalExpenses').textContent = formatCurrency(stats.total_expenses || 0);
        document.getElementById('monthlyExpenses').textContent = formatCurrency(stats.monthly_expenses || 0);
        document.getElementById('expenseCount').textContent = stats.expense_count || 0;

        if (stats.top_category) {
            document.getElementById('topCategory').textContent = stats.top_category.name;
        }

        // Render trend chart
        renderTrendChart(stats.monthly_trend || []);

        // Render recent expenses
        renderRecentExpenses(stats.recent_expenses || []);
    } else {
        showToast('Failed to load dashboard data', 'error');
    }
}

// Render Trend Chart
function renderTrendChart(data) {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    // Destroy existing chart
    if (trendChart) {
        trendChart.destroy();
    }

    const labels = data.map(item => {
        const [year, month] = item.month.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    });

    const values = data.map(item => parseFloat(item.total));

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Expenses',
                data: values,
                borderColor: '#6366F1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#F1F5F9' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 30000,
                    ticks: {
                        color: '#94A3B8',
                        stepSize: 2000,
                        callback: function (value) {
                            return 'Rs. ' + value.toLocaleString('en-IN');
                        }
                    },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    ticks: { color: '#94A3B8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}

// Render Recent Expenses
function renderRecentExpenses(expenses) {
    const container = document.getElementById('recentExpenses');
    const addButton = document.getElementById('addExpenseBtn');
    if (!container) return;

    if (expenses.length === 0) {
        // Hide the Add New button when there are no expenses
        if (addButton) addButton.style.display = 'none';

        container.innerHTML = `
            <div class="text-center text-muted" style="padding: 2rem;">
                <p>No expenses yet</p>
                <a href="add-expense.html" class="btn btn-primary btn-sm mt-2">Add New</a>
            </div>
        `;
        return;
    }

    // Show the Add New button when there are expenses
    if (addButton) addButton.style.display = 'block';

    container.innerHTML = expenses.map(expense => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--card-border);">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div>
                    <div style="font-weight: 500;">${expense.category_name}</div>
                    <div class="text-muted" style="font-size: 0.875rem;">${formatDate(expense.date)}</div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 600; color: var(--text-primary);">${formatCurrency(expense.amount)}</div>
                <div class="text-muted" style="font-size: 0.75rem;">${expense.notes ? expense.notes.substring(0, 20) + '...' : 'No notes'}</div>
            </div>
        </div>
    `).join('');
}

// Load dashboard on page load
document.addEventListener('DOMContentLoaded', loadDashboard);
