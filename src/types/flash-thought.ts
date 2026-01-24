export type FlashThoughtComment = {
  id: string
  authorName: string
  authorAvatar?: string | null
  content: string
  createdAt: string
  replies: FlashThoughtComment[]
}

export type FlashThought = {
  id: string
  authorName: string
  authorAvatar?: string | null
  content: string
  images: string[]
  createdAt: string
  likedByMe: boolean
  likeCount: number
  comments: FlashThoughtComment[]
}
