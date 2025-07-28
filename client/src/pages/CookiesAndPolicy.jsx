import React from 'react';
import { EnvelopeSimple, Phone, MapPin } from 'phosphor-react';

function CookiesAndPolicy() {
  return (
    <div className="font-poppins text-[#000000] px-4 py-12 md:px-16 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-lg ">
        <h1 className="text-5xl font-bold text-center mb-8">Cookies & Tracking Technologies</h1>

        <div className="space-y-6 text-[17px] leading-[23px]">
          <div>
            <p className="font-normal">
              Our site uses cookies and similar tracking technologies to improve user experience, security, and site functionality.
              Cookies may be used to remember your preferences, enable shopping features, analyze site traffic, and display personalized content or advertisements.
              You may disable cookies via your browser settings; however, some features of our site may not function properly without cookies enabled.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-2xl mb-2">Disclosure to Third Parties</h2>
            <p className="font-normal">
              We will only share your personal data with other parties, including companies and external individuals, if legal permission to do so exists.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-2xl mb-2">Cookies in Our App</h2>
            <p className="font-normal">
              We utilize cookies and similar technologies within the application to enhance user experience and overall efficiency.
              Cookies are small text files stored on your device to help with usability and performance.
              We use session cookies (deleted after session) and permanent cookies.
              Necessary cookies are essential for basic functions and security. Other cookies may require consent.
            </p>
          </div>

          {/* 📸 First Image Section */}
          <div className="rounded-lg overflow-hidden shadow mt-6">
            <img
              src="Privacy.jpg" // <-- Replace with actual URL
              alt="Cookies Inside App"
              className="w-full h-auto object-cover"
            />
          </div>

          <div>
            <h2 className="font-bold text-2xl mb-2">Analysis Services</h2>
            <ul className="list-disc pl-6 space-y-2">
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

          <div>
            <h2 className="font-bold text-2xl mb-2">Your Users' Rights</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Right to information</li>
              <li>Right to rectification or erasure</li>
              <li>Right to restriction of processing</li>
              <li>Right to object to processing</li>
              <li>Right to data portability</li>
            </ul>
            <p className="font-normal mt-2">
              For data protection inquiries, contact: <strong>customercare@grabatoz.ae</strong>
            </p>
          </div>

          <div>
            <h2 className="font-bold text-2xl mb-2">Email & Postal Communication</h2>
            <p className="font-normal">
              With your consent during registration, we may send you newsletters via email or post. You can revoke consent at any time.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-2xl mb-2">Links to External Websites</h2>
            <p className="font-normal">
              Our app may contain links to third-party websites. Once accessed, we are no longer responsible for their data collection or practices. Refer to their privacy policies.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-2xl mb-2">Data Security</h2>
            <p className="font-normal">
              You are responsible for access to your device and password security. We use technical and organizational safeguards but cannot guarantee complete security during internet transmission.
            </p>
          </div>

          {/* 📸 Second Image Section */}
          <div className="rounded-lg overflow-hidden shadow mt-6">
            <img
              src="data.jpg" // <-- Replace with actual URL
              alt="Data Security Measures"
              className="w-full h-auto object-cover"
            />
          </div>

          <div>
            <h2 className="font-bold text-2xl mb-2">Updates to Privacy Notice</h2>
            <p className="font-normal">
              This privacy notice may change due to legal, operational, or feature-related updates. Please check regularly for updates.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-2xl mb-2">Your Consent</h2>
            <p className="font-normal">
              By using grabatoz.ae, you consent to the data practices by Crown Excel General Trading LLC. Any policy changes will be posted here.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-2xl mb-2">Contact Details</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <EnvelopeSimple size={20} className="mt-1 text-black" />
                <span><strong>Email:</strong> customercare@grabatoz.ae</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={20} className="mt-1 text-black" />
                <span><strong>Phone:</strong> (+971) 4-354 0566</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={20} className="mt-1 text-black" />
                <span><strong>Mailing Address:</strong> Grabatoz, 5 Admiral Plaza Hotel Building, Khalid Bin Waleed Road, Bur Dubai, Dubai, PO Box: 241975</span>
              </li>
              <li>
                <strong>Customer Service Hours:</strong> 9:00 AM – 7:00 PM daily
              </li>
            </ul>
          </div>

          <p className="font-normal mt-6">
            We value your feedback and are committed to protecting your data. Thank you for choosing Grabatoz.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CookiesAndPolicy;
