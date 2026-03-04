/**
 * payloadtwist Live Preview Script
 *
 * Add this script to your Payload project to enable real-time
 * theme previews from the payloadtwist editor.
 *
 * Usage (Next.js App Router — layout.tsx):
 *   <Script src="https://your-payloadtwist-instance.com/live-preview.js" strategy="afterInteractive" />
 *
 * Usage (plain HTML):
 *   <script src="https://your-payloadtwist-instance.com/live-preview.js" defer></script>
 */
;(function () {
  'use strict'

  var STYLE_IDS = {
    vars: 'tweakpayload-vars',
    components: 'tweakpayload-components',
    bem: 'tweakpayload-bem',
    highlight: 'tweakpayload-highlight',
  }

  function getOrCreateStyle(id) {
    var el = document.getElementById(id)
    if (!el) {
      el = document.createElement('style')
      el.id = id
      document.head.appendChild(el)
    }
    return el
  }

  function handleMessage(event) {
    var data = event.data
    if (!data || typeof data.type !== 'string') return
    if (!data.type.startsWith('payloadtwist:')) return

    switch (data.type) {
      case 'payloadtwist:inject': {
        var p = data.payload || {}
        getOrCreateStyle(STYLE_IDS.vars).textContent = p.varsCSS || ''
        getOrCreateStyle(STYLE_IDS.components).textContent = p.componentCSS || ''
        getOrCreateStyle(STYLE_IDS.bem).textContent = p.bemCSS || ''
        break
      }

      case 'payloadtwist:theme': {
        var theme = (data.payload || {}).theme
        if (theme === 'dark' || theme === 'light') {
          document.documentElement.setAttribute('data-theme', theme)
        }
        break
      }

      case 'payloadtwist:highlight': {
        var blockName = (data.payload || {}).blockName
        if (!blockName) break
        var style = getOrCreateStyle(STYLE_IDS.highlight)
        style.textContent =
          '.' + blockName + ' { outline: 2px solid #3b82f6 !important; outline-offset: 2px; }'
        setTimeout(function () {
          style.textContent = ''
        }, 2000)
        break
      }

      case 'payloadtwist:ping': {
        event.source.postMessage({ type: 'payloadtwist:pong' }, event.origin)
        break
      }
    }
  }

  window.addEventListener('message', handleMessage)

  // Notify parent that we're ready (in case we're in an iframe)
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'payloadtwist:ready' }, '*')
  }
})()
