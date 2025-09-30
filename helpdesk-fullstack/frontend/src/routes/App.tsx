import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../screens/Login'
import AdminLayout from '../screens/admin/AdminLayout'
import TechLayout from '../screens/tech/TechLayout'
import ClientLayout from '../screens/client/ClientLayout'
import RequireRole from './RequireRole'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireRole role="ADMIN" />}>
        <Route path="/admin/*" element={<AdminLayout />} />
      </Route>
      <Route element={<RequireRole role="TECH" />}>
        <Route path="/tech/*" element={<TechLayout />} />
      </Route>
      <Route element={<RequireRole role="CLIENT" />}>
        <Route path="/client/*" element={<ClientLayout />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}
