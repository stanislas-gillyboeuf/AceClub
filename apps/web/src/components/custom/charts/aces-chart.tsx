"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AcesChartProps {
  data: { date: string; total: number }[];
}

export function AcesChart({ data }: AcesChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progression des Aces</CardTitle>
        <CardDescription>30 derniers jours</CardDescription>
      </CardHeader>
      <CardContent>
        {formatted.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Aucune donnée</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formatted}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
