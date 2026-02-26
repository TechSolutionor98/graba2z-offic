import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { HelmetProvider } from "react-helmet-async"
import { checkCacheVersion } from "./utils/cacheManager"

const runWhenIdle = (task, timeout = 3000) => {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(task, { timeout })
  } else {
    setTimeout(task, 1200)
  }
}

const optimizeMediaLoading = () => {
  const optimizeElement = (el) => {
    if (el.tagName === "IMG") {
      const inInitialViewport = el.getBoundingClientRect().top < window.innerHeight * 1.2
      if (!inInitialViewport && !el.hasAttribute("loading")) {
        el.setAttribute("loading", "lazy")
      }
      if (!el.hasAttribute("decoding")) {
        el.setAttribute("decoding", "async")
      }
      if (!inInitialViewport && !el.hasAttribute("fetchpriority")) {
        el.setAttribute("fetchpriority", "low")
      }
    }

    if (el.tagName === "IFRAME" && !el.hasAttribute("loading")) {
      el.setAttribute("loading", "lazy")
    }
  }

  document.querySelectorAll("img, iframe").forEach(optimizeElement)

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return
        if (node.matches("img, iframe")) optimizeElement(node)
        node.querySelectorAll?.("img, iframe").forEach(optimizeElement)
      })
    })
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

// Defer non-critical startup tasks until after initial render.
runWhenIdle(() => {
  optimizeMediaLoading()
  checkCacheVersion()
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)

