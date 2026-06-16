export default function ShimmerRibbon() {
  return (
    <section style={{ background: '#2C2420', padding: '80px 0', textAlign: 'center' }}>
      <h2 className="shimmer" style={{ animationDelay: '0s' }}>SIZHU</h2>
      <h2 className="shimmer" style={{ animationDelay: '1.5s' }}>ATELIER</h2>
      <p className="shimmer-subtitle" style={{ animationDelay: '3s' }}>Wo Kosmologie Kunst wird</p>
      <div style={{ marginTop: 48 }}>
        <a
          href="/atelier"
          style={{
            display: 'inline-block',
            border: '1px solid #C4A265',
            color: '#C4A265',
            background: 'transparent',
            padding: '12px 28px',
            borderRadius: 9999,
            fontFamily: '"Inter", sans-serif',
            fontSize: 13,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#C4A265'
            e.currentTarget.style.color = '#2C2420'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#C4A265'
          }}
        >
          Atelier besuchen
        </a>
      </div>
    </section>
  )
}
