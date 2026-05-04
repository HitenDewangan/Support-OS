import React from 'react'
import Navbar    from './components/Navbar'
import Hero      from './components/Hero'
import Stats     from './components/Stats'
import Roles     from './components/Roles'
import Journey   from './components/Journey'
import Features  from './components/Features'
import TechStack from './components/TechStack'
import Roadmap   from './components/Roadmap'
import CTA       from './components/CTA'
import Footer    from './components/Footer'

export default function App() {
  return (
    <>
      {/* Fixed background blobs — purely decorative */}
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />

      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Roles />
        <Journey />
        <Features />
        <TechStack />
        <Roadmap />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
