import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const conversations = [
  {
    id: "1",
    user: "João Silva",
    message: "Olá, gostaria de saber mais sobre os planos de assinatura.",
    time: "Há 5 minutos",
    agent: "Assistente de Vendas",
    status: "active",
  },
  {
    id: "2",
    user: "Maria Oliveira",
    message: "Como faço para cancelar minha assinatura?",
    time: "Há 15 minutos",
    agent: "Suporte ao Cliente",
    status: "active",
  },
  {
    id: "3",
    user: "Pedro Santos",
    message: "Preciso de ajuda com a integração da API.",
    time: "Há 1 hora",
    agent: "Suporte Técnico",
    status: "closed",
  },
  {
    id: "4",
    user: "Ana Costa",
    message: "Quais são os recursos disponíveis no plano Pro?",
    time: "Há 3 horas",
    agent: "Assistente de Vendas",
    status: "closed",
  },
]

export function RecentConversations() {
  return (
    <div className="space-y-8">
      {conversations.map((conversation) => (
        <div key={conversation.id} className="flex items-start gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={`/placeholder.svg?height=36&width=36&query=${conversation.user}`}
              alt={conversation.user}
            />
            <AvatarFallback>
              {conversation.user
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{conversation.user}</p>
              <div
                className={`h-2 w-2 rounded-full ${conversation.status === "active" ? "bg-green-500" : "bg-gray-300"}`}
              />
              <p className="text-xs text-muted-foreground">{conversation.time}</p>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">{conversation.message}</p>
            <p className="text-xs">
              <span className="font-medium">Agente:</span> {conversation.agent}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto">
            Ver
          </Button>
        </div>
      ))}
      <Button variant="outline" className="w-full">
        Ver todas as conversas
      </Button>
    </div>
  )
}
