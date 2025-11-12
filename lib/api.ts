// API Service for BIT Attendance System
const API_BASE_URL = 'https://every.pupujiger.workers.dev';

export interface Student {
  name: string;
  index: string;
  attended?: boolean;
  blacklisted?: boolean;
  protected?: boolean;
}

export interface SearchResult {
  displayValue: string;
  searchType: 'name' | 'index';
  studentData: Student;
}

export interface AttendanceStats {
  total: number;
  present: number;
  attendanceEnabled: boolean;
}

export interface CourseRep {
  name: string;
  phone: string;
}

function getDeviceId(): string {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

function getSessionToken(): string | null {
  return sessionStorage.getItem('admin_session');
}

export async function getStats(): Promise<AttendanceStats> {
  const response = await fetch(`${API_BASE_URL}/api/get-stats`);
  const data = await response.json();
  return data;
}

export async function searchStudent(query: string): Promise<SearchResult[]> {
  const response = await fetch(`${API_BASE_URL}/api/search-student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const data = await response.json();
  return data.results || [];
}

export async function verifyStudent(
  student: SearchResult,
  pin: string,
  latitude?: number,
  longitude?: number
) {
  const response = await fetch(`${API_BASE_URL}/api/verify-student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student,
      pin,
      deviceId: getDeviceId(),
      latitude,
      longitude,
    }),
  });
  return await response.json();
}

export async function markAttendance(student: Student, isProtected: boolean = false) {
  const response = await fetch(`${API_BASE_URL}/api/mark-attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student,
      deviceId: getDeviceId(),
      isProtected,
    }),
  });
  return await response.json();
}

export async function adminLogin(pincode: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pincode }),
  });
  const data = await response.json();
  if (data.success && data.sessionToken) {
    sessionStorage.setItem('admin_session', data.sessionToken);
  }
  return data;
}

export async function adminGetData() {
  const token = getSessionToken();
  const response = await fetch(`${API_BASE_URL}/api/admin-get-data`, {
    headers: { Authorization: token || '' },
  });
  return await response.json();
}

export async function adminBulkUpload(data: string) {
  const token = getSessionToken();
  const response = await fetch(`${API_BASE_URL}/api/admin-bulk-upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || '',
    },
    body: JSON.stringify({ data }),
  });
  return await response.json();
}

export async function adminAddStudent(name: string, index: string) {
  const token = getSessionToken();
  const response = await fetch(`${API_BASE_URL}/api/admin-add-student`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || '',
    },
    body: JSON.stringify({ name, index }),
  });
  return await response.json();
}

export async function adminDeleteStudent(index: string) {
  const token = getSessionToken();
  const response = await fetch(`${API_BASE_URL}/api/admin-delete-student`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || '',
    },
    body: JSON.stringify({ index }),
  });
  return await response.json();
}

export async function adminToggleAttendance(enabled: boolean) {
  const token = getSessionToken();
  const response = await fetch(`${API_BASE_URL}/api/admin-toggle-attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || '',
    },
    body: JSON.stringify({ enabled }),
  });
  return await response.json();
}

export async function adminToggleStrictMode(enabled: boolean) {
  const token = getSessionToken();
  const response = await fetch(`${API_BASE_URL}/api/admin-toggle-strict-mode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || '',
    },
    body: JSON.stringify({ enabled }),
  });
  return await response.json();
}

export async function adminBlacklist(index: string, reason: string, duration: string) {
  const token = getSessionToken();
  const response = await fetch(`${API_BASE_URL}/api/admin-blacklist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || '',
    },
    body: JSON.stringify({ index, reason, duration }),
  });
  return await response.json();
}

export async function adminUnblacklist(id: string) {
  const token = getSessionToken();
  const response = await fetch(`${API_BASE_URL}/api/admin-unblacklist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || '',
    },
    body: JSON.stringify({ id }),
  });
  return await response.json();
}

export async function adminClearAttendance() {
  const token = getSessionToken();
  const response = await fetch(`${API_BASE_URL}/api/admin-clear-attendance`, {
    method: 'POST',
    headers: { Authorization: token || '' },
  });
  return await response.json();
}

export async function adminRemoveRestriction(index: string, all: boolean = false) {
  const token = getSessionToken();
  const response = await fetch(`${API_BASE_URL}/api/admin-remove-restriction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || '',
    },
    body: JSON.stringify({ index, all }),
  });
  return await response.json();
}

export async function getCourseReps(): Promise<CourseRep[]> {
  const response = await fetch(`${API_BASE_URL}/api/get-course-reps`);
  const data = await response.json();
  return data.courseReps || [];
}

export function getLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => reject(error)
    );
  });
}
