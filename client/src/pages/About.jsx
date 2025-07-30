import React from 'react';
import {
  Star, Lightbulb, UsersThree, ListDashes, Medal, UserFocus,
  MapPin, EnvelopeSimple, Phone
} from 'phosphor-react';
import { Users, Phone as LucidePhone, Mail, Clock, MapPin as LucideMapPin } from 'lucide-react';

function AboutUs() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-lime-500 rounded-full p-4">
              <Users className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover Grabatoz - Your trusted technology partner in Dubai, UAE
          </p>
        </div>
      </div>

      <div className="font-poppins text-black">
      {/* About Section */}
      <div className="bg-white px-4 py-10 md:px-20 grid md:grid-cols-2 items-center gap-10">
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">ABOUT US</h2>
          <p className="text-[17px] leading-[23px] font-[400]">
            <strong>Grabatoz</strong> Grabatoz, powered by Crown Excel General Trading LLC is a premier name in the world of consumer electronics and technology solutions, proudly headquartered in Dubai, United Arab Emirates. Since our inception, we have been driven by a commitment to quality, innovation, and customer satisfaction, establishing ourselves as a trusted technology partner for individuals and businesses alike.
            With a focus on integrity and excellence, Grabatoz offers a wide range of computer electronics, Hardware, accessories, and many more exiting technologies, IT products, meeting the evolving needs of today’s fast-paced digital world. Our dedication to quality products, reliable service, and long-term relationships has made us a recognized and respected brand in the UAE and beyond.

          </p>
        </div>
        <div>
          <img src="/about-us.png" alt="Catalogue" className="rounded-xl w-full shadow" />
        </div>
      </div>

      {/* Vision Section */}
      <div className="text-center px-4 py-10 md:px-32">
        <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
        <p className="text-[17px] leading-[23px] font-[400] mb-6">
          To be recognized as a leader in laptop distribution and advanced technology solutions, consistently setting new standards of quality and innovation. We strive to remain ahead of market trends, ensuring that our customers always have access to modern, reliable, and high-performing technology.
        </p>
        <img src="/our-vision.jpg" alt="Vision" className="rounded-xl mx-auto w-full max-w-3xl shadow" />
      </div>

      {/* Mission Section */}
      <div className="text-center px-4 py-10 md:px-32">
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-[17px] leading-[23px] font-[400]">
          <strong>Grabatoz</strong> Our mission is to deliver exceptional technology products that empower individuals, businesses, and educational institutions. We aim to enhance productivity, connectivity, and customer experiences through premium products, professional service, and continuous innovation.
        </p>
      </div>

      {/* Core Values Section */}
      <div className="bg-white px-4 py-10 md:px-32 text-center">
        <h2 className="text-3xl font-bold mb-8">Core Values</h2>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="text-lime-500">
                  <Star size={40} />
                </div>
              </div>
              <h4 className="text-lg font-bold text-black mb-2">Integrity</h4>
              <p className="text-[16px] leading-[22px] text-gray-700">Conducting business with honesty and transparency</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="text-lime-500">
                  <Lightbulb size={40} />
                </div>
              </div>
              <h4 className="text-lg font-bold text-black mb-2">Innovation</h4>
              <p className="text-[16px] leading-[22px] text-gray-700">Embracing change and leveraging the latest technologies</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="text-lime-500">
                  <UserFocus size={40} />
                </div>
              </div>
              <h4 className="text-lg font-bold text-black mb-2">Customer Focus</h4>
              <p className="text-[16px] leading-[22px] text-gray-700">Placing customer satisfaction at the heart of our operations</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="text-lime-500">
                  <Medal size={40} />
                </div>
              </div>
              <h4 className="text-lg font-bold text-black mb-2">Excellence</h4>
              <p className="text-[16px] leading-[22px] text-gray-700">Striving for superior quality in products and services</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center md:col-span-2 md:max-w-lg md:mx-auto">
              <div className="flex justify-center mb-4">
                <div className="text-lime-500">
                  <UsersThree size={40} />
                </div>
              </div>
              <h4 className="text-lg font-bold text-black mb-2">Teamwork</h4>
              <p className="text-[16px] leading-[22px] text-gray-700">Fostering collaboration to achieve shared goals</p>
            </div>
          </div>
        </div>

        {/* Product Range Section */}
        <div className="max-w-5xl mx-auto mt-12">
          <h3 className="text-2xl font-bold mb-8 text-center">Our Product Range</h3>
          <div className="bg-lime-50 rounded-lg p-8 border border-lime-200 text-center">
            <div className="flex justify-center mb-6">
              <div className="text-lime-500">
                <ListDashes size={40} />
              </div>
            </div>
            <h4 className="text-lg font-bold text-black mb-4">Diverse Portfolio</h4>
            <p className="text-[16px] leading-[22px] text-gray-700 mb-6 max-w-2xl mx-auto">
              Grabatoz offers a diverse portfolio of products including:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-lime-500 font-bold text-lg mb-2">💻</div>
                <p className="text-[16px] leading-[22px] text-gray-700 font-medium">
                  Laptops and notebooks for students, professionals, and enterprises
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-lime-500 font-bold text-lg mb-2">🖱️</div>
                <p className="text-[16px] leading-[22px] text-gray-700 font-medium">
                  Computer peripherals and accessories
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-lime-500 font-bold text-lg mb-2">🏢</div>
                <p className="text-[16px] leading-[22px] text-gray-700 font-medium">
                  IT solutions tailored for businesses and educational institutions
                </p>
              </div>
            </div>
          </div>
        </div>
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
                <LucidePhone className="w-5 h-5 text-lime-500" />
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
              <a href="mailto:support@grabatoz.com" className="text-lime-500">
                support@grabatoz.com
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
                <LucideMapPin className="w-5 h-5 text-lime-500" />
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
    </div>
  );
}

export default AboutUs;
