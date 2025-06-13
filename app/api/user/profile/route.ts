// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        files: {
          select: {
            id: true,
            name: true,
            originalName: true,
            size: true,
            type: true,
            uploadedAt: true
          },
          orderBy: { uploadedAt: 'desc' }
        },
        settings: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)

  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, avatar } = await request.json()

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar })
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true
      }
    })

    return NextResponse.json(updatedUser)

  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}