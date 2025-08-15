import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 750))

    // Mock user attributes
    const userAttributes = [
      { key: "department", value: "Engineering", type: "string" },
      { key: "employee_id", value: `EMP${userId}`, type: "string" },
      { key: "start_date", value: "2023-06-01", type: "date" },
      { key: "salary_band", value: "L4", type: "string" },
      { key: "manager_id", value: "MGR001", type: "string" },
      { key: "office_location", value: "New York", type: "string" },
      { key: "years_experience", value: "5", type: "number" },
    ]

    return NextResponse.json(userAttributes)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user attributes" }, { status: 500 })
  }
}
