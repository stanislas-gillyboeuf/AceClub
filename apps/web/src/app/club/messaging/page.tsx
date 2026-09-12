"use client"

import { useState } from "react"
import { Mail, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AvatarStack } from "@/components/custom/avatar-stack"
import { useBroadcasts, useSegmentPreview } from "@/hooks/use-messaging-queries"
import { useSendBroadcast } from "@/hooks/use-messaging-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"
import type { BroadcastChannel, BroadcastSegment } from "@/types/messaging"

const SEGMENT_LABELS: Record<BroadcastSegment, string> = {
  all: "Tous les membres",
  unpaid_dues: "Cotisation impayée",
  inactive_30d: "Inactifs depuis 30 jours",
}

const CHANNEL_LABELS: Record<BroadcastChannel, string> = {
  email: "Email",
  push: "Notification push",
  both: "Email + notification push",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ClubMessagingPage() {
  const { organizationId } = useClubAdminContext()
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [channel, setChannel] = useState<BroadcastChannel>("email")
  const [segment, setSegment] = useState<BroadcastSegment>("all")
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: preview } = useSegmentPreview(organizationId, segment)
  const { data: history } = useBroadcasts(organizationId, { limit: 10 })
  const sendBroadcast = useSendBroadcast()

  const isValid = subject.trim().length > 0 && body.trim().length > 0

  function handleSend() {
    sendBroadcast.mutate(
      { organizationId, subject, body, channel, segment },
      {
        onSuccess: () => {
          setSubject("")
          setBody("")
        },
      },
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Messagerie</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Nouveau message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="subject">Sujet</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">Message</Label>
            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Canal</Label>
              <Select value={channel} onValueChange={(v: BroadcastChannel) => setChannel(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CHANNEL_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Destinataires</Label>
              <Select value={segment} onValueChange={(v: BroadcastSegment) => setSegment(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SEGMENT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {preview ? (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
              <AvatarStack
                people={preview.sample.map((m) => ({ id: m.userId, name: m.name, image: m.image }))}
              />
              <p className="text-sm text-muted-foreground">
                Ce message touchera <strong className="text-foreground">{preview.count}</strong>{" "}
                membre{preview.count > 1 ? "s" : ""}.
              </p>
            </div>
          ) : null}

          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button disabled={!isValid}>
                <Send className="mr-2 h-4 w-4" />
                Envoyer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Envoyer ce message ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Il sera envoyé à {preview?.count ?? 0} membre{(preview?.count ?? 0) > 1 ? "s" : ""} via{" "}
                  {CHANNEL_LABELS[channel].toLowerCase()}. Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleSend} disabled={sendBroadcast.isPending}>
                  {sendBroadcast.isPending ? "Envoi..." : "Confirmer l'envoi"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Historique</CardTitle>
        </CardHeader>
        <CardContent>
          {!history?.broadcasts.length ? (
            <p className="text-sm text-muted-foreground">Aucun message envoyé pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {history.broadcasts.map((b) => (
                <li key={b.id} className="flex items-start justify-between gap-4 border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{b.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(b.createdAt)} · par {b.senderName} · {SEGMENT_LABELS[b.segment]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{CHANNEL_LABELS[b.channel]}</Badge>
                    <Badge variant="secondary">
                      <Mail className="mr-1 h-3 w-3" />
                      {b.recipientCount}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
