"use client"

import { useState } from "react"
import { Mail, Phone, Clock, MapPin } from "lucide-react"

export default function PrivacyPolicy() {
  const [language, setLanguage] = useState("english")

  const content = {
    english: {
      title: "Privacy Policy",
      
      company: "Company: Grabatoz powered by Crown Excel General Trading LLC",
      sections: {
        introduction: {
          title: "Introduction",
          content: `Grabatoz, powered by Crown Excel General Trading LLC ("we," "us," or "our"), respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and protect your information when you use our website grabatoz.ae and related services.`,
        },
        dataCollection: {
          title: "Data Collection and Usage",
          points: [
            "We do not collect personal data from users located in the European Union (EU).",
            "We use certain authorized third-party service providers, such as payment gateways, analytics tools, and shipping providers, to operate and improve our services. These third parties may collect and process data according to their own privacy policies.",
            "We collect information you provide voluntarily, such as during registration, purchases, or contacting customer support, and use it solely to provide, personalize, and enhance our services.",
          ],
        },
        cookies: {
          title: "Cookies and Tracking Technologies",
          points: [
            "Our site uses cookies and similar tracking technologies to improve user experience, security, and site functionality.",
            "Cookies may be used to remember your preferences, enable shopping features, analyze site traffic, and display personalized content or advertisements.",
            "You may disable cookies via your browser settings; however, some features of our site may not function properly without cookies enabled.",
          ],
        },
        rights: {
          title: "Your Rights",
          points: [
            "You have the right to access, correct, or delete your personal data.",
            "You may opt out of marketing communications at any time.",
            "For any privacy-related inquiries or to exercise your rights, please contact us at: customercare@grabatoz.ae",
          ],
        },
        security: {
          title: "Data Security",
          content:
            "We implement appropriate technical and organizational measures to protect your data against unauthorized access, loss, or alteration. However, internet transmissions are not completely secure, and we cannot guarantee absolute security.",
        },
        changes: {
          title: "Changes to This Policy",
          content:
            "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.",
        },
        contact: {
          title: "Contact Information",
          details: {
            website: "Grabatoz.ae",
            poweredBy: "Powered by Crown Excel General Trading LLC",
            poBox: "P.O. Box No: 241975, Dubai, UAE",
            customerService: "Customer Service:",
            phone: "Tel: +971 4 354 0566",
            email: "Email: customercare@grabatoz.ae",
            hours: "Customer service hours: Daily from 9:00 AM to 7:00 PM",
          },
        },
      },
    },
    arabic: {
      title: "سياسة الخصوصية",
      effectiveDate: "تاريخ النفاذ: [أدخل التاريخ]",
      company: "شركة: Grabatoz powered by Crown Excel General Trading LLC",
      sections: {
        introduction: {
          title: "مقدمة",
          content: `تحترم شركة Grabatoz المدعومة من Crown Excel General Trading LLC ("نحن"، "لنا" أو "خاصتنا") خصوصيتك وتلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع معلوماتك واستخدامها وحمايتها عند استخدامك لموقعنا الإلكتروني grabatoz.ae والخدمات ذات الصلة.`,
        },
        dataCollection: {
          title: "جمع واستخدام البيانات",
          points: [
            "نحن لا نجمع بيانات شخصية من المستخدمين المقيمين في الاتحاد الأوروبي.",
            "نستخدم مزودي خدمات من طرف ثالث مخولين، مثل بوابات الدفع وأدوات التحليل ومزودي الشحن، لتشغيل وتحسين خدماتنا. قد يقوم هؤلاء الطرف الثالث بجمع ومعالجة البيانات وفقًا لسياسات الخصوصية الخاصة بهم.",
            "نجمع المعلومات التي تقدمها طواعيةً، مثل التسجيل أو الشراء أو التواصل مع دعم العملاء، ونستخدمها فقط لتقديم خدماتنا وتخصيصها وتحسينها.",
          ],
        },
        cookies: {
          title: "ملفات تعريف الارتباط وتقنيات التتبع",
          points: [
            "يستخدم موقعنا ملفات تعريف الارتباط وتقنيات التتبع المماثلة لتحسين تجربة المستخدم والأمان ووظائف الموقع.",
            "قد تُستخدم ملفات تعريف الارتباط لتذكر تفضيلاتك، وتمكين ميزات التسوق، وتحليل حركة الموقع، وعرض محتوى أو إعلانات مخصصة.",
            "يمكنك تعطيل ملفات تعريف الارتباط من خلال إعدادات المتصفح، لكن بعض ميزات الموقع قد لا تعمل بشكل صحيح بدون تمكين ملفات تعريف الارتباط.",
          ],
        },
        rights: {
          title: "حقوقك",
          points: [
            "لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها أو حذفها.",
            "يمكنك إلغاء الاشتراك في الاتصالات التسويقية في أي وقت.",
            "لأي استفسارات متعلقة بالخصوصية أو لممارسة حقوقك، يرجى التواصل معنا على: customercare@grabatoz.ae",
          ],
        },
        security: {
          title: "أمان البيانات",
          content:
            "نطبق التدابير الفنية والتنظيمية المناسبة لحماية بياناتك من الوصول غير المصرح به أو الفقدان أو التغيير. ومع ذلك، لا يمكن ضمان الأمان الكامل للبيانات أثناء النقل عبر الإنترنت.",
        },
        changes: {
          title: "تغييرات هذه السياسة",
          content:
            "قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سيتم نشر التغييرات على هذه الصفحة مع تاريخ النفاذ المحدث.",
        },
        contact: {
          title: "معلومات الاتصال",
          details: {
            website: "Grabatoz.ae",
            poweredBy: "شركة Crown Excel General Trading LLC",
            poBox: "صندوق بريد: 241975، دبي",
            customerService: "خدمة العملاء:",
            phone: "هاتف: +971 4 354 0566",
            email: "البريد الإلكتروني: customercare@grabatoz.ae",
            hours: "ساعات خدمة العملاء: يوميًا من 9:00 صباحًا حتى 7:00 مساءً",
          },
        },
      },
    },
  }

  const currentContent = content[language]
  const isArabic = language === "arabic"

  return (
    <div className={`min-h-screen bg-white py-8 px-4 ${isArabic ? "rtl" : "ltr"}`}>
      <div className="max-w-4xl mx-auto">
        {/* Language Toggle Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setLanguage("english")}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
              language === "english"
                ? "bg-lime-500 text-white hover:bg-lime-600"
                : "bg-white border-2 border-lime-500 text-lime-500 hover:bg-lime-50"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("arabic")}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
              language === "arabic"
                ? "bg-lime-500 text-white hover:bg-lime-600"
                : "bg-white border-2 border-lime-500 text-lime-500 hover:bg-lime-50"
            }`}
          >
            العربية
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentContent.title}</h1>
              <p className="text-gray-600 mb-2">{currentContent.effectiveDate}</p>
              <p className="text-gray-700 font-medium">{currentContent.company}</p>
            </div>

            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-lime-500 pb-2">
                {currentContent.sections.introduction.title}
              </h2>
              <p className="text-gray-700 leading-relaxed">{currentContent.sections.introduction.content}</p>
            </section>

            {/* Data Collection and Usage */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-lime-500 pb-2">
                {currentContent.sections.dataCollection.title}
              </h2>
              <ul className="space-y-3">
                {currentContent.sections.dataCollection.points.map((point, index) => (
                  <li key={index} className="text-gray-700 leading-relaxed flex items-start">
                    <span className="inline-block w-2 h-2 bg-lime-500 rounded-full mt-2 mr-3 ml-1 flex-shrink-0"></span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Cookies and Tracking Technologies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-lime-500 pb-2">
                {currentContent.sections.cookies.title}
              </h2>
              <ul className="space-y-3">
                {currentContent.sections.cookies.points.map((point, index) => (
                  <li key={index} className="text-gray-700 leading-relaxed flex items-start">
                    <span className="inline-block w-2 h-2 bg-lime-500 rounded-full mt-2 mr-3 ml-1 flex-shrink-0"></span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-lime-500 pb-2">
                {currentContent.sections.rights.title}
              </h2>
              <ul className="space-y-3">
                {currentContent.sections.rights.points.map((point, index) => (
                  <li key={index} className="text-gray-700 leading-relaxed flex items-start">
                    <span className="inline-block w-2 h-2 bg-lime-500 rounded-full mt-2 mr-3 ml-1 flex-shrink-0"></span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-lime-500 pb-2">
                {currentContent.sections.security.title}
              </h2>
              <p className="text-gray-700 leading-relaxed">{currentContent.sections.security.content}</p>
            </section>

            {/* Changes to This Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-lime-500 pb-2">
                {currentContent.sections.changes.title}
              </h2>
              <p className="text-gray-700 leading-relaxed">{currentContent.sections.changes.content}</p>
            </section>


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
              <a href="mailto:customercare@grabatoz.ae" className="text-black">
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
  )
}
