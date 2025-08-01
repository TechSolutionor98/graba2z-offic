export default function DeliveryInfo() {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Information</h1>
            <p className="text-lg text-lime-500 font-semibold">Grabatoz, Powered by Crown Excel General Trading LLC</p>
            <p className="text-gray-600 mt-2">
              we are committed to delivering your orders efficiently and reliably across the United Arab Emirates. Please
              review the following delivery options, charges, and terms:
            </p>
          </div>
  
          {/* Standard Delivery Section */}
          <div className="bg-lime-50 p-6 rounded-lg border-l-4 border-lime-500">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              🚚 Standard Delivery to Your Doorstep (UAE Only)
            </h2>
            <p className="text-gray-700 mb-4">
              Deliveries are available to your provided shipping address anywhere in the UAE.
            </p>
  
            <h3 className="text-xl font-semibold text-lime-500 mb-3">Order Value wise Shipping Fee</h3>
  
            <div className="space-y-4">
              <div className="bg-white p-4 rounded border border-lime-200">
                <p className="font-medium text-lime-500">Below AED 500</p>
                <p className="text-gray-700">will be charges AED 20.00 delivery charges</p>
                <p className="text-gray-700">
                  if COD (Cash on Delivery) then COD Handling Fee: AED 5.00 will be applicable (Non-refundable)
                </p>
                <p className="text-gray-700">
                  AED 20 Delivery Charges +5 COD handling Fee total payable on delivery AED 25.00
                </p>
              </div>
  
              <div className="bg-white p-4 rounded border border-lime-200">
                <p className="font-medium text-lime-500">AED 500 or Above</p>
                <p className="text-gray-700">Eligible for FREE delivery</p>
                <p className="text-gray-700">
                  if COD (Cash on Delivery) then COD Handling Fee: AED 5.00 (Non-refundable) applicable only.
                </p>
              </div>
            </div>
  
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-lime-500 mb-3">Payment Methods Available</h3>
              <p className="text-gray-700">Cash on Delivery, Credit Card, Bank Transfer, Tabby, Tamara</p>
            </div>
  
            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <p>
                · Free Shipping is applicable on a single order (one order ID) with a value of AED 500 or more, excluding
                any applied voucher or discount codes.
              </p>
              <p>· Offer is valid for UAE customers only.</p>
              <p>
                · For bulk orders or international deliveries, please refer to our Bulk Delivery Section or contact
                Customer Care through the available support channels.
              </p>
              <p>· COD Handling Fee: AED 5.00 (Non-refundable)</p>
              <p>· Delivery Schedule: No deliveries on Sundays or UAE Public Holidays</p>
              <p>· Rates mentioned are per order</p>
            </div>
          </div>
  
          {/* In-Store Pickup Section */}
          <div className="bg-lime-50 p-6 rounded-lg border-l-4 border-lime-500">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">🏪 In-Store Pickup</h2>
            <p className="text-gray-700 mb-4">
              Collect your items from designated in-store pickup Grabatoz Powered by Crown Excel General Trading LLC offer
              4 locations at Dubai UAE for in-store Pickup.
            </p>
  
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-3 rounded border border-lime-200">
                <p className="font-medium text-lime-500">Service</p>
                <p className="text-gray-700">FREE Pickup on All Orders</p>
              </div>
              <div className="bg-white p-3 rounded border border-lime-200">
                <p className="font-medium text-lime-500">Payment</p>
                <p className="text-gray-700">Credit Card only</p>
              </div>
            </div>
  
            <div className="space-y-2 text-sm text-gray-600">
              <p>· To find a pickup location near you, please visit our Store Finder page</p>
              <p>· Bulky items may require pickup from store locations only</p>
              <p>
                · In case of space or logistics limitations, our Customer Care Team will reach out to provide alternative
                shipping options
              </p>
              <p>· No deliveries on Sundays or UAE Public Holidays</p>
            </div>
  
            <p className="mt-4 text-gray-700">
              For assistance or inquiries regarding delivery, please contact our Customer Care Team via live chat,
              WhatsApp, or email.
            </p>
          </div>
  
          {/* Delivery Policy Section */}
          <div className="bg-lime-50 p-6 rounded-lg border-l-4 border-lime-500">
            <h2 className="text-2xl font-semibold text-lime-500 mb-4">Delivery Policy for Retail</h2>
            <p className="text-gray-700 mb-4">
              At Grabatoz, powered by Crown Excel General Trading LLC, we are committed to providing a smooth, reliable,
              and express delivery experience. As part of our promise, all standard deliveries are handled on a priority
              basis. However, delivery times may vary depending on product availability, address confirmation, and
              serviceability in remote or urban areas as per our trusted courier partners.
            </p>
  
            <p className="text-gray-700 mb-4">Please review the following key points of our delivery policy:</p>
  
            <div className="space-y-4">
              <div className="bg-white p-4 rounded border border-lime-200">
                <h3 className="text-lg font-semibold text-lime-500">Delivery Schedule:</h3>
                <p className="text-gray-700">We arrange daily deliveries, except on Sundays and UAE Public Holidays.</p>
              </div>
  
              <div className="bg-white p-4 rounded border border-lime-200">
                <h3 className="text-lg font-semibold text-lime-500">Possible Delays:</h3>
                <p className="text-gray-700 mb-2">
                  While we aim to meet the estimated delivery timelines at checkout, delays may occasionally occur due to
                  circumstances beyond our control, including:
                </p>
                <ol className="list-decimal list-inside text-gray-700 space-y-1 ml-4">
                  <li>Customs clearance procedures</li>
                  <li>Deliveries to remote, mobile, or less-accessible urban areas</li>
                  <li>Local and international retail shipping</li>
                  <li>Force majeure events (e.g., extreme weather, logistical disruptions)</li>
                  <li>Inability to contact or locate the recipient at the time of delivery</li>
                </ol>
              </div>
  
              <div className="bg-white p-4 rounded border border-lime-200">
                <h3 className="text-lg font-semibold text-lime-500">Change of Delivery Address:</h3>
                <p className="text-gray-700">
                  If you need to update your shipping address, kindly contact our Customer Care Team before dispatch
                  confirmation.
                </p>
                <p className="text-red-600 font-medium mt-2">
                  ⚠️ Please note: Once your order is confirmed as dispatched, we are unable to make any changes to the
                  delivery address.
                </p>
              </div>
            </div>
  
            <p className="text-gray-700 mt-4">
              We value your trust and patience. For further assistance, please reach out to our support team through the
              available channels on our website or app.
            </p>
          </div>
  
          {/* Bulk Orders Section */}
          <div className="bg-lime-50 p-6 rounded-lg border-l-4 border-lime-500">
            <h2 className="text-2xl font-semibold text-lime-500 mb-4">Bulk Orders Delivery Information</h2>
            <p className="text-gray-700 mb-4">
              At Grabatoz, powered by Crown Excel General Trading LLC, we are pleased to accommodate bulk orders. However,
              please note the following important information regarding shipping:
            </p>
  
            <div className="mb-4">
              <div className="bg-white p-4 rounded border border-lime-200">
                <h3 className="text-lg font-semibold text-lime-500 mb-2">Shipping Costs</h3>
                <p className="text-gray-700 mb-2">
                  While we gladly accept bulk purchases, shipping charges for bulk orders will either be borne by the
                  customer or mutually agreed upon, as per the applicable terms.
                </p>
                <p className="text-gray-700">
                  Shipping costs are calculated based on the actual weight or volumetric (dimensional) weight of the
                  shipment—whichever is higher, and may vary for local and international deliveries.
                </p>
              </div>
            </div>
  
            <div className="mb-4">
              <div className="bg-white p-4 rounded border border-lime-200">
                <h3 className="text-lg font-semibold text-lime-500 mb-2">How It Works:</h3>
                <p className="text-gray-700 mb-2">Once we receive your bulk order request:</p>
                <ol className="list-decimal list-inside text-gray-700 space-y-1 ml-4">
                  <li>Our team will calculate the shipping cost.</li>
                  <li>
                    We will email you the full delivery details, including the shipping fee, before processing your order.
                  </li>
                  <li>
                    Your confirmation is required to proceed. Upon your approval, the order will be processed and
                    dispatched.
                  </li>
                </ol>
              </div>
            </div>
  
            <div>
              <div className="bg-white p-4 rounded border border-lime-200">
                <h3 className="text-lg font-semibold text-lime-500 mb-2">Contact for Bulk Orders:</h3>
                <p className="text-gray-700">
                  To inquire about bulk orders and associated shipping costs, please contact our Customer Care Team.
                </p>
              </div>
            </div>
          </div>
  
          {/* Contact Information */}
          <div className="bg-lime-100 p-6 rounded-lg border-2 border-lime-500">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-lime-500 mb-2">Grabatoz.ae</h3>
              <p className="text-gray-700 mb-4">Powered by Crown Excel General Trading LLC</p>
              <p className="text-gray-700 mb-4">P.O. Box No: 241975, Dubai, UAE</p>
  
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-lime-500">Customer Service:</h4>
                <p className="text-gray-700">📞 Tel: +971 4 354 0566</p>
                <p className="text-gray-700">✉️ Email: customercare@grabatoz.ae</p>
                <p className="text-gray-700">🕒 Customer service hours: Every day from 9:00 AM to 7:00 PM</p>
              </div>
  
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 font-medium">
                  ⚠️Please ensure someone is available to accept the delivery at the provided address once the order has
                  been confirmed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  