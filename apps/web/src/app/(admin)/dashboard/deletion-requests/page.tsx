"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useAccountDeletionRequests } from "@/hooks/use-admin-queries"
import { useProcessDeletionRequest } from "@/hooks/use-admin-mutations"
import type { AccountDeletionRequest } from "@/types/admin"
import { CheckCircle, XCircle } from "lucide-react"

function StatusBadge({ status }: { status: AccountDeletionRequest["status"] }) {
  switch (status) {
    case "pending":
      return <Badge variant="outline">En attente</Badge>
    case "processed":
      return <Badge variant="default">Traité</Badge>
    case "rejected":
      return <Badge variant="destructive">Rejeté</Badge>
  }
}

export default function DeletionRequestsPage() {
  const { data, isLoading } = useAccountDeletionRequests()
  const processMutation = useProcessDeletionRequest()

  const handleProcess = (requestId: string, status: "processed" | "rejected") => {
    processMutation.mutate({ requestId, status })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Demandes de suppression</h1>
        <p className="text-muted-foreground">
          Gérer les demandes de suppression de compte des utilisateurs
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !data?.requests?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              Aucune demande de suppression
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nom complet</TableHead>
                <TableHead>Club</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(request.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>
                    {request.firstName} {request.lastName}
                  </TableCell>
                  <TableCell>{request.clubName}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {request.reason || "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === "pending" && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={processMutation.isPending}
                          onClick={() => handleProcess(request.id, "processed")}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Traiter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={processMutation.isPending}
                          onClick={() => handleProcess(request.id, "rejected")}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Rejeter
                        </Button>
                      </div>
                    )}
                    {request.status !== "pending" && request.processedAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.processedAt).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
