// Cloudflare Worker for BIT GROUP C Attendance System
// Deploy this to Cloudflare Workers at: every.pupujiger.workers.dev

const PASTEBIN_API_KEY = "Ekj5p2bNNepuGxI_QKvAgFlETVbztESk"
const PASTEBIN_PASTE_ID = "s3rjsTJg"
const PASTEBIN_RAW_URL = `https://pastebin.com/raw/${PASTEBIN_PASTE_ID}`
const PASTEBIN_API_URL = "https://pastebin.com/api/api_post.php"
const PROTECTED_STUDENTS = ["1686468923", "1685397148", "1700493421"]
const ADMIN_PINCODE = "PINCODE"
const SECRET_KEY = "kissmeifyoucan" // Protected students secret key

// GCTU Campus coordinates (Ghana Communication Technology University - Tesano Campus)
const GCTU_LOCATION = {
  latitude: 5.6519,
  longitude: -0.2173,
  radiusMeters: 500 // 500 meters (~6-7 minutes walk)
}

// Course Representatives
const COURSE_REPS = [
  {
    name: "Myles",
    phone: "0500776941",
    whatsapp: "https://wa.me/233500776941"
  },
  {
    name: "Dhonzy",
    phone: "0345222358",
    whatsapp: "https://wa.me/233345222358"
  }
]

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c // Distance in meters
}

// Default data structure
const DEFAULT_DATA = {
  students: [
    {
      id: "1686468923",
      name: "Osman Mohammed Abutazure",
      indexNumber: "1686468923",
      createdAt: new Date().toISOString(),
    },
    {
      id: "1685397148",
      name: "Portia Awusi Atsu",
      indexNumber: "1685397148",
      createdAt: new Date().toISOString(),
    },
    {
      id: "1700493421",
      name: "Princess Asiedua Annor",
      indexNumber: "1700493421",
      createdAt: new Date().toISOString(),
    },
  ],
  attendance: [],
  blacklist: [],
  adminLogs: [],
  fraudAttempts: [],
  settings: {
    attendanceEnabled: false,
    attendanceStarted: false,
    strictMode: false,
    strictModeRadius: 500,
  },
  courseReps: COURSE_REPS,
}

// Fetch current data from Pastebin
async function getPastebinData() {
  try {
    const response = await fetch(PASTEBIN_RAW_URL)
    if (!response.ok) return DEFAULT_DATA
    const text = await response.text()
    return JSON.parse(text)
  } catch (error) {
    console.error("[Worker] Error fetching from Pastebin:", error)
    return DEFAULT_DATA
  }
}

// Update Pastebin paste
async function updatePastebin(data) {
  try {
    const params = new URLSearchParams()
    params.append("api_dev_key", PASTEBIN_API_KEY)
    params.append("api_option", "paste")
    params.append("api_paste_key", PASTEBIN_PASTE_ID)
    params.append("api_paste_code", JSON.stringify(data, null, 2))
    params.append("api_paste_private", "1")
    params.append("api_paste_name", "BIT Attendance Data")

    const response = await fetch(PASTEBIN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    })

    const result = await response.text()
    return !result.includes("error") && result.length > 0
  } catch (error) {
    console.error("[Worker] Error updating Pastebin:", error)
    return false
  }
}

// CORS headers
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

// Verify PIN based on search type
function verifyPIN(student, pin, pinType) {
  if (pinType === "surname") {
    const lastName = student.name.split(" ").pop()
    const first4 = lastName.slice(0, 4).toUpperCase()
    return pin.toUpperCase() === first4
  } else {
    const last5 = student.indexNumber.slice(-5)
    return pin === last5
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const path = url.pathname

    // Handle OPTIONS (preflight)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() })
    }

    try {
      // GET /api/students - Get all students
      if (path === "/api/students" && request.method === "GET") {
        const data = await getPastebinData()
        return new Response(JSON.stringify({
          success: true,
          students: data.students || []
        }), {
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        })
      }

      // GET /api/data - Get all data (for admin)
      if (path === "/api/data" && request.method === "GET") {
        const data = await getPastebinData()
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        })
      }

      // POST /api/admin/login - Admin authentication
      if (path === "/api/admin/login" && request.method === "POST") {
        const body = await request.json()
        if (body.pincode === ADMIN_PINCODE) {
          return new Response(JSON.stringify({
            success: true,
            message: "Authentication successful"
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        return new Response(JSON.stringify({
          success: false,
          message: "Invalid PIN code"
        }), {
          status: 401,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        })
      }

      // POST /api/verify-pin - Verify student PIN
      if (path === "/api/verify-pin" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()

        // Check if protected student secret key
        if (body.pin === SECRET_KEY) {
          return new Response(JSON.stringify({
            success: true,
            protected: true,
            message: "Welcome, protected student! You have unlimited access.",
            student: body.student
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }

        const student = data.students.find(s => 
          s.indexNumber === body.studentId || 
          s.id === body.studentId
        )

        if (!student) {
          return new Response(JSON.stringify({
            success: false,
            message: "Student not found"
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }

        // Check if blacklisted
        const blacklisted = data.blacklist.find(b => b.studentId === body.studentId)
        if (blacklisted) {
          return new Response(JSON.stringify({
            success: false,
            blacklisted: true,
            message: "You have been blacklisted",
            reason: blacklisted.reason,
            duration: blacklisted.duration,
            courseReps: data.courseReps || COURSE_REPS
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }

        // Verify PIN
        const isPinValid = verifyPIN(student, body.pin, body.pinType)

        if (!isPinValid) {
          return new Response(JSON.stringify({
            success: false,
            strikes: 1,
            message: "Invalid PIN"
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }

        return new Response(JSON.stringify({
          success: true,
          student: student
        }), {
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        })
      }

      // POST /api/mark-attendance - Mark attendance
      if (path === "/api/mark-attendance" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()

        // Check if protected student (they can mark unlimited times for anyone)
        const isProtected = body.secretKey === SECRET_KEY

        // Check if attendance is enabled (not applicable to protected students)
        if (!data.settings.attendanceEnabled && !isProtected) {
          return new Response(JSON.stringify({
            success: false,
            message: "Attendance is currently disabled"
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }

        // STRICT MODE: GPS Location Verification (not applicable to protected students)
        if (data.settings.strictMode && body.latitude && body.longitude && !isProtected) {
          const distance = calculateDistance(
            GCTU_LOCATION.latitude,
            GCTU_LOCATION.longitude,
            body.latitude,
            body.longitude
          )

          const maxDistance = data.settings.strictModeRadius || 500

          if (distance > maxDistance) {
            return new Response(JSON.stringify({
              success: false,
              notOnCampus: true,
              distance: Math.round(distance),
              message: `You are approximately ${Math.round(distance)} meters away from GCTU campus.\n\nYou must be within ${maxDistance} meters of campus to mark attendance.\n\nIf you believe this is an error, please contact the admin or course representative.`,
              courseReps: data.courseReps || COURSE_REPS
            }), {
              status: 403,
              headers: { ...corsHeaders(), "Content-Type": "application/json" },
            })
          }
        }

        const today = new Date().toISOString().split("T")[0]
        
        // Check if already marked by this student today (not applicable to protected students)
        if (!isProtected) {
          const alreadyMarkedBySelf = data.attendance.some(a => 
            a.studentId === body.studentId && a.date === today
          )

          if (alreadyMarkedBySelf) {
            return new Response(JSON.stringify({
              success: false,
              alreadyMarked: true,
              message: "You have already marked attendance for today"
            }), {
              headers: { ...corsHeaders(), "Content-Type": "application/json" },
            })
          }
        }

        // FRAUD DETECTION: Check if this device tried to mark for different student (not applicable to protected students)
        if (!isProtected) {
          const deviceAttendance = data.attendance.filter(a => 
            a.date === today && 
            (a.deviceId === body.deviceId || a.ipInfo === body.ipInfo)
          )

          if (deviceAttendance.length > 0) {
            const existingStudent = deviceAttendance[0]
            
            if (existingStudent.studentId !== body.studentId) {
              const fraudAttempts = data.fraudAttempts.filter(f => 
                f.deviceId === body.deviceId && 
                f.timestamp.startsWith(today)
              )

              // First strike - Warning
              if (fraudAttempts.length === 0) {
                const attempt = {
                  id: Math.random().toString(36).substring(2),
                  attemptedStudent: body.studentName,
                  attemptedStudentId: body.studentId,
                  actualStudent: existingStudent.studentName,
                  actualStudentId: existingStudent.studentId,
                  ipInfo: body.ipInfo,
                  deviceId: body.deviceId,
                  timestamp: new Date().toISOString(),
                  strike: 1,
                }
                data.fraudAttempts.push(attempt)
                await updatePastebin(data)

                return new Response(JSON.stringify({
                  success: false,
                  fraud: true,
                  strike: 1,
                  message: `⚠️ FRAUD ALERT!\n\nThis device has already marked attendance for ${existingStudent.studentName}.\n\nIf you try again, you will be BLACKLISTED and both attendances will be VOIDED!\n\nThis is your only warning.`
                }), {
                  status: 403,
                  headers: { ...corsHeaders(), "Content-Type": "application/json" },
                })
              }

              // Second strike - BLACKLIST
              if (fraudAttempts.length >= 1) {
                // Blacklist the fraudster
                data.blacklist.push({
                  id: Math.random().toString(36).substring(2),
                  studentId: body.studentId,
                  studentName: body.studentName,
                  reason: "Attempted to mark attendance for multiple students",
                  duration: "indefinite",
                  timestamp: new Date().toISOString(),
                })

                // Void both students' attendance
                data.attendance = data.attendance.filter(a => 
                  !(a.date === today && (a.studentId === body.studentId || a.studentId === existingStudent.studentId))
                )

                // Log the incident
                const log = {
                  id: Math.random().toString(36).substring(2),
                  action: "FRAUD_BLACKLIST",
                  timestamp: new Date().toISOString(),
                  details: `BLACKLISTED ${body.studentName} for fraud. Voided attendance for both ${body.studentName} and ${existingStudent.studentName}.`
                }
                data.adminLogs.push(log)

                await updatePastebin(data)

                return new Response(JSON.stringify({
                  success: false,
                  fraud: true,
                  strike: 2,
                  blacklisted: true,
                  message: `🚫 YOU HAVE BEEN BLACKLISTED!\n\n✗ Your attendance has been VOIDED\n✗ ${existingStudent.studentName}'s attendance has been VOIDED\n✗ You are BLACKLISTED indefinitely\n\nReason: Attempted to mark attendance for multiple students.\n\nContact the admin or course representative.`,
                  courseReps: data.courseReps || COURSE_REPS
                }), {
                  status: 403,
                  headers: { ...corsHeaders(), "Content-Type": "application/json" },
                })
              }
            }
          }
        }

        // Mark attendance
        const record = {
          id: Math.random().toString(36).substring(2),
          studentId: body.studentId,
          studentName: body.studentName,
          indexNumber: body.indexNumber,
          ipInfo: body.ipInfo || "Unknown",
          deviceId: body.deviceId || "Unknown",
          location: body.latitude && body.longitude ? {
            latitude: body.latitude,
            longitude: body.longitude,
            distance: Math.round(calculateDistance(
              GCTU_LOCATION.latitude,
              GCTU_LOCATION.longitude,
              body.latitude,
              body.longitude
            ))
          } : null,
          timestamp: new Date().toISOString(),
          date: today,
          markedBy: isProtected ? "Protected Student" : "Self"
        }

        data.attendance.push(record)

        // Mark attendance as started
        if (!data.settings.attendanceStarted) {
          data.settings.attendanceStarted = true
        }

        const success = await updatePastebin(data)

        if (success) {
          return new Response(JSON.stringify({
            success: true,
            message: isProtected ? `Attendance marked successfully for ${body.studentName}` : "Attendance marked successfully",
            record
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }

        throw new Error("Failed to mark attendance")
      }

      // POST /api/admin/toggle-attendance - Toggle attendance
      if (path === "/api/admin/toggle-attendance" && request.method === "POST") {
        const data = await getPastebinData()
        data.settings.attendanceEnabled = !data.settings.attendanceEnabled
        
        const log = {
          id: Math.random().toString(36).substring(2),
          action: data.settings.attendanceEnabled ? "ENABLED_ATTENDANCE" : "DISABLED_ATTENDANCE",
          timestamp: new Date().toISOString(),
          details: `Attendance ${data.settings.attendanceEnabled ? 'enabled' : 'disabled'}`
        }
        data.adminLogs.push(log)
        
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({
            success: true,
            enabled: data.settings.attendanceEnabled
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to toggle attendance")
      }

      // POST /api/admin/toggle-strict-mode - Toggle strict mode
      if (path === "/api/admin/toggle-strict-mode" && request.method === "POST") {
        const data = await getPastebinData()
        data.settings.strictMode = !data.settings.strictMode
        
        const log = {
          id: Math.random().toString(36).substring(2),
          action: data.settings.strictMode ? "ENABLED_STRICT_MODE" : "DISABLED_STRICT_MODE",
          timestamp: new Date().toISOString(),
          details: `Strict mode (GPS verification) ${data.settings.strictMode ? 'enabled' : 'disabled'}. Radius: ${data.settings.strictModeRadius}m`
        }
        data.adminLogs.push(log)
        
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({
            success: true,
            strictMode: data.settings.strictMode,
            radius: data.settings.strictModeRadius
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to toggle strict mode")
      }

      // POST /api/admin/add-student - Add new student
      if (path === "/api/admin/add-student" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()

        const newStudent = {
          id: body.indexNumber,
          name: body.name,
          indexNumber: body.indexNumber,
          createdAt: new Date().toISOString(),
        }

        data.students.push(newStudent)
        
        const log = {
          id: Math.random().toString(36).substring(2),
          action: "ADDED_STUDENT",
          timestamp: new Date().toISOString(),
          details: `Added student: ${body.name} (${body.indexNumber})`
        }
        data.adminLogs.push(log)
        
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({
            success: true,
            student: newStudent
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to add student")
      }

      // POST /api/admin/delete-student - Delete student
      if (path === "/api/admin/delete-student" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()

        const student = data.students.find(s => s.id === body.studentId || s.indexNumber === body.studentId)
        data.students = data.students.filter(s => s.id !== body.studentId && s.indexNumber !== body.studentId)
        
        const log = {
          id: Math.random().toString(36).substring(2),
          action: "DELETED_STUDENT",
          timestamp: new Date().toISOString(),
          details: student ? `Deleted student: ${student.name} (${student.indexNumber})` : `Deleted student: ${body.studentId}`
        }
        data.adminLogs.push(log)
        
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to delete student")
      }

      // POST /api/admin/blacklist-student - Blacklist student
      if (path === "/api/admin/blacklist-student" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()

        const student = data.students.find(s => s.id === body.studentId || s.indexNumber === body.studentId)

        data.blacklist.push({
          id: Math.random().toString(36).substring(2),
          studentId: body.studentId,
          studentName: student ? student.name : "Unknown",
          reason: body.reason || "Blacklisted by admin",
          duration: body.duration || "indefinite",
          timestamp: new Date().toISOString(),
        })
        
        const log = {
          id: Math.random().toString(36).substring(2),
          action: "BLACKLISTED_STUDENT",
          timestamp: new Date().toISOString(),
          details: `Blacklisted ${student ? student.name : body.studentId} for ${body.duration || 'indefinite'} - Reason: ${body.reason || 'Admin action'}`
        }
        data.adminLogs.push(log)
        
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to blacklist student")
      }

      // POST /api/admin/unblacklist-student - Remove from blacklist
      if (path === "/api/admin/unblacklist-student" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()

        const blacklisted = data.blacklist.find(b => b.studentId === body.studentId)
        data.blacklist = data.blacklist.filter(b => b.studentId !== body.studentId)
        
        const log = {
          id: Math.random().toString(36).substring(2),
          action: "UNBLACKLISTED_STUDENT",
          timestamp: new Date().toISOString(),
          details: blacklisted ? `Removed ${blacklisted.studentName} from blacklist` : `Removed student ${body.studentId} from blacklist`
        }
        data.adminLogs.push(log)
        
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to unblacklist student")
      }

      // POST /api/admin/clear-attendance - Clear all attendance
      if (path === "/api/admin/clear-attendance" && request.method === "POST") {
        const data = await getPastebinData()
        const count = data.attendance.length
        data.attendance = []
        data.settings.attendanceStarted = false
        
        const log = {
          id: Math.random().toString(36).substring(2),
          action: "CLEARED_ATTENDANCE",
          timestamp: new Date().toISOString(),
          details: `Cleared all attendance records (${count} records deleted)`
        }
        data.adminLogs.push(log)
        
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to clear attendance")
      }

      // POST /api/admin/add-attendance-record - Manually add attendance
      if (path === "/api/admin/add-attendance-record" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()
        const today = new Date().toISOString().split("T")[0]

        const record = {
          id: Math.random().toString(36).substring(2),
          studentId: body.studentId,
          studentName: body.studentName,
          indexNumber: body.indexNumber,
          ipInfo: "Admin Added",
          deviceId: "ADMIN",
          timestamp: new Date().toISOString(),
          date: today,
          addedBy: "Admin"
        }

        data.attendance.push(record)
        
        const log = {
          id: Math.random().toString(36).substring(2),
          action: "MANUALLY_ADDED_ATTENDANCE",
          timestamp: new Date().toISOString(),
          details: `Manually added attendance for ${body.studentName} (${body.indexNumber})`
        }
        data.adminLogs.push(log)
        
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({ success: true, record }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to add attendance")
      }

      // POST /api/admin/remove-attendance-record - Remove attendance
      if (path === "/api/admin/remove-attendance-record" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()

        const record = data.attendance.find(a => a.id === body.recordId)
        data.attendance = data.attendance.filter(a => a.id !== body.recordId)
        
        const log = {
          id: Math.random().toString(36).substring(2),
          action: "REMOVED_ATTENDANCE",
          timestamp: new Date().toISOString(),
          details: record ? `Removed attendance for ${record.studentName} (${record.indexNumber})` : `Removed attendance record ${body.recordId}`
        }
        data.adminLogs.push(log)
        
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to remove attendance")
      }

      // POST /api/admin/delete-log - Delete admin log
      if (path === "/api/admin/delete-log" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()
        
        data.adminLogs = data.adminLogs.filter(log => log.id !== body.logId)
        
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to delete log")
      }

      // GET /api/course-reps - Get course representatives
      if (path === "/api/course-reps" && request.method === "GET") {
        return new Response(JSON.stringify({
          success: true,
          courseReps: COURSE_REPS
        }), {
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        })
      }

      // Default response
      return new Response(JSON.stringify({
        success: false,
        message: "Endpoint not found"
      }), {
        status: 404,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      })

    } catch (error) {
      console.error("[Worker] Error:", error)
      return new Response(JSON.stringify({
        success: false,
        message: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      })
    }
  },
}
