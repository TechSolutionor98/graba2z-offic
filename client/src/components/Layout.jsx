import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/971508604360"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-20 right-4 z-50"
      aria-label="Chat on WhatsApp"
      style={{ transition: 'transform 0.2s' }}
    >
      <img
        src="/whatsapp.png"
        alt="WhatsApp"
        className="w-14 h-14 rounded-full border-2 hover:scale-110"
        style={{ background: '#25D366' }}
      />
    </a>
  )
}

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar - Fixed height */}
      <Navbar />

      {/* Main Content Area - Grows to fill space */}
      <main className="flex-1 w-full">
        <div className="w-full max-w-[1700px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Footer - At bottom */}
      <Footer />

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  )
}

export default Layout
