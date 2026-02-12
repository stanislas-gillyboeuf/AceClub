"use client";

import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLeaveOrganization } from "@/hooks/use-org-mutations";

interface LeaveOrgDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
}

export function LeaveOrgDialog({ open, onOpenChange, organizationId }: LeaveOrgDialogProps) {
  const router = useRouter();
  const leaveOrg = useLeaveOrganization();

  const handleLeave = async () => {
    await leaveOrg.mutateAsync({ organizationId });
    onOpenChange(false);
    router.push("/app/profile");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Quitter le club</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir quitter ce club ? Vous pourrez rejoindre à nouveau plus tard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLeave}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Quitter
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
