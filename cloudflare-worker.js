// Cloudflare Worker for BIT GROUP C Attendance System
// Deploy this to Cloudflare Workers at: every.pupujiger.workers.dev
// Powered by Alien Technology from Pluto

const PASTEBIN_API_KEY = "Ekj5p2bNNepuGxI_QKvAgFlETVbztESk"
const PASTEBIN_PASTE_ID = "s3rjsTJg"
const PASTEBIN_RAW_URL = `https://pastebin.com/raw/${PASTEBIN_PASTE_ID}`
const PASTEBIN_API_URL = "https://pastebin.com/api/api_post.php"
const PROTECTED_STUDENTS = ["1686468923", "1685397148", "1700493421"]
const ADMIN_PINCODE = "PINCODE" // Admin authentication PIN

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
  },
  {
    name: "Admin",
    phone: "0245222358",
    whatsapp: "https://wa.me/233245222358"
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

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() })
    }

    try {
      // GET /api/get-stats
      if (path === "/api/get-stats" && request.method === "GET") {
        const data = await getPastebinData()
        if (!data.settings.attendanceStarted) {
          return new Response(JSON.stringify({
            success: true,
            total: 0,
            present: 0,
            attendanceStarted: false,
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        const today = new Date().toISOString().split("T")[0]
        const todayAttendance = data.attendance.filter(a => a.date === today)
        return new Response(JSON.stringify({
          success: true,
          total: data.students.length,
          present: todayAttendance.length,
          attendanceStarted: true,
        }), {
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        })
      }

      // GET /api/get-students
      if (path === "/api/get-students" && request.method === "GET") {
        const data = await getPastebinData()
        return new Response(JSON.stringify({
          success: true,
          students: data.students,
        }), {
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        })
      }

      // POST /api/verify-pin
      if (path === "/api/verify-pin" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()
        const student = data.students.find(s => 
          s.indexNumber === body.studentId || s.id === body.studentId
        )
        if (!student) {
          return new Response(JSON.stringify({
            success: false,
            message: "Student not found"
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        const isBlacklisted = data.blacklist.some(b => 
          b.studentId === student.indexNumber && b.status === "active"
        )
        if (isBlacklisted) {
          return new Response(JSON.stringify({
            success: false,
            blacklisted: true,
            message: "You have been blacklisted"
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
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

      // POST /api/mark-attendance
      if (path === "/api/mark-attendance" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()
        if (!data.settings.attendanceEnabled && !PROTECTED_STUDENTS.includes(body.studentId)) {
          return new Response(JSON.stringify({
            success: false,
            message: "Attendance is currently disabled"
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        const today = new Date().toISOString().split("T")[0]
        const alreadyMarkedBySelf = data.attendance.some(a => 
          a.studentId === body.studentId && a.date === today
        )
        if (alreadyMarkedBySelf && !PROTECTED_STUDENTS.includes(body.studentId)) {
          return new Response(JSON.stringify({
            success: false,
            alreadyMarked: true,
            message: "You have already marked attendance for today"
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
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
                message: "⚠️ FRAUD ALERT!\n\nThis device has already marked attendance for " + existingStudent.studentName + " today.\n\nAttempting to mark for another student is strictly prohibited.\n\n🚨 THIS IS YOUR FIRST AND FINAL WARNING!\n\nIf you try this again, you will be BLACKLISTED immediately and your attendance will be VOIDED."
              }), {
                status: 403,
                headers: { ...corsHeaders(), "Content-Type": "application/json" },
              })
            }
            if (fraudAttempts.length >= 1) {
              const blacklistEntry = {
                id: Math.random().toString(36).substring(2),
                studentId: body.studentId,
                studentName: body.studentName,
                duration: "indefinite",
                reason: "Attempted to mark attendance for multiple students",
                addedAt: new Date().toISOString(),
                status: "active",
              }
              data.blacklist.push(blacklistEntry)
              data.attendance = data.attendance.filter(a => 
                !(a.date === today && (
                  a.studentId === body.studentId || 
                  a.studentId === existingStudent.studentId
                ))
              )
              const finalAttempt = {
                id: Math.random().toString(36).substring(2),
                attemptedStudent: body.studentName,
                attemptedStudentId: body.studentId,
                actualStudent: existingStudent.studentName,
                actualStudentId: existingStudent.studentId,
                ipInfo: body.ipInfo,
                deviceId: body.deviceId,
                timestamp: new Date().toISOString(),
                strike: 2,
                action: "BLACKLISTED",
              }
              data.fraudAttempts.push(finalAttempt)
              await updatePastebin(data)
              return new Response(JSON.stringify({
                success: false,
                blacklisted: true,
                strike: 2,
                message: "🚫 YOU HAVE BEEN BLACKLISTED!\n\nYou were warned but chose to violate the rules again.\n\n📋 CONSEQUENCES:\n• You have been BLACKLISTED indefinitely\n• Your attendance for today has been VOIDED\n• " + existingStudent.studentName + "'s attendance has been VOIDED\n• This incident has been logged\n\n⚖️ Reason: Attempted to mark attendance for multiple students using the same device.\n\nContact the administrator if you believe this is an error."
              }), {
                status: 403,
                headers: { ...corsHeaders(), "Content-Type": "application/json" },
              })
            }
          }
        }
        if (!data.settings.attendanceStarted) {
          data.settings.attendanceStarted = true
        }
        const record = {
          id: Math.random().toString(36).substring(2),
          studentId: body.studentId,
          studentName: body.studentName,
          indexNumber: body.indexNumber,
          ipInfo: body.ipInfo || "Unknown",
          deviceId: body.deviceId || "Unknown",
          timestamp: new Date().toISOString(),
          date: today,
        }
        data.attendance.push(record)
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({
            success: true,
            record
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to mark attendance")
      }

      // Admin endpoints
      if (path === "/api/admin/login" && request.method === "POST") {
        const body = await request.json()
        if (body.pincode === ADMIN_PINCODE) {
          return new Response(JSON.stringify({
            success: true,
            message: "Login successful"
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

      if (path === "/api/admin/get-all-data" && request.method === "GET") {
        const data = await getPastebinData()
        return new Response(JSON.stringify({
          success: true,
          students: data.students,
          attendance: data.attendance,
          blacklist: data.blacklist,
          settings: data.settings,
          fraudAttempts: data.fraudAttempts,
        }), {
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        })
      }

      if (path === "/api/admin/toggle-attendance" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()
        data.settings.attendanceEnabled = body.enabled
        if (body.enabled) {
          data.settings.attendanceStarted = true
        }
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({
            success: true,
            enabled: body.enabled
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to toggle attendance")
      }

      if (path === "/api/admin/add-student" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()
        const student = {
          id: body.indexNumber,
          name: body.name,
          indexNumber: body.indexNumber,
          createdAt: new Date().toISOString(),
        }
        data.students.push(student)
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({
            success: true,
            student
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to add student")
      }

      if (path === "/api/admin/bulk-add-students" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()
        const newStudents = body.students.map(s => ({
          id: s.indexNumber,
          name: s.name,
          indexNumber: s.indexNumber,
          createdAt: new Date().toISOString(),
        }))
        data.students.push(...newStudents)
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({
            success: true,
            added: newStudents.length
          }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to bulk add students")
      }

      if (path === "/api/admin/delete-student" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()
        if (PROTECTED_STUDENTS.includes(body.studentId)) {
          return new Response(JSON.stringify({
            success: false,
            message: "Cannot delete protected student"
          }), {
            status: 403,
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        data.students = data.students.filter(s => s.indexNumber !== body.studentId)
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to delete student")
      }

      if (path === "/api/admin/blacklist-student" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()
        if (PROTECTED_STUDENTS.includes(body.studentId)) {
          return new Response(JSON.stringify({
            success: false,
            message: "Cannot blacklist protected student"
          }), {
            status: 403,
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        const entry = {
          id: Math.random().toString(36).substring(2),
          studentId: body.studentId,
          duration: body.duration,
          addedAt: new Date().toISOString(),
          status: "active",
        }
        data.blacklist.push(entry)
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to blacklist student")
      }

      if (path === "/api/admin/unblacklist-student" && request.method === "POST") {
        const body = await request.json()
        const data = await getPastebinData()
        data.blacklist = data.blacklist.filter(b => b.studentId !== body.studentId)
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to unblacklist student")
      }

      if (path === "/api/admin/clear-attendance" && request.method === "POST") {
        const data = await getPastebinData()
        data.attendance = []
        data.settings.attendanceStarted = false
        const success = await updatePastebin(data)
        if (success) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          })
        }
        throw new Error("Failed to clear attendance")
      }

      return new Response(JSON.stringify({ 
        error: "Endpoint not found",
        path: path 
      }), {
        status: 404,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      })

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      })
    }
  },
}
