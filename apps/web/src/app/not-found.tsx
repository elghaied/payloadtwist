import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        fontFamily: "'Outfit', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#e5e5e5',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 700, margin: 0, opacity: 0.3 }}>404</h1>
        <p style={{ fontSize: '1.125rem', marginTop: '0.5rem', opacity: 0.6 }}>
          Page not found
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginTop: '1.5rem',
            padding: '0.5rem 1.25rem',
            borderRadius: '0.5rem',
            backgroundColor: '#a855f7',
            color: 'white',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
