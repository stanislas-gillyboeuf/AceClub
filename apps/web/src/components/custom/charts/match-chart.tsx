"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MatchChartProps {
  wins: number;
  losses: number;
}

export function MatchChart({ wins, losses }: MatchChartProps) {
  const data = [
    { name: "Victoires", count: wins, fill: "hsl(var(--primary))" },
    { name: "Défaites", count: losses, fill: "hsl(var(--destructive))" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Victoires vs Défaites</CardTitle>
        <CardDescription>Matchs terminés</CardDescription>
      </CardHeader>
      <CardContent>
        {wins === 0 && losses === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Aucun match terminé</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
