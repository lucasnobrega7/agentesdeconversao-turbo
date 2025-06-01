// Widget embeddable para sites externos
import { createRoot } from 'react-dom/client'
import { ChatWidget } from './components/ChatWidget'

declare global {
  interface Window {
    AgentesChat: {
      init: (config: ChatConfig) => void
      destroy: () => void
    }
  }
}

interface ChatConfig {
  apiKey: string
  agentId: string
  position?: 'bottom-right' | 'bottom-left'
  theme?: 'light' | 'dark' | 'auto'
  language?: string
  metadata?: Record<string, any>
}

let root: ReturnType<typeof createRoot> | null = null

window.AgentesChat = {
  init: (config: ChatConfig) => {
    // Criar container se não existir
    let container = document.getElementById('agentes-chat-widget')
    if (!container) {
      container = document.createElement('div')
      container.id = 'agentes-chat-widget'
      document.body.appendChild(container)
    }

    // Montar widget
    root = createRoot(container)
    root.render(<ChatWidget config={config} />)
  },

  destroy: () => {
    if (root) {
      root.unmount()
      root = null
    }
    const container = document.getElementById('agentes-chat-widget')
    if (container) {
      container.remove()
    }
  }
}

// Auto-init se tiver configuração no script tag
const script = document.currentScript as HTMLScriptElement
if (script) {
  const config = script.dataset.config
  if (config) {
    try {
      window.AgentesChat.init(JSON.parse(config))
    } catch (e) {
      console.error('[AgentesChat] Invalid config:', e)
    }
  }
}
