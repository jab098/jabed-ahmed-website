history.scrollRestoration = 'manual'

if (location.hash) {
  history.replaceState(null, '', location.pathname + location.search)
}

window.scrollTo(0, 0)
window.addEventListener('beforeunload', () => window.scrollTo(0, 0))
window.addEventListener('pageshow', () => window.scrollTo(0, 0))

window.__loaderFallback = window.setTimeout(() => {
  document.documentElement.classList.remove('is-loading')
  document.documentElement.classList.add('loader-complete')
}, 7000)
