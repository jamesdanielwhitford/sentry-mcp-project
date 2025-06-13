// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    // Check session first
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.error("Upload attempt without valid session")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log("Upload request from user:", session.user.id)

    // Parse form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (error) {
      console.error("Failed to parse form data:", error)
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      )
    }

    const file = formData.get("file") as File
    
    if (!file) {
      console.error("No file provided in form data")
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    console.log("File details:", {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.error("File too large:", file.size)
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'application/pdf', 
      'text/plain',
      'text/csv',
      'application/json'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      console.error("File type not allowed:", file.type)
      return NextResponse.json(
        { error: `File type not allowed: ${file.type}. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate unique filename with better extension handling
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    
    // Handle file extension more safely
    let fileExtension = 'bin' // default extension
    if (file.name && file.name.includes('.')) {
      const parts = file.name.split('.')
      fileExtension = parts[parts.length - 1].toLowerCase()
    } else {
      // Derive extension from MIME type if no extension in filename
      const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'application/pdf': 'pdf',
        'text/plain': 'txt',
        'text/csv': 'csv',
        'application/json': 'json'
      }
      fileExtension = mimeToExt[file.type] || 'bin'
    }
    
    const filename = `${session.user.id}/${timestamp}-${randomString}.${fileExtension}`
    
    console.log("Generated filename:", filename)

    // Check if Vercel Blob is properly configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN environment variable is not set")
      return NextResponse.json(
        { error: "File storage not configured" },
        { status: 500 }
      )
    }

    let blob
    try {
      console.log("Attempting to upload to Vercel Blob...")
      
      // Upload to Vercel Blob Storage
      blob = await put(filename, file, {
        access: 'public',
      })
      
      console.log("Blob upload successful:", blob.url)
      
    } catch (uploadError) {
      console.error("Blob upload error:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload file to storage. Please check your Vercel Blob configuration." },
        { status: 500 }
      )
    }

    // Test database connection before attempting to save
    try {
      console.log("Testing database connection...")
      await db.$queryRaw`SELECT 1`
      console.log("Database connection successful")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        { error: "Database connection failed. Please check your DATABASE_URL." },
        { status: 500 }
      )
    }

    let savedFile
    try {
      console.log("Attempting to save file metadata to database...")
      
      // Save file metadata to database
      savedFile = await db.file.create({
        data: {
          name: blob.pathname.split('/').pop() || filename,
          originalName: file.name,
          size: file.size,
          type: file.type,
          url: blob.url,
          userId: session.user.id
        }
      })
      
      console.log("File metadata saved successfully:", savedFile.id)
      
    } catch (dbError) {
      console.error("Database save error:", dbError)
      
      // Try to clean up the uploaded blob if database save fails
      try {
        const { del } = await import('@vercel/blob')
        await del(blob.url)
        console.log("Cleaned up blob after database error")
      } catch (cleanupError) {
        console.error("Failed to cleanup blob after database error:", cleanupError)
      }
      
      return NextResponse.json(
        { error: "Failed to save file metadata. Database error." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "File uploaded successfully",
      file: savedFile
    })

  } catch (error) {
    console.error("Unexpected upload error:", error)
    
    // Log the full error details for debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}