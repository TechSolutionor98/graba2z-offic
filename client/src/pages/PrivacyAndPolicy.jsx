import React from 'react';
import '@fontsource/poppins'; // base
import '@fontsource/poppins/700.css'; // bold

import { MapPin, EnvelopeSimple, Phone } from 'phosphor-react';

function PrivacyAndPolicy() {
  return (
    <div className="bg-white-100 min-h-screen px-4 md:px-16 py-12">
      <div >
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Account and Registration Obligations</h1>
        <p className="text-gray-700 mb-6">
          <strong>Grabatoz</strong> and its subsidiaries (“<strong>Grabatoz</strong>”) respect your privacy. This Privacy Policy outlines how your data is collected and utilized by <strong>Grabatoz</strong>. By accessing our services, you consent to the collection and use of your data as described in this Privacy Policy. If you do not agree with this policy, please refrain from using our website.
        </p>

        <h2 className="font-semibold text-lg mb-2">Privacy Commitment:</h2>
        <p className="text-gray-700 mb-6">
          At <strong>Grabatoz</strong>, we are committed to protecting your privacy. We value the trust you place in us and strive to ensure your confidence in our services. This policy is designed to inform you about how we treat your personal information as you engage with our website.
        </p>

        <h2 className="font-semibold text-lg mb-2">Privacy Guarantee:</h2>
        <p className="text-gray-700 mb-6">
          <strong>Grabatoz</strong> assures you that we will not sell or rent your personal information to third parties without your consent, except as outlined in this Privacy Policy. Your information may be shared with our authorized third-party service providers for communication purposes. We may also provide general statistical information about our website and visitors, maintaining the highest level of confidentiality.
        </p>

        <div className="grid md:grid-cols-2 gap-8 items-start mt-10">
          <div>
            <h2 className="font-semibold text-lg mb-2">Information Collection:</h2>
            <p className="text-gray-700 mb-4">
              <strong>Grabatoz</strong> collects information provided by you during registration and through your use of our services. This includes transaction details, payment card information, and any additional data provided during promotions or feedback submissions. We also gather anonymous traffic information to enhance user experience and monitor website usage.
            </p>

            <h2 className="font-semibold text-lg mb-2">Credit Card Details:</h2>
            <p className="text-gray-700 mb-4">
              We do not store any credit card details in our database. All transactions are processed through a secure SSL environment.
            </p>

            <h2 className="font-semibold text-lg mb-2">Anonymous Information:</h2>
            <p className="text-gray-700">
              We automatically collect certain anonymous information through standard usage logs, including cookies, IP addresses, and browser details. These are utilized for various purposes such as simplifying the login process, enhancing security, and monitoring website traffic.
            </p>
          </div>

          <div className="rounded-lg overflow-hidden shadow">
            <img
              src="/privacy.png"
              alt="Privacy Catalogue"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        <div className="mt-10 space-y-6">
          <div>
            <h2 className="font-semibold text-lg">Personally Identifiable Information:</h2>
            <p className="text-gray-700">
              Personally identifiable information collected by <strong>Grabatoz</strong> may include your name, contact details, demographic profile, and opinions on website features. You have the option to terminate your account and request the deletion of your data at any time.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg">Use of Information:</h2>
            <p className="text-gray-700">
              We utilize your personal information to personalize your experience on our website, provide tailored services, and communicate with you as needed. Additionally, anonymous traffic information helps us improve our services and diagnose server issues.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg">Disclosure of Information:</h2>
            <p className="text-gray-700">
              We do not disclose your personal information to third parties unless required for legal compliance, fraud prevention, or at your explicit consent.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg">Your Choices:</h2>
            <p className="text-gray-700">
              Supplying personally identifiable information is voluntary, and you can unsubscribe from our communications at any time. You have the right to access, correct, or delete your personal data as needed.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg">Security:</h2>
            <p className="text-gray-700">
              We employ physical, electronic, and managerial measures to protect your information from loss, misuse, or alteration. However, please note that internet transmissions may not be entirely secure.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg">Access and Changes to Information:</h2>
            <p className="text-gray-700">
              To access or modify your personally identifiable information, verification of identity is required. We reserve the right to update our policies, with any changes being effective immediately upon posting on our website.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Consent:</h2>
          <p className="text-gray-700 mb-6">
            By using our website, you consent to the collection and use of your information by Techatooz. Any changes to this Privacy Policy will be communicated through our website.
          </p>

          <p className="font-semibold mb-4">For further inquiries or concerns about privacy, please contact us at:</p>

          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start gap-2">
              <MapPin size={24} className="text-gray-800 mt-1" />
              Grabatoz, 5 Admiral Plaza Hotel Building, Khalid Bin Waleed Road, Bur Dubai, Dubai PO Box: 241975
            </li>
            <li className="flex items-start gap-2">
              <EnvelopeSimple size={24} className="text-gray-800 mt-1" />
              Support@Grabatoz.com
            </li>
            <li className="flex items-start gap-2">
              <Phone size={24} className="text-gray-800 mt-1" />
              (+971) 4-354 0566
            </li>
          </ul>

          <p className="text-center font-medium mt-10 text-lg text-gray-800">
            Thank you for entrusting Grabatoz with your privacy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyAndPolicy;
