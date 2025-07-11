import React from 'react';
import {
  Star, Lightbulb, UsersThree, ListDashes, Medal, UserFocus,
  MapPin, EnvelopeSimple, Phone
} from 'phosphor-react';

function AboutUs() {
  return (
    <div className="font-poppins text-black">
      {/* About Section */}
      <div className="bg-white px-4 py-10 md:px-20 grid md:grid-cols-2 items-center gap-10">
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">ABOUT US</h2>
          <p className="text-[17px] leading-[23px] font-[400]">
            <strong>Grabatoz</strong> is a distinguished entity in the landscape of consumer electronics and technology solutions,
            headquartered in the vibrant city of Dubai, United Arab Emirates. Established with a commitment to excellence and customer satisfaction,
            we have emerged as a trusted name in the industry, serving clients with integrity and innovation.
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
          We envision being a leader in the distribution of laptops and cutting-edge technology solutions,
          setting new benchmarks for excellence in the industry. We aim to continuously adapt and innovate,
          staying ahead of market trends to meet the evolving needs of our clientele.
        </p>
        <img src="/our-vision.jpg" alt="Vision" className="rounded-xl mx-auto w-full max-w-3xl shadow" />
      </div>

      {/* Mission Section */}
      <div className="text-center px-4 py-10 md:px-32">
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-[17px] leading-[23px] font-[400]">
          <strong>Grabatoz</strong> is a distinguished entity in the landscape of consumer electronics and technology solutions,
          headquartered in the vibrant city of Dubai, United Arab Emirates. Established with a commitment to excellence
          and customer satisfaction, we have emerged as a trusted name in the industry, serving clients with integrity and innovation.
        </p>
      </div>

    {/* Core Values Section */}
<div className="bg-white px-4 py-10 md:px-32 text-center">
  <h2 className="text-3xl font-bold mb-8">Core Values</h2>
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-y-12 gap-x-4 justify-center">
    {[
      { icon: <Star size={40} />, label: 'Integrity' },
      { icon: <Lightbulb size={40} />, label: 'Innovation:' },
      { icon: <UserFocus size={40} />, label: 'Customer Focus' },
      { icon: <Medal size={40} />, label: 'Excellence' },
      { icon: <UsersThree size={40} />, label: 'Teamwork' },
      { icon: <ListDashes size={40} />, label: 'Wide Product Range' },
    ].map((item, idx) => (
      <div key={idx} className="flex flex-col items-center">
        <div className="text-lime-500 mb-4">{item.icon}</div>
        <p className="text-[17px] font-bold leading-[23px]">{item.label}</p>
      </div>
    ))}
  </div>
</div>


      {/* Contact Section */}
      <div className="bg-gray-100 px-4 py-10 md:px-32 text-center md:text-left">
        <h2 className="text-xl font-bold mb-4">Contact Us:</h2>
        <ul className="space-y-4 text-[17px] leading-[23px] font-[400]">
          <li className="flex items-start gap-2 justify-center md:justify-start">
            <MapPin size={20} className="text-gray-800 mt-1" />
            Grabatoz 5 Admiral Plaza Hotel Building, Khalid Bin Waleed Road, Bur Dubai, Dubai PO Box: 241975
          </li>
          <li className="flex items-start gap-2 justify-center md:justify-start">
            <EnvelopeSimple size={20} className="text-gray-800 mt-1" />
            Support@Grabatoz.com
          </li>
          <li className="flex items-start gap-2 justify-center md:justify-start">
            <Phone size={20} className="text-gray-800 mt-1" />
            (+971) 4-354 0566
          </li>
        </ul>
        <p className="text-center font-semibold mt-6 text-lg text-black">
          Thank you for choosing <strong>Grabatoz</strong>. Experience excellence with us.
        </p>
      </div>
    </div>
  );
}

export default AboutUs;
