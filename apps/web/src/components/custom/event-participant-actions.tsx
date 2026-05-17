"use client"

import {
  useAdminRemoveParticipant,
  useAdminUpdateParticipantStatus,
} from "@/hooks/use-admin-mutations"
import type {
  AdminEventParticipant,
  EventParticipantStatus,
} from "@/types/admin"
import { ConfirmDestructiveDialog } from "./confirm-destructive-dialog"
import { StatusSelectDialog } from "./status-select-dialog"

const participantStatusOptions: {
  value: EventParticipantStatus
  label: string
}[] = [
  { value: "registered", label: "Inscrit" },
  { value: "waitlisted", label: "Liste d'attente" },
  { value: "cancelled", label: "Annulé" },
]

export function UpdateParticipantStatusDialog({
  participant,
  open,
  onOpenChange,
}: {
  participant: AdminEventParticipant
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateMutation = useAdminUpdateParticipantStatus()

  return (
    <StatusSelectDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Modifier le statut"
      description={<>Changer le statut de &laquo; {participant.userName} &raquo;</>}
      initialValue={participant.status}
      options={participantStatusOptions}
      isPending={updateMutation.isPending}
      onSubmit={(status) =>
        updateMutation.mutate(
          { participantId: participant.id, status },
          { onSuccess: () => onOpenChange(false) },
        )
      }
    />
  )
}

export function RemoveParticipantDialog({
  participant,
  open,
  onOpenChange,
}: {
  participant: AdminEventParticipant
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const removeMutation = useAdminRemoveParticipant()

  return (
    <ConfirmDestructiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Retirer le participant"
      description={
        <>
          Retirer d&eacute;finitivement &laquo; {participant.userName} &raquo; de
          cet &eacute;v&eacute;nement ? Cette action est irr&eacute;versible.
        </>
      }
      confirmLabel="Retirer"
      isPending={removeMutation.isPending}
      onConfirm={() =>
        removeMutation.mutate(
          { participantId: participant.id },
          { onSuccess: () => onOpenChange(false) },
        )
      }
    />
  )
}
