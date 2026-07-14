import { SiteNav } from './components/SiteNav'
import { Hero } from './components/Hero'
import { Metrics } from './components/Metrics'
import { Process } from './components/Process'
import { SystemsShowcase } from './components/SystemsShowcase'
import { Capabilities } from './components/Capabilities'
import { Faq } from './components/Faq'
import { Contact } from './components/Contact'
import { PageLoader } from './components/PageLoader'

export default function App() {
  return (
    <div className="site-shell">
      <PageLoader />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SiteNav />
      <main id="main-content">
        <Hero />
        <Metrics />
        <Process />
        <SystemsShowcase />
        <Capabilities />
        <Faq />
        <Contact />
      </main>
    </div>
  )
}
