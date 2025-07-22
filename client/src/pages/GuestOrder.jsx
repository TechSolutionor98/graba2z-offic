import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle, Clock, Package, Truck, AlertTriangle } from "lucide-react";
import config from "../config/config";

const GuestOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get("orderId");
    const email = params.get("email");
    const success = params.get("success");

    if (!orderId || !email) {
      setError("Missing order information. Please check your order confirmation email.");
      setLoading(false);
      return;
    }

    if (success === "true") {
      setSuccessMessage(`Thank you for your order! Your order #${orderId.slice(-6)} has been placed successfully.`);
    }

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.post(`${config.API_URL}/api/orders/track`, {
          email,
          orderId,
        });
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError("Could not find your order. Please check your email and order ID.");
        setLoading(false);
      }
    };
    fetchOrder();
  }, [location]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Processing":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "Shipped":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "Out for Delivery":
        return <Truck className="h-5 w-5 text-purple-500" />;
      case "Delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Guest Order Details</h1>
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Order #{order._id.slice(-6)}</h2>
                <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="mt-2 sm:mt-0 flex items-center">
                {getStatusIcon(order.status)}
                <span className="ml-2 text-sm font-medium">{order.status}</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Items</h3>
            <ul className="divide-y divide-gray-200">
              {order.orderItems.map((item) => (
                <li key={item._id} className="py-4 flex">
                  <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm font-medium text-gray-900">AED {item.price.toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="px-6 py-4 bg-gray-50">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-900">Total</span>
              <span className="font-medium text-gray-900">AED {order.totalPrice.toLocaleString()}</span>
            </div>
            {order.trackingId && (
              <div className="mt-2 text-sm">
                <span className="font-medium text-gray-900">Tracking ID: </span>
                <span className="text-gray-600">{order.trackingId}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestOrder; 