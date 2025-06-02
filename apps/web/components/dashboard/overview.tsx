"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "01/05",
    conversas: 40,
    conversoes: 24,
  },
  {
    name: "08/05",
    conversas: 30,
    conversoes: 13,
  },
  {
    name: "15/05",
    conversas: 20,
    conversoes: 8,
  },
  {
    name: "22/05",
    conversas: 27,
    conversoes: 12,
  },
  {
    name: "29/05",
    conversas: 18,
    conversoes: 7,
  },
  {
    name: "05/06",
    conversas: 23,
    conversoes: 11,
  },
  {
    name: "12/06",
    conversas: 34,
    conversoes: 19,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="conversas" fill="#adfa1d" radius={[4, 4, 0, 0]} />
        <Bar dataKey="conversoes" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}