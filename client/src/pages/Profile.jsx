import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { User, Mail, Phone, LogOut, Trash2, Shield, Settings, Package, Heart, AlertTriangle } from "lucide-react"
import { useToast } from "../context/ToastContext"
import axios from "axios"
import config from "../config/config"

const API_BASE_URL = `${config.API_URL}/api`

const Profile = () => {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [isRequestingDelete, setIsRequestingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleRequestDeletion = async () => {
    setIsRequestingDelete(true)
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/request-account-deletion`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      showToast(response.data.message + " (Email may take 5-6 minutes to arrive. Check spam folder if not received.)", "success")
      setShowDeleteModal(false)
      setShowVerifyModal(true)
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to send verification code. Please try again.",
        "error"
      )
    } finally {
      setIsRequestingDelete(false)
    }
  }

  const handleVerifyDeletion = async (e) => {
    e.preventDefault()
    
    if (verificationCode.length !== 6) {
      showToast("Please enter a valid 6-digit code", "error")
      return
    }

    setIsDeleting(true)
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/verify-account-deletion`,
        { code: verificationCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      showToast(response.data.message, "success")
      // Log out the user after successful deletion
      setTimeout(() => {
        logout()
        navigate("/")
      }, 2000)
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to verify code. Please try again.",
        "error"
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDeletion = () => {
    setShowDeleteModal(false)
    setShowVerifyModal(false)
    setVerificationCode("")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-lime-600 to-green-700 rounded-lg shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center space-x-6">
          <div className="bg-white/20 backdrop-blur-sm p-5 rounded-full">
            <User size={48} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{user?.name}</h1>
            <p className="text-lime-100 flex items-center gap-2">
              <Mail size={16} />
              {user?.email}
            </p>
            {user?.isEmailVerified && (
              <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                <Shield size={14} />
                Verified Account
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Information */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Account Information</h2>
            <Settings size={20} className="text-gray-400" />
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-lime-100 p-3 rounded-full">
                <User size={20} className="text-lime-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                <p className="font-semibold text-gray-800">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 p-3 rounded-full">
                <Mail size={20} className="text-blue-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                <p className="font-semibold text-gray-800">{user?.email}</p>
              </div>
            </div>

            {user?.phone && (
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Phone size={20} className="text-purple-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                  <p className="font-semibold text-gray-800">{user.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-orange-100 p-3 rounded-full">
                <Settings size={20} className="text-orange-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Account Type</p>
                <p className="font-semibold text-gray-800">{user?.isAdmin ? "Administrator" : "Customer"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/orders")}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-50 hover:bg-lime-50 hover:border-lime-300 border-2 border-transparent rounded-lg transition-all group"
              >
                <Package size={20} className="text-gray-600 group-hover:text-lime-700" />
                <span className="text-gray-700 group-hover:text-lime-700 font-medium">My Orders</span>
              </button>
              
              <button
                onClick={() => navigate("/wishlist")}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-50 hover:bg-pink-50 hover:border-pink-300 border-2 border-transparent rounded-lg transition-all group"
              >
                <Heart size={20} className="text-gray-600 group-hover:text-pink-700" />
                <span className="text-gray-700 group-hover:text-pink-700 font-medium">Wishlist</span>
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border-2 border-transparent rounded-lg transition-all group"
              >
                <Settings size={20} className="text-gray-600 group-hover:text-blue-700" />
                <span className="text-gray-700 group-hover:text-blue-700 font-medium">Shopping Cart</span>
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md"
            >
              <LogOut size={20} />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle size={24} className="text-red-600" />
          <h2 className="text-xl font-bold text-gray-800">Danger Zone</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-gray-700 mb-4">
            Once you delete your account, there is no going back. Please be certain. All your data, orders, and preferences will be permanently deleted.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            <Trash2 size={20} />
            <span>Delete My Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Delete Account</h3>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you absolutely sure you want to delete your account? This action cannot be undone and will:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Permanently delete all your personal data</li>
              <li>Remove your order history</li>
              <li>Delete your wishlist and preferences</li>
              <li>Close your account permanently</li>
            </ul>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Warning:</strong> You will receive a 6-digit verification code via email. You must enter this code to complete the deletion.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancelDeletion}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDeletion}
                disabled={isRequestingDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequestingDelete ? "Sending..." : "Send Verification Code"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Code Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Mail size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Enter Verification Code</h3>
            </div>
            
            <p className="text-gray-700 mb-4">
              We've sent a 6-digit verification code to <strong>{user?.email}</strong>. Please enter it below to confirm account deletion.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>📧 Note:</strong> The email may take 5-6 minutes to arrive. Please check your spam/junk folder if you don't see it in your inbox.
              </p>
            </div>

            <form onSubmit={handleVerifyDeletion}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-2xl tracking-widest font-bold"
                  placeholder="000000"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  The code will expire in 10 minutes.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancelDeletion}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || verificationCode.length !== 6}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </form>

            <button
              onClick={handleRequestDeletion}
              disabled={isRequestingDelete}
              className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {isRequestingDelete ? "Sending..." : "Resend Code"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
