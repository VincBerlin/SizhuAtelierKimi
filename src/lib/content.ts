/* Social proof + FAQ content.
   NOTE: testimonials are PLACEHOLDER copy. Replace with real, verifiable
   customer reviews before launch — inventing reviews is not permitted and is
   legally risky (UWG/irreführende Werbung). */

export interface Testimonial {
  id: string
  name: string
  location: string
  rating: number
  text: string
  context?: string
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Marie L.',
    location: 'Berlin',
    rating: 5,
    text: 'Mein BaZi-Poster ist wunderschön geworden — ruhig, hochwertig und genau auf meine Geburtsdaten abgestimmt. Hängt jetzt über meinem Schreibtisch.',
    context: 'BaZi Chart Poster',
  },
  {
    id: 't2',
    name: 'Dr. Anke R.',
    location: 'TCM-Praxis, Hamburg',
    rating: 5,
    text: 'Das Wuxing-Praxisposter gibt meinem Behandlungsraum eine klare, professionelle Ausstrahlung. Patient:innen sprechen es oft an.',
    context: 'TCM & Wuxing Praxisposter',
  },
  {
    id: 't3',
    name: 'Jonas & Lena',
    location: 'München',
    rating: 5,
    text: 'Wir haben unsere zwei Charts als Paar bestellt — ein wunderbares Hochzeitsgeschenk an uns selbst. Druck und Papier fühlen sich edel an.',
    context: 'BaZi Chart Poster',
  },
  {
    id: 't4',
    name: 'Sarah M.',
    location: 'Yoga-Studio, Köln',
    rating: 5,
    text: 'Die Element-Poster passen perfekt in unser Studio. Sanft, reduziert und genau die ruhige Ästhetik, die wir gesucht haben.',
    context: 'Poster für Yoga Studios',
  },
  {
    id: 't5',
    name: 'Thomas B.',
    location: 'Wien',
    rating: 4,
    text: 'Schnelle Lieferung, schöne Verpackung. Beim Rahmen hätte ich mir noch eine dritte Farbe gewünscht — sonst rundum zufrieden.',
    context: 'BaZi Chart Poster',
  },
  {
    id: 't6',
    name: 'Caroline H.',
    location: 'Zürich',
    rating: 5,
    text: 'Als Geschenk für meine Mutter bestellt. Die persönliche Bedeutung hinter dem Poster hat sie zu Tränen gerührt.',
    context: 'Geschenk',
  },
]

export const averageRating =
  Math.round((testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length) * 10) / 10

export interface Faq {
  category: string
  question: string
  answer: string
}

export const faqs: Faq[] = [
  {
    category: 'Personalisierung',
    question: 'Welche Daten brauche ich für ein personalisiertes Poster?',
    answer:
      'Geburtsdatum, möglichst genaue Geburtszeit und Geburtsort. Daraus berechnen wir die vier Säulen und die Element-Balance. Fehlt die Uhrzeit, gestalten wir das Poster auf Wunsch ohne Stunden-Säule.',
  },
  {
    category: 'Personalisierung',
    question: 'Kann ich das Design vor dem Druck sehen?',
    answer:
      'Ja. Bei personalisierten Postern erhältst du vor dem Druck eine digitale Vorschau zur Freigabe. Erst danach geht dein Poster in Produktion.',
  },
  {
    category: 'Personalisierung',
    question: 'Wann kommen Saju und Junishi?',
    answer:
      'Beide personalisierten Linien sind in Vorbereitung. Trag dich auf der jeweiligen Produktseite ein und sichere dir 25 % Early-Access-Vorteil zum Start.',
  },
  {
    category: 'Produkt & Material',
    question: 'Aus welchem Material sind die Poster?',
    answer:
      'Premium-Naturpapier, 200 g/m², matt. Wir drucken im Archival-Pigmentdruck — UV-beständig und alterungsresistent.',
  },
  {
    category: 'Produkt & Material',
    question: 'Welche Größen und Rahmen gibt es?',
    answer:
      'Die Poster gibt es in A4, A3 und 50×70 cm. Optional mit Rahmen in Eiche Natur oder Schwarz — oder ohne Rahmen.',
  },
  {
    category: 'Versand & Lieferung',
    question: 'Was kostet der Versand?',
    answer:
      'Ab € 50 Bestellwert liefern wir kostenlos, darunter € 4,90. Versand klimaneutral und plastikfrei, weltweit verfügbar.',
  },
  {
    category: 'Versand & Lieferung',
    question: 'Wie lange dauert die Lieferung?',
    answer:
      'Personalisierte Poster: 3–5 Werktage nach Freigabe deines Designs. Praxis- und Studio-Poster versenden wir innerhalb weniger Werktage.',
  },
  {
    category: 'Bestellung & Zahlung',
    question: 'Welche Zahlungsarten bietet ihr an?',
    answer:
      'PayPal, Apple Pay, Google Pay, Kreditkarte und Kauf auf Rechnung. Du kannst als Gast bestellen — ein Konto ist nicht nötig.',
  },
  {
    category: 'Bestellung & Zahlung',
    question: 'Kann ich personalisierte Poster zurückgeben?',
    answer:
      'Personalisierte Artikel sind vom Widerruf ausgenommen. Sollte etwas mit deiner Bestellung nicht stimmen, melde dich — wir finden eine Lösung.',
  },
]

export const faqCategories = [...new Set(faqs.map((f) => f.category))]
