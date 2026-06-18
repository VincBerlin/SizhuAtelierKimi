import { useEffect } from 'react'
import FaqSection from '../components/shop/FaqSection'

/** Standalone FAQ route (REQ-039 footer). Reuses the shared FaqSection. */
export default function Faq() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <main>
      <FaqSection />
    </main>
  )
}
