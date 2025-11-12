// Cloudflare Worker Backend for BIT GROUP C Attendance System
// Deploy at: https://every.pupujiger.workers.dev/

const ADMIN_PINCODE = 'PINCODE';
const PROTECTED_SECRET_KEY = 'kissmeifyoucan';

// Protected students - cannot be deleted, edited, or blacklisted
const PROTECTED_STUDENTS = ['1686468923', '1685397148', '1700493421'];

// Course reps contact info
const COURSE_REPS = [
  { name: 'Myles', phone: '0500776941' },
  { name: 'Dhonzy', phone: '0245222358' }
];

// GCTU Campus coordinates (approximate)
const CAMPUS_LOCATION = {
  latitude: 5.6513,
  longitude: -0.0646,
  radiusMeters: 500 // 500 meters radius
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper: Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Helper: Check if location is within campus
function isWithinCampus(lat, lon, strictMode) {
  if (!strictMode) return true;
  const distance = calculateDistance(
    lat,
    lon,
    CAMPUS_LOCATION.latitude,
    CAMPUS_LOCATION.longitude
  );
  return distance <= CAMPUS_LOCATION.radiusMeters;
}

// Helper: Generate device fingerprint hash
function hashDeviceId(ip, deviceId, date) {
  const data = `${ip}-${deviceId}-${date}`;
  return btoa(data);
}

// Helper: Check if student is protected
function isProtected(index) {
  return PROTECTED_STUDENTS.includes(index);
}

// Helper: Log activity
async function logActivity(env, action, details) {
  const logs = (await env.ATTENDANCE_KV.get('activity_logs', { type: 'json' })) || [];
  logs.push({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action,
    details,
  });
  await env.ATTENDANCE_KV.put('activity_logs', JSON.stringify(logs));
}

// API Handlers

async function handleGetStats(env) {
  const students = (await env.ATTENDANCE_KV.get('students', { type: 'json' })) || [];
  const attendance = (await env.ATTENDANCE_KV.get('attendance', { type: 'json' })) || [];
  const attendanceEnabled =
    (await env.ATTENDANCE_KV.get('attendance_enabled')) === 'true';

  const today = new Date().toISOString().split('T')[0];
  const presentToday = attendance.filter((a) => a.date === today).length;

  // Always include protected students in count
  const protectedCount = PROTECTED_STUDENTS.length;

  return {
    success: true,
    total: students.length,
    present: Math.max(presentToday, protectedCount),
    attendanceEnabled,
  };
}

async function handleSearchStudent(env, request) {
  const { query } = await request.json();
  const students = (await env.ATTENDANCE_KV.get('students', { type: 'json' })) || [];

  const isIndexSearch = /^\d+$/.test(query);
  const results = students
    .filter((s) => {
      if (isIndexSearch) {
        return s.index.includes(query);
      } else {
        return s.name.toLowerCase().includes(query.toLowerCase());
      }
    })
    .slice(0, 10)
    .map((s) => ({
      displayValue: isIndexSearch ? s.index : s.name,
      searchType: isIndexSearch ? 'index' : 'name',
      studentData: s,
    }));

  return { success: true, results };
}

async function handleVerifyStudent(env, request) {
  const { student, pin, deviceId, latitude, longitude } = await request.json();
  const clientIP = request.headers.get('CF-Connecting-IP');
  const today = new Date().toISOString().split('T')[0];

  // Check if it's a protected student with secret key
  if (pin === PROTECTED_SECRET_KEY) {
    return {
      success: true,
      isProtected: true,
      message: 'Welcome, protected student. You have unlimited access.',
    };
  }

  // Check if attendance is enabled
  const attendanceEnabled =
    (await env.ATTENDANCE_KV.get('attendance_enabled')) === 'true';
  if (!attendanceEnabled) {
    return {
      success: false,
      message: 'Go and sit down, it\'s not time for attendance taking.',
    };
  }

  // Check blacklist
  const blacklist = (await env.ATTENDANCE_KV.get('blacklist', { type: 'json' })) || [];
  const blacklistEntry = blacklist.find((b) => b.index === student.index);
  
  if (blacklistEntry && blacklistEntry.status === 'active') {
    const expiryDate = blacklistEntry.expiryDate;
    if (expiryDate === 'indefinite' || new Date(expiryDate) > new Date()) {
      return {
        success: false,
        blacklisted: true,
        message: `You have been blacklisted for violating the rules. ${
          blacklistEntry.reason || ''
        }`,
        contactInfo: COURSE_REPS,
      };
    }
  }

  // Check strict mode (location verification)
  const strictMode = (await env.ATTENDANCE_KV.get('strict_mode')) === 'true';
  if (strictMode && latitude && longitude) {
    if (!isWithinCampus(latitude, longitude, strictMode)) {
      return {
        success: false,
        message:
          'You are not within campus premises. Please contact the admin or course rep to mark your attendance.',
        contactInfo: COURSE_REPS,
      };
    }
  }

  // Verify PIN
  let pinValid = false;
  if (student.searchType === 'index') {
    // User searched by index, ask for last name
    const lastName = student.studentData.name.split(' ').pop();
    pinValid = lastName.toLowerCase() === pin.toLowerCase();
  } else {
    // User searched by name, ask for last 5 digits of index
    pinValid = student.studentData.index.slice(-5) === pin;
  }

  if (!pinValid) {
    // Track fraud attempts
    const fraudAttempts =
      (await env.ATTENDANCE_KV.get('fraud_attempts', { type: 'json' })) || [];
    const recentAttempts = fraudAttempts.filter(
      (f) => f.deviceId === deviceId && f.date === today
    );

    if (recentAttempts.length >= 2) {
      // Third strike - blacklist
      blacklist.push({
        id: crypto.randomUUID(),
        name: student.studentData.name,
        index: student.studentData.index,
        reason: 'Multiple fraud attempts',
        date: today,
        expiryDate: 'indefinite',
        status: 'active',
      });
      await env.ATTENDANCE_KV.put('blacklist', JSON.stringify(blacklist));

      // Void any attendance for today
      const attendance =
        (await env.ATTENDANCE_KV.get('attendance', { type: 'json' })) || [];
      const filtered = attendance.filter(
        (a) => !(a.index === student.studentData.index && a.date === today)
      );
      await env.ATTENDANCE_KV.put('attendance', JSON.stringify(filtered));

      await logActivity(env, 'FRAUD_BLACKLIST', {
        student: student.studentData,
        ip: clientIP,
      });

      return {
        success: false,
        blacklisted: true,
        message:
          'You have been blacklisted for multiple fraud attempts. Your attendance has been voided.',
      };
    }

    // Log attempt
    fraudAttempts.push({
      id: crypto.randomUUID(),
      deviceId,
      ip: clientIP,
      student: student.studentData,
      date: today,
      timestamp: new Date().toISOString(),
    });
    await env.ATTENDANCE_KV.put('fraud_attempts', JSON.stringify(fraudAttempts));

    return {
      success: false,
      strikes: recentAttempts.length + 1,
      message:
        recentAttempts.length === 0
          ? 'Invalid PIN. One more attempt and you will be warned.'
          : 'Wrong again! One more attempt and you will be blacklisted.',
    };
  }

  return { success: true };
}

async function handleMarkAttendance(env, request) {
  const { student, deviceId, isProtected: protectedFlag } = await request.json();
  const clientIP = request.headers.get('CF-Connecting-IP');
  const today = new Date().toISOString().split('T')[0];
  const deviceHash = hashDeviceId(clientIP, deviceId, today);

  const attendance = (await env.ATTENDANCE_KV.get('attendance', { type: 'json' })) || [];
  const ipLog = (await env.ATTENDANCE_KV.get('ip_device_log', { type: 'json' })) || [];

  // Protected students can mark unlimited times
  if (!protectedFlag && !isProtected(student.index)) {
    // Check if already marked today
    const alreadyMarked = attendance.some(
      (a) => a.index === student.index && a.date === today
    );
    if (alreadyMarked) {
      return {
        success: false,
        message: 'You have already marked attendance today.',
      };
    }

    // Check if device/IP already used today
    const deviceUsed = ipLog.some((log) => log.deviceHash === deviceHash);
    if (deviceUsed) {
      return {
        success: false,
        message: 'This device has already been used to mark attendance today.',
      };
    }
  }

  // Mark attendance
  attendance.push({
    id: crypto.randomUUID(),
    name: student.name,
    index: student.index,
    date: today,
    timestamp: new Date().toISOString(),
    ip: clientIP,
    deviceHash,
  });

  ipLog.push({
    deviceHash,
    ip: clientIP,
    studentIndex: student.index,
    date: today,
    timestamp: new Date().toISOString(),
  });

  await env.ATTENDANCE_KV.put('attendance', JSON.stringify(attendance));
  await env.ATTENDANCE_KV.put('ip_device_log', JSON.stringify(ipLog));
  await logActivity(env, 'ATTENDANCE_MARKED', { student, ip: clientIP });

  return { success: true };
}

async function handleAdminLogin(env, request) {
  const { pincode } = await request.json();
  const clientIP = request.headers.get('CF-Connecting-IP');

  if (pincode !== ADMIN_PINCODE) {
    return { success: false, message: 'Invalid PINCODE' };
  }

  // Create session token
  const sessionToken = crypto.randomUUID();
  const sessions = (await env.ATTENDANCE_KV.get('admin_sessions', { type: 'json' })) || [];

  sessions.push({
    token: sessionToken,
    ip: clientIP,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
  });

  await env.ATTENDANCE_KV.put('admin_sessions', JSON.stringify(sessions));
  await logActivity(env, 'ADMIN_LOGIN', { ip: clientIP });

  return { success: true, sessionToken };
}

async function verifyAdminSession(env, request) {
  const sessionToken = request.headers.get('Authorization');
  if (!sessionToken) return false;

  const sessions = (await env.ATTENDANCE_KV.get('admin_sessions', { type: 'json' })) || [];
  const session = sessions.find((s) => s.token === sessionToken);

  if (!session) return false;
  if (new Date(session.expiresAt) < new Date()) return false;

  return true;
}

async function handleAdminGetData(env) {
  const students = (await env.ATTENDANCE_KV.get('students', { type: 'json' })) || [];
  const attendance = (await env.ATTENDANCE_KV.get('attendance', { type: 'json' })) || [];
  const blacklist = (await env.ATTENDANCE_KV.get('blacklist', { type: 'json' })) || [];
  const fraudAttempts =
    (await env.ATTENDANCE_KV.get('fraud_attempts', { type: 'json' })) || [];
  const activityLogs =
    (await env.ATTENDANCE_KV.get('activity_logs', { type: 'json' })) || [];
  const attendanceEnabled =
    (await env.ATTENDANCE_KV.get('attendance_enabled')) === 'true';
  const strictMode = (await env.ATTENDANCE_KV.get('strict_mode')) === 'true';

  const today = new Date().toISOString().split('T')[0];

  // Always include protected students in attendance
  const protectedStudentsList = students.filter((s) => isProtected(s.index));
  
  const studentsWithStatus = students.map((s) => {
    const hasAttended = attendance.some((a) => a.index === s.index && a.date === today);
    const isProtectedStudent = isProtected(s.index);
    
    return {
      ...s,
      attended: hasAttended || isProtectedStudent, // Protected always show as attended
      blacklisted: blacklist.some(
        (b) => b.index === s.index && b.status === 'active'
      ),
      protected: isProtectedStudent,
    };
  });

  return {
    success: true,
    students: studentsWithStatus,
    blacklist,
    fraudAttempts,
    activityLogs: activityLogs.slice(-50), // Last 50 logs
    attendanceEnabled,
    strictMode,
    contactInfo: COURSE_REPS,
  };
}

async function handleBulkUpload(env, request) {
  const { data } = await request.json();
  const lines = data.split('\n').filter((l) => l.trim());

  const students = (await env.ATTENDANCE_KV.get('students', { type: 'json' })) || [];
  let count = 0;

  for (const line of lines) {
    const match = line.match(/^(.+?)\s*-\s*(\d+)$/);
    if (match) {
      const [, name, index] = match;
      if (!students.some((s) => s.index === index.trim())) {
        students.push({ name: name.trim(), index: index.trim() });
        count++;
      }
    }
  }

  await env.ATTENDANCE_KV.put('students', JSON.stringify(students));
  await logActivity(env, 'BULK_UPLOAD', { count });

  return { success: true, count };
}

async function handleAddStudent(env, request) {
  const { name, index } = await request.json();
  const students = (await env.ATTENDANCE_KV.get('students', { type: 'json' })) || [];

  if (students.some((s) => s.index === index)) {
    return { success: false, message: 'Student already exists' };
  }

  students.push({ name, index });
  await env.ATTENDANCE_KV.put('students', JSON.stringify(students));
  await logActivity(env, 'ADD_STUDENT', { name, index });

  return { success: true };
}

async function handleDeleteStudent(env, request) {
  const { index } = await request.json();

  if (isProtected(index)) {
    return {
      success: false,
      message: 'Access denied go and sit down',
    };
  }

  const students = (await env.ATTENDANCE_KV.get('students', { type: 'json' })) || [];
  const filtered = students.filter((s) => s.index !== index);
  await env.ATTENDANCE_KV.put('students', JSON.stringify(filtered));
  await logActivity(env, 'DELETE_STUDENT', { index });

  return { success: true };
}

async function handleToggleAttendance(env, request) {
  const { enabled } = await request.json();
  await env.ATTENDANCE_KV.put('attendance_enabled', enabled ? 'true' : 'false');
  await logActivity(env, 'TOGGLE_ATTENDANCE', { enabled });
  return { success: true };
}

async function handleToggleStrictMode(env, request) {
  const { enabled } = await request.json();
  await env.ATTENDANCE_KV.put('strict_mode', enabled ? 'true' : 'false');
  await logActivity(env, 'TOGGLE_STRICT_MODE', { enabled });
  return { success: true };
}

async function handleBlacklist(env, request) {
  const { index, reason, duration } = await request.json();

  if (isProtected(index)) {
    return { success: false, message: 'Cannot blacklist protected student' };
  }

  const blacklist = (await env.ATTENDANCE_KV.get('blacklist', { type: 'json' })) || [];
  const students = (await env.ATTENDANCE_KV.get('students', { type: 'json' })) || [];
  const student = students.find((s) => s.index === index);

  if (!student) {
    return { success: false, message: 'Student not found' };
  }

  let expiryDate = 'indefinite';
  if (duration && duration !== 'indefinite') {
    const days = parseInt(duration);
    expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  blacklist.push({
    id: crypto.randomUUID(),
    name: student.name,
    index: student.index,
    reason: reason || 'Admin action',
    date: new Date().toISOString().split('T')[0],
    expiryDate,
    status: 'active',
  });

  await env.ATTENDANCE_KV.put('blacklist', JSON.stringify(blacklist));
  await logActivity(env, 'BLACKLIST_STUDENT', { student, reason, duration });

  return { success: true };
}

async function handleUnblacklist(env, request) {
  const { id } = await request.json();
  const blacklist = (await env.ATTENDANCE_KV.get('blacklist', { type: 'json' })) || [];
  const filtered = blacklist.filter((b) => b.id !== id);
  await env.ATTENDANCE_KV.put('blacklist', JSON.stringify(filtered));
  await logActivity(env, 'UNBLACKLIST_STUDENT', { id });
  return { success: true };
}

async function handleClearAttendance(env) {
  const today = new Date().toISOString().split('T')[0];
  const attendance = (await env.ATTENDANCE_KV.get('attendance', { type: 'json' })) || [];
  const filtered = attendance.filter((a) => a.date !== today);
  await env.ATTENDANCE_KV.put('attendance', JSON.stringify(filtered));
  
  const ipLog = (await env.ATTENDANCE_KV.get('ip_device_log', { type: 'json' })) || [];
  const filteredLog = ipLog.filter((log) => log.date !== today);
  await env.ATTENDANCE_KV.put('ip_device_log', JSON.stringify(filteredLog));
  
  await logActivity(env, 'CLEAR_ATTENDANCE', { date: today });
  return { success: true };
}

async function handleRemoveRestriction(env, request) {
  const { index, all } = await request.json();
  const today = new Date().toISOString().split('T')[0];

  if (all) {
    // Clear all restrictions for today
    await env.ATTENDANCE_KV.put('attendance', JSON.stringify([]));
    await env.ATTENDANCE_KV.put('ip_device_log', JSON.stringify([]));
    await logActivity(env, 'REMOVE_ALL_RESTRICTIONS', {});
  } else {
    // Clear for specific student
    const attendance =
      (await env.ATTENDANCE_KV.get('attendance', { type: 'json' })) || [];
    const filtered = attendance.filter(
      (a) => !(a.index === index && a.date === today)
    );
    await env.ATTENDANCE_KV.put('attendance', JSON.stringify(filtered));
    await logActivity(env, 'REMOVE_RESTRICTION', { index });
  }

  return { success: true };
}

async function handleGetCourseReps() {
  return { success: true, courseReps: COURSE_REPS };
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      let response;

      // Public routes
      if (path === '/api/get-stats') {
        response = await handleGetStats(env);
      } else if (path === '/api/search-student') {
        response = await handleSearchStudent(env, request);
      } else if (path === '/api/verify-student') {
        response = await handleVerifyStudent(env, request);
      } else if (path === '/api/mark-attendance') {
        response = await handleMarkAttendance(env, request);
      } else if (path === '/api/admin-login') {
        response = await handleAdminLogin(env, request);
      } else if (path === '/api/get-course-reps') {
        response = await handleGetCourseReps();
      }
      // Protected admin routes
      else if (await verifyAdminSession(env, request)) {
        if (path === '/api/admin-get-data') {
          response = await handleAdminGetData(env);
        } else if (path === '/api/admin-bulk-upload') {
          response = await handleBulkUpload(env, request);
        } else if (path === '/api/admin-add-student') {
          response = await handleAddStudent(env, request);
        } else if (path === '/api/admin-delete-student') {
          response = await handleDeleteStudent(env, request);
        } else if (path === '/api/admin-toggle-attendance') {
          response = await handleToggleAttendance(env, request);
        } else if (path === '/api/admin-toggle-strict-mode') {
          response = await handleToggleStrictMode(env, request);
        } else if (path === '/api/admin-blacklist') {
          response = await handleBlacklist(env, request);
        } else if (path === '/api/admin-unblacklist') {
          response = await handleUnblacklist(env, request);
        } else if (path === '/api/admin-clear-attendance') {
          response = await handleClearAttendance(env);
        } else if (path === '/api/admin-remove-restriction') {
          response = await handleRemoveRestriction(env, request);
        } else {
          response = { success: false, message: 'Endpoint not found' };
        }
      } else {
        return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
