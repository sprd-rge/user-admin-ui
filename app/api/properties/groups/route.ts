import { NextResponse } from "next/server"

// Mock data for demonstration
const mockPropertyGroups = [
  {
    id: "user-preferences",
    name: "User Preferences",
    properties: [
      { key: "theme", value: "dark" },
      { key: "language", value: "en-US" },
      { key: "timezone", value: "UTC" },
      { key: "date_format", value: "MM/DD/YYYY" },
    ],
  },
  {
    id: "system-config",
    name: "System Configuration",
    properties: [
      { key: "max_connections", value: "100" },
      { key: "timeout", value: "30s" },
      { key: "debug_mode", value: "false" },
      { key: "log_level", value: "info" },
      { key: "cache_size", value: "256MB" },
    ],
  },
  {
    id: "notifications",
    name: "Notification Settings",
    properties: [
      { key: "email_notifications", value: "enabled" },
      { key: "push_notifications", value: "disabled" },
      { key: "sms_notifications", value: "enabled" },
      { key: "notification_frequency", value: "daily" },
    ],
  },
  {
    id: "security",
    name: "Security Settings",
    properties: [
      { key: "two_factor_auth", value: "enabled" },
      { key: "session_timeout", value: "24h" },
      { key: "password_policy", value: "strict" },
    ],
  },
  {
    id: "api-config",
    name: "API Configuration",
    properties: [
      { key: "rate_limit", value: "1000/hour" },
      { key: "api_version", value: "v2" },
      { key: "cors_enabled", value: "true" },
    ],
  },
]

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200))

    return NextResponse.json(mockPropertyGroups)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch property groups" }, { status: 500 })
  }
}
