// import React from 'react';

// function TermsAndConditions() {
//   return (
//     <div className="bg-white-100 min-h-screen px-4 md:px-16 py-12">
//       <div >
//         <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Grabatoz Terms and Conditions</h1>
//         <p className="text-center max-w-3xl mx-auto text-gray-600 mb-10">
//           Welcome to <strong>Grabatoz</strong>’s official website. By purchasing laptops and accessories from us, you agree to adhere to the terms and conditions listed below. Please read them carefully.
//         </p>

//         <div className="grid md:grid-cols-2 gap-8">
//           {/* Column 1 */}
//           <div className="bg-white-100 p-6 rounded-lg shadow-2xl">
//             <h2 className="text-xl font-semibold mb-4">1. General Terms</h2>
//             <ul className="list-disc ml-6 space-y-2 text-gray-700">
//               <li><strong>Use of Products:</strong> For personal, non-commercial use only. No reselling or distribution without our consent.</li>
//               <li><strong>Product Availability:</strong> Subject to availability. If unavailable, we will offer an alternative or refund.</li>
//               <li><strong>Price and Payment:</strong> Prices may change without notice. Full payment required at purchase.</li>
//             </ul>

//             <h2 className="text-xl font-semibold mt-8 mb-4">2. Delivery</h2>
//             <ul className="list-disc ml-6 space-y-2 text-gray-700">
//               <li><strong>Charges:</strong> Not included in the product price; calculated at checkout.</li>
//               <li><strong>Times:</strong> Estimated delivery times may vary. We will notify of significant delays.</li>
//               <li><strong>International Shipping:</strong> Available for select products. Customer is responsible for any additional fees.</li>
//               <li><strong>Order Tracking:</strong> Tracking number provided upon shipment.</li>
//             </ul>

//             <h2 className="text-xl font-semibold mt-8 mb-4">3. Returns and Refunds</h2>
//             <ul className="list-disc ml-6 space-y-2 text-gray-700">
//               <li><strong>Return Policy:</strong> 7-day return policy for a full refund if the product is in original condition.</li>
//               <li><strong>Refund Process:</strong> Refunds processed within a week of receiving the return. Additional bank processing time may apply.</li>
//               <li><strong>Defective/Damaged Products:</strong> Contact us immediately for a replacement or refund.</li>
//               <li><strong>Exclusions:</strong> No returns on customized, used, or final sale items.</li>
//             </ul>

//             <h2 className="text-xl font-semibold mt-8 mb-4">4. Privacy Policy</h2>
//             <ul className="list-disc ml-6 space-y-2 text-gray-700">
//               <li>We protect your personal information and use it solely for order fulfillment. No sharing without consent, except as required by law.</li>
//             </ul>
//           </div>

//           {/* Column 2 */}
//           <div className="bg-white-100 p-6 rounded-lg shadow-2xl">
//             <h2 className="text-xl font-semibold mb-4">5. Intellectual Property</h2>
//             <ul className="list-disc ml-6 space-y-2 text-gray-700">
//               <li>All content on our website is protected by intellectual property laws and is our property or our licensors’.</li>
//             </ul>

//             <h2 className="text-xl font-semibold mt-8 mb-4">6. Governing Law</h2>
//             <ul className="list-disc ml-6 space-y-2 text-gray-700">
//               <li>Governed by UAE laws. Disputes resolved by Dubai courts or an appointed arbitrator.</li>
//             </ul>

//             <h2 className="text-xl font-semibold mt-8 mb-4">7. Reviews and Feedback</h2>
//             <ul className="list-disc ml-6 space-y-2 text-gray-700">
//               <li>Submitted comments become Grabatoz’s property, granting us perpetual rights to use them. We may monitor, edit, or remove any submissions.</li>
//             </ul>

//             <h2 className="text-xl font-semibold mt-8 mb-4">8. Customer Cancellations</h2>
//             <ul className="list-disc ml-6 space-y-2 text-gray-700">
//               <li>Cancel within 24 hours of purchase without penalty. Contact customer service with order details. Cancellations beyond this may incur fees.</li>
//             </ul>

//             <h2 className="text-xl font-semibold mt-8 mb-4">9. Seller Cancellations</h2>
//             <ul className="list-disc ml-6 space-y-2 text-gray-700">
//               <li>We may cancel orders due to inventory issues, pricing errors, or transaction concerns, offering alternatives or refunds.</li>
//             </ul>

//             <h2 className="text-xl font-semibold mt-8 mb-4">10. Credit Card Details</h2>
//             <ul className="list-disc ml-6 space-y-2 text-gray-700">
//               <li>Transactions are secure. We do not store credit card details. Payments handled by trusted, PCI-compliant processors.</li>
//             </ul>

//             <h2 className="text-xl font-semibold mt-8 mb-4">11. Changes to Terms</h2>
//             <ul className="list-disc ml-6 space-y-2 text-gray-700">
//               <li>Terms may change; continued use of our website indicates acceptance.</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default TermsAndConditions;


"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, FileText, Users, CreditCard, Globe, Phone, Mail, MapPin, Clock } from "lucide-react";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  // Future functionality for Arabic version
  // const handleArabicClick = () => {
  //   navigate('/terms-conditions-arabic');
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
            Terms & Conditions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to Grabatoz.ae, a service by Crown Excel General Trading LLC. Understanding our terms and your rights when using our services.
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
        
        {/* Introduction */}
        <div className="bg-white rounded-lg p-1">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="flex justify-center md:justify-start">
              <FileText className="w-8 h-8 text-lime-500 mt-1 flex-shrink-0" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Important Notice</h2>
              <p className="text-gray-700 leading-relaxed">
                By using our site, you agree to the following terms and conditions.
                Your order is treated as an "offer" and is only accepted upon dispatch of products.
              </p>
            </div>
          </div>
        </div>

        {/* Membership Eligibility */}
        <section className="bg-white rounded-lg mt-5 ">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
                <div className="flex justify-center md:justify-start">
                  <Users className="w-8 h-8 text-lime-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">1. Membership Eligibility</h2>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Only individuals legally eligible to enter contracts as per UAE law can use our services.</li>
                  <li>Users under 18 must use the site under supervision of a parent or guardian who agrees to the terms.</li>
                  <li>Access may be terminated if users violate terms or provide false information.</li>
                  <li>Users outside the UAE are responsible for complying with local laws.</li>
                </ul>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Membership and Legal Compliance" 
                className="rounded-lg shadow-md object-cover w-full h-64"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </section>

        {/* Account & Registration */}
        <section className="bg-white rounded-lg mt-5 ">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative md:order-2">
              <img 
                src="https://images.unsplash.com/photo-1633265486064-086b219458ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Account Security and Registration" 
                className="rounded-lg shadow-md object-cover w-full h-64"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
            
            <div className="md:order-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
                <div className="flex justify-center md:justify-start">
                  <FileText className="w-8 h-8 text-lime-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">2. Account & Registration</h2>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Keep your account credentials secure and confidential.</li>
                  <li>Provide accurate registration details and keep them updated.</li>
                  <li>Report unauthorized account access immediately.</li>
                  <li>False or misleading info may lead to account suspension.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing & Orders */}
        <section className="bg-white rounded-lg mt-5 ">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
                <div className="flex justify-center md:justify-start">
                  <CreditCard className="w-8 h-8 text-lime-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">3. Pricing & Orders</h2>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Errors in price or product info may result in cancellation.</li>
                  <li>You will be notified before dispatch if any discrepancy arises.</li>
                  <li>Prices may change without notice.</li>
                  <li>Refunds are processed via original payment methods only.</li>
                </ul>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Pricing and Payment Processing" 
                className="rounded-lg shadow-md object-cover w-full h-64"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </section>

        {/* Product Display & Communication */}
        <section className="bg-white rounded-lg mt-5 ">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative md:order-2">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Product Display and Communication" 
                className="rounded-lg shadow-md object-cover w-full h-64"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
            
            <div className="md:order-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
                <div className="flex justify-center md:justify-start">
                  <Globe className="w-8 h-8 text-lime-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">4. Product Display & Communication</h2>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Colors may differ due to device settings. Refer to detailed product specs before buying. Use support tools like chat or callback for clarity.
                </p>
                <p>
                  By using Grabatoz.ae, you consent to receive emails and electronic communications from us.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final Note */}
      

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
              <a href="mailto:customercare@grabatoz.ae" className="text-lime-500">
                customercare@grabatoz.ae
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
