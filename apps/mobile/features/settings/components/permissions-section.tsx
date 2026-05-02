import { Bell, MapPin } from "lucide-react-native";
import { SectionCard } from "@/components/ui/section-card";
import { ToggleRow } from "@/components/ui/toggle-row";
import { colors } from "@/constants/theme";

interface PermissionsSectionProps {
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  onNotificationsToggle: (value: boolean) => void;
  onLocationToggle: (value: boolean) => void;
}

export function PermissionsSection({
  notificationsEnabled,
  locationEnabled,
  onNotificationsToggle,
  onLocationToggle,
}: PermissionsSectionProps) {
  return (
    <>
      <SectionCard title="Notifications">
        <ToggleRow
          icon={<Bell size={20} color={colors.accentOrange} strokeWidth={1.5} />}
          label="Notifications push"
          description="Recevez des alertes pour les matchs et invitations"
          value={notificationsEnabled}
          onValueChange={onNotificationsToggle}
        />
      </SectionCard>

      <SectionCard title="Localisation">
        <ToggleRow
          icon={<MapPin size={20} color={colors.accentGreen} strokeWidth={1.5} />}
          label="Accès à la localisation"
          description="Permet de trouver des joueurs proches de vous"
          value={locationEnabled}
          onValueChange={onLocationToggle}
        />
      </SectionCard>
    </>
  );
}
