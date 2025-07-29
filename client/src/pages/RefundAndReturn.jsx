// 

"use client";

import React from "react";
import { EnvelopeSimple, Phone } from "phosphor-react";

function RefundAndReturn() {
  return (
    <div className="font-poppins text-[#1f1f1f] px-4 py-12 md:px-16 bg-[#f9fafb] min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
          Refund and Return Policies
        </h1>

        <p className="text-center mb-10 text-lg text-gray-600">
          At <span className="font-bold text-gray-800">Grabatoz</span>, we are committed to ensuring your satisfaction with every purchase.
          If for any reason you are not entirely satisfied with your laptop purchase, we are here to assist you.
        </p>

        <div className="bg-white p-6 md:p-10 rounded-xl border border-gray-200 space-y-6 text-[17px] leading-[28px]">

          <p>
            <span className="font-bold text-lg text-gray-800">Return Period:</span> You have 15 days from the date of receipt of your laptop to initiate a return.
          </p>

          <p>
            <span className="font-bold text-lg text-gray-800">Eligibility:</span> To qualify for a return, the laptop must meet the following conditions:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-lg text-gray-700">
            <li>The laptop must be in the same condition as when you received it, including all original packaging, accessories, manuals, warranty cards, and any seals intact.</li>
            <li>The returned laptop should be the exact original item received.</li>
            <li>The laptop must not be damaged due to misuse or mishandling.</li>
          </ol>

          <p>
            <span className="font-bold text-lg text-gray-800">Defective Items:</span> If you have received a defective laptop, it is eligible for a full refund or exchange following the verification process. Claims made after the return period will be treated as warranty claims.
          </p>

          <p>
            <span className="font-bold text-lg text-gray-800">Refund Duration:</span> Upon receipt of your returned laptop, please allow up to two weeks for the return process to be completed. Once processed, refunds will be issued within 7 to 14 business days to your original payment method.
          </p>

          <h2 className="font-bold text-2xl pt-4 text-gray-800">How to Initiate a Return:</h2>
          <ul className="list-disc pl-6 space-y-2 text-lg text-gray-700">
            <li>
              <span className="font-bold text-lg text-gray-800">In-Store Returns:</span> Visit our location at: <span className="font-bold">Grabatoz</span>, 5 Admiral Plaza Hotel Building, Khalid Bin Waleed Road, Bur Dubai, Dubai, PO Box: 241975.
            </li>
            <li>Please bring the laptop along with the original tax invoice received via email or phone. Head to our customer service desk to initiate the return process.</li>
            <li>
              <span className="font-bold text-lg text-gray-800">Online Returns:</span> For online purchases made through our website, please email your order details to <span className="font-bold">support@grabatoz.com</span>, and our customer support team will provide you with the necessary return instructions.
            </li>
          </ul>

          <p className="font-bold text-2xl pt-4 text-gray-800">Non-Eligible Items for Return or Exchange:</p>
          <ul className="list-disc pl-6 space-y-1 text-lg text-gray-700">
            <li>Customized order products</li>
            <li>Cut cables or wires</li>
          </ul>

          <p>
            <span className="font-bold text-lg text-gray-800">Refund Process:</span> Refunds will be processed within 7 to 14 business days after completing the return process. Refunds will be issued to the original payment method used during purchase.
          </p>

          <p>
            <span className="font-bold text-lg text-gray-800">Restocking Fee:</span> For opened or used products, a minimum restocking fee of 15% may be applied to cover handling and restocking costs.
          </p>

          <p>
            <span className="font-bold text-lg text-gray-800">Important Note:</span> <span className="font-bold">Grabatoz</span> reserves the right to take action against customers who abuse the return policy, including issuing warnings, implementing restrictions, refusing returns, and suspending or terminating relevant customer accounts, if necessary.
          </p>

          <h2 className="font-bold mt-8 text-lg text-gray-800">For further inquiries or concerns about privacy, please contact us at:</h2>
          <div className="mt-4 space-y-3 text-lg text-gray-700">
            <p className="flex items-center gap-2">
              <EnvelopeSimple size={20} />
              <span className="font-bold">Support@Grabatoz.com</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={20} />
              <span className="font-bold">(+971) 4-354 0566</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RefundAndReturn;
