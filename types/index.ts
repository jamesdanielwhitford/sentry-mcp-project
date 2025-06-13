// types/index.ts
import { User, File, UserSettings } from "@prisma/client"

export type UserWithRelations = User & {
  files: File[]
  settings: UserSettings | null
}

export type WeatherData = {
  city: string
  country: string
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  icon: string
}

export type FileUpload = {
  id: string
  name: string
  originalName: string
  size: number
  type: string
  url: string
  uploadedAt: Date
}

export type UserProfile = {
  id: string
  email: string
  name: string | null
  avatar: string | null
  createdAt: Date
  files: FileUpload[]
  settings: UserSettings | null
}