import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Copy, Edit, MoreHorizontal, Plus, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

const agents = [
  {
    id: "1",
    name: "Assistente de Vendas",
    description: "Agente especializado em converter leads em vendas.",
    conversations: 245,
    conversionRate: "24%",
    status: "active",
  },
  {
    id: "2",
    name: "Suporte ao Cliente",
    description: "Agente para atendimento e suporte ao cliente.",
    conversations: 532,
    conversionRate: "N/A",
    status: "active",
  },
  {
    id: "3",
    name: "Qualificação de Leads",
    description: "Agente para qualificar leads antes de enviar para a equipe de vendas.",
    conversations: 187,
    conversionRate: "32%",
    status: "active",
  },
  {
    id: "4",
    name: "FAQ Bot",
    description: "Agente para responder perguntas frequentes.",
    conversations: 423,
    conversionRate: "N/A",
    status: "inactive",
  },
]

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agentes</h1>
          <p className="text-muted-foreground">Gerencie seus agentes de conversão.</p>
        </div>
        <Link href="/agents/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agente
          </Button>
        </Link>
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="inactive">Inativos</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Card key={agent.id} className={agent.status === "inactive" ? "opacity-70" : ""}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center">
                      <Bot className="mr-2 h-4 w-4" />
                      {agent.name}
                    </CardTitle>
                    <CardDescription>{agent.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Conversas</p>
                      <p className="font-medium">{agent.conversations}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taxa de Conversão</p>
                      <p className="font-medium">{agent.conversionRate}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex w-full justify-between">
                    <Button variant="outline" size="sm">
                      Testar
                    </Button>
                    <Link href={`/agents/${agent.id}`}>
                      <Button size="sm">Gerenciar</Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents
              .filter((a) => a.status === "active")
              .map((agent) => (
                <Card key={agent.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center">
                        <Bot className="mr-2 h-4 w-4" />
                        {agent.name}
                      </CardTitle>
                      <CardDescription>{agent.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Conversas</p>
                        <p className="font-medium">{agent.conversations}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Taxa de Conversão</p>
                        <p className="font-medium">{agent.conversionRate}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex w-full justify-between">
                      <Button variant="outline" size="sm">
                        Testar
                      </Button>
                      <Link href={`/agents/${agent.id}`}>
                        <Button size="sm">Gerenciar</Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="inactive" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents
              .filter((a) => a.status === "inactive")
              .map((agent) => (
                <Card key={agent.id} className="opacity-70">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center">
                        <Bot className="mr-2 h-4 w-4" />
                        {agent.name}
                      </CardTitle>
                      <CardDescription>{agent.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Conversas</p>
                        <p className="font-medium">{agent.conversations}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Taxa de Conversão</p>
                        <p className="font-medium">{agent.conversionRate}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex w-full justify-between">
                      <Button variant="outline" size="sm">
                        Testar
                      </Button>
                      <Link href={`/agents/${agent.id}`}>
                        <Button size="sm">Gerenciar</Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
