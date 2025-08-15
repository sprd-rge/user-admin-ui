import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { identityId: string } }) {
  try {
    const { identityId } = params

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Mock mapping of identityId to userId
    // In a real application, this would query your database
    const identityToUserMapping: Record<string, string> = {
      "auth0|123456789": "user_001",
      "google|987654321": "user_002",
      "github|555666777": "user_003",
      "facebook|111222333": "user_004",
    }

    // Generate a userId based on identityId if not in mapping
    const userId = identityToUserMapping[identityId] || `user_${identityId.slice(-6)}`

    const response = {
      identityId: identityId,
      userId: userId,
      provider: identityId.split("|")[0] || "unknown",
      found: true,
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user from identity" }, { status: 500 })
  }
}
