// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`

    try {
      // Check if we're in production and Vercel Blob is available
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        // Use Vercel Blob in production
        const { put } = await import('@vercel/blob')
        const filename = `${session.user.id}/${uniqueFilename}`
        
        const blob = await put(filename, file, {
          access: 'public',
        })

        // Save file metadata to database
        const savedFile = await db.file.create({
          data: {
            name: blob.pathname.split('/').pop() || uniqueFilename,
            originalName: file.name,
            size: file.size,
            type: file.type,
            url: blob.url,
            userId: session.user.id
          }
        })

        return NextResponse.json({
          message: "File uploaded successfully",
          file: savedFile
        })
      } else {
        // Use local file storage for development
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', session.user.id)
        await mkdir(uploadsDir, { recursive: true })

        // Save file to local storage
        const filePath = join(uploadsDir, uniqueFilename)
        await writeFile(filePath, buffer)

        // Create file URL for local storage
        const fileUrl = `/uploads/${session.user.id}/${uniqueFilename}`

        // Save file metadata to database
        const savedFile = await db.file.create({
          data: {
            name: uniqueFilename,
            originalName: file.name,
            size: file.size,
            type: file.type,
            url: fileUrl,
            userId: session.user.id
          }
        })

        return NextResponse.json({
          message: "File uploaded successfully",
          file: savedFile
        })
      }

    } catch (uploadError) {
      console.error("File upload error:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}