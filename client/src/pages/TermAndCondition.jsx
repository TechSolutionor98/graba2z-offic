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


import React from "react";

const sections = [
  {
    title: "1. Membership Eligibility",
    content: (
      <ul className="list-disc pl-6 space-y-2">
        <li>Only individuals legally eligible to enter contracts as per UAE law can use our services.</li>
        <li>Users under 18 must use the site under supervision of a parent or guardian who agrees to the terms.</li>
        <li>Access may be terminated if users violate terms or provide false information.</li>
        <li>Users outside the UAE are responsible for complying with local laws.</li>
      </ul>
    ),
    image: "https://via.placeholder.com/400x300?text=Membership",
  },
  {
    title: "2. Account & Registration",
    content: (
      <ul className="list-disc pl-6 space-y-2">
        <li>Keep your account credentials secure and confidential.</li>
        <li>Provide accurate registration details and keep them updated.</li>
        <li>Report unauthorized account access immediately.</li>
        <li>False or misleading info may lead to account suspension.</li>
      </ul>
    ),
    image: "https://via.placeholder.com/400x300?text=Account",
  },
  {
    title: "3. Pricing & Orders",
    content: (
      <ul className="list-disc pl-6 space-y-2">
        <li>Errors in price or product info may result in cancellation.</li>
        <li>You will be notified before dispatch if any discrepancy arises.</li>
        <li>Prices may change without notice.</li>
        <li>Refunds are processed via original payment methods only.</li>
      </ul>
    ),
    image: "https://via.placeholder.com/400x300?text=Pricing",
  },
  {
    title: "4. Product Display & Communication",
    content: (
      <>
        <p>
          Colors may differ due to device settings. Refer to detailed product specs before buying. Use support tools like chat or callback for clarity.
        </p>
        <p className="mt-4">
          By using Grabatoz.ae, you consent to receive emails and electronic communications from us.
        </p>
      </>
    ),
    image: "https://via.placeholder.com/400x300?text=Display",
  },
  {
    title: "5. Contact Information",
    content: (
      <p>
        Grabatoz.ae<br />
        Powered by Crown Excel General Trading LLC<br />
        P.O. Box No: 241975, Dubai, UAE<br />
        📞 Tel: +971 4 354 0566<br />
        ✉️ Email: customercare@grabatoz.ae<br />
        🕒 Service Hours: 9:00 AM to 7:00 PM Daily
      </p>
    ),
    image: "https://via.placeholder.com/400x300?text=Contact",
  },
];

function TermsAndConditions() {
  return (
    <div className="bg-white font-poppins min-h-screen px-4 md:px-16 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 text-gray-900">
          Terms & Conditions
        </h1>

        {/* Introduction */}
        <div className="mb-14 text-[17px] leading-[26px] text-gray-800 max-w-4xl mx-auto text-center">
          <p>
            Welcome to Grabatoz.ae, a service by Crown Excel General Trading LLC.
            By using our site, you agree to the following terms and conditions.
            Your order is treated as an "offer" and is only accepted upon dispatch of products.
          </p>
        </div>

        {/* Sections with alternating image/text layout */}
        {sections.map((section, index) => (
          <div
            key={index}
            className={`grid md:grid-cols-2 gap-8 items-center mb-16 ${
              index % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Image */}
            <div className="w-full">
              <img
                src={section.image}
                alt={section.title}
                className="rounded-lg w-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="text-gray-800 text-[17px] leading-[26px]">
              <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
              {section.content}
            </div>
          </div>
        ))}

        {/* Final Note */}
        <div className="text-center text-[16px] text-gray-600 mt-10">
          <p>
            These terms may change without notice. Continued use of Grabatoz.ae confirms your acceptance.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;
