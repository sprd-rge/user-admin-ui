import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 650))

    // Mock addresses data
    const addresses = [
      {
        id: `addr_${userId}_1`,
        type: "billing",
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        isDefault: true,
        createdAt: "2024-01-15T10:30:00Z",
      },
      {
        id: `addr_${userId}_2`,
        type: "shipping",
        street: "456 Oak Avenue",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90210",
        country: "USA",
        isDefault: false,
        createdAt: "2024-01-18T14:20:00Z",
      },
    ]

    return NextResponse.json(addresses)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
  }
}
