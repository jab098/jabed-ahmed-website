import { SiteNav } from './components/SiteNav'
import { Hero } from './components/Hero'
import { Process } from './components/Process'
import { SystemsShowcase } from './components/SystemsShowcase'
import { Capabilities } from './components/Capabilities'
import { CapabilitiesIntro } from './components/CapabilitiesIntro'
import { Faq } from './components/Faq'
import { Contact } from './components/Contact'
import { PageLoader } from './components/PageLoader'
import { NarrativeScroll } from './components/NarrativeScroll'

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
        <CapabilitiesIntro />
        <Capabilities />
        <Process />
        <SystemsShowcase />
        <Faq />
        <Contact />
      </main>
      <NarrativeScroll />
    </div>
  )
}
