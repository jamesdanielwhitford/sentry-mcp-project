// app/api/user/files/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { del } from '@vercel/blob'

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
      // Delete from Vercel Blob Storage
      await del(file.url)
    } catch (blobError) {
      console.warn("Could not delete file from blob storage:", blobError)
      // Continue with database deletion even if blob deletion fails
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