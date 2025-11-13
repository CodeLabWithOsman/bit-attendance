// Attendance page functionality

let allStudents = [];
let selectedStudent = null;

document.addEventListener('DOMContentLoaded', async function() {
  // Start time update
  startTimeUpdate();
  
  // Load students
  await loadStudents();
  
  // Setup search
  setupSearch();
  
  // Setup form submission
  setupAttendanceForm();
});

// Load all students
async function loadStudents() {
  try {
    const data = await apiRequest(API.GET_STUDENTS);
    
    if (data.success) {
      allStudents = data.students;
    }
  } catch (error) {
    console.error('Error loading students:', error);
    showAlert('Failed to load students. Please refresh the page.', 'error');
  }
}

// Setup search functionality
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const suggestionsList = document.getElementById('suggestionsList');
  
  if (!searchInput || !suggestionsList) return;
  
  searchInput.addEventListener('input', function() {
    const query = this.value.trim().toLowerCase();
    
    if (query.length < 2) {
      suggestionsList.style.display = 'none';
      return;
    }
    
    const matches = allStudents.filter(student => 
      student.name.toLowerCase().includes(query) ||
      student.indexNumber.includes(query)
    );
    
    if (matches.length === 0) {
      suggestionsList.style.display = 'none';
      return;
    }
    
    suggestionsList.innerHTML = matches.slice(0, 5).map(student => `
      <div class="suggestion-item" data-id="${student.indexNumber}">
        <div class="suggestion-name">${student.name}</div>
        <div class="suggestion-index">${student.indexNumber}</div>
      </div>
    `).join('');
    
    suggestionsList.style.display = 'block';
    
    // Add click listeners
    document.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', function() {
        const studentId = this.dataset.id;
        selectStudent(studentId);
      });
    });
  });
  
  // Close suggestions when clicking outside
  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
      suggestionsList.style.display = 'none';
    }
  });
}

// Select a student
function selectStudent(studentId) {
  const student = allStudents.find(s => s.indexNumber === studentId);
  
  if (!student) return;
  
  selectedStudent = student;
  
  const searchInput = document.getElementById('searchInput');
  const suggestionsList = document.getElementById('suggestionsList');
  const pinContainer = document.getElementById('pinContainer');
  const selectedInfo = document.getElementById('selectedStudentInfo');
  const pinHint = document.getElementById('pinHint');
  
  if (searchInput) searchInput.value = student.name;
  if (suggestionsList) suggestionsList.style.display = 'none';
  
  if (pinContainer) {
    pinContainer.style.display = 'block';
  }
  
  if (selectedInfo) {
    selectedInfo.innerHTML = `
      <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
        <div style="font-weight: 600; color: var(--text-primary);">${student.name}</div>
        <div style="color: var(--text-secondary); font-size: 0.875rem;">${student.indexNumber}</div>
      </div>
    `;
  }
  
  if (pinHint) {
    pinHint.textContent = 'Enter the last 5 digits of your index number';
  }
}

// Setup attendance form
function setupAttendanceForm() {
  const form = document.getElementById('attendanceForm');
  
  if (!form) return;
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!selectedStudent) {
      showAlert('Please select a student first', 'error');
      return;
    }
    
    const pinInput = document.getElementById('pinInput');
    const pin = pinInput.value.trim();
    
    if (!pin) {
      showAlert('Please enter your PIN', 'error');
      return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading"></span> Verifying...';
      
      // Verify PIN
      const verifyData = await apiRequest(API.VERIFY_PIN, {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudent.indexNumber,
          pin: pin,
          pinType: 'index'
        })
      });
      
      if (!verifyData.success) {
        if (verifyData.blacklisted) {
          showAlert('You have been blacklisted. Contact the administrator.', 'error', 10000);
        } else {
          showAlert(verifyData.message || 'Invalid PIN. Please try again.', 'error');
        }
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        return;
      }
      
      // Mark attendance
      submitBtn.innerHTML = '<span class="loading"></span> Marking attendance...';
      
      const deviceId = generateDeviceId();
      const ipInfo = await getIpInfo();
      
      const attendanceData = await apiRequest(API.MARK_ATTENDANCE, {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudent.indexNumber,
          studentName: selectedStudent.name,
          indexNumber: selectedStudent.indexNumber,
          deviceId: deviceId,
          ipInfo: ipInfo
        })
      });
      
      if (attendanceData.success) {
        showAlert('Attendance marked successfully!', 'success');
        
        // Reset form
        form.reset();
        selectedStudent = null;
        document.getElementById('pinContainer').style.display = 'none';
        document.getElementById('selectedStudentInfo').innerHTML = '';
        
      } else if (attendanceData.fraud) {
        // Fraud detected
        const message = attendanceData.message || 'Fraud attempt detected!';
        showAlert(message, 'error', 15000);
        
        if (attendanceData.blacklisted) {
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 15000);
        }
      } else if (attendanceData.alreadyMarked) {
        showAlert('You have already marked attendance for today.', 'warning');
      } else {
        showAlert(attendanceData.message || 'Failed to mark attendance', 'error');
      }
      
    } catch (error) {
      console.error('Error:', error);
      showAlert('An error occurred. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}
