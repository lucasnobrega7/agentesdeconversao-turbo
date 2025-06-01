import { MessageNode } from './MessageNode'
import { ConditionNode } from './ConditionNode'
import { APINode } from './APINode'
import { PromptNode } from './PromptNode'
import { IntegrationNode } from './IntegrationNode'

export const nodeTypes = {
  message: MessageNode,
  condition: ConditionNode,
  api: APINode,
  prompt: PromptNode,
  integration: IntegrationNode,
  // Adicionar outros tipos conforme necessário
}

export {
  MessageNode,
  ConditionNode,
  APINode,
  PromptNode,
  IntegrationNode
}
