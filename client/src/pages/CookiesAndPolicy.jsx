"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Cookie, Eye, Database, Lock, Globe, Phone, Mail, MapPin, Clock, FileText } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import TranslatedText from "../components/TranslatedText";

export default function CookiesAndPolicy() {
  const navigate = useNavigate();
  const { getLocalizedPath } = useLanguage();

  // Future functionality for Arabic version
  // const handleArabicClick = () => {
  //   navigate('/cookies-policy-arabic');
  // };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white ">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-lime-500 rounded-full p-4">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <TranslatedText>Cookies & Tracking Technologies</TranslatedText>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-3"><TranslatedText>Important Notice</TranslatedText></h2>
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
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Disclosure to Third Parties</TranslatedText></h2>
          </div>

          <div className="space-y-4 text-center text-gray-700">
            <p>
            We will only share your personal data with other parties, including companies and external individuals, if legal permission to do so exists.
Cookies and Tracking Technologies. We utilize cookies and similar technologies within the application to enhance user experience and overall efficiency. Cookies are small text files assigned to your browser and stored on your hard drive, enhancing the app's user-friendliness and effectiveness.
Cookies can contain data allowing device recognition but typically don't personally identify users. We differentiate between session cookies (deleted after closing the browser) and permanent cookies (stored beyond the session).
We use necessary cookies for app navigation, basic functions, and security purposes. Consent-based technologies that enhance app usage may also be utilized.            </p>
          </div>
        </section>

        {/* Cookies in Our App */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Cookie className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Analysis Services</TranslatedText></h2>
          </div>

          <div className="space-y-4 text-center text-gray-700">
            <p>
            We utilize beaconsmind AG to provide insights into app usage, user preferences, statistical analyses of products and stores, and purchase histories. The statistics obtained help us enhance the app's offerings and make them more appealing to users. In addition, with your consent, we can track your presence in a store using the beacon technology mentioned.
            </p>
           
            {/* Image Section */}
          
          
          </div>
        </section>

            <div className="flex flex-col justify-center items-center md:flex-row md:justify-center gap-14">

            <div className="rounded-lg mt-6">
              <img
                src="https://www.nokia.com/sites/default/files/2022-01/cybersecurity4_0.jpg?height=600&width=1920&resize=1"
                alt="Cookies Inside App"
                className="hidden md:block w-[900px] h-[300px] rounded-lg bg-cover"
              />
            </div>
            


        {/* Analysis Services */}
        <section className="bg-white rounded-lg mt-5 p-1">

          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Database className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Google Analytics</TranslatedText></h2>
          </div>

          <div className="space-y-4 text-gray-700">
             <p>We utilize features of Google Analytics. Google Analytics helps us analyze and enhance app usage regularly, utilizing obtained statistics to improve offerings for users.</p>
             
          </div>



          
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Database className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Sentry</TranslatedText></h2>
          </div>

          <div className="space-y-4 text-gray-700">
<p>Our app uses the error diagnosis service Sentry, provided by Functional Software, Inc., to diagnose app crashes or unexpected errors. Relevant information is sent to Sentry's servers for analysis and diagnostics.</p>             
          </div>
        </section>

        </section>


        </div>

        {/* Your Users' Rights */}
        
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Shield className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Your Users' Rights</TranslatedText></h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <p>You have specific rights concerning your personal data under applicable laws:</p>
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
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Email & Postal Communication</TranslatedText></h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
            During registration and acceptance of our terms of use, you can consent to receive email and postal newsletters. We process your email and postal addresses to send you relevant communications. You can revoke this consent at any time without providing reasons.            </p>
          </div>
        </section>

        {/* Links to External Websites */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Globe className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Links to External Websites</TranslatedText></h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
            Our app may contain links to websites of third-party providers. When you access these links, we no longer control data collection and usage. Refer to the respective provider's privacy policy for comprehensive information on data collection and use.            </p>
          </div>
        </section>

        {/* Data Security */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Lock className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Data Security</TranslatedText></h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
            You are responsible for controlling access to your mobile device and maintaining password confidentiality. We employ technical and organizational security measures to protect your personal data against unauthorized access, loss, or alterations. However, complete data protection during internet transmission (e.g., email communication) is not guaranteed.            </p>

          
          </div>
        </section>

        {/* Updates to Privacy Notice */}

        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <FileText className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Updates to Privacy Notice</TranslatedText></h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
            This privacy notice may be updated periodically due to legal changes or new features. We recommend checking it regularly for updates.
            For any privacy-related inquiries, please contact us at customercare@grabatoz.ae             </p>
          </div>
        </section>


          {/* Image Section */}
          <div className="rounded-lg overflow-hidden shadow mt-6">
              <img
                src="https://humanfocus.co.uk/wp-content/uploads/what-is-cyber-security.jpg"
                alt="Data Security Measures"
                className="w-[700px] h-48 bg-cover"
              />
            </div>

            </div>

        {/* Your Consent */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Shield className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left"><TranslatedText>Your Consent</TranslatedText></h2>
          </div>

          <div className="space-y-4 text-gray-700">
          <p>By using the Site, you consent to the collection and use of the information you disclose on the website grabatoz.ae by Crown Excel General Trading LLC. If we decide to change our Privacy Policy, we will post those changes on this page so that you are always aware of what information we collect, how we use it, and under what circumstances we disclose it</p>
          </div>
        </section>

      </div>

      {/* Contact Information */}
      <section className="bg-gray-50 text-black p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2"><TranslatedText>Contact Information</TranslatedText></h2>
            <p className="text-black"><TranslatedText>Get in touch with our team for any questions or concerns</TranslatedText></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Phone className="w-5 h-5 text-lime-500" />
              </div>
              <h3 className="font-medium mb-1"><TranslatedText>Phone</TranslatedText></h3>
              <a href="tel:+97143540566" className="text-black">
                +971 4 354 0566
              </a>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Mail className="w-5 h-5 text-lime-500" />
              </div>
              <h3 className="font-medium mb-1"><TranslatedText>Email</TranslatedText></h3>
              <a href="mailto:customercare@grabatoz.ae" className="text-black">
                customercare@grabatoz.ae
              </a>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Clock className="w-5 h-5 text-lime-500" />
              </div>
              <h3 className="font-medium mb-1"><TranslatedText>Hours</TranslatedText></h3>
              <p className="text-black"><TranslatedText>Daily 9:00 AM - 7:00 PM</TranslatedText></p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <MapPin className="w-5 h-5 text-lime-500" />
              </div>
              <h3 className="font-medium mb-1"><TranslatedText>Address</TranslatedText></h3>
              <p className="text-black"><TranslatedText>P.O. Box 241975, Dubai, UAE</TranslatedText></p>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-gray-700">
            <p className="text-black">
              <strong>Grabatoz.ae</strong><br />
              <b><TranslatedText>Powered by Crown Excel General Trading LLC</TranslatedText></b>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
