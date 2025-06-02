"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function PropertiesPanel() {
  return (
    <aside className="w-80 border-l bg-background">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Propriedades</h2>
        <p className="text-sm text-muted-foreground">
          Configure o elemento selecionado
        </p>
      </div>
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Configurações do Nó</CardTitle>
            <CardDescription className="text-xs">
              Ajuste as propriedades do nó selecionado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="node-label">Label</Label>
              <Input id="node-label" placeholder="Nome do nó" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-type">Tipo</Label>
              <Select>
                <SelectTrigger id="node-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Agente</SelectItem>
                  <SelectItem value="message">Mensagem</SelectItem>
                  <SelectItem value="action">Ação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-description">Descrição</Label>
              <Textarea 
                id="node-description" 
                placeholder="Descreva a função deste nó"
                rows={3}
              />
            </div>
            <Button variant="destructive" size="sm" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Remover Nó
            </Button>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}