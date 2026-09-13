import { View, Text, StyleSheet } from "react-native";
import { semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { MyEnrolledCourse } from "@/types/course";

const WEEKDAY_LABELS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

interface MyCoursesSectionProps {
  courses: MyEnrolledCourse[];
}

export function MyCoursesSection({ courses }: MyCoursesSectionProps) {
  const scheme = useColorScheme();

  if (courses.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>Mes cours</Text>
      {courses.map((course) => (
        <View
          key={course.courseId}
          style={[styles.card, { backgroundColor: semanticColors.cardBackground[scheme] }]}
        >
          <Text style={[styles.courseName, { color: semanticColors.labelPrimary[scheme] }]}>
            {course.name}
          </Text>
          <Text style={[styles.detail, { color: semanticColors.labelSecondary[scheme] }]}>
            {course.coachName} · {course.courtName}
          </Text>
          <Text style={[styles.detail, { color: semanticColors.labelSecondary[scheme] }]}>
            {WEEKDAY_LABELS[course.weekday]} {course.startTime} ({course.durationMinutes} min)
          </Text>
          <Text style={[styles.remaining, { color: semanticColors.labelTertiary[scheme] }]}>
            {course.status === "cancelled"
              ? "Série annulée"
              : `${course.sessionsRemaining} séance${course.sessionsRemaining > 1 ? "s" : ""} restante${course.sessionsRemaining > 1 ? "s" : ""}`}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  courseName: {
    fontSize: 14,
    fontWeight: "700",
  },
  detail: {
    fontSize: 12,
    marginTop: 2,
  },
  remaining: {
    fontSize: 11,
    marginTop: 6,
  },
});
