import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock newsletter data
    const newsletterData = {
      subscribed: true,
      preferences: ["product_updates", "weekly_digest", "security_alerts"],
      lastSent: "2024-01-19T08:00:00Z",
      subscribedAt: "2024-01-15T10:30:00Z",
      frequency: "weekly",
    }

    return NextResponse.json(newsletterData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch newsletter information" }, { status: 500 })
  }
}
