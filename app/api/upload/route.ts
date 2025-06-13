// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("Upload endpoint called")
    
    const session = await getServerSession(authOptions)
    console.log("Session:", session?.user?.id ? "Valid" : "Invalid")
    
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

    console.log("File received:", {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'application/pdf', 
      'text/plain',
      'text/csv'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      console.log("Invalid file type:", file.type)
      return NextResponse.json(
        { error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'bin'
    const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`

    console.log("Environment check:", {
      hasBlob: !!process.env.BLOB_READ_WRITE_TOKEN,
      nodeEnv: process.env.NODE_ENV
    })

    try {
      // Always try to use Vercel Blob first if token is available
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        console.log("Using Vercel Blob storage")
        
        try {
          const { put } = await import('@vercel/blob')
          const filename = `uploads/${session.user.id}/${uniqueFilename}`
          
          console.log("Uploading to blob:", filename)
          
          const blob = await put(filename, file, {
            access: 'public',
          })

          console.log("Blob uploaded successfully:", blob.url)

          // Save file metadata to database
          console.log("Saving to database...")
          
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

          console.log("File saved to database:", savedFile.id)

          return NextResponse.json({
            message: "File uploaded successfully",
            file: savedFile
          })
          
        } catch (blobError) {
          console.error("Vercel Blob error:", blobError)
          throw new Error(`Blob storage failed: ${blobError instanceof Error ? blobError.message : 'Unknown error'}`)
        }
        
      } else {
        // Fallback error - should not happen in production
        console.error("No blob storage token available")
        return NextResponse.json(
          { error: "File storage not configured. BLOB_READ_WRITE_TOKEN environment variable is required." },
          { status: 500 }
        )
      }

    } catch (uploadError) {
      console.error("Upload error details:", uploadError)
      
      // More specific error handling
      if (uploadError instanceof Error) {
        if (uploadError.message.includes('PrismaClient')) {
          return NextResponse.json(
            { error: "Database connection failed. Please check your database configuration." },
            { status: 500 }
          )
        }
        
        if (uploadError.message.includes('Blob')) {
          return NextResponse.json(
            { error: "File storage failed. Please try again or contact support." },
            { status: 500 }
          )
        }
        
        return NextResponse.json(
          { error: `Upload failed: ${uploadError.message}` },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("General upload error:", error)
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error("Error stack:", error.stack)
    }
    
    return NextResponse.json(
      { error: "Internal server error. Please check server logs." },
      { status: 500 }
    )
  }
}