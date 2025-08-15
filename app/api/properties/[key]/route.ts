import { NextResponse } from "next/server"

// Mock data for demonstration - maps property keys to user IDs
const mockPropertyUsers: Record<string, string[]> = {
  theme: ["user_abc123", "user_def456", "user_ghi789"],
  notifications: ["user_def456", "user_jkl012", "user_mno345"],
  language: ["user_abc123", "user_pqr678", "user_stu901"],
  timezone: ["user_def456", "user_vwx234", "user_yz567"],
  max_connections: ["user_abc123", "user_def456"],
}

export async function GET(request: Request, { params }: { params: { key: string } }) {
  try {
    const { key } = params

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Get users for the specified property key
    const userIds = mockPropertyUsers[key] || []

    return NextResponse.json({
      propertyKey: key,
      userIds: userIds,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch property users" }, { status: 500 })
  }
}
