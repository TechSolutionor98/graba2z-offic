"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken")
  if (!adminToken) {
    return <Navigate to="/grabiansadmin/login" />
  }
  return children
}

export default AdminRoute
