"use client";

import React from "react";
import { useNavigate, Link } from "react-router-dom";
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
      <div className="bg-white">
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
        <div className="bg-white rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex justify-center md:justify-start">
              <div className="bg-lime-500 rounded-full p-3">
                <FileText className="w-8 h-8 text-white flex-shrink-0" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p>
                  Welcome to Grabatoz.ae, a service provided by Crown Excel General Trading LLC, United Arab Emirates. By accessing or using Grabatoz.ae or any associated services, you acknowledge and agree to the terms and conditions outlined below. These terms apply to all users of the site, including without limitation vendors, customers, merchants, and/or contributors of content.
                </p>
                <p>
                  All products and services displayed on Grabatoz.ae constitute an "invitation to offer." Your order represents an "offer," which is subject to acceptance by Grabatoz. Upon placing an order, you will receive an email confirming receipt of your order. This confirmation does not signify our acceptance. Our acceptance takes place only upon dispatch of the product(s) ordered.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          
          {/* Membership Eligibility */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Membership Eligibility</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>The services of Grabatoz.ae are only available to individuals who are legally eligible to enter into contracts as per UAE laws.</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Users below 18 years of age must use the site under supervision of a parent or legal guardian who agrees to be bound by these terms.</li>
                    <li>Grabatoz.ae reserves the right to terminate access to users found to be in violation of these terms or providing false information.</li>
                    <li>Users accessing the website from outside the UAE are responsible for compliance with their local laws.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Account & Registration */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Account & Registration</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>When using Grabatoz.ae, you are responsible for maintaining the confidentiality of your account and password and for restricting access to your device. You agree to accept responsibility for all activities under your account.</p>
                  <div>
                    <p className="font-medium mb-2">You agree to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Provide accurate and complete registration data.</li>
                      <li>Keep your information updated.</li>
                      <li>Inform us immediately in case of any unauthorized access or breach.</li>
                    </ul>
                  </div>
                  <p>Grabatoz reserves the right to suspend or terminate accounts for providing false, outdated, or misleading information.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing & Orders */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Pricing & Orders</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>Grabatoz.ae strives to provide accurate product descriptions and pricing. However, errors may occur.</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>In case of incorrect price or information, we reserve the right to cancel the order.</li>
                    <li>We will notify you via email before dispatch if there's a discrepancy in price or availability.</li>
                    <li>Prices and availability are subject to change without prior notice.</li>
                    <li>No cash refunds are provided; all refunds are processed via original payment methods.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Order Cancellation */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <Globe className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Order Cancellation</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    <strong>By Grabatoz:</strong> We reserve the right to cancel orders due to stock issues, pricing errors, or fraud concerns.
                  </p>
                  <p>
                    <strong>By Customer:</strong> You may cancel an order before it is processed. Once shipped, cancellations are not permitted.
                  </p>
                  <p>Refunds for canceled orders (by either party) will be credited to your original payment method. Or grabatoz will make a credit voucher.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Third-Party & Branded Product Disclaimer */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <Globe className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party & Branded Product Disclaimer</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Grabatoz.ae offers a variety of products, including items listed by third-party vendors, marketplace partners, and branded products supplied via external platforms. While some of these branded products may have originally been sourced through Grabatoz or Crown Excel General Trading LLC, we are not responsible for products sold directly by third-party sellers, vendors, or external platforms.
                  </p>
                  <p>Grabatoz assumes responsibility only for products sold directly by the official Grabatoz store or Crown Excel store. Any product listed by a third-party, even if originally supplied by Grabatoz, falls under the responsibility of the respective vendor or seller.</p>
                  <p>In the case of branded items, Grabatoz does not guarantee the performance, durability, or quality of such products. These aspects are solely determined by the original manufacturer. However, Grabatoz can assist in processing returns, warranty claims, or maintenance requests on behalf of the customer, strictly in accordance with the brand's or manufacturer's warranty, return, and exchange policy.</p>
                  <p>Customers are advised to read all seller and manufacturer policies carefully before making a purchase. Grabatoz is not liable for discrepancies in performance or service standards for third-party or branded items not directly sold by us.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Payment & Credit Card Information */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment & Credit Card Information</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <ul className="list-disc list-inside space-y-2">
                    <li>Payments must be made using valid credit/debit cards owned by the customer.</li>
                    <li>Grabatoz will not share payment information with third parties except in case of fraud investigation or as required by law.</li>
                    <li>Fraudulent transactions will be reported, and Grabatoz reserves the right to take legal action.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Declined or Fraudulent Transactions */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Declined or Fraudulent Transactions</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>Grabatoz reserves the right to recover the cost of goods, collection charges, and legal fees from users involved in fraudulent transactions.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Electronic Communications */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <Mail className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Electronic Communications</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>By visiting Grabatoz.ae or communicating with us electronically, you consent to receive communications from us electronically, including emails, notices, and updates.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Currency & Foreign Transactions */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Currency & Foreign Transactions</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <ul className="list-disc list-inside space-y-2">
                    <li>All transactions are processed in UAE Dirham (AED).</li>
                    <li>If your card is issued by a non-UAE bank, exchange rates and charges may apply.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Product Availability & "On Demand" Items */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <Globe className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Product Availability & "On Demand" Items</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <ul className="list-disc list-inside space-y-2">
                    <li>Items marked "check availability" are sourced upon order confirmation and may take additional time.</li>
                    <li>We do not guarantee availability for such items but will keep you informed throughout the process.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Use of the Site */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Use of the Site</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>You agree not to use the website for:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Posting unlawful or harmful content.</li>
                    <li>Conducting fraudulent transactions.</li>
                    <li>Gaining unauthorized access to systems.</li>
                    <li>Violating UAE laws or infringing intellectual property rights.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Colors & Product Display */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <Globe className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Colors & Product Display</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>We strive to display the colors and images of all products available on Grabatoz.ae as accurately as possible. However, the actual colors you see may vary depending on your screen resolution, device settings, or lighting conditions. Therefore, we cannot guarantee that your device's display will reflect the true color or appearance of the product.</p>
                  <p>To avoid misunderstandings, we strongly encourage customers to carefully review the complete product descriptions, specifications, and additional details provided on each product page. If you require further clarification or specific information about any product, our dedicated support team is always available to assist you.</p>
                  <p>For quick assistance, you may use the following available channels:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Chat with a Specialist</li>
                    <li>Request a Callback</li>
                  </ul>
                  <p>These features are designed to ensure you receive accurate guidance before making a purchase.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Intellectual Property Rights */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Intellectual Property Rights</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>All content, design, layout, graphics, and logos on Grabatoz.ae are the property of Crown Excel General Trading LLC or its licensors. You may not reproduce, distribute, or create derivative works without express written permission.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews & Submissions */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Reviews & Submissions</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>All content submitted to Grabatoz.ae (reviews, comments, suggestions) becomes the property of Grabatoz. We reserve the right to use, publish, or remove content at our discretion.</p>
                  <p>You agree not to post:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Obscene, illegal, or defamatory content.</li>
                    <li>Copyright-infringing material.</li>
                    <li>Spam or unauthorized advertising.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Indemnification */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Indemnification</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>You agree to indemnify and hold Grabatoz, its affiliates, employees, directors, and agents harmless from any claims, liabilities, or losses arising out of your violation of these terms, use of the site, or breach of laws.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Termination</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>Grabatoz reserves the right to suspend or terminate your access to the site at any time without notice, including for breach of terms or unlawful activity.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Governing Law & Jurisdiction */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <Globe className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Governing Law & Jurisdiction</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts of Dubai.</p>
                </div>
              </div>
            </div>
          </section>

          {/* OFAC Compliance */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">18. OFAC Compliance</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>Grabatoz will not process or ship any orders to OFAC-sanctioned countries, as per UAE regulations.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Privacy Policy */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">19. Privacy Policy</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>Your use of Grabatoz.ae is subject to our Privacy Policy, which outlines how we collect, use, and protect your personal data. We do not sell or rent your data without your consent. See our full <Link to="/privacy-policy" className="text-lime-600 hover:underline font-medium">Privacy Policy</Link> for more details.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex justify-center md:justify-start">
                <div className="bg-lime-500 rounded-full p-3">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">20. Changes to Terms</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>Grabatoz may update these Terms & Conditions at any time without prior notice. Continued use of the site after updates constitutes your acceptance of the revised terms.</p>
                </div>
              </div>
            </div>
          </section>

        </div>
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
              <a href="tel:+97143540566" className="text-black">
                +971 4 354 0566
              </a>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Mail className="w-5 h-5 text-lime-500" />
              </div>
              <h3 className="font-medium mb-1">Email</h3>
              <a href="mailto:customercare@grabatoz.ae" className="text-black">
                customercare@grabatoz.ae
              </a>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Clock className="w-5 h-5 text-lime-500" />
              </div>
              <h3 className="font-medium mb-1">Hours</h3>
              <p className="text-black">Daily 9:00 AM - 7:00 PM</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <MapPin className="w-5 h-5 text-lime-500" />
              </div>
              <h3 className="font-medium mb-1">Address</h3>
              <p className="text-black">P.O. Box 241975, Dubai, UAE</p>
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