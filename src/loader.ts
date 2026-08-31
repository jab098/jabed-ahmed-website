// Let the browser preserve shared anchors and Back/Forward scroll positions.
history.scrollRestoration = 'auto'

window.__loaderFallback = window.setTimeout(() => {
  document.documentElement.classList.remove('is-loading')
  document.documentElement.classList.add('loader-complete')
  document.body.style.overflow = ''
  window.dispatchEvent(new Event('site:loader-complete'))
}, 7000)
