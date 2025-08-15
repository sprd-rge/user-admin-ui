"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, User, CreditCard, Mail, MapPin, Settings } from "lucide-react"

interface Property {
  key: string
  value: string
}

interface PropertyGroup {
  id: string
  name: string
  properties: Property[]
}

interface UserDetails {
  userId: string
  name: string
  email: string
  status: string
  createdAt: string
}

interface UserIdentity {
  identityId: string
  provider: string
  verified: boolean
  lastLogin: string
}

interface UserProperty {
  key: string
  value: string
  updatedAt: string
}

interface PaymentInfo {
  customerId: string
  plan: string
  status: string
  nextBilling: string
  amount: number
}

interface Newsletter {
  subscribed: boolean
  preferences: string[]
  lastSent: string
}

interface Address {
  id: string
  type: string
  street: string
  city: string
  country: string
  isDefault: boolean
}

interface UserAttribute {
  key: string
  value: string
  type: string
}

export default function AdminUI() {
  const [activeTab, setActiveTab] = useState("users")
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [propertyUsers, setPropertyUsers] = useState<string[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [propertiesSubTab, setPropertiesSubTab] = useState("properties")
  const [propertyGroups, setPropertyGroups] = useState<PropertyGroup[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [groupsError, setGroupsError] = useState<string | null>(null)

  // User details state
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [currentUserId, setCurrentUserId] = useState("")
  const [currentIdentityId, setCurrentIdentityId] = useState("")
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [userIdentity, setUserIdentity] = useState<UserIdentity | null>(null)
  const [userProperties, setUserProperties] = useState<UserProperty[]>([])
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [userAttributes, setUserAttributes] = useState<UserAttribute[]>([])
  const [loadingStates, setLoadingStates] = useState({
    userDetails: false,
    userIdentity: false,
    userProperties: false,
    paymentInfo: false,
    newsletter: false,
    addresses: false,
    userAttributes: false,
  })

  // Form state for users
  const [userForm, setUserForm] = useState({
    userId: "",
    identityId: "",
    email: "",
  })

  const fetchProperties = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/properties")
      if (!response.ok) {
        throw new Error("Failed to fetch properties")
      }
      const data = await response.json()
      setProperties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setProperties([
        { key: "office_1", value: "Downtown Office" },
        { key: "home_1", value: "Suburban Home" },
        { key: "warehouse_1", value: "Warehouse District" },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "properties") {
      if (propertiesSubTab === "properties") {
        fetchProperties()
      } else if (propertiesSubTab === "groups") {
        fetchPropertyGroups()
      }
    }
    if (value === "users") {
      setShowUserDetails(false)
    }
  }

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let userId = userForm.userId
    let identityId = userForm.identityId
    const email = userForm.email

    // Count how many fields are filled
    const filledFields = [userId, identityId, email].filter((field) => field.trim() !== "").length

    if (filledFields === 0) {
      alert("Please enter either a User ID, Identity ID, or Email")
      return
    }

    if (filledFields > 1) {
      alert("Please enter only one field - either User ID, Identity ID, or Email")
      return
    }

    try {
      // If Identity ID is provided, fetch userId from identity
      if (identityId && !userId) {
        const response = await fetch(`/api/users/identities/${identityId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch user from identity")
        }
        const data = await response.json()
        userId = data.userId

        // Update the form to show the resolved userId
        setUserForm((prev) => ({ ...prev, userId: data.userId }))
      }

      // If Email is provided, fetch userId from email
      if (email && !userId) {
        const response = await fetch(`/api/users/email/${encodeURIComponent(email)}`)
        if (!response.ok) {
          throw new Error("Failed to fetch user from email")
        }
        const data = await response.json()
        userId = data.userId
        identityId = data.identityId || identityId

        // Update the form to show the resolved values
        setUserForm((prev) => ({
          ...prev,
          userId: data.userId,
          identityId: data.identityId || prev.identityId,
        }))
      }

      if (!userId) {
        alert("Could not resolve user from the provided information")
        return
      }

      setCurrentUserId(userId)
      setCurrentIdentityId(identityId)
      setShowUserDetails(true)

      // Fetch all user data
      await Promise.all([
        fetchUserDetails(userId),
        fetchUserIdentity(identityId),
        fetchUserProperties(userId),
        fetchPaymentInfo(userId),
        fetchNewsletter(userId),
        fetchAddresses(userId),
        fetchUserAttributes(userId),
      ])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      if (errorMessage.includes("identity")) {
        alert("Failed to find user with the provided Identity ID")
      } else if (errorMessage.includes("email")) {
        alert("Failed to find user with the provided Email")
      } else {
        alert("Failed to resolve user information")
      }
    }
  }

  const fetchUserDetails = async (userId: string) => {
    setLoadingStates((prev) => ({ ...prev, userDetails: true }))
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) throw new Error("Failed to fetch user details")
      const data = await response.json()
      setUserDetails(data)
    } catch (err) {
      console.error("Error fetching user details:", err)
      setUserDetails({
        userId,
        name: "John Doe",
        email: "john.doe@example.com",
        status: "active",
        createdAt: "2024-01-15T10:30:00Z",
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, userDetails: false }))
    }
  }

  const fetchUserIdentity = async (identityId: string) => {
    if (!identityId) return
    setLoadingStates((prev) => ({ ...prev, userIdentity: true }))
    try {
      const response = await fetch(`/api/users/identity/${identityId}`)
      if (!response.ok) throw new Error("Failed to fetch user identity")
      const data = await response.json()
      setUserIdentity(data)
    } catch (err) {
      console.error("Error fetching user identity:", err)
      setUserIdentity({
        identityId,
        provider: "auth0",
        verified: true,
        lastLogin: "2024-01-20T14:22:00Z",
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, userIdentity: false }))
    }
  }

  const fetchUserProperties = async (userId: string) => {
    setLoadingStates((prev) => ({ ...prev, userProperties: true }))
    try {
      const response = await fetch(`/api/users/${userId}/properties`)
      if (!response.ok) throw new Error("Failed to fetch user properties")
      const data = await response.json()
      setUserProperties(data)
    } catch (err) {
      console.error("Error fetching user properties:", err)
      setUserProperties([
        { key: "theme", value: "dark", updatedAt: "2024-01-18T09:15:00Z" },
        { key: "language", value: "en-US", updatedAt: "2024-01-15T10:30:00Z" },
        { key: "notifications", value: "enabled", updatedAt: "2024-01-19T16:45:00Z" },
      ])
    } finally {
      setLoadingStates((prev) => ({ ...prev, userProperties: false }))
    }
  }

  const fetchPaymentInfo = async (userId: string) => {
    setLoadingStates((prev) => ({ ...prev, paymentInfo: true }))
    try {
      const response = await fetch(`/api/users/${userId}/payment-info`)
      if (!response.ok) throw new Error("Failed to fetch payment info")
      const data = await response.json()
      setPaymentInfo(data)
    } catch (err) {
      console.error("Error fetching payment info:", err)
      setPaymentInfo({
        customerId: "cus_1234567890",
        plan: "Pro",
        status: "active",
        nextBilling: "2024-02-15T00:00:00Z",
        amount: 29.99,
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, paymentInfo: false }))
    }
  }

  const fetchNewsletter = async (userId: string) => {
    setLoadingStates((prev) => ({ ...prev, newsletter: true }))
    try {
      const response = await fetch(`/api/users/${userId}/newsletter`)
      if (!response.ok) throw new Error("Failed to fetch newsletter info")
      const data = await response.json()
      setNewsletter(data)
    } catch (err) {
      console.error("Error fetching newsletter info:", err)
      setNewsletter({
        subscribed: true,
        preferences: ["product_updates", "weekly_digest"],
        lastSent: "2024-01-19T08:00:00Z",
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, newsletter: false }))
    }
  }

  const fetchAddresses = async (userId: string) => {
    setLoadingStates((prev) => ({ ...prev, addresses: true }))
    try {
      const response = await fetch(`/api/users/${userId}/addresses`)
      if (!response.ok) throw new Error("Failed to fetch addresses")
      const data = await response.json()
      setAddresses(data)
    } catch (err) {
      console.error("Error fetching addresses:", err)
      setAddresses([
        {
          id: "addr_1",
          type: "billing",
          street: "123 Main St",
          city: "New York",
          country: "USA",
          isDefault: true,
        },
        {
          id: "addr_2",
          type: "shipping",
          street: "456 Oak Ave",
          city: "Los Angeles",
          country: "USA",
          isDefault: false,
        },
      ])
    } finally {
      setLoadingStates((prev) => ({ ...prev, addresses: false }))
    }
  }

  const fetchUserAttributes = async (userId: string) => {
    setLoadingStates((prev) => ({ ...prev, userAttributes: true }))
    try {
      const response = await fetch(`/api/users/${userId}/attributes`)
      if (!response.ok) throw new Error("Failed to fetch user attributes")
      const data = await response.json()
      setUserAttributes(data)
    } catch (err) {
      console.error("Error fetching user attributes:", err)
      setUserAttributes([
        { key: "department", value: "Engineering", type: "string" },
        { key: "employee_id", value: "EMP001", type: "string" },
        { key: "start_date", value: "2023-06-01", type: "date" },
        { key: "salary_band", value: "L4", type: "string" },
      ])
    } finally {
      setLoadingStates((prev) => ({ ...prev, userAttributes: false }))
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setUserForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const fetchPropertyUsers = async (propertyKey: string) => {
    setLoadingUsers(true)
    setSelectedProperty(propertyKey)
    try {
      const response = await fetch(`/api/properties/${propertyKey}`)
      if (!response.ok) {
        throw new Error("Failed to fetch property users")
      }
      const data = await response.json()
      setPropertyUsers(data.userIds || [])
    } catch (err) {
      console.error("Error fetching property users:", err)
      setPropertyUsers([
        `user_${Math.random().toString(36).substr(2, 9)}`,
        `user_${Math.random().toString(36).substr(2, 9)}`,
        `user_${Math.random().toString(36).substr(2, 9)}`,
      ])
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchPropertyGroups = async () => {
    setLoadingGroups(true)
    setGroupsError(null)
    try {
      const response = await fetch("/api/properties/groups")
      if (!response.ok) {
        throw new Error("Failed to fetch property groups")
      }
      const data = await response.json()
      setPropertyGroups(data)
    } catch (err) {
      setGroupsError(err instanceof Error ? err.message : "An error occurred")
      setPropertyGroups([
        {
          id: "user-preferences",
          name: "User Preferences",
          properties: [
            { key: "theme", value: "dark" },
            { key: "language", value: "en-US" },
            { key: "timezone", value: "UTC" },
          ],
        },
        {
          id: "system-config",
          name: "System Configuration",
          properties: [
            { key: "max_connections", value: "100" },
            { key: "timeout", value: "30s" },
            { key: "debug_mode", value: "false" },
          ],
        },
        {
          id: "notifications",
          name: "Notification Settings",
          properties: [
            { key: "email_notifications", value: "enabled" },
            { key: "push_notifications", value: "disabled" },
            { key: "sms_notifications", value: "enabled" },
          ],
        },
      ])
    } finally {
      setLoadingGroups(false)
    }
  }

  const handlePropertiesSubTabChange = (value: string) => {
    setPropertiesSubTab(value)
    if (value === "properties") {
      fetchProperties()
    } else if (value === "groups") {
      fetchPropertyGroups()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (showUserDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowUserDetails(false)}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Users</span>
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
              </div>
            </div>
          </div>
        </header>

        {/* User Details Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>User Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStates.userDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading user details...
                  </div>
                ) : userDetails ? (
                  <div className="space-y-3">
                    <div>
                      <strong>User ID:</strong> {userDetails.userId}
                    </div>
                    <div>
                      <strong>Name:</strong> {userDetails.name}
                    </div>
                    <div>
                      <strong>Email:</strong> {userDetails.email}
                    </div>
                    <div>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`px-2 py-1 rounded text-xs ${userDetails.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {userDetails.status}
                      </span>
                    </div>
                    <div>
                      <strong>Created:</strong> {formatDate(userDetails.createdAt)}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">No user details available</div>
                )}
              </CardContent>
            </Card>

            {/* User Identity */}
            <Card>
              <CardHeader>
                <CardTitle>Identity Information</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStates.userIdentity ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading identity...
                  </div>
                ) : userIdentity ? (
                  <div className="space-y-3">
                    <div>
                      <strong>Identity ID:</strong> {userIdentity.identityId}
                    </div>
                    <div>
                      <strong>Provider:</strong> {userIdentity.provider}
                    </div>
                    <div>
                      <strong>Verified:</strong>{" "}
                      <span
                        className={`px-2 py-1 rounded text-xs ${userIdentity.verified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {userIdentity.verified ? "Yes" : "No"}
                      </span>
                    </div>
                    <div>
                      <strong>Last Login:</strong> {formatDate(userIdentity.lastLogin)}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">No identity information available</div>
                )}
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStates.paymentInfo ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading payment info...
                  </div>
                ) : paymentInfo ? (
                  <div className="space-y-3">
                    <div>
                      <strong>Customer ID:</strong> {paymentInfo.customerId}
                    </div>
                    <div>
                      <strong>Plan:</strong> {paymentInfo.plan}
                    </div>
                    <div>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`px-2 py-1 rounded text-xs ${paymentInfo.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {paymentInfo.status}
                      </span>
                    </div>
                    <div>
                      <strong>Amount:</strong> ${paymentInfo.amount}
                    </div>
                    <div>
                      <strong>Next Billing:</strong> {formatDate(paymentInfo.nextBilling)}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">No payment information available</div>
                )}
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Newsletter</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStates.newsletter ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading newsletter info...
                  </div>
                ) : newsletter ? (
                  <div className="space-y-3">
                    <div>
                      <strong>Subscribed:</strong>{" "}
                      <span
                        className={`px-2 py-1 rounded text-xs ${newsletter.subscribed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {newsletter.subscribed ? "Yes" : "No"}
                      </span>
                    </div>
                    <div>
                      <strong>Preferences:</strong> {newsletter.preferences.join(", ")}
                    </div>
                    <div>
                      <strong>Last Sent:</strong> {formatDate(newsletter.lastSent)}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">No newsletter information available</div>
                )}
              </CardContent>
            </Card>

            {/* User Properties */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>User Properties</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStates.userProperties ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading properties...
                  </div>
                ) : userProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userProperties.map((property) => (
                      <div key={property.key} className="bg-gray-50 rounded p-3">
                        <div className="font-mono text-sm">
                          <span className="font-semibold text-blue-600">"{property.key}"</span>
                          <span className="text-gray-500 mx-2">:</span>
                          <span className="text-green-600">"{property.value}"</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Updated: {formatDate(property.updatedAt)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No properties found</div>
                )}
              </CardContent>
            </Card>

            {/* Addresses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Addresses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStates.addresses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading addresses...
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold capitalize">{address.type}</span>
                          {address.isDefault && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Default</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>{address.street}</div>
                          <div>
                            {address.city}, {address.country}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No addresses found</div>
                )}
              </CardContent>
            </Card>

            {/* User Attributes */}
            <Card>
              <CardHeader>
                <CardTitle>User Attributes</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStates.userAttributes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading attributes...
                  </div>
                ) : userAttributes.length > 0 ? (
                  <div className="space-y-3">
                    {userAttributes.map((attribute) => (
                      <div key={attribute.key} className="bg-gray-50 rounded p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-mono text-sm">
                            <span className="font-semibold text-blue-600">{attribute.key}</span>
                            <span className="text-gray-500 mx-2">:</span>
                            <span className="text-green-600">{attribute.value}</span>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">{attribute.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No attributes found</div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Enter either a User ID, Identity ID, or Email to view detailed user information. Only one field is
                  required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUserFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      type="text"
                      placeholder="Enter user ID"
                      value={userForm.userId}
                      onChange={(e) => handleInputChange("userId", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="identityId">Identity ID</Label>
                    <Input
                      id="identityId"
                      type="text"
                      placeholder="Enter identity ID"
                      value={userForm.identityId}
                      onChange={(e) => handleInputChange("identityId", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={userForm.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    View User Details
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>Manage properties and property groups in the system.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Sub-navigation for Properties */}
                <Tabs value={propertiesSubTab} onValueChange={handlePropertiesSubTabChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                    <TabsTrigger value="groups">Property Groups</TabsTrigger>
                  </TabsList>

                  <TabsContent value="properties">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Properties</h3>
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            Loading properties...
                          </div>
                        ) : error ? (
                          <div className="text-center py-8">
                            <p className="text-red-600 mb-4">Error: {error}</p>
                            <p className="text-sm text-gray-500">Showing mock data for demonstration</p>
                          </div>
                        ) : properties.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No properties found.</p>
                        ) : (
                          properties.map((property) => (
                            <div
                              key={property.key}
                              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => fetchPropertyUsers(property.key)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-mono text-sm">
                                    <span className="font-semibold text-blue-600">"{property.key}"</span>
                                    <span className="text-gray-500 mx-2">:</span>
                                    <span className="text-green-600">"{property.value}"</span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-400">Click to view users</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          {selectedProperty ? `Users for "${selectedProperty}"` : "Select a property"}
                        </h3>
                        {selectedProperty ? (
                          <div className="border rounded-lg p-4 min-h-[200px]">
                            {loadingUsers ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                Loading users...
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {propertyUsers.length === 0 ? (
                                  <p className="text-gray-500 text-center py-4">No users found for this property.</p>
                                ) : (
                                  propertyUsers.map((userId, index) => (
                                    <div key={index} className="bg-gray-50 rounded p-3 font-mono text-sm">
                                      {userId}
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="border rounded-lg p-4 min-h-[200px] flex items-center justify-center text-gray-500">
                            Click on a property to view associated users
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="groups">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Property Groups</h3>
                      {loadingGroups ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          Loading property groups...
                        </div>
                      ) : groupsError ? (
                        <div className="text-center py-8">
                          <p className="text-red-600 mb-4">Error: {groupsError}</p>
                          <p className="text-sm text-gray-500">Showing mock data for demonstration</p>
                        </div>
                      ) : propertyGroups.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No property groups found.</p>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                          {propertyGroups.map((group) => (
                            <Card key={group.id} className="hover:shadow-md transition-shadow">
                              <CardHeader>
                                <CardTitle className="text-lg">{group.name}</CardTitle>
                                <CardDescription>
                                  {group.properties.length} {group.properties.length === 1 ? "property" : "properties"}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {group.properties.map((property) => (
                                    <div key={property.key} className="bg-gray-50 rounded p-3">
                                      <div className="font-mono text-sm">
                                        <span className="font-semibold text-blue-600">"{property.key}"</span>
                                        <span className="text-gray-500 mx-2">:</span>
                                        <span className="text-green-600">"{property.value}"</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
