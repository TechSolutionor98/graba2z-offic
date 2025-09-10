"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { authAPI } from "../services/api"
import { adminAPI } from "../services/api"

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
  error: null,
  admin: null,
  adminToken: localStorage.getItem("adminToken"),
  isAdminAuthenticated: false,
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  REGISTER_START: "REGISTER_START",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  REGISTER_FAILURE: "REGISTER_FAILURE",
  VERIFY_EMAIL_START: "VERIFY_EMAIL_START",
  VERIFY_EMAIL_SUCCESS: "VERIFY_EMAIL_SUCCESS",
  VERIFY_EMAIL_FAILURE: "VERIFY_EMAIL_FAILURE",
  LOGOUT: "LOGOUT",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_LOADING: "SET_LOADING",
  UPDATE_PROFILE: "UPDATE_PROFILE",
  ADMIN_LOGIN_SUCCESS: "ADMIN_LOGIN_SUCCESS",
  ADMIN_LOGOUT: "ADMIN_LOGOUT",
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.VERIFY_EMAIL_START:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.VERIFY_EMAIL_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      }

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.VERIFY_EMAIL_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      }

    case AUTH_ACTIONS.ADMIN_LOGIN_SUCCESS:
      return {
        ...state,
        admin: action.payload.admin,
        adminToken: action.payload.token,
        isAdminAuthenticated: true,
        loading: false,
        error: null,
      }

    case AUTH_ACTIONS.ADMIN_LOGOUT:
      return {
        ...state,
        admin: null,
        adminToken: null,
        isAdminAuthenticated: false,
        loading: false,
        error: null,
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      }

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }

    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const userData = await authAPI.getProfile()
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: userData,
              token,
            },
          })
        } catch (error) {
          localStorage.removeItem("token")
          dispatch({
            type: AUTH_ACTIONS.LOGOUT,
          })
        }
      } else {
        dispatch({
          type: AUTH_ACTIONS.SET_LOADING,
          payload: false,
        })
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    try {
      const data = await authAPI.login(credentials)
      localStorage.setItem("token", data.token)
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: data,
          token: data.token,
        },
      })
      return { ...data, success: true }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message,
      })
      return { success: false, message: error.message }
    }
  }

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START })
    try {
      const data = await authAPI.register(userData)
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
      })
      return data
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: error.message,
      })
      throw error
    }
  }

  // Verify email function
  const verifyEmail = async (verificationData) => {
    dispatch({ type: AUTH_ACTIONS.VERIFY_EMAIL_START })
    try {
      const data = await authAPI.verifyEmail(verificationData)
      localStorage.setItem("token", data.token)
      dispatch({
        type: AUTH_ACTIONS.VERIFY_EMAIL_SUCCESS,
        payload: {
          user: data,
          token: data.token,
        },
      })
      return data
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.VERIFY_EMAIL_FAILURE,
        payload: error.message,
      })
      throw error
    }
  }

  // Resend verification function
  const resendVerification = async (email) => {
    try {
      const data = await authAPI.resendVerification(email)
      return data
    } catch (error) {
      throw error
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const data = await authAPI.updateProfile(profileData)
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: data,
      })
      return data
    } catch (error) {
      throw error
    }
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  const adminLogin = async (credentials) => {
    try {
      const data = await adminAPI.login(credentials)
      localStorage.setItem("adminToken", data.token)
      dispatch({
        type: AUTH_ACTIONS.ADMIN_LOGIN_SUCCESS,
        payload: {
          admin: data,
          token: data.token,
        },
      })
      return { ...data, success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const adminLogout = () => {
    localStorage.removeItem("adminToken")
    dispatch({ type: AUTH_ACTIONS.ADMIN_LOGOUT })
  }

  const value = {
    ...state,
    login,
    adminLogin,
    adminLogout,
    register,
    verifyEmail,
    resendVerification,
    logout,
    updateProfile,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default AuthContext
