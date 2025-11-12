import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import HomePage from "./pages/HomePage"
import AdminPage from "./pages/AdminPage"
import TryHackMePage from "./pages/TryHackMePage"
import Navigation from "./components/Navigation"

function App() {
  return (
    <Router basename="/bit-attendance">
      <div className="min-h-screen bg-slate-950 text-white">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/tryhackme" element={<TryHackMePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
