import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { email: string } }) {
  try {
    const email = decodeURIComponent(params.email)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 700))

    // Mock mapping of email to user data
    // In a real application, this would query your database
    const emailToUserMapping: Record<string, { userId: string; identityId?: string }> = {
      "john.doe@example.com": { userId: "user_001", identityId: "auth0|123456789" },
      "jane.smith@example.com": { userId: "user_002", identityId: "google|987654321" },
      "bob.wilson@example.com": { userId: "user_003", identityId: "github|555666777" },
      "alice.brown@example.com": { userId: "user_004", identityId: "facebook|111222333" },
    }

    // Generate a userId based on email if not in mapping
    const userData = emailToUserMapping[email] || {
      userId: `user_${email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "_")}`,
      identityId: `email|${email}`,
    }

    const response = {
      email: email,
      userId: userData.userId,
      identityId: userData.identityId,
      found: true,
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user from email" }, { status: 500 })
  }
}
