import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { apiRequest } from "../../services/api"

const STATUS_OPTIONS = ['pending', 'done', 'spam'];

const AdminRequestCallbacks = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const data = await apiRequest('/api/request-callback', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(data);
    } catch (err) {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      await apiRequest(`/api/request-callback/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: { status },
      });
      setRequests((prev) => prev.map((req) => (req._id === id ? { ...req, status } : req)));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this callback request?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await apiRequest(`/api/request-callback/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests((prev) => prev.filter((req) => req._id !== id));
    } catch (err) {
      alert('Failed to delete request');
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    }
    if (openDropdownId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="ml-64 p-8">
        <h1 className="text-2xl font-bold mb-6">Request Callbacks</h1>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Date</th> {/* Added Date column */}
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id} className="border-b">
                    <td className="px-4 py-2">{req.name}</td>
                    <td className="px-4 py-2">{req.email}</td>
                    <td className="px-4 py-2">{req.phone}</td>
                    <td className="px-4 py-2">
                      {req.createdAt
                        ? new Date(req.createdAt).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-2 relative">
                      <span
                        className={`px-3 py-1 rounded font-semibold text-xs cursor-pointer select-none
                          ${req.status === 'done' ? 'bg-green-100 text-green-700' : ''}
                          ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${req.status === 'spam' ? 'bg-red-100 text-red-700' : ''}
                        `}
                        style={{ textTransform: 'capitalize' }}
                        onClick={() => setOpenDropdownId(openDropdownId === req._id ? null : req._id)}
                      >
                        {req.status}
                      </span>
                      {openDropdownId === req._id && (
                        <div ref={dropdownRef} className="absolute z-10 mt-2 bg-white border rounded shadow-lg w-32">
                          {STATUS_OPTIONS.map((status) => (
                            <div
                              key={status}
                              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${req.status === status ? 'font-bold text-blue-600' : ''}`}
                              onClick={() => {
                                updateStatus(req._id, status);
                                setOpenDropdownId(null);
                              }}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 ml-2"
                        onClick={() => deleteRequest(req._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequestCallbacks;
