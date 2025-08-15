"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, RotateCcw, Clock, CheckCircle, XCircle, CreditCard, AlertTriangle, Phone, Mail, MapPin, FileText, Home, Truck, Settings, Info } from "lucide-react";

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
            Return & Refund & Exchange Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            At Grabatoz, powered by Crown Excel General Trading LLC we value your satisfaction and strive to provide a smooth and reliable shopping experience. for any reason if you are not fully satisfied with our products, you can return or exchange your product.
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
              <Shield className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Return Eligibility</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              Grabatoz offers ,<strong> 15 days return windows to the date of receipt </strong> of your order to <strong> initiate a return request.</strong>
            </p>

            <div className="space-y-4 text-gray-700">
              <p>Oooh plaining for a return, we are sorry to hear but anyways please ensure that:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>The product is in original condition, including:</li>
                <li>The item should be in its original condition, with all tags and labels attached.</li>
                <li>It must be unused, undamaged, and free from any stains or odors</li>
                <li>For all electronics and tech items, all accessories and manuals should be included.</li>
                <li>Any protective seals or labels intact</li>
                <li>The product has not been damaged due to misuse, mishandling, or unauthorized modification</li>
                <li>Products that are customized, with cut cables/wires, or missing original components are not eligible for return or exchange.</li>
              </ol>
            </div>
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
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Return Methods</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>Grabatoz have two options for return and exchange product:</p>
            <ol className="list-inside space-y-2 ml-4">
              <li><b>1. In Store </b></li>
              <li><b>2.	Pick-Up from Home</b></li>
            </ol>
          </div>
        </section>

        {/* Defective Items */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <MapPin className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">In-Store Return, Refund & Exchange</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              <strong>  Grabatozs </strong>  offers the convenience of <strong>in-store returns, refunds, and exchanges </strong> at any of our <strong> three physical locations</strong>  across the UAE.
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
              <Settings className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">How It Works:</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              You may visit any of our Crown Excel experience center or branch and locations to request a return, refund, or product exchange. Please make sure sure the item is in the original packaging, unused, and sealed exactly as time of received.
            </p>
          </div>
        </section>

        {/* How to Initiate a Return */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <AlertTriangle className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Important note:</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              Items that are <strong> not in their original packaging </strong> or have <strong>broken seals</strong>  may be subject to rejection or handled according to the <strong> specific brand’s return policy.</strong> Grabatoz reserves the right to apply additional <strong> terms and conditions </strong> based on <strong> manufacturer or supplier guidelines. </strong>
              Bring the item and the original tax invoice (received by email or phone). Our customer service team will assist you with the process.

            </p>
          </div>
        </section>

        {/* Non-Eligible Items */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Home className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Pick-Up from Home – Return Service</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              At <strong>Grabatoz,</strong> our aim to provide a hassle-free return experience. For your convenience, we offer a <strong> Pick-Up from Home </strong>  return option.
            </p>
          </div>
        </section>

        {/* Refund Process */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Truck className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">How It Works:</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              Our  <strong>dedicated grabian delivery team</strong> or an <strong>authorized delivery partner</strong> will contact you to schedule a suitable <strong> pickup time </strong>at your convenience.
              The returned item will be <strong>transported to our store</strong>  for inspection and processing.

            </p>
          </div>
        </section>

        {/* Restocking Fee */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <Info className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Important:</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              Please ensure the product is in the <strong> original condition, unused,</strong> and securely packed in its <strong> original packaging,</strong>  along with the <strong> original invoice or proof of purchase.
                Return delivery charges</strong>  will be <strong> borne by the customer</strong> and may vary based on location or product type.
              Once the item is received and inspected, a  <strong>refund or exchange </strong> will be processed in accordance with our return policy.

            </p>
          </div>
        </section>



        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <CreditCard className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Refund Process</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              Once the returned product is <strong>received and verified</strong> by our <strong>product inspection team,</strong> a <strong>refund or exchange</strong> will be initiated with in <strong>15 days.</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Refunds will be issued to the <strong>original payment method</strong> used at the time of purchase.</li>
              <li>Exchanges will be processed based on <strong>product availability</strong> and customer preference.</li>
              <li>The process will begin <strong>immediately after successful inspection</strong> of the returned item.</li>
              <li><strong>Important:</strong> the inspection ensures the product is in its <strong>original condition, unused,</strong> and in <strong>original packaging,</strong> as per our return policy.</li>
              <li>Processing time may vary based on the payment service provider; it takes a minimum of 2 or in some cases up to 15 business days.</li>
              <li>All refunds are processed in AED; international transactions are automatically converted to your local currency by your payment provider.</li>
            </ul>
          </div>
        </section>



        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <FileText className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Important Policy Notes</h2>

          </div>
          <p className="text-red-400"><strong>Grabatoz reserves the right to:</strong> </p>
          <div className="space-y-4 text-gray-700">
            <ol>
              <li>	Refuse returns that do not meet the conditions stated above.</li>
              <li>	Take appropriate action against policy abuse, which may include warnings, return restrictions, or account suspension.</li>
            </ol>
          </div>
        </section>
        {/* Important Note */}
        <section className="bg-white rounded-lg mt-5 p-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex justify-center md:justify-start">
              <AlertTriangle className="w-8 h-8 text-lime-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">Defective (Damaged) & Non-Defective Items</h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-6 text-gray-700">
            <div className="flex-1 space-y-4">
              <ul className="list-none space-y-3">
                <li>
                  <span className="font-semibold list-none">Defective Items:</span>
                  <ul className="list-disc list-inside ml-5 space-y-1">
                    <li>Report within 15 days of delivery with order details and photos.</li>
                    <li>We will verify and arrange a replacement or refund.</li>
                    <li>Return shipping for defective items will be covered by us.</li>
                  </ul>
                </li>
                <li>
                  <span className="font-semibold list-none">Non-Defective Items:</span>
                  <ul className="list-disc list-inside ml-5 space-y-1">
                    <li>Returns accepted only if the item is unused and in original packaging.</li>
                    <li>Must be requested within 15 days of delivery.</li>
                    <li>Return shipping costs are the customer’s responsibility.</li>
                  </ul>
                </li>
              </ul>
            </div>

            {/* Image Section - right on desktop, below on mobile */}
            <div className="md:w-1/3">
              <div className="rounded-lg overflow-hidden shadow md:mt-0 mt-6">
                <img
                  src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Defective device inspection and repair"
                  className="w-full h-auto md:h-48 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Contact Information */}
      <section className="bg-gray-50 text-black p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Contact Information</h2>
            <p className="text-black">For questions or concerns regarding Return and Refunds terms please contact:</p>
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
              <a href="mailto:support@grabatoz.com" className="text-black">
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


