import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'payloadtwist — Visual Theme Editor for Payload CMS'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 40%, #0a0a0f 100%)',
          position: 'relative',
        }}
      >
        {/* Subtle gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '15%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(147,51,234,0.12) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '15%',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '40%',
            right: '30%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(219,39,119,0.06) 0%, transparent 70%)',
          }}
        />

        {/* PT monogram icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: 18,
            background: 'linear-gradient(135deg, #0f0f1a, #0a0a0f)',
            border: '1px solid rgba(147,51,234,0.3)',
            marginBottom: 40,
            fontSize: 36,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-1px',
          }}
        >
          <span
            style={{
              background: 'linear-gradient(135deg, #9333ea, #db2777, #06b6d4)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            PT
          </span>
        </div>

        {/* Wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: '-3px',
            lineHeight: 1,
          }}
        >
          <span style={{ color: '#e4e4e7' }}>payload</span>
          <span
            style={{
              background: 'linear-gradient(90deg, #9333ea, #db2777, #06b6d4)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            twist
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            color: 'rgba(228,228,231,0.45)',
            fontWeight: 400,
            letterSpacing: '-0.5px',
          }}
        >
          Visual Theme Editor for Payload CMS
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #9333ea, #db2777, #06b6d4)',
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  )
}
