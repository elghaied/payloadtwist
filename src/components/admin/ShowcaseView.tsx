'use client'

import React from 'react'

/* ─────────────────────────────────────────────
 * Showcase View — tweakcn-style card grid
 *
 * ALL styling uses Payload CSS variables only.
 * No Tailwind, no shadcn, no external CSS.
 * Everything here reacts to theme editor changes.
 * ───────────────────────────────────────────── */

// ── shared style tokens (all reference Payload vars) ──
const s = {
  bg: 'var(--theme-bg)',
  text: 'var(--theme-elevation-1000)',
  muted: 'var(--theme-elevation-500)',
  subtle: 'var(--theme-elevation-400)',
  border: 'var(--theme-elevation-150)',
  surface: 'var(--theme-elevation-0)',
  surfaceRaised: 'var(--theme-elevation-50)',
  surfaceOverlay: 'var(--theme-elevation-100)',
  inputBg: 'var(--theme-input-bg, var(--theme-elevation-0))',
  radius: 'var(--style-radius-m)',
  radiusL: 'var(--style-radius-l)',
  radiusS: 'var(--style-radius-s)',
  font: 'var(--font-body)',
  mono: 'var(--font-mono, monospace)',
  success500: 'var(--color-success-500)',
  warning500: 'var(--color-warning-500)',
  error500: 'var(--color-error-500)',
  success100: 'var(--color-success-100)',
  warning100: 'var(--color-warning-100)',
  error100: 'var(--color-error-100)',
} as const

const card: React.CSSProperties = {
  background: s.surface,
  border: `1px solid ${s.border}`,
  borderRadius: s.radiusL,
  padding: '24px',
  fontFamily: s.font,
  color: s.text,
  overflow: 'hidden',
}

const cardTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  margin: 0,
  color: s.text,
}

const cardDesc: React.CSSProperties = {
  fontSize: '13px',
  color: s.muted,
  margin: '4px 0 0',
  lineHeight: 1.5,
}

const input: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  fontSize: '13px',
  fontFamily: s.font,
  color: s.text,
  background: s.inputBg,
  border: `1px solid ${s.border}`,
  borderRadius: s.radius,
  outline: 'none',
  boxSizing: 'border-box',
}

const label: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 500,
  color: s.text,
  marginBottom: '4px',
  display: 'block',
}

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 16px',
  fontSize: '13px',
  fontWeight: 500,
  fontFamily: s.font,
  color: 'var(--color-base-0)',
  background: 'var(--color-base-1000)',
  border: 'none',
  borderRadius: s.radius,
  cursor: 'pointer',
  width: '100%',
}

const btnSecondary: React.CSSProperties = {
  ...btnPrimary,
  background: s.surface,
  color: s.text,
  border: `1px solid ${s.border}`,
  width: 'auto',
}

const divider: React.CSSProperties = {
  height: '1px',
  background: s.border,
  border: 'none',
  margin: '16px 0',
}

export default function ShowcaseView() {
  return (
    <div style={{
      padding: '24px',
      background: s.bg,
      minHeight: '100vh',
      fontFamily: s.font,
      color: s.text,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Row 1 */}
        <StatsCard title="Total Revenue" value="$15,231.89" change="+20.1% from last month" positive />
        <StatsCard title="Subscriptions" value="+2,350" change="+180.1% from last month" positive />
        <CalendarCard />

        {/* Row 2 */}
        <SubscriptionCard />
        <CreateAccountCard />
        <ActivityCard />

        {/* Row 3 */}
        <ChatCard />
        <PaymentsCard />

        {/* Row 4 */}
        <TeamCard />
        <NotificationsCard />
        <ColorPaletteCard />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
 *  CARD COMPONENTS
 * ═══════════════════════════════════════════ */

function StatsCard({ title, value, change, positive }: { title: string; value: string; change: string; positive?: boolean }) {
  return (
    <div style={card}>
      <p style={{ ...cardDesc, margin: 0, fontWeight: 500 }}>{title}</p>
      <p style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0 4px', color: s.text, letterSpacing: '-0.5px' }}>{value}</p>
      <p style={{ fontSize: '12px', color: positive ? s.success500 : s.error500, margin: 0 }}>{change}</p>
    </div>
  )
}

function CalendarCard() {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const dates = [
    [null, null, null, null, null, null, 1],
    [2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20, 21, 22],
    [23, 24, 25, 26, 27, 28, null],
  ]
  const today = 14
  const rangeStart = 5
  const rangeEnd = 13

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '13px', color: s.muted, cursor: 'pointer' }}>&larr;</span>
        <span style={{ fontSize: '14px', fontWeight: 600 }}>March 2026</span>
        <span style={{ fontSize: '13px', color: s.muted, cursor: 'pointer' }}>&rarr;</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
        {days.map((d) => (
          <div key={d} style={{ fontSize: '11px', color: s.muted, padding: '4px 0', fontWeight: 500 }}>{d}</div>
        ))}
        {dates.flat().map((d, i) => {
          const isToday = d === today
          const inRange = d !== null && d >= rangeStart && d <= rangeEnd
          return (
            <div key={i} style={{
              fontSize: '12px',
              padding: '6px 0',
              borderRadius: s.radiusS,
              cursor: d ? 'pointer' : 'default',
              background: isToday ? 'var(--color-base-1000)' : inRange ? s.surfaceRaised : 'transparent',
              color: isToday ? 'var(--color-base-0)' : d ? s.text : 'transparent',
              fontWeight: isToday ? 600 : 400,
            }}>
              {d ?? ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SubscriptionCard() {
  return (
    <div style={card}>
      <h3 style={cardTitle}>Upgrade your subscription</h3>
      <p style={cardDesc}>You are currently on the free plan. Upgrade to the pro plan to get access to all features.</p>
      <hr style={divider} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={label}>Name</label>
          <input style={input} defaultValue="Evil Rabbit" readOnly />
        </div>
        <div>
          <label style={label}>Email</label>
          <input style={input} defaultValue="example@acme.com" readOnly />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={label}>Card Number</label>
        <input style={input} defaultValue="1234 1234 1234 1234" readOnly />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ ...label, marginBottom: '8px' }}>Plan</label>
        <p style={{ fontSize: '12px', color: s.muted, margin: '0 0 8px' }}>Select the plan that best fits your needs.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <PlanOption name="Starter Plan" desc="Perfect for small businesses." selected />
          <PlanOption name="Pro Plan" desc="More features and storage." />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={label}>Notes</label>
        <textarea style={{ ...input, minHeight: '48px', resize: 'vertical' }} placeholder="Enter notes" readOnly />
      </div>

      <CheckRow label="I agree to the terms and conditions" checked />
      <CheckRow label="Allow us to send you emails" checked={false} />

      <hr style={divider} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button style={btnSecondary}>Cancel</button>
        <button style={{ ...btnPrimary, width: 'auto' }}>Upgrade Plan</button>
      </div>
    </div>
  )
}

function PlanOption({ name, desc, selected }: { name: string; desc: string; selected?: boolean }) {
  return (
    <div style={{
      padding: '12px',
      borderRadius: s.radius,
      border: `1px solid ${selected ? 'var(--color-base-1000)' : s.border}`,
      background: selected ? s.surfaceRaised : s.surface,
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%',
          border: `2px solid ${selected ? 'var(--color-base-1000)' : s.border}`,
          background: selected ? 'var(--color-base-1000)' : 'transparent',
        }} />
        <span style={{ fontSize: '13px', fontWeight: 500 }}>{name}</span>
      </div>
      <p style={{ fontSize: '11px', color: s.muted, margin: 0, paddingLeft: '16px' }}>{desc}</p>
    </div>
  )
}

function CheckRow({ label: text, checked }: { label: string; checked: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <div style={{
        width: '16px', height: '16px', borderRadius: s.radiusS,
        border: `1px solid ${checked ? 'var(--color-base-1000)' : s.border}`,
        background: checked ? 'var(--color-base-1000)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {checked && <span style={{ color: 'var(--color-base-0)', fontSize: '10px', lineHeight: 1 }}>&#10003;</span>}
      </div>
      <span style={{ fontSize: '12px', color: s.text }}>{text}</span>
    </div>
  )
}

function CreateAccountCard() {
  return (
    <div style={card}>
      <h3 style={cardTitle}>Create an account</h3>
      <p style={cardDesc}>Enter your email below to create your account</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '16px 0' }}>
        <button style={btnSecondary}>GitHub</button>
        <button style={btnSecondary}>Google</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
        <hr style={{ ...divider, flex: 1, margin: 0 }} />
        <span style={{ fontSize: '10px', color: s.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>or continue with</span>
        <hr style={{ ...divider, flex: 1, margin: 0 }} />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={label}>Email</label>
        <input style={input} placeholder="m@example.com" readOnly />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={label}>Password</label>
        <input style={input} type="password" defaultValue="password123" readOnly />
      </div>
      <button style={btnPrimary}>Create account</button>
    </div>
  )
}

function ActivityCard() {
  return (
    <div style={card}>
      <h3 style={cardTitle}>Move Goal</h3>
      <p style={cardDesc}>Set your daily activity goal.</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', margin: '24px 0' }}>
        <button style={{
          width: '36px', height: '36px', borderRadius: '50%',
          border: `1px solid ${s.border}`, background: s.surface,
          fontSize: '18px', color: s.muted, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>&minus;</button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '48px', fontWeight: 700, margin: 0, lineHeight: 1, letterSpacing: '-2px' }}>350</p>
          <p style={{ fontSize: '11px', color: s.muted, margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '1px' }}>calories/day</p>
        </div>
        <button style={{
          width: '36px', height: '36px', borderRadius: '50%',
          border: `1px solid ${s.border}`, background: s.surface,
          fontSize: '18px', color: s.muted, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>+</button>
      </div>
      {/* Mini bar chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '48px', marginBottom: '16px' }}>
        {[40, 65, 30, 80, 55, 70, 45, 90, 35, 60, 75, 50, 85].map((h, i) => (
          <div key={i} style={{
            flex: 1,
            height: `${h}%`,
            background: s.surfaceOverlay,
            borderRadius: '2px',
          }} />
        ))}
      </div>
      <button style={btnPrimary}>Set Goal</button>
    </div>
  )
}

function ChatCard() {
  const messages = [
    { from: 'other', name: 'Sofia Davis', text: 'Hi, how can I help you today?' },
    { from: 'me', text: "Hey, I'm having trouble with my account." },
    { from: 'other', name: 'Sofia Davis', text: 'What seems to be the problem?' },
    { from: 'me', text: "I can't log in." },
  ]
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <Avatar letter="S" />
        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>Sofia Davis</p>
          <p style={{ fontSize: '11px', color: s.muted, margin: 0 }}>m@example.com</p>
        </div>
        <div style={{ marginLeft: 'auto', width: '24px', height: '24px', borderRadius: '50%', border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: s.muted, cursor: 'pointer' }}>+</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.from === 'me' ? 'flex-end' : 'flex-start',
            display: 'flex', flexDirection: 'column',
            maxWidth: '80%',
          }}>
            <div style={{
              padding: '8px 12px',
              borderRadius: s.radiusL,
              fontSize: '13px',
              lineHeight: 1.4,
              background: msg.from === 'me' ? 'var(--color-base-1000)' : s.surfaceRaised,
              color: msg.from === 'me' ? 'var(--color-base-0)' : s.text,
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input style={{ ...input, flex: 1 }} placeholder="Type your message..." readOnly />
        <button style={{ ...btnPrimary, width: '36px', height: '36px', padding: 0, borderRadius: s.radius, fontSize: '14px' }}>&#9654;</button>
      </div>
    </div>
  )
}

function PaymentsCard() {
  const rows = [
    { status: 'Success', email: 'ken99@example.com', amount: '$316.00', color: s.success500 },
    { status: 'Success', email: 'abe45@example.com', amount: '$242.00', color: s.success500 },
    { status: 'Processing', email: 'monserrat44@example.com', amount: '$837.00', color: s.warning500 },
    { status: 'Failed', email: 'carmella@example.com', amount: '$721.00', color: s.error500 },
    { status: 'Success', email: 'silas22@example.com', amount: '$874.00', color: s.success500 },
  ]
  return (
    <div style={{ ...card, gridColumn: 'span 2' }}>
      <h3 style={cardTitle}>Payments</h3>
      <p style={cardDesc}>Manage your payments.</p>
      <hr style={divider} />
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '12px', fontWeight: 500, color: s.muted, borderBottom: `1px solid ${s.border}` }}>Status</th>
            <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '12px', fontWeight: 500, color: s.muted, borderBottom: `1px solid ${s.border}` }}>Email</th>
            <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: '12px', fontWeight: 500, color: s.muted, borderBottom: `1px solid ${s.border}` }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td style={{ padding: '10px 12px', fontSize: '13px', borderBottom: `1px solid ${s.border}` }}>
                <span style={{
                  display: 'inline-block', padding: '2px 8px',
                  borderRadius: s.radiusS, fontSize: '11px', fontWeight: 500,
                  background: row.status === 'Success' ? s.success100 : row.status === 'Processing' ? s.warning100 : s.error100,
                  color: row.color,
                }}>{row.status}</span>
              </td>
              <td style={{ padding: '10px 12px', fontSize: '13px', borderBottom: `1px solid ${s.border}`, color: s.text }}>{row.email}</td>
              <td style={{ padding: '10px 12px', fontSize: '13px', borderBottom: `1px solid ${s.border}`, textAlign: 'right', fontWeight: 500, fontFamily: s.mono }}>{row.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TeamCard() {
  const members = [
    { name: 'Sofia Davis', email: 'm@example.com', role: 'Owner' },
    { name: 'Jackson Lee', email: 'p@example.com', role: 'Member' },
    { name: 'Isabella Nguyen', email: 'i@example.com', role: 'Member' },
  ]
  return (
    <div style={card}>
      <h3 style={cardTitle}>Team Members</h3>
      <p style={cardDesc}>Invite your team members to collaborate.</p>
      <hr style={divider} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {members.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Avatar letter={m.name[0]} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>{m.name}</p>
              <p style={{ fontSize: '11px', color: s.muted, margin: 0 }}>{m.email}</p>
            </div>
            <span style={{
              fontSize: '11px', color: s.muted,
              padding: '3px 10px',
              border: `1px solid ${s.border}`,
              borderRadius: s.radius,
            }}>{m.role}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotificationsCard() {
  const items = [
    { title: 'Everything', desc: 'Email digest, mentions & all activity.' },
    { title: 'Available', desc: 'Only mentions and comments.' },
    { title: 'Ignoring', desc: 'Turn off all notifications.' },
  ]
  return (
    <div style={card}>
      <h3 style={cardTitle}>Notifications</h3>
      <p style={cardDesc}>Choose what you want to be notified about.</p>
      <hr style={divider} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 12px', borderRadius: s.radius,
            border: `1px solid ${i === 0 ? 'var(--color-base-1000)' : s.border}`,
            cursor: 'pointer',
          }}>
            <div style={{
              width: '14px', height: '14px', borderRadius: '50%',
              border: `2px solid ${i === 0 ? 'var(--color-base-1000)' : s.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {i === 0 && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-base-1000)' }} />}
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>{item.title}</p>
              <p style={{ fontSize: '11px', color: s.muted, margin: '2px 0 0' }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ColorPaletteCard() {
  const baseSteps = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 800, 850, 900, 950, 1000]
  const statusGroups = [
    { name: 'Success', prefix: 'success' },
    { name: 'Warning', prefix: 'warning' },
    { name: 'Error', prefix: 'error' },
  ]
  return (
    <div style={card}>
      <h3 style={cardTitle}>Color Palette</h3>
      <p style={cardDesc}>Base scale and status colors.</p>
      <hr style={divider} />

      <p style={{ fontSize: '11px', fontWeight: 500, color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' }}>Base Scale</p>
      <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {baseSteps.map((n) => (
          <div key={n} style={{
            width: '20px', height: '20px',
            borderRadius: '3px',
            background: `var(--color-base-${n})`,
            border: `1px solid ${s.border}`,
          }} title={`base-${n}`} />
        ))}
      </div>

      {statusGroups.map((g) => (
        <div key={g.prefix} style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>{g.name}</p>
          <div style={{ display: 'flex', gap: '3px' }}>
            {[100, 200, 300, 400, 500].map((n) => (
              <div key={n} style={{
                width: '20px', height: '20px',
                borderRadius: '3px',
                background: `var(--color-${g.prefix}-${n})`,
                border: `1px solid ${s.border}`,
              }} title={`${g.prefix}-${n}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── tiny avatar helper ── */
function Avatar({ letter }: { letter: string }) {
  return (
    <div style={{
      width: '32px', height: '32px', borderRadius: '50%',
      background: s.surfaceOverlay,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '13px', fontWeight: 600, color: s.text,
      flexShrink: 0,
    }}>{letter}</div>
  )
}
