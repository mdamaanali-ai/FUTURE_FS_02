import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import Dashboard from "./pages/admin/Dashboard"
import LeadDetail from "./pages/admin/LeadDetail"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/leads/:id" element={<LeadDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
