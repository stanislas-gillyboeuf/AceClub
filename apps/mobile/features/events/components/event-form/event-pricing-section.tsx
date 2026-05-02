import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { Ticket, Link } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import { colors, semanticColors, radii } from "@/constants/theme";

interface EventPricingSectionProps {
  isFree: boolean;
  onIsFreeChange: (value: boolean) => void;
  price: string;
  onPriceChange: (price: string) => void;
  paymentLink: string;
  onPaymentLinkChange: (link: string) => void;
  scheme: "light" | "dark";
}

export function EventPricingSection({
  isFree,
  onIsFreeChange,
  price,
  onPriceChange,
  paymentLink,
  onPaymentLinkChange,
  scheme,
}: EventPricingSectionProps) {
  return (
    <GlassView style={styles.container}>
      <Text style={[styles.label, { color: semanticColors.labelSecondary[scheme] }]}>
        TARIF
      </Text>

      <View style={styles.row}>
        <Ticket size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />
        <Text style={[styles.rowLabel, { color: semanticColors.labelPrimary[scheme], flex: 1 }]}>
          Entrée
        </Text>
        <View style={styles.picker}>
          <Pressable
            onPress={() => onIsFreeChange(true)}
            style={[styles.option, isFree && styles.freeActive]}
          >
            <Text
              style={[
                styles.optionText,
                { color: isFree ? "#FFFFFF" : semanticColors.labelSecondary[scheme] },
              ]}
            >
              Gratuit
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onIsFreeChange(false)}
            style={[styles.option, !isFree && styles.paidActive]}
          >
            <Text
              style={[
                styles.optionText,
                { color: !isFree ? "#FFFFFF" : semanticColors.labelSecondary[scheme] },
              ]}
            >
              Payant
            </Text>
          </Pressable>
        </View>
      </View>

      {!isFree && (
        <>
          <View style={[styles.divider, { backgroundColor: semanticColors.divider[scheme] }]} />

          <View style={styles.row}>
            <Text
              style={[
                styles.rowLabel,
                { color: semanticColors.labelPrimary[scheme], flex: 1, marginLeft: 30 },
              ]}
            >
              Prix
            </Text>
            <View style={styles.priceInputRow}>
              <TextInput
                value={price}
                onChangeText={onPriceChange}
                placeholder="0"
                placeholderTextColor={semanticColors.labelTertiary[scheme]}
                keyboardType="number-pad"
                style={[styles.priceInput, { color: semanticColors.labelPrimary[scheme] }]}
              />
              <Text style={[styles.priceSuffix, { color: semanticColors.labelSecondary[scheme] }]}>
                €
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: semanticColors.divider[scheme] }]} />

          <View style={styles.row}>
            <Link size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />
            <TextInput
              value={paymentLink}
              onChangeText={onPaymentLinkChange}
              placeholder="Lien de paiement (Lydia, PayPal...)"
              placeholderTextColor={semanticColors.labelTertiary[scheme]}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.linkInput, { color: semanticColors.labelPrimary[scheme] }]}
            />
          </View>
        </>
      )}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    padding: 14,
    gap: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  rowLabel: {
    fontSize: 16,
  },
  picker: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  freeActive: {
    backgroundColor: colors.accentGreen,
    borderRadius: 8,
  },
  paidActive: {
    backgroundColor: colors.accentOrange,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceInput: {
    fontSize: 16,
    textAlign: "right",
    width: 60,
  },
  priceSuffix: {
    fontSize: 16,
    fontWeight: "500",
  },
  linkInput: {
    fontSize: 16,
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
