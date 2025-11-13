// Home page functionality

document.addEventListener('DOMContentLoaded', async function() {
  // Start time update
  startTimeUpdate();
  
  // Fetch and display stats
  await fetchStats();
  
  // Check for admin secret code in URL
  const urlParams = new URLSearchParams(window.location.search);
  const secret = urlParams.get('key');
  
  if (secret === ADMIN_PATH) {
    // Show admin login prompt
    showAdminLogin();
  }
});

// Fetch attendance stats
async function fetchStats() {
  try {
    const data = await apiRequest(API.GET_STATS);
    
    if (data.success && data.attendanceStarted) {
      const statsCard = document.getElementById('statsCard');
      const statsNumber = document.getElementById('statsNumber');
      const statsPercentage = document.getElementById('statsPercentage');
      
      if (statsCard && statsNumber && statsPercentage) {
        const percentage = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
        
        statsNumber.textContent = `${data.present} / ${data.total}`;
        statsPercentage.textContent = `${percentage}% Present`;
        statsCard.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

// Show admin login modal
function showAdminLogin() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 2rem;
      max-width: 400px;
      width: 90%;
    ">
      <h2 style="margin-bottom: 1rem; color: var(--text-primary);">Admin Access</h2>
      <input 
        type="password" 
        id="adminPinInput" 
        placeholder="Enter PIN code"
        style="
          width: 100%;
          padding: 1rem;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 10px;
          color: var(--text-primary);
          font-size: 1rem;
          margin-bottom: 1rem;
        "
      >
      <div style="display: flex; gap: 1rem;">
        <button id="adminLoginBtn" class="btn btn-primary" style="flex: 1;">Login</button>
        <button id="adminCancelBtn" class="btn btn-outline" style="flex: 1;">Cancel</button>
      </div>
      <div id="adminLoginError" style="
        color: var(--error);
        margin-top: 1rem;
        font-size: 0.875rem;
        display: none;
      "></div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const pinInput = document.getElementById('adminPinInput');
  const loginBtn = document.getElementById('adminLoginBtn');
  const cancelBtn = document.getElementById('adminCancelBtn');
  const errorDiv = document.getElementById('adminLoginError');
  
  loginBtn.addEventListener('click', async () => {
    const pin = pinInput.value.trim();
    
    if (!pin) {
      errorDiv.textContent = 'Please enter PIN code';
      errorDiv.style.display = 'block';
      return;
    }
    
    try {
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<span class="loading"></span>';
      
      const data = await apiRequest(API.ADMIN_LOGIN, {
        method: 'POST',
        body: JSON.stringify({ pincode: pin })
      });
      
      if (data.success) {
        setAdminAuth(true);
        window.location.href = `${ADMIN_PATH}.html`;
      } else {
        errorDiv.textContent = 'Invalid PIN code';
        errorDiv.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
      }
    } catch (error) {
      errorDiv.textContent = 'Error: ' + error.message;
      errorDiv.style.display = 'block';
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
    }
  });
  
  cancelBtn.addEventListener('click', () => {
    modal.remove();
    window.history.replaceState({}, '', window.location.pathname);
  });
  
  pinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loginBtn.click();
    }
  });
  
  pinInput.focus();
}
