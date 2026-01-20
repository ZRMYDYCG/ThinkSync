export type Document = {
  id: string
  title: string
  userId: string
  isArchived: boolean
  parentDocumentId: string | null
  content: string | null
  coverImage: string | null
  icon: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
}
