// API Configuration
const API_BASE_URL = 'https://every.pupujiger.workers.dev';

// API Endpoints
const API = {
  GET_STATS: `${API_BASE_URL}/api/get-stats`,
  GET_STUDENTS: `${API_BASE_URL}/api/get-students`,
  VERIFY_PIN: `${API_BASE_URL}/api/verify-pin`,
  MARK_ATTENDANCE: `${API_BASE_URL}/api/mark-attendance`,
  LOG_FRAUD: `${API_BASE_URL}/api/log-fraud`,
  
  // Admin endpoints
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  ADMIN_GET_DATA: `${API_BASE_URL}/api/admin/get-all-data`,
  ADMIN_TOGGLE_ATTENDANCE: `${API_BASE_URL}/api/admin/toggle-attendance`,
  ADMIN_ADD_STUDENT: `${API_BASE_URL}/api/admin/add-student`,
  ADMIN_BULK_ADD: `${API_BASE_URL}/api/admin/bulk-add-students`,
  ADMIN_DELETE_STUDENT: `${API_BASE_URL}/api/admin/delete-student`,
  ADMIN_BLACKLIST: `${API_BASE_URL}/api/admin/blacklist-student`,
  ADMIN_UNBLACKLIST: `${API_BASE_URL}/api/admin/unblacklist-student`,
  ADMIN_CLEAR_ATTENDANCE: `${API_BASE_URL}/api/admin/clear-attendance`,
};

// Protected students that cannot be deleted or blacklisted
const PROTECTED_STUDENTS = ['1686468923', '1685397148', '1700493421'];

// Admin secret path (obfuscated)
const ADMIN_PATH = 'x9k2p7m4';
