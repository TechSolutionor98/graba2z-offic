import React from 'react';

function TermsAndConditions() {
  return (
    <div className="bg-white-100 min-h-screen px-4 md:px-16 py-12">
      <div >
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Grabatoz Terms and Conditions</h1>
        <p className="text-center max-w-3xl mx-auto text-gray-600 mb-10">
          Welcome to <strong>Grabatoz</strong>’s official website. By purchasing laptops and accessories from us, you agree to adhere to the terms and conditions listed below. Please read them carefully.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Column 1 */}
          <div className="bg-white-100 p-6 rounded-lg shadow-2xl">
            <h2 className="text-xl font-semibold mb-4">1. General Terms</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li><strong>Use of Products:</strong> For personal, non-commercial use only. No reselling or distribution without our consent.</li>
              <li><strong>Product Availability:</strong> Subject to availability. If unavailable, we will offer an alternative or refund.</li>
              <li><strong>Price and Payment:</strong> Prices may change without notice. Full payment required at purchase.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Delivery</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li><strong>Charges:</strong> Not included in the product price; calculated at checkout.</li>
              <li><strong>Times:</strong> Estimated delivery times may vary. We will notify of significant delays.</li>
              <li><strong>International Shipping:</strong> Available for select products. Customer is responsible for any additional fees.</li>
              <li><strong>Order Tracking:</strong> Tracking number provided upon shipment.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Returns and Refunds</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li><strong>Return Policy:</strong> 7-day return policy for a full refund if the product is in original condition.</li>
              <li><strong>Refund Process:</strong> Refunds processed within a week of receiving the return. Additional bank processing time may apply.</li>
              <li><strong>Defective/Damaged Products:</strong> Contact us immediately for a replacement or refund.</li>
              <li><strong>Exclusions:</strong> No returns on customized, used, or final sale items.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Privacy Policy</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>We protect your personal information and use it solely for order fulfillment. No sharing without consent, except as required by law.</li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="bg-white-100 p-6 rounded-lg shadow-2xl">
            <h2 className="text-xl font-semibold mb-4">5. Intellectual Property</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>All content on our website is protected by intellectual property laws and is our property or our licensors’.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">6. Governing Law</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Governed by UAE laws. Disputes resolved by Dubai courts or an appointed arbitrator.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">7. Reviews and Feedback</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Submitted comments become Grabatoz’s property, granting us perpetual rights to use them. We may monitor, edit, or remove any submissions.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">8. Customer Cancellations</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Cancel within 24 hours of purchase without penalty. Contact customer service with order details. Cancellations beyond this may incur fees.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">9. Seller Cancellations</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>We may cancel orders due to inventory issues, pricing errors, or transaction concerns, offering alternatives or refunds.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">10. Credit Card Details</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Transactions are secure. We do not store credit card details. Payments handled by trusted, PCI-compliant processors.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">11. Changes to Terms</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Terms may change; continued use of our website indicates acceptance.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;
