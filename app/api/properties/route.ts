import { NextResponse } from "next/server"

// Mock data for demonstration
const mockProperties = [
  {
    key: "theme",
    value: "dark",
  },
  {
    key: "notifications",
    value: "enabled",
  },
  {
    key: "language",
    value: "en-US",
  },
  {
    key: "timezone",
    value: "UTC",
  },
  {
    key: "max_connections",
    value: "100",
  },
]

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json(mockProperties)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}
