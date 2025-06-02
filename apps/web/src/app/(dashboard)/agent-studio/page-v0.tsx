import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Edit, FlowerIcon as FlowIcon, MoreHorizontal, Plus, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const flows = [
  {
    id: "1",
    name: "Fluxo de Vendas",
    description: "Fluxo para converter leads em vendas.",
    agent: "Assistente de Vendas",
    lastUpdated: "Há 2 dias",
    status: "published",
  },
  {
    id: "2",
    name: "Atendimento ao Cliente",
    description: "Fluxo para resolver problemas de clientes.",
    agent: "Suporte ao Cliente",
    lastUpdated: "Há 5 dias",
    status: "published",
  },
  {
    id: "3",
    name: "Qualificação de Leads",
    description: "Fluxo para qualificar leads antes de enviar para vendas.",
    agent: "Qualificação de Leads",
    lastUpdated: "Há 1 semana",
    status: "draft",
  },
  {
    id: "4",
    name: "FAQ Automatizado",
    description: "Fluxo para responder perguntas frequentes.",
    agent: "FAQ Bot",
    lastUpdated: "Há 2 semanas",
    status: "draft",
  },
]

export default function AgentStudioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AgentStudio</h1>
          <p className="text-muted-foreground">
            Crie e gerencie fluxos de conversação para seus agentes.
          </p>
        </div>
        <Link href="/agent-studio/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Fluxo
          </Button>
        </Link>
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="published">Publicados</TabsTrigger>
          <TabsTrigger value="draft">Rascunhos</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flows.map((flow) => (
              <Card key={flow.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="flex items-center">
                        <FlowIcon className="mr-2 h-4 w-4" />
                        {flow.name}
                      </CardTitle>
                      {flow.status === "published" ? (
                        <Badge variant="default" className="bg-green-500">Publicado</Badge>
                      ) : (
                        <Badge variant="outline">Rascunho</Badge>
                      )}
                    </div>
                    <CardDescription>{flow.description}</CardDescription>
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
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Agente</p>
                      <p className="font-medium">{flow.agent}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Última atualização</p>
                      <p className="font-medium">{flow.lastUpdated}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex w-full justify-between">
                    <Button variant="outline" size="sm">
                      Simular
                    </Button>
                    <Link href={`/agent-studio/${flow.id}`}>
                      <Button size="sm">
                        Editar Fluxo
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="published" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flows.filter(f => f.status === "published").map((flow) => (
              <Card key={flow.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="flex items-center">
                        <FlowIcon className="mr-2 h-4 w-4" />
                        {flow.name}
                      </CardTitle>
                      <Badge variant="default" className="bg-green-500">Publicado</Badge>
                    </div>
                    <CardDescription>{flow.description}</CardDescription>
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
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Agente</p>
                      <p className="font-medium">{flow.agent}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Última atualização</p>
                      <p className="font-medium">{flow.lastUpdated}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex w-full justify-between">
                    <Button variant="outline" size="sm">
                      Simular
                    </Button>
                    <Link href={`/agent-studio/${flow.id}`}>
                      <Button size="sm">
                        Editar Fluxo
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="draft" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flows.filter(f => f.status === "draft").map((flow) => (
              <Card key={flow.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="flex items-center">
                        <FlowIcon className="mr-2 h-4 w-4" />
                        {flow.name}
                      </CardTitle>
                      <Badge variant="outline">Rascunho</Badge>
                    </div>
                    <CardDescription>{flow.description}</CardDescription>
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
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className\
