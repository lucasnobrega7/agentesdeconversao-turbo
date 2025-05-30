"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Conversas Totais",
      value: "1,234",
      change: "+20.1%",
      icon: Activity,
    },
    {
      title: "Conversões",
      value: "234",
      change: "+18.2%",
      icon: DollarSign,
    },
    {
      title: "Agentes Ativos",
      value: "12",
      change: "+2",
      icon: Users,
    },
    {
      title: "Receita Gerada",
      value: "R$ 45,231",
      change: "+32.4%",
      icon: CreditCard,
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} em relação ao mês passado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
