import { SiteNav } from './components/SiteNav'
import { Hero } from './components/Hero'
import { WhoAmI } from './components/WhoAmI'
import { Insights } from './components/Insights'
import { Service } from './components/Service'
import { Contact } from './components/Contact'

export default function App() {
  return (
    <div className="site-shell w-full min-h-screen font-sans antialiased text-black overflow-x-clip tracking-[-0.02em] p-2 md:p-6 lg:p-8 flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SiteNav />
      <main id="main-content" className="site-main">
        <Hero />
        <WhoAmI />
        <Insights />
        <Service />
        <Contact />
      </main>
    </div>
  )
}
