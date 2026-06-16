import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { backgroundOptions, frameOptions, posterSizes } from '../lib/shop'
import { defaultSelection, useShop } from './ShopProvider'

export default function ProductConfigurator() {
  const { selectedProduct, closeConfigurator, addConfiguredProduct } = useShop()
  const [sizeId, setSizeId] = useState(defaultSelection.size.id)
  const [frameId, setFrameId] = useState(defaultSelection.frame.id)
  const [backgroundId, setBackgroundId] = useState(defaultSelection.background.id)
  const [personName, setPersonName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [birthPlace, setBirthPlace] = useState('')
  const [note, setNote] = useState('')
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)

  if (!selectedProduct) return null

  const size = posterSizes.find((option) => option.id === sizeId) ?? posterSizes[1]
  const frame = frameOptions.find((option) => option.id === frameId) ?? frameOptions[0]
  const background = backgroundOptions.find((option) => option.id === backgroundId) ?? backgroundOptions[0]
  const isComingSoon = selectedProduct.status === 'coming-soon'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isComingSoon) {
      setJoined(true)
      return
    }

    addConfiguredProduct({
      product: selectedProduct,
      size,
      frame,
      background,
      personName,
      birthDate,
      birthTime,
      birthPlace,
      note,
    })
  }

  return (
    <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
      <div className="product-modal-backdrop" onClick={closeConfigurator} />
      <div className="product-modal-panel">
        <button className="product-modal-close" type="button" onClick={closeConfigurator} aria-label="Produkt schließen">
          <X size={22} strokeWidth={1.5} />
        </button>

        <div className="product-modal-grid">
          <div className="product-modal-preview" style={{ background: background.swatch }}>
            <div className="product-modal-frame">
              <span>{selectedProduct.symbol}</span>
              <small>{selectedProduct.title}</small>
            </div>
          </div>

          <div className="product-modal-info">
            <span className="product-info-eyebrow">{selectedProduct.label}</span>
            <h2 id="product-modal-title">{selectedProduct.title}</h2>
            <div className="product-price">{isComingSoon ? 'Coming soon' : selectedProduct.priceLabel}</div>
            <div className="product-price-note">inkl. MwSt. · zzgl. Versand · Lieferzeit 3-5 Werktage nach Freigabe</div>
            <div className="product-desc">
              {selectedProduct.longDescription.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {selectedProduct.personalize && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="person-name">Name der Person <sup>*</sup></label>
                    <input className="form-input" id="person-name" value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="z.B. Marie Müller" required={!isComingSoon} />
                  </div>
                  <div className="form-group">
                    <div className="form-input-row">
                      <div>
                        <label className="form-label" htmlFor="birth-date">Geburtsdatum <sup>*</sup></label>
                        <input className="form-input" type="date" id="birth-date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required={!isComingSoon} />
                      </div>
                      <div>
                        <label className="form-label" htmlFor="birth-time">Geburtszeit <sup>*</sup></label>
                        <input className="form-input" type="time" id="birth-time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} required={!isComingSoon} />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="birth-place">Geburtsort <sup>*</sup></label>
                    <input className="form-input" id="birth-place" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} placeholder="z.B. Berlin, Deutschland" required={!isComingSoon} />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Poster & Rahmengröße</label>
                <div className="size-options">
                  {posterSizes.map((option) => (
                    <button type="button" className={`size-opt ${sizeId === option.id ? 'active' : ''}`} onClick={() => setSizeId(option.id)} key={option.id}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Rahmen</label>
                <div className="size-options">
                  {frameOptions.map((option) => (
                    <button type="button" className={`size-opt ${frameId === option.id ? 'active' : ''}`} onClick={() => setFrameId(option.id)} key={option.id}>
                      {option.label}{option.price ? ` +€ ${option.price}` : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Hintergrundfarbe</label>
                <div className="background-options">
                  {backgroundOptions.map((option) => (
                    <button type="button" className={`background-opt ${backgroundId === option.id ? 'active' : ''}`} onClick={() => setBackgroundId(option.id)} key={option.id}>
                      <span style={{ background: option.swatch }} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {isComingSoon ? (
                <div className="coming-soon-form">
                  <label className="form-label" htmlFor="coming-soon-email">E-Mail eintragen und 25% sichern</label>
                  <div>
                    <input id="coming-soon-email" className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="deine@email.de" required />
                    <button type="submit">25% sichern</button>
                  </div>
                  {joined && <p>Danke. Dein Early-Access-Vorteil ist vorgemerkt.</p>}
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="personalization-note">Persönliche Notiz (optional)</label>
                    <input className="form-input" id="personalization-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="z.B. Für Papa zum Geburtstag" />
                  </div>
                  <div className="product-add-row">
                    <button type="submit" className="btn-primary-lg">In den Warenkorb</button>
                    <a href="/kontakt" className="btn-outline-lg">Anfragen</a>
                  </div>
                </>
              )}

              <dl className="product-modal-meta">
                <div><dt>Material</dt><dd>Premium-Naturpapier, 200g/m², matt</dd></div>
                <div><dt>Druck</dt><dd>Archival-Pigmentdruck, UV-beständig</dd></div>
                <div><dt>Rahmen</dt><dd>Optional: Eiche, Schwarz oder Nussbaum</dd></div>
              </dl>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
