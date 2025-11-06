"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/admin/data-table"
import { columns, UserData } from "./columns"
import { IconShield, IconShieldCheck, IconCheck, IconX } from "@tabler/icons-react"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/admin/users")
        if (!response.ok) throw new Error("Failed to fetch users")
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Brukere</h2>
          <p className="text-muted-foreground">
            Administrer og imiter brukere
          </p>
        </div>
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground">Laster...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Brukere</h2>
        <p className="text-muted-foreground">
          Administrer og imiter brukere
        </p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Søk etter navn eller e-post..."
        filterConfig={[
          {
            columnId: "role",
            title: "Rolle",
            options: [
              {
                label: "Admin",
                value: "ADMIN",
                icon: IconShield,
              },
              {
                label: "Bruker",
                value: "USER",
                icon: IconShieldCheck,
              },
            ],
          },
          {
            columnId: "emailVerified",
            title: "Status",
            options: [
              {
                label: "Verifisert",
                value: "true",
                icon: IconCheck,
              },
              {
                label: "Ikke verifisert",
                value: "false",
                icon: IconX,
              },
            ],
          },
        ]}
      />
    </div>
  )
}
