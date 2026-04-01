import { Suspense, lazy, useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import BlogNavbar from "./BlogNavbar"

const Footer = lazy(() => import("./Footer"))
const BlogFooter = lazy(() => import("./BlogFooter"))

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/971505033860"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-20 right-4 z-50"
      aria-label="Chat on WhatsApp"
      style={{ transition: 'transform 0.2s' }}
    >
      <img
        src="/whatsapp.webp"
        alt="WhatsApp"
        width="56"
        height="56"
        className="w-14 h-14 rounded-full border-2 hover:scale-110"
        style={{ background: '#25D366' }}
      />
    </a>
  )
}

function Layout() {
  const location = useLocation()
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  )
  const [showDeferredChrome, setShowDeferredChrome] = useState(false)
  // Check if current path is a blog page (with or without language prefix)
  // Matches: /blogs, /blogs/slug, /ae-en/blogs, /ae-en/blogs/slug, /ar/blogs, etc.
  const isBlogPage = location.pathname.match(/^\/([a-z]{2}(-[a-z]{2})?\/)?blogs(\/|$)/i)

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!isMobileViewport) {
      setShowDeferredChrome(true)
      return
    }

    setShowDeferredChrome(false)

    const revealChrome = () => setShowDeferredChrome(true)
    const idleId = window.setTimeout(revealChrome, 1400)

    window.addEventListener("scroll", revealChrome, { once: true, passive: true })
    window.addEventListener("pointerdown", revealChrome, { once: true, passive: true })
    window.addEventListener("touchstart", revealChrome, { once: true, passive: true })

    return () => {
      window.clearTimeout(idleId)
      window.removeEventListener("scroll", revealChrome)
      window.removeEventListener("pointerdown", revealChrome)
      window.removeEventListener("touchstart", revealChrome)
    }
  }, [isMobileViewport])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar - Conditional based on page */}
      {isBlogPage ? <BlogNavbar /> : <Navbar />}

      {/* Main Content Area - Grows to fill space */}
      <main className="flex-1 w-full">
        <div className="w-full max-w-[1700px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Footer - Conditional based on page */}
      {showDeferredChrome && (
        <Suspense fallback={null}>
          {isBlogPage ? <BlogFooter /> : <Footer />}
        </Suspense>
      )}

      {/* WhatsApp Button */}
      {showDeferredChrome && <WhatsAppButton />}
    </div>
  )
}

export default Layout
