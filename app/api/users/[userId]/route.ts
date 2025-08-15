import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Mock user data
    const userData = {
      userId: userId,
      name: `User ${userId}`,
      email: `${userId.toLowerCase()}@example.com`,
      status: "active",
      createdAt: "2024-01-15T10:30:00Z",
      lastUpdated: "2024-01-20T14:22:00Z",
    }

    return NextResponse.json(userData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 })
  }
}
