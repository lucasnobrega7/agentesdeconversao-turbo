import type { NodeTypes } from "@xyflow/react"
import { StartNode } from "./start-node"
import { AIResponseNode } from "./ai-response-node"
import { ConditionNode } from "./condition-node"
import { WebhookNode } from "./webhook-node"
import { EndNode } from "./end-node"
import { MessageNode } from "./message-node"
import { ToolNode } from "./tool-node" // Novo nó

export const nodeTypes: NodeTypes = {
  startNode: StartNode,
  aiResponseNode: AIResponseNode,
  conditionNode: ConditionNode,
  webhookNode: WebhookNode,
  messageNode: MessageNode,
  toolNode: ToolNode, // Adicionado
  endNode: EndNode,
}

export const nodeCategories = [
  {
    label: "Gatilhos", // Renomeado de "Entrada"
    icon: "Zap",
    nodes: [
      { type: "startNode", label: "Início do Fluxo", icon: "PlayCircle" }, // Ícone mais específico
      { type: "webhookNode", label: "Webhook HTTP", icon: "Webhook" },
    ],
  },
  {
    label: "Ações de IA", // Renomeado e focado
    icon: "BrainCircuit", // Ícone mais específico
    nodes: [
      { type: "aiResponseNode", label: "Gerar Resposta IA", icon: "Sparkles" }, // Ícone mais específico
    ],
  },
  {
    label: "Lógica",
    icon: "GitFork",
    nodes: [
      { type: "conditionNode", label: "Decisão (Se/Então)", icon: "Split" }, // Ícone mais específico
    ],
  },
  {
    label: "Comunicação",
    icon: "MessagesSquare", // Ícone mais específico
    nodes: [
      { type: "messageNode", label: "Enviar Mensagem", icon: "Send" }, // Ícone mais específico
    ],
  },
  {
    label: "Ferramentas", // Nova categoria
    icon: "Wrench",
    nodes: [
      { type: "toolNode", label: "Executar Ferramenta", icon: "TerminalSquare" }, // Novo nó
    ],
  },
  {
    label: "Finalizadores", // Renomeado de "Saída"
    icon: "Flag",
    nodes: [{ type: "endNode", label: "Fim do Fluxo", icon: "CheckCircle2" }], // Ícone mais específico
  },
]
