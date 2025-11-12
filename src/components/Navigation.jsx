import { Link } from "react-router-dom"
import { Users, Shield, Home } from "lucide-react"

export default function Navigation() {
  return (
    <nav className="bg-slate-900 border-b border-indigo-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-indigo-400 hover:text-indigo-300 transition"
          >
            <Users size={24} />
            BIT Attendance
          </Link>
          <div className="flex gap-4">
            <Link
              to="/"
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-slate-300 hover:text-indigo-300 hover:bg-slate-800 transition"
            >
              <Home size={18} />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              to="/admin"
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-slate-300 hover:text-indigo-300 hover:bg-slate-800 transition"
            >
              <Shield size={18} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
