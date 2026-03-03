'use client'

import React from 'react'
import type { ErrorBoundaryProps } from './types'

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary that catches render errors and displays them inline.
 * Useful for isolating component previews so one failure doesn't break the page.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error(`[ErrorBoundary: ${this.props.name}]`, error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '12px 16px',
            margin: '4px 0',
            borderRadius: 'var(--style-radius-s, 4px)',
            background: 'var(--theme-error-100, #fff5f5)',
            color: 'var(--theme-error-500, #dc2626)',
            fontSize: '13px',
          }}
        >
          <strong>Error: {this.props.name}</strong>
          <pre
            style={{
              fontSize: '11px',
              marginTop: '4px',
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
              maxHeight: '120px',
            }}
          >
            {this.state.error?.message}
          </pre>
        </div>
      )
    }

    return <>{this.props.children}</>
  }
}
