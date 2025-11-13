// Admin panel functionality

let adminData = null;

document.addEventListener('DOMContentLoaded', async function() {
  // Check authentication
  if (!isAdminAuthenticated()) {
    window.location.href = 'prank.html';
    return;
  }
  
  // Load admin data
  await loadAdminData();
  
  // Setup attendance toggle
  setupAttendanceToggle();
  
  // Setup forms
  setupAddStudentForm();
  setupBulkAddForm();
  
  // Setup action buttons
  setupActionButtons();
});

// Load all admin data
async function loadAdminData() {
  try {
    const data = await apiRequest(API.ADMIN_GET_DATA);
    
    if (data.success) {
      adminData = data;
      updateDashboard();
    }
  } catch (error) {
    console.error('Error loading admin data:', error);
    showAlert('Failed to load admin data', 'error');
  }
}

// Update dashboard with data
function updateDashboard() {
  if (!adminData) return;
  
  // Update statistics
  document.getElementById('totalStudents').textContent = adminData.students.length;
  
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = adminData.attendance.filter(a => a.date === today);
  document.getElementById('todayAttendance').textContent = todayAttendance.length;
  
  // Update attendance toggle
  const toggle = document.getElementById('attendanceToggle');
  const label = document.getElementById('toggleLabel');
  if (toggle && label) {
    toggle.checked = adminData.settings.attendanceEnabled;
    label.textContent = `Attendance: ${adminData.settings.attendanceEnabled ? 'ON' : 'OFF'}`;
  }
  
  // Update students table
  updateStudentsTable();
  
  // Update attendance table
  updateAttendanceTable();
  
  // Update blacklist table
  updateBlacklistTable();
}

// Update students table
function updateStudentsTable() {
  const tbody = document.getElementById('studentsTable');
  
  if (!adminData || adminData.students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-secondary);">No students found</td></tr>';
    return;
  }
  
  tbody.innerHTML = adminData.students.map(student => {
    const isProtected = PROTECTED_STUDENTS.includes(student.indexNumber);
    
    return `
      <tr>
        <td>${student.name}</td>
        <td>${student.indexNumber}</td>
        <td>
          ${!isProtected ? `
            <button class="btn btn-danger" style="padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="deleteStudent('${student.indexNumber}')">
              Delete
            </button>
            <button class="btn btn-warning" style="padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="blacklistStudent('${student.indexNumber}')">
              Blacklist
            </button>
          ` : '<span style="color: var(--warning);">Protected</span>'}
        </td>
      </tr>
    `;
  }).join('');
}

// Update attendance table
function updateAttendanceTable() {
  const tbody = document.getElementById('attendanceTable');
  
  if (!adminData) return;
  
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = adminData.attendance.filter(a => a.date === today);
  
  if (todayAttendance.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-secondary);">No attendance records for today</td></tr>';
    return;
  }
  
  tbody.innerHTML = todayAttendance.map(record => `
    <tr>
      <td>${record.studentName}</td>
      <td>${record.indexNumber}</td>
      <td>${formatTime(record.timestamp)}</td>
      <td style="font-size: 0.75rem; color: var(--text-muted);">${record.deviceId.substring(0, 12)}...</td>
    </tr>
  `).join('');
}

// Update blacklist table
function updateBlacklistTable() {
  const tbody = document.getElementById('blacklistTable');
  
  if (!adminData || adminData.blacklist.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-secondary);">No blacklisted students</td></tr>';
    return;
  }
  
  tbody.innerHTML = adminData.blacklist.map(entry => `
    <tr>
      <td>${entry.studentId}</td>
      <td>${formatDate(entry.addedAt)}</td>
      <td>
        <button class="btn btn-success" style="padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="unblacklistStudent('${entry.studentId}')">
          Remove
        </button>
      </td>
    </tr>
  `).join('');
}

// Setup attendance toggle
function setupAttendanceToggle() {
  const toggle = document.getElementById('attendanceToggle');
  const label = document.getElementById('toggleLabel');
  
  if (!toggle || !label) return;
  
  toggle.addEventListener('change', async function() {
    try {
      const data = await apiRequest(API.ADMIN_TOGGLE_ATTENDANCE, {
        method: 'POST',
        body: JSON.stringify({ enabled: this.checked })
      });
      
      if (data.success) {
        label.textContent = `Attendance: ${this.checked ? 'ON' : 'OFF'}`;
        showAlert(`Attendance ${this.checked ? 'enabled' : 'disabled'} successfully`, 'success');
        await loadAdminData();
      } else {
        this.checked = !this.checked;
        showAlert('Failed to toggle attendance', 'error');
      }
    } catch (error) {
      this.checked = !this.checked;
      showAlert('Error: ' + error.message, 'error');
    }
  });
}

// Setup add student form
function setupAddStudentForm() {
  const form = document.getElementById('addStudentForm');
  
  if (!form) return;
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('studentName').value.trim();
    const indexNumber = document.getElementById('studentIndex').value.trim();
    
    if (!name || !indexNumber) {
      showAlert('Please fill in all fields', 'error');
      return;
    }
    
    try {
      const data = await apiRequest(API.ADMIN_ADD_STUDENT, {
        method: 'POST',
        body: JSON.stringify({ name, indexNumber })
      });
      
      if (data.success) {
        showAlert('Student added successfully', 'success');
        form.reset();
        await loadAdminData();
      } else {
        showAlert('Failed to add student', 'error');
      }
    } catch (error) {
      showAlert('Error: ' + error.message, 'error');
    }
  });
}

// Setup bulk add form
function setupBulkAddForm() {
  const btn = document.getElementById('bulkAddBtn');
  
  if (!btn) return;
  
  btn.addEventListener('click', async function() {
    const textarea = document.getElementById('bulkStudents');
    const text = textarea.value.trim();
    
    if (!text) {
      showAlert('Please enter student data', 'error');
      return;
    }
    
    const lines = text.split('\n').filter(line => line.trim());
    const students = [];
    
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        students.push({
          name: parts[0],
          indexNumber: parts[1]
        });
      }
    }
    
    if (students.length === 0) {
      showAlert('No valid student data found', 'error');
      return;
    }
    
    try {
      const data = await apiRequest(API.ADMIN_BULK_ADD, {
        method: 'POST',
        body: JSON.stringify({ students })
      });
      
      if (data.success) {
        showAlert(`${data.added} students added successfully`, 'success');
        textarea.value = '';
        await loadAdminData();
      } else {
        showAlert('Failed to add students', 'error');
      }
    } catch (error) {
      showAlert('Error: ' + error.message, 'error');
    }
  });
}

// Setup action buttons
function setupActionButtons() {
  // Refresh button
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadAdminData);
  }
  
  // Clear attendance button
  const clearBtn = document.getElementById('clearAttendanceBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', async function() {
      if (!confirm('Are you sure you want to clear all attendance records? This cannot be undone!')) {
        return;
      }
      
      try {
        const data = await apiRequest(API.ADMIN_CLEAR_ATTENDANCE, {
          method: 'POST'
        });
        
        if (data.success) {
          showAlert('Attendance records cleared successfully', 'success');
          await loadAdminData();
        } else {
          showAlert('Failed to clear attendance', 'error');
        }
      } catch (error) {
        showAlert('Error: ' + error.message, 'error');
      }
    });
  }
}

// Delete student
async function deleteStudent(studentId) {
  if (!confirm('Are you sure you want to delete this student?')) {
    return;
  }
  
  try {
    const data = await apiRequest(API.ADMIN_DELETE_STUDENT, {
      method: 'POST',
      body: JSON.stringify({ studentId })
    });
    
    if (data.success) {
      showAlert('Student deleted successfully', 'success');
      await loadAdminData();
    } else {
      showAlert(data.message || 'Failed to delete student', 'error');
    }
  } catch (error) {
    showAlert('Error: ' + error.message, 'error');
  }
}

// Blacklist student
async function blacklistStudent(studentId) {
  if (!confirm('Are you sure you want to blacklist this student?')) {
    return;
  }
  
  try {
    const data = await apiRequest(API.ADMIN_BLACKLIST, {
      method: 'POST',
      body: JSON.stringify({ 
        studentId,
        duration: 'indefinite'
      })
    });
    
    if (data.success) {
      showAlert('Student blacklisted successfully', 'success');
      await loadAdminData();
    } else {
      showAlert(data.message || 'Failed to blacklist student', 'error');
    }
  } catch (error) {
    showAlert('Error: ' + error.message, 'error');
  }
}

// Unblacklist student
async function unblacklistStudent(studentId) {
  if (!confirm('Are you sure you want to remove this student from the blacklist?')) {
    return;
  }
  
  try {
    const data = await apiRequest(API.ADMIN_UNBLACKLIST, {
      method: 'POST',
      body: JSON.stringify({ studentId })
    });
    
    if (data.success) {
      showAlert('Student removed from blacklist', 'success');
      await loadAdminData();
    } else {
      showAlert('Failed to remove from blacklist', 'error');
    }
  } catch (error) {
    showAlert('Error: ' + error.message, 'error');
  }
}
