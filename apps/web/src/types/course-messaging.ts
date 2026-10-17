export interface CourseMessagingSettings {
  enabled: boolean
}

export interface ClubGroup {
  id: string
  name: string | null
  courseId: string | null
  courseName: string | null
  isArchived: boolean
  announcementsOnly: boolean
  createdAt: string
}
