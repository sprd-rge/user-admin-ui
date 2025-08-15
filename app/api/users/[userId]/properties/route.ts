import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 700))

    // Mock user properties
    const userProperties = [
      { key: "theme", value: "dark", updatedAt: "2024-01-18T09:15:00Z" },
      { key: "language", value: "en-US", updatedAt: "2024-01-15T10:30:00Z" },
      { key: "notifications", value: "enabled", updatedAt: "2024-01-19T16:45:00Z" },
      { key: "timezone", value: "UTC", updatedAt: "2024-01-16T12:00:00Z" },
      { key: "date_format", value: "MM/DD/YYYY", updatedAt: "2024-01-17T08:30:00Z" },
    ]

    return NextResponse.json(userProperties)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user properties" }, { status: 500 })
  }
}
