"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, RotateCcw, Clock, CheckCircle, XCircle, CreditCard, AlertTriangle, Phone, Mail, MapPin, FileText } from "lucide-react";

export default function RefundAndReturn() {
  const navigate = useNavigate();

  // Future functionality for Arabic version
  // const handleArabicClick = () => {
  //   navigate('/refund-return-arabic');
  // };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-lime-500 rounded-full p-4">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Refund and Return Policies
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            At Grabatoz, we are committed to ensuring your satisfaction with every purchase.
            If for any reason you are not entirely satisfied with your laptop purchase, we are here to assist you.
          </p>
          
          {/* Language Switch Button - Commented out until Arabic version is created */}
          {/* <div className="flex justify-center mt-6">
            <button
              onClick={handleArabicClick}
              className="bg-lime-500 hover:bg-lime-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              العربية Arabic
            </button>
          </div> */}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Return Period */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Clock className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Return Period</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p>
              You have 15 days from the date of receipt of your laptop to initiate a return.
            </p>
            
            {/* Image Section */}
            {/* <div className="rounded-lg overflow-hidden shadow mt-6">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="15 Day Return Period"
                className="w-full h-48 object-cover"
              />
            </div> */}
          </div>
        </section>

        {/* Eligibility */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <CheckCircle className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Eligibility</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p>To qualify for a return, the laptop must meet the following conditions:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>The laptop must be in the same condition as when you received it, including all original packaging, accessories, manuals, warranty cards, and any seals intact.</li>
              <li>The returned laptop should be the exact original item received.</li>
              <li>The laptop must not be damaged due to misuse or mishandling.</li>
            </ol>
          </div>
        </section>

        {/* Defective Items */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <AlertTriangle className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Defective Items</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p>
              If you have received a defective laptop, it is eligible for a full refund or exchange following the verification process. Claims made after the return period will be treated as warranty claims.
            </p>
            
            {/* Image Section */}
            {/* <div className="rounded-lg overflow-hidden shadow mt-6">
              <img
                src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Defective Laptop Repair and Warranty"
                className="w-full h-48 object-cover"
              />
            </div> */}
          </div>
        </section>

        {/* Refund Duration */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Clock className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Refund Duration</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p>
              Upon receipt of your returned laptop, please allow up to two weeks for the return process to be completed. Once processed, refunds will be issued within 7 to 14 business days to your original payment method.
            </p>
          </div>
        </section>

        {/* How to Initiate a Return */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <RotateCcw className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">How to Initiate a Return</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>In-Store Returns:</strong> Visit our location at: Grabatoz, 5 Admiral Plaza Hotel Building, Khalid Bin Waleed Road, Bur Dubai, Dubai, PO Box: 241975.
              </li>
              <li>Please bring the laptop along with the original tax invoice received via email or phone. Head to our customer service desk to initiate the return process.</li>
              <li>
                <strong>Online Returns:</strong> For online purchases made through our website, please email your order details to <strong>support@grabatoz.com</strong>, and our customer support team will provide you with the necessary return instructions.
              </li>
            </ul>
          </div>
        </section>

        {/* Non-Eligible Items */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <XCircle className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Non-Eligible Items for Return or Exchange</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Customized order products</li>
              <li>Cut cables or wires</li>
            </ul>
          </div>
        </section>

        {/* Refund Process */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <CreditCard className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Refund Process</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p>
              Refunds will be processed within 7 to 14 business days after completing the return process. Refunds will be issued to the original payment method used during purchase.
            </p>
          </div>
        </section>

        {/* Restocking Fee */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <CreditCard className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Restocking Fee</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p>
              For opened or used products, a minimum restocking fee of 15% may be applied to cover handling and restocking costs.
            </p>
          </div>
        </section>

        {/* Important Note */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <AlertTriangle className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Important Note</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p>
              Grabatoz reserves the right to take action against customers who abuse the return policy, including issuing warnings, implementing restrictions, refusing returns, and suspending or terminating relevant customer accounts, if necessary.
            </p>
            
            {/* Image Section */}
            <div className="rounded-lg overflow-hidden shadow mt-6">
              <img
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Policy Enforcement and Account Management"
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        </section>

      </div>

      {/* Contact Information */}
      <section className="bg-gray-50 text-black p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Contact Information</h2>
            <p className="text-black">Get in touch with our team for any questions or concerns</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Phone className="w-5 h-5 text-lime-500" />
              </div>
              <h3 className="font-medium mb-1">Phone</h3>
              <a href="tel:+97143540566" className="text-lime-500">
                +971 4 354 0566
              </a>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Mail className="w-5 h-5 text-lime-500" />
              </div>
              <h3 className="font-medium mb-1">Email</h3>
              <a href="mailto:support@grabatoz.com" className="text-lime-500">
                support@grabatoz.com
              </a>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Clock className="w-5 h-5 text-lime-500" />
              </div>
              <h3 className="font-medium mb-1">Hours</h3>
              <p className="text-lime-500">Daily 9:00 AM - 7:00 PM</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <MapPin className="w-5 h-5 text-lime-500" />
              </div>
              <h3 className="font-medium mb-1">Address</h3>
              <p className="text-lime-500">P.O. Box 241975, Dubai, UAE</p>
            </div>
          </div>
          
          <div className="text-center pt-4 border-t border-gray-700">
            <p className="text-black">
              <strong>Grabatoz.ae</strong><br />
              <b>Powered by Crown Excel General Trading LLC</b>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


