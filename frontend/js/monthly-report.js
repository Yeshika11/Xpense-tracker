// Require authentication
requireAuth();

let categoryChart = null;

// Populate year selector
function populateYears() {
    const select = document.getElementById('yearSelect');
    const currentYear = new Date().getFullYear();

    for (let i = currentYear; i >= currentYear - 5; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        select.appendChild(option);
    }
}

// Set current month
function setCurrentMonth() {
    const monthSelect = document.getElementById('monthSelect');
    const currentMonth = new Date().getMonth() + 1;
    monthSelect.value = currentMonth;
}

// Generate Report
async function generateReport() {
    const month = document.getElementById('monthSelect').value;
    const year = document.getElementById('yearSelect').value;

    const loader = document.getElementById('reportLoader');
    const content = document.getElementById('reportContent');
    const noData = document.getElementById('noDataMessage');

    loader.classList.remove('hidden');
    content.classList.add('hidden');
    noData.classList.add('hidden');

    const result = await apiRequest(`${API_BASE}/expenses.php?action=monthly_report&year=${year}&month=${month}`);

    loader.classList.add('hidden');

    if (result.success && result.report) {
        const report = result.report;

        if (report.breakdown.length === 0) {
            noData.classList.remove('hidden');
            return;
        }

        // Update total
        document.getElementById('reportTotal').textContent = formatCurrency(report.total || 0);

        // Render chart
        renderCategoryChart(report.breakdown);

        // Render breakdown
        renderCategoryBreakdown(report.breakdown);

        content.classList.remove('hidden');
    } else {
        showToast('Failed to generate report', 'error');
    }
}

// Render Category Chart
function renderCategoryChart(breakdown) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    // Destroy existing chart
    if (categoryChart) {
        categoryChart.destroy();
    }

    const labels = breakdown.map(item => item.category);
    const data = breakdown.map(item => parseFloat(item.total));
    const colors = breakdown.map(item => item.color);

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.map(color => color + '80'),
                borderColor: colors,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#F1F5F9',
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = formatCurrency(context.parsed);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Render Category Breakdown
function renderCategoryBreakdown(breakdown) {
    const container = document.getElementById('categoryBreakdown');
    if (!container) return;

    const total = breakdown.reduce((sum, item) => sum + parseFloat(item.total), 0);

    container.innerHTML = breakdown.map(item => {
        const percentage = ((parseFloat(item.total) / total) * 100).toFixed(1);
        return `
            <div style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--card-border);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-weight: 500;">
                        <span style="color: ${item.color}; margin-right: 0.5rem;">${item.category}</span>
                    </span>
                    <span style="font-weight: 600; color: var(--text-primary);">
                        ${formatCurrency(item.total)}
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                    <span>${item.count} transaction${item.count !== '1' ? 's' : ''}</span>
                    <span>${percentage}%</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); overflow: hidden;">
                    <div style="width: ${percentage}%; height: 100%; background: ${item.color}; transition: width 0.3s ease;"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Event Listeners
document.getElementById('generateReport')?.addEventListener('click', generateReport);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    populateYears();
    setCurrentMonth();
    generateReport();
});
