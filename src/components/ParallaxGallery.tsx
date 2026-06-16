interface GiftMoment {
  id: number
  label: string
  title: string
  symbol: string
  tone: 'wedding' | 'birthday' | 'anniversary' | 'baby'
}

const giftMoments: GiftMoment[] = [
  {
    id: 1,
    label: 'FÜR PAARE',
    title: 'Hochzeit & Partnerschaft',
    symbol: '婚',
    tone: 'wedding',
  },
  {
    id: 2,
    label: 'EINZIGARTIGES GESCHENK',
    title: 'Geburtstag',
    symbol: '壽',
    tone: 'birthday',
  },
  {
    id: 3,
    label: 'JAHRESTAG · ERINNERUNG',
    title: 'Jahrestag',
    symbol: '年',
    tone: 'anniversary',
  },
  {
    id: 4,
    label: 'WILLKOMMEN IM LEBEN',
    title: 'Babyparty & Neubeginn',
    symbol: '福',
    tone: 'baby',
  },
]

function MomentArt({ moment }: { moment: GiftMoment }) {
  return (
    <div className="gift-moment-art" aria-hidden="true">
      <span className="gift-symbol">{moment.symbol}</span>
      {moment.tone === 'wedding' && (
        <svg viewBox="0 0 220 220" role="img">
          <circle cx="88" cy="118" r="44" />
          <circle cx="132" cy="118" r="44" />
          <path d="M154 48 C136 78 132 96 134 112" />
          <path d="M76 62 C92 88 96 104 94 126" />
          <circle cx="110" cy="118" r="5" />
        </svg>
      )}
      {moment.tone === 'birthday' && (
        <svg viewBox="0 0 220 220" role="img">
          <circle cx="110" cy="110" r="56" />
          <path d="M63 154 H157" />
          <path d="M110 54 V166" />
          <path d="M70 94 C94 72 130 72 154 94" />
          <circle cx="68" cy="72" r="3" />
        </svg>
      )}
      {moment.tone === 'anniversary' && (
        <svg viewBox="0 0 220 220" role="img">
          <path d="M56 112 C82 84 138 84 164 112 C138 142 82 142 56 112Z" />
          <path d="M74 112 H146" />
          <path d="M156 52 C140 80 136 102 136 112" />
          <circle cx="110" cy="112" r="5" />
        </svg>
      )}
      {moment.tone === 'baby' && (
        <svg viewBox="0 0 220 220" role="img">
          <circle cx="110" cy="112" r="54" />
          <path d="M80 58 C92 82 126 82 140 58" />
          <path d="M66 154 C98 132 128 132 154 154" />
          <path d="M54 68 C68 92 68 116 58 138" />
          <path d="M166 64 C150 90 150 116 162 140" />
        </svg>
      )}
    </div>
  )
}

export default function ParallaxGallery() {
  return (
    <section className="gift-moments-section" aria-labelledby="gift-moments-title">
      <div className="gift-moments-inner">
        <div className="gift-moments-heading">
          <p className="section-eyebrow">FÜR JEDEN MOMENT</p>
          <h2 id="gift-moments-title">Das perfekte Geschenk</h2>
        </div>

        <div className="gift-moments-grid">
          {giftMoments.map((moment) => (
            <a href="#shop" className={`gift-moment-tile gift-moment-${moment.tone}`} key={moment.id}>
              <MomentArt moment={moment} />
              <div className="gift-moment-copy">
                <p>{moment.label}</p>
                <h3>{moment.title}</h3>
                <span>ENTDECKEN <b aria-hidden="true">→</b></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
