import {
  generateMinimalPayloadCSS,
  buildBemCSS,
  buildComponentOverrideCSS,
} from './generator'
import type { PayloadThemeConfig } from './types'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'failed'

export class CrossOriginBridge {
  private iframe: HTMLIFrameElement | null = null
  private status: ConnectionStatus = 'disconnected'
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private pingCount = 0
  private maxPings = 50 // 50 * 300ms = 15s
  private onStatus: ((status: ConnectionStatus) => void) | null = null
  private listener: ((e: MessageEvent) => void) | null = null
  private pendingCSS: { varsCSS: string; componentCSS: string; bemCSS: string } | null = null
  private pendingTheme: 'light' | 'dark' | null = null

  connect(iframe: HTMLIFrameElement, onStatus: (status: ConnectionStatus) => void): void {
    this.disconnect()
    this.iframe = iframe
    this.onStatus = onStatus
    this.setStatus('connecting')

    this.listener = (e: MessageEvent) => {
      if (e.source !== iframe.contentWindow) return
      const type = e.data?.type
      if (type === 'payloadtwist:pong' || type === 'payloadtwist:ready') {
        this.onConnected()
      }
    }
    window.addEventListener('message', this.listener)

    this.pingCount = 0
    this.pingTimer = setInterval(() => {
      this.pingCount++
      if (this.pingCount > this.maxPings) {
        this.stopPinging()
        this.setStatus('failed')
        return
      }
      try {
        iframe.contentWindow?.postMessage({ type: 'payloadtwist:ping' }, '*')
      } catch {
        // iframe might not be ready yet
      }
    }, 300)
  }

  send(config: PayloadThemeConfig, theme: 'light' | 'dark'): void {
    const varsCSS = generateMinimalPayloadCSS(config)
    const bemCSS = buildBemCSS(config.bemOverrides)
    const componentCSS = config.componentOverrides
      ? buildComponentOverrideCSS(config.componentOverrides)
      : ''

    this.pendingTheme = theme

    if (this.status === 'connected') {
      this.postInject(varsCSS, componentCSS, bemCSS)
      this.postTheme(theme)
    } else {
      this.pendingCSS = { varsCSS, componentCSS, bemCSS }
    }
  }

  highlight(blockName: string): void {
    if (this.status !== 'connected') return
    this.iframe?.contentWindow?.postMessage(
      { type: 'payloadtwist:highlight', payload: { blockName } },
      '*',
    )
  }

  disconnect(): void {
    this.stopPinging()
    if (this.listener) {
      window.removeEventListener('message', this.listener)
      this.listener = null
    }
    this.iframe = null
    this.onStatus = null
    this.pendingCSS = null
    this.pendingTheme = null
    this.status = 'disconnected'
  }

  getStatus(): ConnectionStatus {
    return this.status
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status
    this.onStatus?.(status)
  }

  private onConnected(): void {
    if (this.status === 'connected') return
    this.stopPinging()
    this.setStatus('connected')
    this.flush()
  }

  private flush(): void {
    if (this.pendingCSS) {
      this.postInject(this.pendingCSS.varsCSS, this.pendingCSS.componentCSS, this.pendingCSS.bemCSS)
      this.pendingCSS = null
    }
    if (this.pendingTheme) {
      this.postTheme(this.pendingTheme)
    }
  }

  private postInject(varsCSS: string, componentCSS: string, bemCSS: string): void {
    this.iframe?.contentWindow?.postMessage(
      {
        type: 'payloadtwist:inject',
        payload: { varsCSS, componentCSS, bemCSS },
      },
      '*',
    )
  }

  private postTheme(theme: 'light' | 'dark'): void {
    this.iframe?.contentWindow?.postMessage(
      { type: 'payloadtwist:theme', payload: { theme } },
      '*',
    )
  }

  private stopPinging(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }
}
