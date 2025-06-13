// app/api/user/files/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { unlink } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const files = await db.file.findMany({
      where: { userId: session.user.id },
      orderBy: { uploadedAt: 'desc' }
    })

    return NextResponse.json(files)

  } catch (error) {
    console.error("Files fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("id")

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID required" },
        { status: 400 }
      )
    }

    // Find the file and verify ownership
    const file = await db.file.findFirst({
      where: { 
        id: fileId,
        userId: session.user.id 
      }
    })

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    try {
      // Check if file is stored in Vercel Blob or locally
      if (file.url.startsWith('https://') && process.env.BLOB_READ_WRITE_TOKEN) {
        // Delete from Vercel Blob Storage
        const { del } = await import('@vercel/blob')
        await del(file.url)
      } else if (file.url.startsWith('/uploads/')) {
        // Delete local file
        const filePath = join(process.cwd(), 'public', file.url)
        try {
          await unlink(filePath)
        } catch (unlinkError) {
          console.warn("Could not delete local file:", unlinkError)
          // Continue with database deletion even if file deletion fails
        }
      }
    } catch (storageError) {
      console.warn("Could not delete file from storage:", storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    await db.file.delete({
      where: { id: fileId }
    })

    return NextResponse.json({ message: "File deleted successfully" })

  } catch (error) {
    console.error("File deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}