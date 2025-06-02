"use client"

import { Check, ChevronsUpDown, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import { useOrganizations } from "@/hooks/use-organizations"
import { Skeleton } from "@/components/ui/skeleton"

export function OrganizationSwitcher() {
  const [open, setOpen] = useState(false)
  const { organizations, currentOrganization, loading, switchOrganization } = useOrganizations()

  // Fallback para modo demo se não houver dados
  const demoOrganizations = [
    { id: "1", name: "Minha Empresa", slug: "minha-empresa" },
    { id: "2", name: "Empresa Teste", slug: "empresa-teste" },
  ]

  const displayOrganizations = organizations.length > 0 ? organizations : demoOrganizations
  const displayCurrent = currentOrganization || displayOrganizations[0]

  if (loading) {
    return <Skeleton className="h-10 w-[180px]" />
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open} 
          className="w-[180px] justify-between"
        >
          <div className="flex items-center">
            <Building2 className="mr-2 h-4 w-4" />
            <span className="truncate">{displayCurrent?.name || "Selecione..."}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Buscar organização..." />
          <CommandList>
            <CommandEmpty>Nenhuma organização encontrada.</CommandEmpty>
            <CommandGroup>
              {displayOrganizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.slug || org.id}
                  onSelect={() => {
                    if (organizations.length > 0) {
                      switchOrganization(org.id)
                    }
                    setOpen(false)
                  }}
                >
                  <Check 
                    className={cn(
                      "mr-2 h-4 w-4", 
                      displayCurrent?.id === org.id ? "opacity-100" : "opacity-0"
                    )} 
                  />
                  {org.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}