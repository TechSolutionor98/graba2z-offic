import React from 'react';
import { EnvelopeSimple, Phone } from 'phosphor-react';

function RefundAndReturn() {
  return (
    
    <div className="font-poppins text-[#000000] px-4 py-12 md:px-16 bg-white min-h-screen">
         <h1 className="text-4xl font-bold text-center mb-4">Refund and Return Policies</h1>
        <p className="text-center mb-8 text-lg">
          At <span className="font-bold">Grabatoz</span>, we are committed to ensuring your satisfaction with every purchase. If for any reason you are not entirely satisfied with your laptop purchase, we are here to assist you.
        </p>
      <div className="max-w-6xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-2xl">
       

        <div className="space-y-6 text-[17px] leading-[23px]">
          <p><span className="font-bold text-lg">Return Period:</span> You have 15 days from the date of receipt of your laptop to initiate a return.</p>

          <p><span className="font-bold text-lg">Eligibility:</span> To qualify for a return, the laptop must meet the following conditions:</p>
          <ol className="list-decimal pl-6 space-y-2 text-lg">
            <li>The laptop must be in the same condition as when you received it, including all original packaging, accessories, manuals, warranty cards, and any seals intact.</li>
            <li>The returned laptop should be the exact original item received.</li>
            <li>The laptop must not be damaged due to misuse or mishandling.</li>
          </ol>

          <p><span className="font-bold text-lg">Defective Items:</span> If you have received a defective laptop, it is eligible for a full refund or exchange following the verification process. Claims made after the return period will be treated as warranty claims.</p>

          <p><span className="font-bold">Refund Duration:</span> Upon receipt of your returned laptop, please allow up to two weeks for the return process to be completed. Once processed, refunds will be issued within 7 to 14 business days to your original payment method.</p>

          <h2 className="font-bold text-2xl">How to Initiate a Return:</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-bold text-lg">In-Store Returns:</span> Visit our location at: <span className="font-bold">Grabatoz</span> 5 Admiral Plaza Hotel Building Khalid Bin Waleed Road Bur Dubai, Dubai PO Box: 241975
            </li>
            <li>
              Please bring the laptop along with the original tax invoice received via email or phone. Head to our customer service desk to initiate the return process.
            </li>
            <li>
              <span className="font-bold text-lg">Online Returns:</span> For online purchases made through our website, please email your order details to support@grabatoz.com, and our customer support team will provide you with the necessary return instructions.
            </li>
          </ul>

          <p><span className="font-bold text-2xl">Non-Eligible Items for Return or Exchange:</span> The following items are not eligible for return or exchange if the packaging is opened or the item is used:</p>
          <ul className="list-disc pl-6 text-lg">
            <li>Customized order products</li>
            <li>Cut cables or wires</li>
          </ul>

          <p><span className="font-bold text-lg">Refund Process:</span> Refunds will be processed within 7 to 14 business days after completing the return process. Refunds will be issued to the original payment method used during purchase.</p>

          <p><span className="font-bold text-lg">Restocking Fee:</span> For opened or used products, a minimum restocking fee of 15% may be applied to cover handling and restocking costs.</p>

          <p><span className="font-bold text-lg">Important Note:</span> <span className="font-bold">Grabatoz</span> reserves the right to take action against customers who abuse the return policy, including issuing warnings, implementing restrictions, refusing returns, and suspending or terminating relevant customer accounts, if necessary.</p>

          <h2 className="font-bold mt-8 text-lg">For further inquiries or concerns about privacy, please contact us at:</h2>
          <div className="mt-4 space-y-3 text-lg">
            <p className="flex items-center gap-2 text-lg">
              <EnvelopeSimple size={20} /> <span className="font-bold">Support@Grabatoz.com</span>
            </p>
            <p className="flex items-center gap-2 text-lg">
              <Phone size={20} /> <span className="font-bold text-lg">(+971) 4-354 0566</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RefundAndReturn;
