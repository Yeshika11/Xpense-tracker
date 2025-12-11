// API Base URL
const API_BASE = '../backend/api';

// Toast Notification System
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// API Request Wrapper
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
                ...(options.headers || {}),
            }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

// Check Session
async function checkSession() {
    const result = await apiRequest(`${API_BASE}/auth.php?action=check`);
    return result.logged_in;
}

// Redirect if not logged in
async function requireAuth() {
    const isLoggedIn = await checkSession();
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Redirect if logged in (for auth pages)
async function redirectIfAuth() {
    const isLoggedIn = await checkSession();
    if (isLoggedIn) {
        window.location.href = 'dashboard.html';
        return true;
    }
    return false;
}

// Logout
async function logout() {
    const result = await apiRequest(`${API_BASE}/auth.php?action=logout`, {
        method: 'POST'
    });

    if (result.success) {
        window.location.href = 'login.html';
    }
}

// Theme Management
function initializeTheme() {
    // Check localStorage first, then system preference, default to dark
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    setTheme(theme);
}

function setTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);

    // Update toggle button if it exists
    updateThemeToggle(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function updateThemeToggle(theme) {
    const toggleSlider = document.querySelector('.theme-toggle-slider');
    if (toggleSlider) {
        // Remove emoji, just use the slider position to indicate theme
        toggleSlider.innerHTML = '';
    }
}

// Initialize theme on load
initializeTheme();

// Update Navbar User Profile
async function updateNavbarProfile() {
    const userResult = await apiRequest(`${API_BASE}/auth.php?action=check`);
    if (userResult.logged_in && userResult.user) {
        const username = userResult.user.username;

        // Update navbar username
        const navUserName = document.getElementById('navUserName');
        if (navUserName) {
            navUserName.textContent = username;
        }

        // Update avatar with first letter of username
        const navUserAvatar = document.getElementById('navUserAvatar');
        if (navUserAvatar) {
            navUserAvatar.textContent = username.charAt(0).toUpperCase();
        }
    }
}

// Add logout handler to all pages
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Add theme toggle handler
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Update navbar user profile
    updateNavbarProfile();
});

// Password Visibility Toggle
function togglePasswordVisibility(fieldId, iconElement) {
    const field = document.getElementById(fieldId);
    const eyeOpenSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path fill-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clip-rule="evenodd" />
    </svg>`;
    const eyeClosedSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
        <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z" />
        <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z" />
    </svg>`;

    if (field.type === 'password') {
        field.type = 'text';
        iconElement.innerHTML = eyeClosedSVG;
    } else {
        field.type = 'password';
        iconElement.innerHTML = eyeOpenSVG;
    }
}

// Date Formatting
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Currency Formatting
function formatCurrency(amount) {
    const formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
    return 'Rs. ' + formatted;
}

// Image Preview Handler
function handleImagePreview(input, previewContainer) {
    const files = Array.from(input.files);
    previewContainer.innerHTML = '';

    files.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" class="preview-remove" onclick="removePreviewImage(${index}, '${input.id}', '${previewContainer.id}')">×</button>
                `;
                previewContainer.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Remove preview image
function removePreviewImage(index, inputId, containerId) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);

    const dt = new DataTransfer();
    const files = Array.from(input.files);

    files.forEach((file, i) => {
        if (i !== index) {
            dt.items.add(file);
        }
    });

    input.files = dt.files;
    handleImagePreview(input, container);
}

// Get URL Parameter
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Loading State
function setLoading(buttonId, textElementId, spinnerElementId, isLoading) {
    const textElement = document.getElementById(textElementId);
    const spinnerElement = document.getElementById(spinnerElementId);
    const button = document.getElementById(buttonId);

    if (isLoading) {
        textElement.classList.add('hidden');
        spinnerElement.classList.remove('hidden');
        button.disabled = true;
    } else {
        textElement.classList.remove('hidden');
        spinnerElement.classList.add('hidden');
        button.disabled = false;
    }
}
