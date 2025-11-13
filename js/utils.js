// Utility Functions

// Generate device fingerprint
function generateDeviceId() {
  const stored = localStorage.getItem('deviceId');
  if (stored) return stored;
  
  const id = 'device_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  localStorage.setItem('deviceId', id);
  return id;
}

// Get IP info (simplified - actual IP will be captured by worker)
async function getIpInfo() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format time
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Show alert
function showAlert(message, type = 'success', duration = 5000) {
  const alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) return;
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  
  const icon = document.createElement('div');
  icon.className = 'alert-icon';
  
  if (type === 'success') {
    icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  } else if (type === 'error') {
    icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  } else if (type === 'warning') {
    icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
  }
  
  const content = document.createElement('div');
  content.className = 'alert-content';
  content.innerHTML = `<div class="alert-message">${message}</div>`;
  
  alert.appendChild(icon);
  alert.appendChild(content);
  alertContainer.appendChild(alert);
  
  setTimeout(() => {
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 300);
  }, duration);
}

// API request helper
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Network error. Please check your connection.');
  }
}

// Update current time
function updateTime() {
  const timeElement = document.getElementById('currentTime');
  if (!timeElement) return;
  
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  timeElement.textContent = timeString;
}

// Start time update interval
function startTimeUpdate() {
  updateTime();
  setInterval(updateTime, 1000);
}

// Check if admin authenticated
function isAdminAuthenticated() {
  return sessionStorage.getItem('adminAuth') === 'true';
}

// Set admin authentication
function setAdminAuth(value) {
  if (value) {
    sessionStorage.setItem('adminAuth', 'true');
  } else {
    sessionStorage.removeItem('adminAuth');
  }
}

// Logout admin
function logoutAdmin() {
  setAdminAuth(false);
  window.location.href = 'index.html';
}
