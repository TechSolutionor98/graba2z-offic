import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import config from '../config/config';
import { User, Mail, Phone } from "lucide-react";

export default function ReqBulkPurchase() {
  const { user } = useAuth ? useAuth() : { user: null };
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [callbackForm, setCallbackForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '' });
  const [callbackLoading, setCallbackLoading] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState(false);

  const handleCallbackChange = (e) => {
    const { name, value } = e.target;
    setCallbackForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCallbackSubmit = async (e) => {
    e.preventDefault();
    setCallbackLoading(true);
    try {
      await axios.post(`${config.API_URL}/api/request-callback`, callbackForm);
      setCallbackSuccess(true);
      setTimeout(() => {
        setShowCallbackModal(false);
        setCallbackSuccess(false);
        setCallbackForm({ name: user?.name || '', email: user?.email || '', phone: '' });
      }, 2000);
    } catch (error) {
      alert('Failed to submit request. Please try again.');
    } finally {
      setCallbackLoading(false);
    }
  };

  return (
    <div className="font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 text-center">
        <p className="text-sm text-green-700 font-semibold">Your One-Stop Solution for B2B Business Needs in UAE</p>
      </header>

      {/* Hero Section */}
      <section className="bg-green-100 py-6 px-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800">Grabatoz - B2B Dedicated Wholesale Place</h1>
        <p className="mt-2 text-sm md:text-base max-w-3xl mx-auto text-gray-700">
          Our trusted B2B wholesale palace will cater to all your business needs
        </p>
      </section>

      {/* Intro Section */}
      <section className="py-8 px-4 md:px-16 text-center">
        <p className="max-w-3xl mx-auto text-gray-700">
          Welcome to Grabatoz.com your one-stop sourcing platform for all your business needs.
          Grabatoz.com, the omnichannel retailer that was established in Dubai, UAE. We are a business
          focused marketplace where small and medium businesses (SMBs) discover, interact, and buy
          products and services by engaging with brands and authorized sellers.
        </p>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-100 py-10 px-4 md:px-16">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <img
            src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"
            alt="Business Meeting"
            className="w-full md:w-1/2 rounded-md"
          />
          <div className="md:w-1/2">
            <h2 className="text-xl font-bold mb-2">Benefits of being on Grabatoz.com</h2>
            <p className="text-gray-700 mb-4">
              As a customer and as a business buyer, the platform offers great benefits and opportunities
              for small and medium businesses.
            </p>
            <button className="bg-lime-500 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => setShowCallbackModal(true)}>
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Buying Journey */}
      <section className="py-10 px-4 md:px-16 text-center">
        <h2 className="text-xl font-bold mb-6">Online BUYING journey</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            'Bulk Requirement',
            'Request For Quote',
            'Best Price Quoted',
            'Proposals Evaluated',
            'Invoice',
            'Delivery & Payment',
          ].map((step, i) => (
            <div key={i} className="bg-white border-lime-500 border-2 shadow-md p-4 rounded-md text-sm font-medium">
              <p className="mb-2 font-bold">Step {i + 1}</p>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Bulk Purchase */}
      <section className="bg-gray-50 py-12 px-4 md:px-16">
        <h2 className="text-xl font-bold text-center mb-10">
          Why Bulk Purchase from Grabatoz.com?
        </h2>
        <div className="grid gap-6  md:grid-cols-3">
          {[
            {
              title: 'Trusted Platform',
              desc: 'Dedicated to serving SMBs in the UAE. Trust and reliability are our priority.',
            },
            {
              title: 'Authorized Sellers',
              desc: 'Over 100 authorized sellers ready to serve with better prices and availability.',
            },
            {
              title: 'Learn About Trends',
              desc: 'Join webinars by global brands to stay ahead and grow your business.',
            },
            {
              title: 'Better Range and Information',
              desc: 'Access a wide range of products with accurate info from over 200 global brands.',
            },
            {
              title: 'Quantity Discounts & RFQ',
              desc: 'Get better prices for larger quantities or request quotes from multiple sellers.',
            },
            {
              title: 'Create Users & Manage Purchases',
              desc: 'Add team members and set buyer/approver roles for a seamless experience.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 border-lime-500 border-2 shadow-md rounded-md">
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-700 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="bg-lime-500 text-white px-6 py-3 rounded hover:bg-green-700" onClick={() => setShowCallbackModal(true)}>
            Contact Sales
          </button>
        </div>
      </section>

      {showCallbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-lg sm:max-w-sm md:max-w-md lg:max-w-lg shadow-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowCallbackModal(false)}>
              <X size={24} />
            </button>
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="flex-1 w-full">
                <h2 className="text-xl font-bold mb-4">Request a Callback</h2>

                {callbackSuccess ? (
                  <div className="text-green-600 font-medium text-center">
                    Request submitted successfully!
                  </div>
                ) : (
                  <form onSubmit={handleCallbackSubmit} className="space-y-5">

                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 ml-9">Name</label>
                      <div className="flex items-center gap-3">
                        <div className="text-lime-600">
                          <User size={20} />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={callbackForm.name}
                          onChange={handleCallbackChange}
                          className="flex-1 w-full py-2 px-3 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 ml-9">Email</label>
                      <div className="flex items-center gap-3">
                        <div className="text-lime-600">
                          <Mail size={20} />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={callbackForm.email}
                          onChange={handleCallbackChange}
                          className="flex-1 w-full py-2 px-3 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 ml-9">Phone Number</label>
                      <div className="flex items-center gap-3">
                        <div className="text-lime-600">
                          <Phone size={20} />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={callbackForm.phone}
                          onChange={handleCallbackChange}
                          className="flex-1 w-full py-2 px-3 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-lime-500 text-white py-2 rounded-md font-medium"
                      disabled={callbackLoading}
                    >
                      {callbackLoading ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
