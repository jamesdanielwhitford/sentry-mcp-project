// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}${fileExtension}`
    const filepath = path.join(uploadsDir, filename)

    // Write file
    await writeFile(filepath, buffer)

    // Save to database
    const savedFile = await db.file.create({
      data: {
        name: filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: `/uploads/${filename}`,
        userId: session.user.id
      }
    })

    return NextResponse.json({
      message: "File uploaded successfully",
      file: savedFile
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}