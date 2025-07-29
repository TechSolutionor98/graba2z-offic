"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Cookie, Eye, Database, Lock, Globe, Phone, Mail, MapPin, Clock, FileText } from "lucide-react";

export default function CookiesAndPolicy() {
  const navigate = useNavigate();

  // Future functionality for Arabic version
  // const handleArabicClick = () => {
  //   navigate('/cookies-policy-arabic');
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
            Cookies & Tracking Technologies
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Understanding how we use cookies and tracking technologies to improve your experience at Grabatoz.ae
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
                Our site uses cookies and similar tracking technologies to improve user experience, security, and site functionality.
                Cookies may be used to remember your preferences, enable shopping features, analyze site traffic, and display personalized content or advertisements.
                You may disable cookies via your browser settings; however, some features of our site may not function properly without cookies enabled.
              </p>
            </div>
          </div>
        </div>

        {/* Disclosure to Third Parties */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Eye className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Disclosure to Third Parties</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              We will only share your personal data with other parties, including companies and external individuals, if legal permission to do so exists.
            </p>
          </div>
        </section>

        {/* Cookies in Our App */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Cookie className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Cookies in Our App</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              We utilize cookies and similar technologies within the application to enhance user experience and overall efficiency.
              Cookies are small text files stored on your device to help with usability and performance.
              We use session cookies (deleted after session) and permanent cookies.
              Necessary cookies are essential for basic functions and security. Other cookies may require consent.
            </p>

            {/* Image Section */}
            <div className="rounded-lg overflow-hidden shadow mt-6">
              <img
                src="Privacy.jpg"
                alt="Cookies Inside App"
                className="w-full h-48 bg-cover"
              />
            </div>
          </div>
        </section>

        {/* Analysis Services */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Database className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Analysis Services</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>beaconsmind AG:</strong> Tracks app usage, user preferences, and store presence using beacon technology, with your consent.
              </li>
              <li>
                <strong>Google Analytics:</strong> Provides insights to improve app features and user engagement.
              </li>
              <li>
                <strong>Sentry:</strong> Identifies and reports crashes or unexpected errors in the app using diagnostic information.
              </li>
            </ul>
          </div>
        </section>

        {/* Your Users' Rights */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Shield className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Your Users' Rights</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Right to information</li>
              <li>Right to rectification or erasure</li>
              <li>Right to restriction of processing</li>
              <li>Right to object to processing</li>
              <li>Right to data portability</li>
            </ul>
            <p className="mt-4">
              For data protection inquiries, contact: <strong>customercare@grabatoz.ae</strong>
            </p>
          </div>
        </section>

        {/* Email & Postal Communication */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Mail className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Email & Postal Communication</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              With your consent during registration, we may send you newsletters via email or post. You can revoke consent at any time.
            </p>
          </div>
        </section>

        {/* Links to External Websites */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Globe className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Links to External Websites</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              Our app may contain links to third-party websites. Once accessed, we are no longer responsible for their data collection or practices. Refer to their privacy policies.
            </p>
          </div>
        </section>

        {/* Data Security */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Lock className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Data Security</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              You are responsible for access to your device and password security. We use technical and organizational safeguards but cannot guarantee complete security during internet transmission.
            </p>

            {/* Image Section */}
            <div className="rounded-lg overflow-hidden shadow mt-6">
              <img
                src="data.jpg"
                alt="Data Security Measures"
                className="w-full h-48 bg-cover"
              />
            </div>
          </div>
        </section>

        {/* Updates to Privacy Notice */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <FileText className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Updates to Privacy Notice</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              This privacy notice may change due to legal, operational, or feature-related updates. Please check regularly for updates.
            </p>
          </div>
        </section>

        {/* Your Consent */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Shield className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Your Consent</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              By using grabatoz.ae, you consent to the data practices by Crown Excel General Trading LLC. Any policy changes will be posted here.
            </p>
            <p className="mt-6">
              We value your feedback and are committed to protecting your data. Thank you for choosing Grabatoz.
            </p>
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
