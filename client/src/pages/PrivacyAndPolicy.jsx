"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Eye, FileText, Users, Globe, Phone, Mail, MapPin, Clock, CreditCard, Database } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  const handleArabicClick = () => {
    navigate('/privacy-policy-arabic');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-lime-500 rounded-full p-4">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Understanding how we collect, use, and protect your personal information at Grabatoz.ae
          </p>
          
          {/* Language Switch Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleArabicClick}
              className="bg-lime-500 hover:bg-lime-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              العربية Arabic
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-200">
          <div className="flex items-start gap-4">
            <FileText className="w-6 h-6 text-lime-500 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Important Notice</h2>
              <p className="text-gray-700 leading-relaxed">
                Grabatoz, powered by Crown Excel General Trading LLC ("we," "us," or "our"), respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and protect your information when you use our website grabatoz.ae and related services.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Images */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-6 h-6 text-lime-500" />
            <h2 className="text-2xl font-semibold text-gray-900">Privacy Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                alt="Data Protection" 
                className="rounded-lg shadow-md object-cover w-full h-48"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                <p className="text-white font-semibold text-lg">Data Protection</p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                alt="Secure Information" 
                className="rounded-lg shadow-md object-cover w-full h-48"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                <p className="text-white font-semibold text-lg">Secure Information</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account and Registration */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-lime-500" />
            <h2 className="text-2xl font-semibold text-gray-900">Account and Registration Obligations</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p>
              Grabatoz respect your privacy. This Privacy Policy provides succinctly the manner your data is collected and used by grabatoz.ae. You are advised to please read this Privacy Policy carefully. By accessing the services provided by grabatoz.ae you agree to the collection and use of your data by grabatoz.ae and certain authorized third-party service providers in the manner provided in this Privacy Policy.
            </p>
            <p>
              If you do not agree with this Privacy Policy, please do not use the website ("grabatoz.ae"). This Privacy Policy describes the information, as part of the normal operation of our services; we collect from you and what may happen to that information.
            </p>
            <div className="bg-lime-50 border-l-4 border-lime-500 p-4 rounded">
              <p className="font-medium text-gray-800">
                By accepting the Privacy Policy during registration, you expressly consent to our use and disclosure of your personal information in accordance with this Privacy Policy.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Commitment */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-lime-500" />
            <h2 className="text-2xl font-semibold text-gray-900">Your Privacy – Our Commitment</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <ul className="list-disc list-inside space-y-2">
              <li>Feel secure using our site</li>
              <li>Contact us with privacy concerns</li>
              <li>Contact Us with your questions or concerns about privacy on this Site</li>
              <li>Know your data is protected and only used for service enhancement</li>
            </ul>
            
            <div className="bg-lime-50 border-l-4 border-lime-500 p-4 rounded mt-6">
              <h3 className="font-semibold text-gray-800 mb-2">Privacy Guarantee:</h3>
              <p className="text-gray-700">
                <strong>Grabatoz</strong> promises that we will not sell or rent your personal information to third parties (except as provided in this Privacy Policy) without your consent. Your trust and confidence are our highest priority.
              </p>
            </div>
          </div>
        </section>

        {/* Information Collection */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-lime-500" />
            <h2 className="text-2xl font-semibold text-gray-900">Information We Collect</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <ul className="list-disc list-inside space-y-2">
              <li>Registration and profile details</li>
              <li>Transaction and payment card details</li>
              <li>Anonymous data via cookies (IP, browser, device type)</li>
              <li>Optional survey, feedback, or promotional data</li>
            </ul>
            
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">What Information Is or may be collected from You:</h3>
              <p>
                Grabatoz.ae collects the details provided by you on registration together with information we learn about you from your use of our service and your visits to our Site. We also collect information about the transactions you undertake including details of payment cards used. We may collect additional information in connection with your participation in any promotions or competitions offered by us.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Personally Identifiable Information:</h3>
              <p>We may collect the following personally identifiable information about you:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Name including first and last name</li>
                <li>Mobile phone number and contact details</li>
                <li>Demographic profile (like your age, address)</li>
                <li>Opinions on the features on our Site</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Credit Card Security */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-lime-500" />
            <h2 className="text-2xl font-semibold text-gray-900">Credit/Debit Card Security</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p>
              We do not keep any credit card details in our database or server, which is processed through SSL environment. All credit/debit cards details will NOT be sold, shared, rented or leased to any third parties.
            </p>
            
            <div className="bg-lime-50 border-l-4 border-lime-500 p-4 rounded">
              <h3 className="font-semibold text-gray-800 mb-2">Anonymous Information:</h3>
              <p className="text-gray-700">
                We will automatically receive and collect certain anonymous information in standard usage logs through our Web server, including computer-identification information obtained from "cookies" sent to your browser.
              </p>
            </div>
          </div>
        </section>

        {/* Use of Information */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-lime-500" />
            <h2 className="text-2xl font-semibold text-gray-900">Use of Your Information</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <ul className="list-disc list-inside space-y-2">
              <li>Provide and improve personalized services</li>
              <li>Contact you for service, support, and promotions</li>
              <li>Send newsletters, surveys, or notifications</li>
              <li>Analyze site usage and traffic patterns</li>
            </ul>

            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Our Use of Your Information:</h3>
              <p>Use your personal information to:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Help us provide personalized features</li>
                <li>Tailor our Site to your interests</li>
                <li>Get in touch with you whenever necessary</li>
                <li>Provide the services requested by you</li>
                <li>Preserve social history as governed by existing law or policy</li>
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Our Disclosure of Your Information:</h3>
              <p>We will not use your personal information for any purpose other than to complete a transaction with you. We do not rent, sell or share your personal information and we will not disclose any of your personally identifiable information to third parties unless:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>We have your permission</li>
                <li>To provide products or services you've requested</li>
                <li>To help investigate, prevent or take action regarding unlawful and illegal activities</li>
                <li>Special circumstances such as compliance with subpoenas, court orders, requests from legal authorities</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-lime-500" />
            <h2 className="text-2xl font-semibold text-gray-900">Data Security and Your Rights</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p>
              To protect against the loss, misuse and alteration of the information under our control, we have in place appropriate physical, electronic and managerial procedures.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                  alt="Data Security" 
                  className="rounded-lg shadow-md object-cover w-full h-32"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                  <p className="text-white font-semibold">Secure Servers</p>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                  alt="User Rights" 
                  className="rounded-lg shadow-md object-cover w-full h-32"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                  <p className="text-white font-semibold">User Rights</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Your Users' Rights:</h3>
              <p>You have specific rights concerning your personal data under applicable laws:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Right to information</li>
                <li>Right to rectification or erasure</li>
                <li>Right to restriction of processing</li>
                <li>Right to object to processing</li>
                <li>Right to data portability</li>
              </ul>
            </div>

            <div className="bg-lime-50 border-l-4 border-lime-500 p-4 rounded mt-6">
              <h3 className="font-semibold text-gray-800 mb-2">Cookies and Tracking Technologies:</h3>
              <p className="text-gray-700">
                Our site uses cookies and similar tracking technologies to improve user experience, security, and site functionality. You may disable cookies via your browser settings; however, some features may not function properly without cookies enabled.
              </p>
            </div>
          </div>
        </section>

        {/* Updates and Contact */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-lime-500" />
            <h2 className="text-2xl font-semibold text-gray-900">Updates and Your Consent</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p>
              This privacy notice may be updated periodically due to legal changes or new features. We recommend checking it regularly for updates.
            </p>
            <p>
              By using the Site, you consent to the collection and use of the information you disclose on grabatoz.ae by Crown Excel General Trading LLC. If we change our Privacy Policy, we will post those changes on this page to keep you informed.
            </p>
          </div>
        </section>

      </div>

      {/* Contact Information */}
      <section className="bg-white text-black p-4">
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
              <a href="tel:+97143540566" className="text-lime-400 hover:text-lime-300">
                +971 4 354 0566
              </a>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Mail className="w-5 h-5 text-lime-500" />
              </div>
              <h3 className="font-medium mb-1">Email</h3>
              <a href="mailto:customercare@grabatoz.ae" className="text-lime-400 hover:text-lime-300">
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