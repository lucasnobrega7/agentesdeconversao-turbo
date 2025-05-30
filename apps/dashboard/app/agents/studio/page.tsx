"use client";

import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  BackgroundVariant,
  Handle,
  Position,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MessageSquare, Bot, Zap, GitBranch, Save } from 'lucide-react';

// Tipos de nós customizados
const TriggerNode = ({ data }: NodeProps) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-green-500 text-white">
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <MessageSquare size={16} />
      <span className="text-sm font-medium">{data.label}</span>
    </div>
  </div>
);

const AINode = ({ data }: NodeProps) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-purple-500 text-white">
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <Bot size={16} />
      <span className="text-sm font-medium">{data.label}</span>
    </div>
  </div>
);

const ActionNode = ({ data }: NodeProps) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-blue-500 text-white">
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <div className="flex items-center gap-2">
      <Zap size={16} />
      <span className="text-sm font-medium">{data.label}</span>
    </div>
  </div>
);

const nodeTypes = {
  trigger: TriggerNode,
  ai: AINode,
  action: ActionNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 250, y: 50 },
    data: { label: 'Mensagem WhatsApp' },
  },
  {
    id: '2',
    type: 'ai',
    position: { x: 250, y: 150 },
    data: { label: 'Processar com IA' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
];

export default function AgentStudioPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { 
        label: type === 'trigger' ? 'Novo Gatilho' : 
               type === 'ai' ? 'Processar IA' : 
               'Nova Ação' 
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const saveFlow = async () => {
    const flow = { nodes, edges };
    console.log('Salvando fluxo:', flow);
    // Implementar salvamento no Supabase
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar de componentes */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r p-4">
        <h3 className="font-semibold mb-4">Componentes</h3>
        <div className="space-y-2">
          <button
            onClick={() => addNode('trigger')}
            className="w-full p-3 rounded-lg bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 flex items-center gap-2"
          >
            <MessageSquare size={20} />
            <span>Gatilho</span>
          </button>
          <button
            onClick={() => addNode('ai')}
            className="w-full p-3 rounded-lg bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 flex items-center gap-2"
          >
            <Bot size={20} />
            <span>Processar IA</span>
          </button>
          <button
            onClick={() => addNode('action')}
            className="w-full p-3 rounded-lg bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center gap-2"
          >
            <Zap size={20} />
            <span>Ação</span>
          </button>
        </div>
        
        <button
          onClick={saveFlow}
          className="w-full mt-8 p-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center gap-2"
        >
          <Save size={20} />
          <span>Salvar Fluxo</span>
        </button>
      </div>

      {/* Canvas do ReactFlow */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
