import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 900))

    // Mock payment info
    const paymentInfo = {
      customerId: `cus_${userId}_stripe`,
      plan: "Pro",
      status: "active",
      nextBilling: "2024-02-15T00:00:00Z",
      amount: 29.99,
      currency: "USD",
      paymentMethod: "card",
      lastPayment: "2024-01-15T00:00:00Z",
    }

    return NextResponse.json(paymentInfo)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payment information" }, { status: 500 })
  }
}
