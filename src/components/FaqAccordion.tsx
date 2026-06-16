import type { Faq } from '../lib/content'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion'

/**
 * Reusable FAQ accordion. Pass a subset of items for a product-page snippet,
 * or the full list for the FAQ page.
 */
export default function FaqAccordion({ items }: { items: Faq[] }) {
  return (
    <Accordion type="single" collapsible className="w-full" style={{ color: '#2C2420' }}>
      {items.map((faq, i) => (
        <AccordionItem key={`${faq.question}-${i}`} value={`faq-${i}`}>
          <AccordionTrigger style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, color: '#2C2420' }}>
            {faq.question}
          </AccordionTrigger>
          <AccordionContent>
            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#6A615A', lineHeight: 1.7 }}>
              {faq.answer}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
