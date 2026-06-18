import { useEffect } from 'react'
import HowItWorksSection from '../components/shop/HowItWorksSection'
import ApiTrustSection from '../components/shop/ApiTrustSection'

/** Dedicated How-It-Works + API-trust page (§4 relocates these off the home page
 *  while keeping the personalization-credibility content). */
export default function HowItWorks() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <main>
      <HowItWorksSection />
      <ApiTrustSection />
    </main>
  )
}
