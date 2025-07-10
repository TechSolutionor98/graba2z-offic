import React from 'react';
import { EnvelopeSimple, Phone, MapPin } from 'phosphor-react';

function CookiesAndPolicy() {
  return (
    <div className="font-poppins text-[#000000] px-4 py-12 md:px-16 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-2xl">
        <h1 className="text-5xl font-bold text-center mb-8">Cookies Policy</h1>

        <div className="space-y-6 text-[17px] leading-[23px]">
          <div>
            <h2 className="font-bold mb-2 text-3xl">Introduction</h2>
            <p className="font-normal">
              Welcome to Grabatoz! Our website uses cookies to enhance your browsing experience and ensure the smooth functioning of our services. 
              By continuing to use our site, you agree to our use of cookies as described in this policy.
            </p>
          </div>

          <div>
            <h2 className="font-bold mb-2 text-2xl">What Are Cookies?</h2>
            <p className="font-normal">
              Cookies are small text files stored on your device (computer, tablet, or mobile) when you visit a website. 
              They help us recognize your device and store information about your preferences or past actions.
            </p>
          </div>

          <div>
            <h2 className="font-bold mb-2 text-2xl">Types of Cookies We Use</h2>
            <ol className="list-decimal pl-4 space-y-2">
              <li>
                <span className="font-bold">Essential Cookies:</span>{' '}
                <span className="font-normal">
                  These cookies are necessary for the website to function correctly. 
                  They enable core features such as security, network management, and accessibility.
                </span>
              </li>
              <li>
                <span className="font-bold">Performance Cookies:</span>{' '}
                <span className="font-normal">
                  These cookies collect information about how you use our website, such as pages visited and any errors encountered. 
                  This helps us improve the site's functionality and user experience.
                </span>
              </li>
              <li>
                <span className="font-bold">Functional Cookies:</span>{' '}
                <span className="font-normal">
                  These cookies remember your preferences and settings to provide a more personalized experience, 
                  such as your language preference or login details.
                </span>
              </li>
              <li>
                <span className="font-bold">Targeting Cookies:</span>{' '}
                <span className="font-normal">
                  These cookies track your browsing habits to deliver personalized advertising based on your interests. 
                  They also help measure the effectiveness of advertising campaigns.
                </span>
              </li>
            </ol>
          </div>

          <div>
            <h2 className="font-bold mb-2 text-2xl">How We Use Cookies</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="font-bold">To Provide Essential Services:</span>{' '}
                <span className="font-normal">Ensuring secure login and protection against fraudulent activities.</span>
              </li>
              <li>
                <span className="font-bold">To Improve User Experience:</span>{' '}
                <span className="font-normal">Analyzing site usage to enhance website performance and usability.</span>
              </li>
              <li>
                <span className="font-bold">To Personalize Content:</span>{' '}
                <span className="font-normal">Storing your preferences and login details for a customized experience.</span>
              </li>
              <li>
                <span className="font-bold">To Deliver Targeted Ads:</span>{' '}
                <span className="font-normal">Displaying relevant ads based on your browsing behavior and preferences.</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold mb-2 text-2xl">Managing Cookies</h2>
            <p className="font-normal mb-2">
              You can manage or disable cookies through your browser settings. However, please note that disabling cookies may affect your ability to use certain features of our website.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="font-bold">Browser Settings:</span>{' '}
                <span className="font-normal">
                  Most browsers allow you to control cookies through their settings preferences. 
                  Refer to your browser’s help section for instructions on how to delete or block cookies.
                </span>
              </li>
              <li>
                <span className="font-bold">Opting Out of Targeted Advertising:</span>{' '}
                <span className="font-normal">
                  You can opt out of interest-based advertising through industry opt-out pages like the 
                  Digital Advertising Alliance (DAA) or the Network Advertising Initiative (NAI).
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold mb-2 text-2xl">Third-Party Cookies</h2>
            <p className="font-normal">
              We may also use third-party cookies provided by trusted partners to deliver targeted advertising and analytics services. 
              These third parties have their own privacy policies and cookie practices.
            </p>
          </div>

          <div>
            <h2 className="font-bold mb-2 text-2xl">Changes to This Policy</h2>
            <p className="font-normal mb-4">
              We may update our Cookies Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. 
              Please revisit this page periodically to stay informed about our use of cookies.
            </p>
            <p className="font-normal mb-4">
              If you have any questions about our Cookies Policy, privacy practices, or any other inquiries related to your experience with Grabatoz, 
              please feel free to reach out to us. Our customer service team is here to assist you.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <EnvelopeSimple size={20} className="mt-1 text-black" />
                <span><span className="font-bold">Email:</span> <span className="font-normal">support@grabatoz.com</span></span>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={20} className="mt-1 text-black" />
                <span><span className="font-bold">Phone:</span> <span className="font-normal">+1 (123) 456-7890</span></span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={20} className="mt-1 text-black" />
                <span>
                  <span className="font-bold">Mailing Address:</span>{' '}
                  <span className="font-normal">Grabatoz Customer Service 123 Tech Avenue Suite 100 Silicon Valley, CA 94043 USA</span>
                </span>
              </li>
            </ul>
          </div>

          <p className="font-normal mt-6">
            We value your feedback and are committed to providing the best possible service. Thank you for choosing Grabatoz!
          </p>
        </div>
      </div>
    </div>
  );
}

export default CookiesAndPolicy;
