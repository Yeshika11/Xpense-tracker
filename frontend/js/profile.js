// Require authentication
requireAuth();

// Load Profile
async function loadProfile() {
    const result = await apiRequest(`${API_BASE}/profile.php`);

    if (result.success) {
        const user = result.user;
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;

        // Set profile picture
        const profilePicture = document.getElementById('profilePicture');
        if (user.profile_picture && user.profile_picture !== 'default-avatar.png') {
            profilePicture.src = `../uploads/profiles/${user.profile_picture}`;
        }
    } else {
        showToast('Failed to load profile', 'error');
    }
}

// Profile Picture Upload
document.getElementById('profilePictureInput')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('profile_picture', file);

    const result = await apiRequest(`${API_BASE}/profile.php?action=upload_picture`, {
        method: 'POST',
        body: formData
    });

    if (result.success) {
        showToast('Profile picture updated successfully', 'success');
        document.getElementById('profilePicture').src = `../uploads/profiles/${result.filename}`;
    } else {
        showToast(result.message || 'Failed to upload profile picture', 'error');
    }
});

// Save Profile Button
const saveProfileBtn = document.getElementById('saveProfileBtn');
if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async () => {
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();

        if (!username || !email) {
            showToast('Please fill in username and email', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        // Show loading on Save Changes button
        document.getElementById('profileSubmitText').classList.add('hidden');
        document.getElementById('profileSpinner').classList.remove('hidden');
        saveProfileBtn.disabled = true;

        const result = await apiRequest(`${API_BASE}/profile.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email })
        });

        document.getElementById('profileSubmitText').classList.remove('hidden');
        document.getElementById('profileSpinner').classList.add('hidden');
        saveProfileBtn.disabled = false;

        if (result.success) {
            showToast('Profile updated successfully', 'success');
        } else {
            showToast(result.message || 'Failed to update profile', 'error');
        }
    });
}

// Change Password Button
const changePasswordBtn = document.getElementById('changePasswordBtn');
if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', async () => {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showToast('Please fill in all password fields', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showToast('New password must be at least 6 characters', 'error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        // Show loading on Change Password button
        document.getElementById('passwordSubmitText').classList.add('hidden');
        document.getElementById('passwordSpinner').classList.remove('hidden');
        changePasswordBtn.disabled = true;

        const result = await apiRequest(`${API_BASE}/profile.php?action=change_password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });

        document.getElementById('passwordSubmitText').classList.remove('hidden');
        document.getElementById('passwordSpinner').classList.add('hidden');
        changePasswordBtn.disabled = false;

        if (result.success) {
            showToast('Password updated successfully', 'success');
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';
        } else {
            showToast(result.message || 'Failed to update password', 'error');
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', loadProfile);
