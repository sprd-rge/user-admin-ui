import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { identityId: string } }) {
  try {
    const { identityId } = params

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Mock identity data
    const identityData = {
      identityId: identityId,
      provider: "auth0",
      verified: true,
      lastLogin: "2024-01-20T14:22:00Z",
      loginCount: 42,
      createdAt: "2024-01-15T10:30:00Z",
    }

    return NextResponse.json(identityData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch identity details" }, { status: 500 })
  }
}
