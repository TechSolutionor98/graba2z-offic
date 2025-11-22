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
  const [expandedRow, setExpandedRow] = useState(null);
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Request Callbacks</h1>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-lime-500 text-white rounded hover:bg-lime-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
            {requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No callback requests yet.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '200px', maxWidth: '250px' }}>Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req) => (
                  <>
                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{req.name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{req.email}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{req.phone}</div>
                      </td>
                      <td className="px-4 py-3" style={{ minWidth: '200px', maxWidth: '250px' }}>
                        {req.productName ? (
                          <div className="flex flex-col gap-1">
                            <span 
                              className="text-sm font-medium text-gray-900 leading-tight"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: '1.4'
                              }}
                            >
                              {req.productName}
                            </span>
                            {req.productLink && (
                              <a 
                                href={req.productLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View Product
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {req.createdAt
                            ? new Date(req.createdAt).toLocaleString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <span
                            className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer select-none transition-colors
                              ${req.status === 'done' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                              ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                              ${req.status === 'spam' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                            `}
                            style={{ textTransform: 'capitalize' }}
                            onClick={() => setOpenDropdownId(openDropdownId === req._id ? null : req._id)}
                          >
                            {req.status}
                          </span>
                          {openDropdownId === req._id && (
                            <div ref={dropdownRef} className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-32">
                              {STATUS_OPTIONS.map((status) => (
                                <div
                                  key={status}
                                  className={`px-4 py-2.5 cursor-pointer hover:bg-gray-50 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg
                                    ${req.status === status ? 'font-bold text-blue-600 bg-blue-50' : 'text-gray-700'}`}
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
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1.5 rounded-md bg-blue-500 text-white hover:bg-blue-600 text-xs font-medium transition-colors"
                            onClick={() => setExpandedRow(expandedRow === req._id ? null : req._id)}
                          >
                            {expandedRow === req._id ? 'Hide' : 'Details'}
                          </button>
                          {/* <button
                            className="px-3 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 text-xs font-medium transition-colors"
                            onClick={() => deleteRequest(req._id)}
                          >
                            Delete
                          </button> */}
                        </div>
                      </td>
                    </tr>
                    {expandedRow === req._id && (
                      <tr className="bg-gray-50">
                        <td colSpan="7" className="px-4 py-6">
                          <div className="space-y-4 max-w-4xl">
                            <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Full Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <span className="font-medium text-gray-700 block mb-1 text-sm">Full Name:</span>
                                <p className="text-gray-900">{req.name}</p>
                              </div>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <span className="font-medium text-gray-700 block mb-1 text-sm">Email:</span>
                                <p className="text-gray-900 break-all">{req.email}</p>
                              </div>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <span className="font-medium text-gray-700 block mb-1 text-sm">Phone Number:</span>
                                <p className="text-gray-900">{req.phone}</p>
                              </div>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <span className="font-medium text-gray-700 block mb-1 text-sm">Product:</span>
                                <p className="text-gray-900 mb-2">{req.productName || 'N/A'}</p>
                                {req.productLink && (
                                  <a 
                                    href={req.productLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm inline-flex items-center gap-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    View Product Page
                                  </a>
                                )}
                              </div>
                            </div>
                            {req.customerNote && (
                              <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
                                <span className="font-medium text-gray-700 block mb-2 text-sm">Customer Note:</span>
                                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                                  {req.customerNote}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequestCallbacks;
